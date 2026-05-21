import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';

// Helper to log actions locally or to database
export const logSystemAction = async (action, details, userId, userRole, username) => {
  const timestamp = new Date().toISOString();
  
  const roleNamePt = 
    userRole === 'developer' ? 'DESENVOLVEDOR' :
    userRole === 'owner' ? 'PROPRIETÁRIO' :
    userRole === 'admin' ? 'ADMINISTRADOR' :
    userRole === 'employee' ? 'COLABORADOR' :
    userRole === 'client' ? 'CLIENTE' :
    userRole === 'manager' ? 'GERENTE' : (userRole?.toUpperCase() || 'SISTEMA');

  // Query local profile to fetch full name
  let fullName = '';
  try {
    const profiles = JSON.parse(localStorage.getItem('saas_profiles') || '[]');
    const profile = profiles.find(p => p.username.toLowerCase() === username?.toLowerCase());
    if (profile) fullName = ` (${profile.full_name})`;
  } catch (e) {}

  // Generate random stable simulated IP for aesthetics
  const simulatedIP = `186.230.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
  const formattedDetails = `[HIE: ${roleNamePt}] @${username || 'sistema'}${fullName} | Ação: ${details} | IP: ${simulatedIP} | Disp: Windows 11 Chrome`;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('system_logs').insert([{
        action,
        user_id: userId,
        details: formattedDetails
      }]);
    } catch (err) {
      console.warn("Failing to write log in Supabase, logging to console instead:", err);
    }
  } else {
    const logs = JSON.parse(localStorage.getItem('saas_logs') || '[]');
    logs.unshift({
      id: Math.random().toString(36).substr(2, 9),
      action,
      details: formattedDetails,
      created_at: timestamp
    });
    localStorage.setItem('saas_logs', JSON.stringify(logs.slice(0, 100))); // Limit to 100 logs
  }
};

// Initial Mock Seed Data for Fallback Demo Mode
const initMockData = () => {
  if (localStorage.getItem('saas_initialized') !== 'clean_v5') {
    // 1. Profiles / Users
    const mockProfiles = [
      { id: 'usr-kauadev', username: 'kauadev', full_name: 'Kauã Dev', role: 'developer', avatar_url: '' },
      { id: 'usr-developer', username: 'desenvolvedor', full_name: 'Desenvolvedor Master', role: 'developer', avatar_url: '' },
      { id: 'usr-owner', username: 'proprietario', full_name: 'Proprietário Master', role: 'owner', avatar_url: '' },
      { id: 'usr-client', username: 'cliente', full_name: 'Cliente Gold', role: 'client', avatar_url: '' },
      { id: 'usr-employee', username: 'colaborador', full_name: 'Colaborador Master', role: 'employee', avatar_url: '' }
    ];
    
    // Auth passwords (stored securely in simulation)
    const mockAuth = [
      { username: 'kauadev', password: 'dev@2024', profileId: 'usr-kauadev' },
      { username: 'desenvolvedor', password: 'desenvolvedor123', profileId: 'usr-developer' },
      { username: 'proprietario', password: 'proprietario123', profileId: 'usr-owner' },
      { username: 'cliente', password: 'cliente123', profileId: 'usr-client' },
      { username: 'colaborador', password: 'colaborador123', profileId: 'usr-employee' }
    ];

    // 2. Clients (Cleaned but seed a default Client for the client user)
    const mockClients = [
      { id: 'cli-default', name: 'Cliente Gold', document: '12.345.678/0001-90', email: 'cliente@gold.com', phone: '(81) 98765-4321', status: 'active', created_at: new Date().toISOString() }
    ];

    // 3. Client Files (Cleaned but seed a couple for demonstration)
    const mockFiles = [
      { id: 'file-1', client_id: 'cli-default', name: 'Contrato_Prestacao_Servicos.pdf', file_path: 'clients/cli-default/Contrato_Prestacao_Servicos.pdf', file_type: 'application/pdf', file_size: 1048576, uploaded_at: new Date().toISOString(), uploaded_by: 'usr-developer' },
      { id: 'file-2', client_id: 'cli-default', name: 'Balancete_Contabil_2025.xlsx', file_path: 'clients/cli-default/Balancete_Contabil_2025.xlsx', file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', file_size: 2048576, uploaded_at: new Date().toISOString(), uploaded_by: 'usr-developer' }
    ];

    // 4. Financial Transactions (Cleaned)
    const mockFinancials = [];

    // 5. Employees details (Kept only for system users)
    const mockEmployees = [
      { id: 'emp-kauadev', profile_id: 'usr-kauadev', full_name: 'Kauã Dev', username: 'kauadev', role: 'developer', salary: 18000.00, position: 'Senior Developer', admission_date: '2024-01-01', status: 'active' },
      { id: 'emp-dev', profile_id: 'usr-developer', full_name: 'Desenvolvedor Master', username: 'desenvolvedor', role: 'developer', salary: 15000.00, position: 'Lead Developer', admission_date: '2023-01-01', status: 'active' },
      { id: 'emp-own', profile_id: 'usr-owner', full_name: 'Proprietário Master', username: 'proprietario', role: 'owner', salary: 20000.00, position: 'Sócio-Fundador', admission_date: '2022-05-10', status: 'active' },
      { id: 'emp-3', profile_id: 'usr-employee', full_name: 'Colaborador Master', username: 'colaborador', role: 'employee', salary: 3800.00, position: 'Analista Contábil', admission_date: '2025-06-01', status: 'active' }
    ];

    // 6. Events / Calendar (Cleaned)
    const mockEvents = [];

    // 7. Tasks (Cleaned)
    const mockTasks = [];

    // Commit to localStorage
    localStorage.setItem('saas_profiles', JSON.stringify(mockProfiles));
    localStorage.setItem('saas_auth', JSON.stringify(mockAuth));
    localStorage.setItem('saas_clients', JSON.stringify(mockClients));
    localStorage.setItem('saas_files', JSON.stringify(mockFiles));
    localStorage.setItem('saas_financials', JSON.stringify(mockFinancials));
    localStorage.setItem('saas_employees', JSON.stringify(mockEmployees));
    localStorage.setItem('saas_events', JSON.stringify(mockEvents));
    localStorage.setItem('saas_tasks', JSON.stringify(mockTasks));
    localStorage.setItem('saas_logs', JSON.stringify([{
      id: 'log-init',
      action: 'INIT_SYSTEM',
      details: 'Banco de dados de simulação limpo iniciado com os novos níveis de acesso, incluindo desenvolvedor principal e cliente default.',
      created_at: new Date().toISOString()
    }]));
    
    localStorage.setItem('saas_initialized', 'clean_v5');
  }
};

// Initialize simulated database right away
initMockData();

// Initialize simulated database right away
initMockData();

// Generic helpers for localStorage
const getLocal = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const dbService = {
  // Check Mode
  isSupabaseActive: () => isSupabaseConfigured,

  // ==========================================
  // AUTHENTICATION SERVICES
  // ==========================================
  auth: {
    login: async (username, password) => {
      const cleanUsername = username.includes('@') ? username.split('@')[0] : username;
      if (isSupabaseConfigured && supabase) {
        try {
          // Map username to email behind the scenes
          const email = `${cleanUsername.toLowerCase()}@saas.system`;
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) throw error;
          
          // Fetch custom profile details linked to the auth ID
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileErr) throw profileErr;
          
          await logSystemAction('AUTH_LOGIN', `Usuário realizou login com sucesso.`, profile.id, profile.role, profile.username);
          return { user: data.user, profile };
        } catch (supabaseError) {
          // Fallback to local authentication if credentials are not in Supabase Auth
          console.warn("Supabase login failed, trying local fallback:", supabaseError.message);
          
          const authList = getLocal('saas_auth');
          const match = authList.find(a => a.username.toLowerCase() === cleanUsername.toLowerCase() && a.password === password);
          if (!match) {
            // Log the failed attempt before throwing
            await logSystemAction('AUTH_FAILED', `Tentativa de login falha. Credenciais incorretas.`, 'anonymous', 'visitante', cleanUsername);
            // If local fallback also fails, throw the original Supabase error
            throw supabaseError;
          }
          
          const profiles = getLocal('saas_profiles');
          const profile = profiles.find(p => p.id === match.profileId);
          
          const mockUser = {
            id: profile.id,
            email: `${profile.username}@saas.system`,
            user_metadata: { username: profile.username, role: profile.role, full_name: profile.full_name }
          };
          
          // Store local session to override current session lookups
          localStorage.setItem('saas_session_user', JSON.stringify(mockUser));
          
          await logSystemAction('AUTH_LOGIN', `Usuário realizou login no modo de demonstração (fallback).`, profile.id, profile.role, profile.username);
          return { user: mockUser, profile };
        }
      } else {
        // Fallback local authentication
        const authList = getLocal('saas_auth');
        const match = authList.find(a => a.username.toLowerCase() === cleanUsername.toLowerCase() && a.password === password);
        if (!match) {
          await logSystemAction('AUTH_FAILED', `Tentativa de login falha. Usuário ou senha incorretos.`, 'anonymous', 'visitante', cleanUsername);
          throw new Error('Usuário ou senha incorretos.');
        }
        
        const profiles = getLocal('saas_profiles');
        const profile = profiles.find(p => p.id === match.profileId);
        
        const mockUser = {
          id: profile.id,
          email: `${profile.username}@saas.system`,
          user_metadata: { username: profile.username, role: profile.role, full_name: profile.full_name }
        };
        
        localStorage.setItem('saas_session_user', JSON.stringify(mockUser));
        await logSystemAction('AUTH_LOGIN', `Usuário realizou login no modo de demonstração.`, profile.id, profile.role, profile.username);
        return { user: mockUser, profile };
      }
    },
    
    getCurrentSession: async () => {
      // Always prioritize check of local fallback session if stored
      const sessionUser = JSON.parse(localStorage.getItem('saas_session_user') || 'null');
      if (sessionUser) {
        const profiles = getLocal('saas_profiles');
        const profile = profiles.find(p => p.id === sessionUser.id);
        if (profile) {
          return { user: sessionUser, profile };
        }
      }

      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        return { user: session.user, profile };
      } else {
        if (!sessionUser) return null;
        
        const profiles = getLocal('saas_profiles');
        const profile = profiles.find(p => p.id === sessionUser.id);
        return { user: sessionUser, profile };
      }
    },

    saveSession: (user, profile) => {
      localStorage.setItem('saas_session_user', JSON.stringify(user));
    },

    clearSession: () => {
      localStorage.removeItem('saas_session_user');
    },

    logout: async (profile) => {
      if (profile) {
        await logSystemAction('AUTH_LOGOUT', `Usuário deslogou do sistema.`, profile.id, profile.role, profile.username);
      }
      localStorage.removeItem('saas_session_user');
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn("signOut error:", err);
        }
      }
    },

    // Register user (Only Admin can register new users)
    createUser: async (username, password, fullName, role, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const email = `${username.toLowerCase()}@saas.system`;
          
          // Supabase sign-up creates a user. 
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username.toLowerCase(),
                full_name: fullName,
                role: role
              }
            }
          });
          
          if (error) throw error;
          
          // Ensure local fallback in case Supabase trigger for profiles is missing
          const profiles = getLocal('saas_profiles');
          if (!profiles.some(p => p.username.toLowerCase() === username.toLowerCase())) {
            const newId = data?.user?.id || ('usr-' + Math.random().toString(36).substr(2, 9));
            const newProfile = { id: newId, username: username.toLowerCase(), full_name: fullName, role, avatar_url: '' };
            profiles.push(newProfile);
            setLocal('saas_profiles', profiles);

            if (['developer', 'owner', 'employee'].includes(role)) {
              const employees = getLocal('saas_employees');
              if (!employees.some(e => e.username.toLowerCase() === username.toLowerCase())) {
                employees.push({
                  id: 'emp-' + Math.random().toString(36).substr(2, 9),
                  profile_id: newId,
                  full_name: fullName,
                  username: username.toLowerCase(),
                  role,
                  salary: role === 'owner' ? 20000.00 : role === 'developer' ? 18000.00 : 3800.00,
                  position: role === 'owner' ? 'Sócio-Fundador' : role === 'developer' ? 'Senior Developer' : 'Analista Contábil',
                  admission_date: new Date().toISOString().split('T')[0],
                  status: 'active'
                });
                setLocal('saas_employees', employees);
              }
            }
          }

          await logSystemAction('USER_CREATE', `Registrou novo usuário: ${username} (${role})`, creatorProfile?.id, creatorProfile?.role, creatorProfile?.username);
          return data;
        } catch (supabaseError) {
          console.warn("Supabase createUser failed, falling back to local storage:", supabaseError.message);
          
          // Fallback Local Database User Creation
          const profiles = getLocal('saas_profiles');
          const authList = getLocal('saas_auth');
          
          if (profiles.some(p => p.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Este nome de usuário já está cadastrado.');
          }
          
          const newId = 'usr-' + Math.random().toString(36).substr(2, 9);
          const newProfile = { id: newId, username: username.toLowerCase(), full_name: fullName, role, avatar_url: '' };
          
          profiles.push(newProfile);
          authList.push({ username: username.toLowerCase(), password, profileId: newId });
          
          // Also register in local employees details table if it is a staff role
          if (['developer', 'owner', 'employee'].includes(role)) {
            const employees = getLocal('saas_employees');
            employees.push({
              id: 'emp-' + Math.random().toString(36).substr(2, 9),
              profile_id: newId,
              full_name: fullName,
              username: username.toLowerCase(),
              role,
              salary: role === 'owner' ? 20000.00 : role === 'developer' ? 18000.00 : 3800.00,
              position: role === 'owner' ? 'Sócio-Fundador' : role === 'developer' ? 'Senior Developer' : 'Analista Contábil',
              admission_date: new Date().toISOString().split('T')[0],
              status: 'active'
            });
            setLocal('saas_employees', employees);
          }
          
          setLocal('saas_profiles', profiles);
          setLocal('saas_auth', authList);
          
          await logSystemAction('USER_CREATE', `Registrou novo usuário no modo demo (fallback): ${username} (${role})`, creatorProfile?.id, creatorProfile?.role, creatorProfile?.username);
          return { user: { id: newId }, profile: newProfile };
        }
      } else {
        // Fallback Local Database User Creation
        const profiles = getLocal('saas_profiles');
        const authList = getLocal('saas_auth');
        
        if (profiles.some(p => p.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Este nome de usuário já está cadastrado.');
        }
        
        const newId = 'usr-' + Math.random().toString(36).substr(2, 9);
        const newProfile = { id: newId, username: username.toLowerCase(), full_name: fullName, role, avatar_url: '' };
        
        profiles.push(newProfile);
        authList.push({ username: username.toLowerCase(), password, profileId: newId });
        
        // Also register in local employees details table
        if (['developer', 'owner', 'employee'].includes(role)) {
          const employees = getLocal('saas_employees');
          employees.push({
            id: 'emp-' + Math.random().toString(36).substr(2, 9),
            profile_id: newId,
            full_name: fullName,
            username: username.toLowerCase(),
            role,
            salary: role === 'owner' ? 20000.00 : role === 'developer' ? 18000.00 : 3800.00,
            position: role === 'owner' ? 'Sócio-Fundador' : role === 'developer' ? 'Senior Developer' : 'Analista Contábil',
            admission_date: new Date().toISOString().split('T')[0],
            status: 'active'
          });
          setLocal('saas_employees', employees);
        }
        
        setLocal('saas_profiles', profiles);
        setLocal('saas_auth', authList);
        
        await logSystemAction('USER_CREATE', `Registrou novo usuário no modo demo: ${username} (${role})`, creatorProfile?.id, creatorProfile?.role, creatorProfile?.username);
        return { user: { id: newId }, profile: newProfile };
      }
    }
  },

  // ==========================================
  // CLIENTS SERVICES
  // ==========================================
  clients: {
    getAll: async (profile = null) => {
      let mergedData = [];
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('clients').select('*').order('name', { ascending: true });
          if (profile && !['developer', 'owner'].includes(profile.role)) {
            query = query.eq('created_by', profile.id);
          }
          const { data, error } = await query;
          if (error) throw error;
          mergedData = [...data];
        } catch (err) {
          console.warn("Supabase clients.getAll failed, using local fallback:", err.message);
        }
      }
      
      const localData = getLocal('saas_clients');
      localData.forEach(localItem => {
        if (!mergedData.some(m => m.id === localItem.id)) {
          if (!profile || ['developer', 'owner'].includes(profile.role) || localItem.created_by === profile.id) {
            mergedData.push(localItem);
          }
        }
      });
      
      if (profile && !['developer', 'owner'].includes(profile.role)) {
        mergedData = mergedData.filter(item => item.created_by === profile.id);
      }
      
      return mergedData.sort((a, b) => a.name.localeCompare(b.name));
    },
    
    create: async (clientData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('clients').insert([{
            ...clientData,
            created_by: creatorProfile.id
          }]).select();
          
          if (error) throw error;
          await logSystemAction('CLIENT_CREATE', `Criou o cliente: ${clientData.name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase clients.create failed, using local fallback:", err.message);
        }
      }
      
      const clients = getLocal('saas_clients');
      const newClient = {
        id: 'cli-' + Math.random().toString(36).substr(2, 9),
        ...clientData,
        created_at: new Date().toISOString()
      };
      clients.push(newClient);
      setLocal('saas_clients', clients);
      
      await logSystemAction('CLIENT_CREATE', `Criou o cliente no modo demo: ${clientData.name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return newClient;
    },

    update: async (id, clientData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('clients').update(clientData).eq('id', id).select();
          if (error) throw error;
          await logSystemAction('CLIENT_UPDATE', `Atualizou dados do cliente: ${clientData.name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase clients.update failed, using local fallback:", err.message);
        }
      }
      
      const clients = getLocal('saas_clients');
      const index = clients.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Cliente não encontrado.');
      
      clients[index] = { ...clients[index], ...clientData, updated_at: new Date().toISOString() };
      setLocal('saas_clients', clients);
      
      await logSystemAction('CLIENT_UPDATE', `Atualizou cliente no modo demo: ${clientData.name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return clients[index];
    },

    delete: async (id, name, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('clients').delete().eq('id', id);
          if (error) throw error;
          await logSystemAction('CLIENT_DELETE', `Excluiu o cliente: ${name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return;
        } catch (err) {
          console.warn("Supabase clients.delete failed, using local fallback:", err.message);
        }
      }
      
      let clients = getLocal('saas_clients');
      clients = clients.filter(c => c.id !== id);
      setLocal('saas_clients', clients);
      
      // Cascade delete local files for that client
      let files = getLocal('saas_files');
      files = files.filter(f => f.client_id !== id);
      setLocal('saas_files', files);
      
      await logSystemAction('CLIENT_DELETE', `Excluiu o cliente no modo demo: ${name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
    }
  },

  // ==========================================
  // DOCUMENTS / STORAGE SERVICES
  // ==========================================
  documents: {
    getAll: async (profile = null) => {
      let mergedData = [];
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('client_files').select('*, clients(name)').order('uploaded_at', { ascending: false });
          if (profile && !['developer', 'owner'].includes(profile.role)) {
            query = query.eq('uploaded_by', profile.id);
          }
          const { data, error } = await query;
          if (error) throw error;
          mergedData = [...data];
        } catch (err) {
          console.warn("Supabase documents.getAll failed, using local fallback:", err.message);
        }
      }
      
      const files = getLocal('saas_files');
      const clients = getLocal('saas_clients');
      
      files.forEach(f => {
        if (!mergedData.some(m => m.id === f.id)) {
          if (!profile || ['developer', 'owner'].includes(profile.role) || f.uploaded_by === profile.id) {
            const client = clients.find(c => c.id === f.client_id);
            mergedData.push({
              ...f,
              clients: client ? { name: client.name } : { name: 'Sem cliente' }
            });
          }
        }
      });
      
      if (profile && !['developer', 'owner'].includes(profile.role)) {
        mergedData = mergedData.filter(item => item.uploaded_by === profile.id);
      }
      
      return mergedData.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    },

    upload: async (clientId, file, creatorProfile) => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `clients/${clientId}/${fileName}`;
      
      if (isSupabaseConfigured && supabase) {
        try {
          // 1. Upload file binary to Storage bucket 'documents'
          const { data: storageData, error: storageErr } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
            
          if (storageErr) throw storageErr;
          
          // 2. Insert record in client_files table
          const { data: fileData, error: fileErr } = await supabase.from('client_files').insert([{
            client_id: clientId,
            name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: creatorProfile.id
          }]).select();
          
          if (fileErr) {
            // Rollback storage upload on meta insert failure
            await supabase.storage.from('documents').remove([filePath]);
            throw fileErr;
          }
          
          await logSystemAction('DOC_UPLOAD', `Enviou o documento: ${file.name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return fileData[0];
        } catch (err) {
          console.warn("Supabase upload failed, using local fallback:", err.message);
        }
      }
      
      // Fallback local mock upload
      const files = getLocal('saas_files');
      const newFile = {
        id: 'file-' + Math.random().toString(36).substr(2, 9),
        client_id: clientId,
        name: file.name,
        file_path: filePath,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: creatorProfile.id
      };
      
      files.push(newFile);
      setLocal('saas_files', files);
      
      await logSystemAction('DOC_UPLOAD', `Enviou doc no modo demo: ${file.name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return newFile;
    },

    download: async (filePath, fileName) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.storage.from('documents').download(filePath);
        if (error) throw error;
        
        // Create browser download link
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Fallback simulated download: trigger alert and mock byte download
        // Create an empty dummy file download
        const blob = new Blob(["Simulado: Conteúdo do arquivo premium SaaS"], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    },

    delete: async (id, filePath, fileName, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        // 1. Delete from storage bucket
        const { error: storageErr } = await supabase.storage.from('documents').remove([filePath]);
        if (storageErr) console.warn("Erro ao apagar arquivo no Storage, tentando apagar do banco de dados:", storageErr);
        
        // 2. Delete database entry
        const { error } = await supabase.from('client_files').delete().eq('id', id);
        if (error) throw error;
        
        await logSystemAction('DOC_DELETE', `Excluiu o documento: ${fileName}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      } else {
        let files = getLocal('saas_files');
        files = files.filter(f => f.id !== id);
        setLocal('saas_files', files);
        
        await logSystemAction('DOC_DELETE', `Excluiu o doc no modo demo: ${fileName}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      }
    }
  },

  // ==========================================
  // FINANCIAL SERVICES
  // ==========================================
  financial: {
    getAll: async (profile = null) => {
      let mergedData = [];
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('financial_transactions').select('*').order('date', { ascending: false });
          if (profile && !['developer', 'owner'].includes(profile.role)) {
            query = query.eq('created_by', profile.id);
          }
          const { data, error } = await query;
          if (error) throw error;
          mergedData = [...data];
        } catch (err) {
          console.warn("Supabase financial.getAll failed, using local fallback:", err.message);
        }
      }
      
      const localData = getLocal('saas_financials');
      localData.forEach(localItem => {
        if (!mergedData.some(m => m.id === localItem.id)) {
          if (!profile || ['developer', 'owner'].includes(profile.role) || localItem.created_by === profile.id) {
            mergedData.push(localItem);
          }
        }
      });
      
      if (profile && !['developer', 'owner'].includes(profile.role)) {
        mergedData = mergedData.filter(item => item.created_by === profile.id);
      }
      
      return mergedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    create: async (transactionData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('financial_transactions').insert([{
            ...transactionData,
            created_by: creatorProfile.id
          }]).select();
          
          if (error) throw error;
          await logSystemAction('FIN_CREATE', `Criou transação: ${transactionData.description} (R$ ${transactionData.amount})`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase financial.create failed, using local fallback:", err.message);
        }
      }
      
      const financials = getLocal('saas_financials');
      const newFin = {
        id: 'fin-' + Math.random().toString(36).substr(2, 9),
        ...transactionData,
        created_at: new Date().toISOString()
      };
      financials.push(newFin);
      setLocal('saas_financials', financials);
      
      await logSystemAction('FIN_CREATE', `Transação modo demo: ${transactionData.description} (R$ ${transactionData.amount})`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return newFin;
    },

    delete: async (id, desc, amount, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
          if (error) throw error;
          await logSystemAction('FIN_DELETE', `Excluiu transação: ${desc} (R$ ${amount})`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return;
        } catch (err) {
          console.warn("Supabase financial.delete failed, using local fallback:", err.message);
        }
      }
      
      let financials = getLocal('saas_financials');
      financials = financials.filter(f => f.id !== id);
      setLocal('saas_financials', financials);
      await logSystemAction('FIN_DELETE', `Excluiu transação no modo demo: ${desc}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
    }
  },

  // ==========================================
  // EMPLOYEES SERVICES
  // ==========================================
  employees: {
    getAll: async () => {
      let mergedData = [];
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('employees').select('*').order('full_name', { ascending: true });
          if (error) throw error;
          mergedData = [...data];
        } catch (err) {
          console.warn("Supabase employees.getAll failed, using local fallback:", err.message);
        }
      }
      
      const localData = getLocal('saas_employees');
      localData.forEach(localItem => {
        if (!mergedData.some(m => m.id === localItem.id)) {
          mergedData.push(localItem);
        }
      });
      
      return mergedData.sort((a, b) => a.full_name.localeCompare(b.full_name));
    },

    update: async (id, employeeData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          // First check if role needs to be synced in profile
          const { data: currentEmp } = await supabase.from('employees').select('profile_id').eq('id', id).single();
          if (currentEmp?.profile_id && employeeData.role) {
            await supabase.from('profiles').update({ role: employeeData.role }).eq('id', currentEmp.profile_id);
          }

          const { data, error } = await supabase.from('employees').update(employeeData).eq('id', id).select();
          if (error) throw error;
          await logSystemAction('EMP_UPDATE', `Atualizou dados de colaborador: ${employeeData.full_name || id}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase employees.update failed, using local fallback:", err.message);
        }
      }
      
      const employees = getLocal('saas_employees');
        const index = employees.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Colaborador não encontrado.');
        
        employees[index] = { ...employees[index], ...employeeData };
        setLocal('saas_employees', employees);
        
        // Sync role back to local profiles
        if (employees[index].profile_id && employeeData.role) {
          const profiles = getLocal('saas_profiles');
          const pIndex = profiles.findIndex(p => p.id === employees[index].profile_id);
          if (pIndex !== -1) {
            profiles[pIndex].role = employeeData.role;
            setLocal('saas_profiles', profiles);
          }
        }
        
        await logSystemAction('EMP_UPDATE', `Atualizou colaborador no modo demo: ${employees[index].full_name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
        return employees[index];
    },

    delete: async (id, name, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          // Find profile id to delete the auth user as well in full mode
          const { data: emp } = await supabase.from('employees').select('profile_id').eq('id', id).single();
          
          const { error } = await supabase.from('employees').delete().eq('id', id);
          if (error) throw error;
          
          if (emp?.profile_id) {
            await supabase.from('profiles').delete().eq('id', emp.profile_id);
          }
          
          await logSystemAction('EMP_DELETE', `Excluiu colaborador: ${name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return;
        } catch (err) {
          console.warn("Supabase employees.delete failed, using local fallback:", err.message);
        }
      }
      
      const employees = getLocal('saas_employees');
        const emp = employees.find(e => e.id === id);
        
        const filteredEmployees = employees.filter(e => e.id !== id);
        setLocal('saas_employees', filteredEmployees);
        
        if (emp?.profile_id) {
          let profiles = getLocal('saas_profiles');
          profiles = profiles.filter(p => p.id !== emp.profile_id);
          setLocal('saas_profiles', profiles);
          
          let auths = getLocal('saas_auth');
          auths = auths.filter(a => a.profileId !== emp.profile_id);
          setLocal('saas_auth', auths);
        }
        
        await logSystemAction('EMP_DELETE', `Excluiu colaborador no modo demo: ${name}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
    }
  },

  // ==========================================
  // EVENTS / AGENDA SERVICES
  // ==========================================
  events: {
    getAll: async (profile = null) => {
      let mergedData = [];
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('events').select('*').order('start_time', { ascending: true });
          if (profile && !['developer', 'owner'].includes(profile.role)) {
            query = query.eq('created_by', profile.id);
          }
          const { data, error } = await query;
          if (error) throw error;
          mergedData = [...data];
        } catch (err) {
          console.warn("Supabase events.getAll failed, using local fallback:", err.message);
        }
      }
      
      const localData = getLocal('saas_events');
      localData.forEach(localItem => {
        if (!mergedData.some(m => m.id === localItem.id)) {
          if (!profile || ['developer', 'owner'].includes(profile.role) || localItem.created_by === profile.id) {
            mergedData.push(localItem);
          }
        }
      });
      
      if (profile && !['developer', 'owner'].includes(profile.role)) {
        mergedData = mergedData.filter(item => item.created_by === profile.id);
      }
      
      return mergedData.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    },

    create: async (eventData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('events').insert([{
            ...eventData,
            created_by: creatorProfile.id
          }]).select();
          
          if (error) throw error;
          await logSystemAction('EVT_CREATE', `Criou evento na agenda: ${eventData.title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase events.create failed, using local fallback:", err.message);
        }
      }
      
      const events = getLocal('saas_events');
      const newEvt = {
        id: 'evt-' + Math.random().toString(36).substr(2, 9),
        ...eventData,
        created_at: new Date().toISOString()
      };
      events.push(newEvt);
      setLocal('saas_events', events);
      
      await logSystemAction('EVT_CREATE', `Evento na agenda modo demo: ${eventData.title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return newEvt;
    },

    update: async (id, eventData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('events').update(eventData).eq('id', id).select();
          if (error) throw error;
          await logSystemAction('EVT_UPDATE', `Atualizou evento: ${eventData.title || id}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase events.update failed, using local fallback:", err.message);
        }
      }
      
      const events = getLocal('saas_events');
      const index = events.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Evento não encontrado.');
      
      events[index] = { ...events[index], ...eventData };
      setLocal('saas_events', events);
      
      await logSystemAction('EVT_UPDATE', `Atualizou evento no modo demo: ${events[index].title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return events[index];
    },

    delete: async (id, title, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('events').delete().eq('id', id);
          if (error) throw error;
          await logSystemAction('EVT_DELETE', `Apagou o evento: ${title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return;
        } catch (err) {
          console.warn("Supabase events.delete failed, using local fallback:", err.message);
        }
      }
      
      let events = getLocal('saas_events');
      events = events.filter(e => e.id !== id);
      setLocal('saas_events', events);
      await logSystemAction('EVT_DELETE', `Apagou o evento no modo demo: ${title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
    }
  },

  // ==========================================
  // KANBAN / TASKS SERVICES
  // ==========================================
  tasks: {
    getAll: async (profile = null) => {
      let mergedData = [];
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('tasks').select('*').order('created_at', { ascending: true });
          if (profile && !['developer', 'owner'].includes(profile.role)) {
            query = query.or(`created_by.eq.${profile.id},assignee_id.eq.${profile.id}`);
          }
          const { data, error } = await query;
          if (error) throw error;
          mergedData = [...data];
        } catch (err) {
          console.warn("Supabase tasks.getAll failed, using local fallback:", err.message);
        }
      }
      
      const localData = getLocal('saas_tasks');
      localData.forEach(localItem => {
        if (!mergedData.some(m => m.id === localItem.id)) {
          if (!profile || ['developer', 'owner'].includes(profile.role) || localItem.created_by === profile.id || localItem.assignee_id === profile.id) {
            mergedData.push(localItem);
          }
        }
      });
      
      if (profile && !['developer', 'owner'].includes(profile.role)) {
        mergedData = mergedData.filter(item => item.created_by === profile.id || item.assignee_id === profile.id);
      }
      
      return mergedData;
    },

    create: async (taskData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('tasks').insert([{
            ...taskData,
            created_by: creatorProfile.id
          }]).select();
          
          if (error) throw error;
          await logSystemAction('TSK_CREATE', `Criou tarefa: ${taskData.title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase tasks.create failed, using local fallback:", err.message);
        }
      }
      
      const tasks = getLocal('saas_tasks');
      const newTsk = {
        id: 'tsk-' + Math.random().toString(36).substr(2, 9),
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tasks.push(newTsk);
      setLocal('saas_tasks', tasks);
      
      await logSystemAction('TSK_CREATE', `Tarefa no modo demo: ${taskData.title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return newTsk;
    },

    update: async (id, taskData, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('tasks').update({
            ...taskData,
            updated_at: new Date().toISOString()
          }).eq('id', id).select();
          
          if (error) throw error;
          await logSystemAction('TSK_UPDATE', `Atualizou tarefa: ${taskData.title || id} (Status: ${taskData.status || 'sem alteração'})`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return data[0];
        } catch (err) {
          console.warn("Supabase tasks.update failed, using local fallback:", err.message);
        }
      }
      
      const tasks = getLocal('saas_tasks');
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tarefa não encontrada.');
      
      tasks[index] = { 
        ...tasks[index], 
        ...taskData, 
        updated_at: new Date().toISOString() 
      };
      setLocal('saas_tasks', tasks);
      
      await logSystemAction('TSK_UPDATE', `Atualizou tarefa no modo demo: ${tasks[index].title} (Status: ${tasks[index].status})`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      return tasks[index];
    },

    delete: async (id, title, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('tasks').delete().eq('id', id);
          if (error) throw error;
          await logSystemAction('TSK_DELETE', `Apagou a tarefa: ${title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
          return;
        } catch (err) {
          console.warn("Supabase tasks.delete failed, using local fallback:", err.message);
        }
      }
      
      let tasks = getLocal('saas_tasks');
      tasks = tasks.filter(t => t.id !== id);
      setLocal('saas_tasks', tasks);
      await logSystemAction('TSK_DELETE', `Apagou a tarefa no modo demo: ${title}`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
    }
  },

  // ==========================================
  // ADMINISTRATIVE / LOGS SERVICES
  // ==========================================
  admin: {
    getLogs: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        return data;
      } else {
        return getLocal('saas_logs');
      }
    },
    
    getUsers: async () => {
      const localProfiles = getLocal('saas_profiles');
      if (isSupabaseConfigured && supabase) {
        try {
          // Query profiles directly (which lists system users)
          const { data, error } = await supabase.from('profiles').select('*').order('username', { ascending: true });
          if (error) throw error;
          
          // Merge local profiles with database profiles, avoiding duplicates by username
          const merged = [...data];
          localProfiles.forEach(lp => {
            if (!merged.some(m => m.username.toLowerCase() === lp.username.toLowerCase())) {
              merged.push(lp);
            }
          });
          return merged;
        } catch (err) {
          console.warn("Error querying Supabase profiles, using local profiles:", err);
          return localProfiles;
        }
      } else {
        return localProfiles;
      }
    },
    
    
    updateUser: async (id, fullName, role, password = null, creatorProfile = null) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const updateData = {
            full_name: fullName,
            role: role
          };
          const { error } = await supabase.from('profiles').update(updateData).eq('id', id);
          if (error) throw error;
        } catch (err) {
          console.warn("Supabase profile update failed, using local profiles fallback:", err.message);
        }
      }
      
      const profiles = getLocal('saas_profiles');
      const idx = profiles.findIndex(p => p.id === id);
      if (idx !== -1) {
        profiles[idx].full_name = fullName;
        profiles[idx].role = role;
        setLocal('saas_profiles', profiles);
        
        if (password) {
          const authList = getLocal('saas_auth');
          const authIdx = authList.findIndex(a => a.profileId === id);
          if (authIdx !== -1) {
            authList[authIdx].password = password;
            setLocal('saas_auth', authList);
          }
        }
        
        const employees = getLocal('saas_employees');
        const empIdx = employees.findIndex(e => e.profile_id === id);
        if (empIdx !== -1) {
          employees[empIdx].full_name = fullName;
          employees[empIdx].role = role;
          setLocal('saas_employees', employees);
        }
      }
      
      await logSystemAction('USER_UPDATE', `Atualizou dados do usuário: @${profiles[idx]?.username || id}`, creatorProfile?.id || id, creatorProfile?.role || role, creatorProfile?.username);
    },

    deleteUser: async (id, username, creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('profiles').delete().eq('id', id);
          if (error) throw error;
        } catch (err) {
          console.warn("Supabase profile delete failed, using local fallback:", err.message);
        }
      }
      
      const profiles = getLocal('saas_profiles').filter(p => p.id !== id);
      const authList = getLocal('saas_auth').filter(a => a.profileId !== id);
      const employees = getLocal('saas_employees').filter(e => e.profile_id !== id);
      
      setLocal('saas_profiles', profiles);
      setLocal('saas_auth', authList);
      setLocal('saas_employees', employees);
      
      await logSystemAction('USER_DELETE', `Removeu acesso do usuário: @${username}`, creatorProfile?.id, creatorProfile?.role, creatorProfile?.username);
    },

    clearLogs: async (creatorProfile) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) throw error;
        await logSystemAction('LOGS_CLEAR', `Esvaziou os logs do sistema.`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      } else {
        setLocal('saas_logs', []);
        await logSystemAction('LOGS_CLEAR', `Esvaziou os logs do sistema no modo demo.`, creatorProfile.id, creatorProfile.role, creatorProfile.username);
      }
    }
  }
};
