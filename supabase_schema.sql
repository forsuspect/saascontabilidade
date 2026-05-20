-- SUPABASE DATABASE SCHEMA FOR SAAS COMPREHENSIVO
-- EXECUTE THIS IN THE SUPABASE SQL EDITOR

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Clean up existing triggers and tables if needed (optional, uncomment if re-running)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.system_logs;
-- DROP TABLE IF EXISTS public.tasks;
-- DROP TABLE IF EXISTS public.events;
-- DROP TABLE IF EXISTS public.financial_transactions;
-- DROP TABLE IF EXISTS public.client_files;
-- DROP TABLE IF EXISTS public.employees;
-- DROP TABLE IF EXISTS public.clients;
-- DROP TABLE IF EXISTS public.profiles;

---------------------------------------------------------
-- 1. PROFILES TABLE (SaaS Users & Roles)
---------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Profiles can be updated by administrators or self" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (
    (auth.uid() = id) OR 
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Profiles can be inserted by admin" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Profiles can be deleted by admin" 
  ON public.profiles FOR DELETE 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


---------------------------------------------------------
-- 2. CLIENTS TABLE (Customers Database)
---------------------------------------------------------
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  document text, -- CPF or CNPJ
  email text,
  phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  history text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies for Clients
CREATE POLICY "Clients are viewable by all authenticated users"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can be inserted by admins and managers"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Clients can be updated by admins and managers"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Clients can be deleted by admins only"
  ON public.clients FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


---------------------------------------------------------
-- 3. EMPLOYEES TABLE (Additional HR details)
---------------------------------------------------------
CREATE TABLE public.employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  username text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  salary numeric(12, 2),
  position text,
  admission_date date DEFAULT current_date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for Employees
CREATE POLICY "Employees details are viewable by all authenticated users"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees can be managed by admins only"
  ON public.employees FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


---------------------------------------------------------
-- 4. FINANCIAL TRANSACTIONS TABLE
---------------------------------------------------------
CREATE TABLE public.financial_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  date date DEFAULT current_date NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Financial Transactions
CREATE POLICY "Financials are viewable by admin and manager"
  ON public.financial_transactions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Financials can be inserted by admin and manager"
  ON public.financial_transactions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Financials can be updated or deleted by admin only"
  ON public.financial_transactions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


---------------------------------------------------------
-- 5. CLIENT FILES / DOCUMENTS TABLE
---------------------------------------------------------
CREATE TABLE public.client_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL, -- storage bucket path
  file_type text,
  file_size integer,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- Policies for Files
CREATE POLICY "Files are viewable by all authenticated users"
  ON public.client_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Files can be uploaded by admins and managers"
  ON public.client_files FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Files can be deleted by admin only"
  ON public.client_files FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


---------------------------------------------------------
-- 6. EVENTS / CALENDAR TABLE
---------------------------------------------------------
CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  category text NOT NULL DEFAULT 'meeting' CHECK (category IN ('meeting', 'financial', 'deadline', 'other')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies for Events
CREATE POLICY "Events are viewable by all authenticated users"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Events can be managed by all authenticated users"
  ON public.events FOR ALL
  TO authenticated
  USING (true);


---------------------------------------------------------
-- 7. TASKS / KANBAN TABLE
---------------------------------------------------------
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for Tasks
CREATE POLICY "Tasks are viewable by all authenticated users"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tasks can be created, updated, and deleted by all authenticated users"
  ON public.tasks FOR ALL
  TO authenticated
  USING (true);


---------------------------------------------------------
-- 8. SYSTEM LOGS TABLE
---------------------------------------------------------
CREATE TABLE public.system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  details text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Logs
CREATE POLICY "Logs are viewable by admins only"
  ON public.system_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can insert logs"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);


---------------------------------------------------------
-- TRIGGERS FOR PROFILE AUTO-CREATION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Colaborador'),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );
  
  -- Insert seed entry in employee details table if role is specified
  INSERT INTO public.employees (profile_id, full_name, username, role, salary, position, admission_date, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Colaborador'),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'employee'),
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 12000.00
      WHEN (new.raw_user_meta_data->>'role') = 'manager' THEN 7500.00
      ELSE 3800.00
    END,
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 'Diretor de Operações'
      WHEN (new.raw_user_meta_data->>'role') = 'manager' THEN 'Gerente Financeiro'
      ELSE 'Analista Contábil'
    END,
    current_date,
    'active'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


---------------------------------------------------------
-- SEED DATA: DEFAULT ADMINISTRATOR USER
---------------------------------------------------------
-- Password is 'admin123'
-- Email is generated as 'admin@saas.system'
-- Id is pre-defined for consistency, profile is auto-created via trigger.

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'authenticated',
  'authenticated',
  'admin@saas.system',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin","full_name":"Administrador Master","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Also seed some initial clients, financial entries, and tasks for a vibrant dashboard
-- Let's make sure we seed them. Wait, since we need to seed clients with created_by,
-- we link to the admin user: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'

INSERT INTO public.clients (id, name, document, email, phone, status, history, created_by, created_at)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'NexGen Indústrias S.A.', '45.890.123/0001-90', 'financeiro@nexgen.com', '(11) 98765-4321', 'active', 'Cliente corporativo com auditorias mensais.', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', now() - interval '30 days'),
  ('c2222222-2222-2222-2222-222222222222', 'Apex Holding Ltda', '12.345.678/0001-00', 'contato@apex.co', '(21) 99888-7766', 'active', 'Empresa de consultoria de médio porte.', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', now() - interval '15 days'),
  ('c3333333-3333-3333-3333-333333333333', 'Vanguard Media & Arts', '09.876.543/0001-11', 'diretoria@vanguard.media', '(31) 97111-2233', 'active', 'Startup focada em publicidade digital.', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.financial_transactions (description, amount, type, category, date, created_by)
VALUES
  ('Honorários Mensais - NexGen', 15400.00, 'income', 'Serviços Contábeis', current_date - interval '10 days', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Consultoria Tributária - Apex', 8500.00, 'income', 'Consultoria', current_date - interval '5 days', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Licença Mensal Supabase Enterprise', 1200.00, 'expense', 'Infraestrutura/Software', current_date - interval '8 days', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Aluguel Escritório Físico / Coworking', 3500.00, 'expense', 'Escritório', current_date - interval '2 days', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Honorários Mensais - Vanguard', 6800.00, 'income', 'Serviços Contábeis', current_date - interval '1 day', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

INSERT INTO public.tasks (title, description, status, priority, due_date, created_by)
VALUES
  ('Conciliação Bancária NexGen', 'Conciliar o fechamento financeiro do mês anterior com extratos.', 'todo', 'high', current_date + interval '2 days', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Revisão da Declaração DAS - Vanguard', 'Apuração e emissão do Simples Nacional da Vanguard Media.', 'in_progress', 'medium', current_date + interval '5 days', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Reunião de Alinhamento Tributário', 'Apresentar planejamento tributário anual para a Apex Holding.', 'review', 'high', current_date + interval '1 day', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Arquivamento de Recibos Apex', 'Digitalizar e organizar no Supabase Storage.', 'done', 'low', current_date - interval '1 day', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

INSERT INTO public.events (title, description, start_time, end_time, category, created_by)
VALUES
  ('Auditoria NexGen', 'Auditoria contábil completa de fechamento de trimestre.', now() + interval '1 day', now() + interval '1 day 2 hours', 'meeting', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('Vencimento Guia DAS Simples', 'Data limite para pagamento das guias do Simples Nacional.', now() + interval '3 days', now() + interval '3 days 1 hour', 'deadline', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

-- Set up Storage Bucket for documents
-- Note: Bucket creation can also be done manually in Supabase Dashboard,
-- but this SQL provides a helper trigger/script if executed with storage admin permissions.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the documents bucket
CREATE POLICY "Authenticated users can select documents"
  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Admin and managers can insert/update documents"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admin and managers can update documents"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admin can delete documents"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
