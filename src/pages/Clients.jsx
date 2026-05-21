import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  X, 
  UserPlus, 
  UserCheck, 
  ChevronRight, 
  Building2, 
  Phone, 
  Mail, 
  FileSpreadsheet
} from 'lucide-react';

const Workspace = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  height: calc(100vh - 140px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const SidebarPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
`;

const SearchBox = styled.div`
  position: relative;
  
  input {
    width: 100%;
    background: rgba(10, 10, 12, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 10px 16px 10px 40px;
    border-radius: 8px;
    color: var(--text-white);
    font-size: 0.9rem;
  }

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }
`;

const ClientList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
`;

const ClientItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${props => props.$selected ? 'rgba(139, 30, 47, 0.12)' : 'rgba(255, 255, 255, 0.01)'};
  border: 1px solid ${props => props.$selected ? 'rgba(139, 30, 47, 0.35)' : 'rgba(255, 255, 255, 0.03)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$selected ? 'rgba(139, 30, 47, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
    border-color: ${props => props.$selected ? 'rgba(139, 30, 47, 0.4)' : 'rgba(255, 255, 255, 0.08)'};
  }
`;

const ClientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
`;

const ClientName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClientDoc = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
`;

const DetailsPanel = styled(motion.div)`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  overflow-y: auto;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ContactCard = styled.div`
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--text-gray-light);

  svg {
    color: var(--wine-red-light);
  }
`;

const HistoryBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  textarea {
    width: 100%;
    height: 120px;
    background: rgba(10, 10, 12, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    color: var(--text-white);
    font-size: 0.9rem;
    resize: none;
  }
`;

const ActionBtn = styled.button`
  background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--wine-red)'};
  color: ${props => props.$danger ? '#ef4444' : 'var(--text-white)'};
  border: 1px solid ${props => props.$danger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.2)' : 'var(--wine-red-light)'};
    box-shadow: ${props => props.$danger ? '0 0 10px rgba(239, 68, 68, 0.1)' : '0 0 12px var(--wine-glow)'};
  }
`;

const AddBtn = styled.button`
  background: linear-gradient(135deg, var(--wine-red) 0%, var(--wine-red-dark) 100%);
  color: var(--text-white);
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(139, 30, 47, 0.3);

  &:hover {
    box-shadow: 0 0 15px var(--wine-glow-strong);
    background: linear-gradient(135deg, var(--wine-red-light) 0%, var(--wine-red) 100%);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.01);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    border-color: var(--wine-red-light);
    background: rgba(139, 30, 47, 0.02);
  }

  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const FileList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const FileCard = styled.div`
  background: rgba(14, 14, 18, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled(motion.div)`
  background: #0c0c10;
  border: 1px solid rgba(139, 30, 47, 0.3);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;

  label {
    font-size: 0.75rem;
    color: var(--text-gray);
    text-transform: uppercase;
    font-weight: 600;
  }

  input, select {
    background: rgba(14, 14, 18, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--text-white);
  }
`;

import ConfirmModal from '../components/ConfirmModal';

const formatCNPJCPF = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    return digits.slice(0, 14)
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

const Clients = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historyText, setHistoryText] = useState('');
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [newClient, setNewClient] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    status: 'active',
    history: ''
  });

  const canEdit = profile && ['developer', 'owner', 'employee'].includes(profile.role);
  const canDelete = profile && ['developer', 'owner'].includes(profile.role);

  const fetchClients = async () => {
    try {
      const data = await dbService.clients.getAll(profile);
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
        setHistoryText(data[0].history || '');
      }
    } catch (err) {
      toast.error('Erro ao buscar lista de clientes.');
    }
  };

  const fetchFiles = async (clientId) => {
    try {
      const allFiles = await dbService.documents.getAll(profile);
      const clientFiles = allFiles.filter(f => f.client_id === clientId);
      setFiles(clientFiles);
    } catch (err) {
      console.warn("Erro ao buscar arquivos do cliente:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setHistoryText(selectedClient.history || '');
      fetchFiles(selectedClient.id);
    } else {
      setFiles([]);
    }
  }, [selectedClient]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;

    try {
      const created = await dbService.clients.create(newClient, profile);
      setClients(prev => [...prev, created]);
      setSelectedClient(created);
      setIsModalOpen(false);
      setNewClient({ name: '', document: '', email: '', phone: '', status: 'active', history: '' });
      toast.success('Cliente cadastrado com sucesso.');
    } catch (err) {
      toast.error('Erro ao cadastrar cliente.');
    }
  };

  const handleUpdateHistory = async () => {
    if (!selectedClient) return;
    try {
      const updated = await dbService.clients.update(selectedClient.id, { history: historyText }, profile);
      setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
      setSelectedClient(updated);
      toast.success('Histórico atualizado.');
    } catch (err) {
      toast.error('Erro ao atualizar histórico.');
    }
  };

  const handleDeleteClient = () => {
    if (!selectedClient) return;
    setConfirmState({
      isOpen: true,
      title: 'Excluir Cliente',
      message: `Tem certeza que deseja apagar permanentemente o cliente ${selectedClient.name}?`,
      onConfirm: async () => {
        try {
          await dbService.clients.delete(selectedClient.id, selectedClient.name, profile);
          const remaining = clients.filter(c => c.id !== selectedClient.id);
          setClients(remaining);
          setSelectedClient(remaining.length > 0 ? remaining[0] : null);
          toast.success('Cliente apagado com sucesso.');
        } catch (err) {
          toast.error('Erro ao deletar cliente.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedClient) return;

    setIsLoading(true);
    try {
      const uploaded = await dbService.documents.upload(selectedClient.id, file, profile);
      setFiles(prev => [uploaded, ...prev]);
      toast.success(`Arquivo ${file.name} enviado.`);
    } catch (err) {
      toast.error('Erro ao enviar arquivo para o storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = async (file) => {
    try {
      await dbService.documents.download(file.file_path, file.name);
    } catch (err) {
      toast.error('Erro ao baixar arquivo.');
    }
  };

  const handleFileDelete = (file) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir Documento',
      message: `Deseja apagar o arquivo ${file.name}?`,
      onConfirm: async () => {
        try {
          await dbService.documents.delete(file.id, file.file_path, file.name, profile);
          setFiles(prev => prev.filter(f => f.id !== file.id));
          toast.success('Arquivo excluído com sucesso.');
        } catch (err) {
          toast.error('Erro ao deletar arquivo.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.document && c.document.includes(searchTerm))
  );

  return (
    <Workspace>
      {/* Sidebar List */}
      <SidebarPanel>
        <SearchBox>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        {canEdit && (
          <AddBtn onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} />
            Cadastrar Cliente
          </AddBtn>
        )}

        <ClientList>
          {filteredClients.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 20 }}>Nenhum cliente cadastrado.</div>
          ) : (
            filteredClients.map(c => (
              <ClientItem 
                key={c.id} 
                $selected={selectedClient?.id === c.id}
                onClick={() => setSelectedClient(c)}
              >
                <ClientInfo>
                  <ClientName>{c.name}</ClientName>
                  <ClientDoc>{c.document || 'Sem Documento'}</ClientDoc>
                </ClientInfo>
                <ChevronRight size={14} style={{ color: selectedClient?.id === c.id ? 'var(--wine-red-light)' : 'var(--text-muted)' }} />
              </ClientItem>
            ))
          )}
        </ClientList>
      </SidebarPanel>

      {/* Detail Area */}
      <AnimatePresence mode="wait">
        {selectedClient ? (
          <DetailsPanel
            key={selectedClient.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DetailHeader>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building2 size={24} style={{ color: 'var(--wine-red-light)' }} />
                  {selectedClient.name}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-wine)', fontFamily: 'var(--font-mono)' }}>ID: {selectedClient.id}</p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {canDelete && (
                  <ActionBtn $danger onClick={handleDeleteClient}>
                    <Trash2 size={14} /> Excluir
                  </ActionBtn>
                )}
              </div>
            </DetailHeader>

            <ContactGrid>
              <ContactCard>
                <Mail size={16} />
                <span>{selectedClient.email || 'Email não cadastrado'}</span>
              </ContactCard>
              <ContactCard>
                <Phone size={16} />
                <span>{selectedClient.phone || 'Telefone não cadastrado'}</span>
              </ContactCard>
            </ContactGrid>

            {/* Notepad / History */}
            <HistoryBox>
              <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--text-gray-light)' }}>Histórico & Anotações</h3>
              <textarea 
                value={historyText}
                onChange={(e) => setHistoryText(e.target.value)}
                placeholder="Insira o histórico de transações, auditorias e pendências deste cliente..."
                disabled={!canEdit}
              />
              {canEdit && (
                <div style={{ alignSelf: 'flex-end' }}>
                  <ActionBtn onClick={handleUpdateHistory}>Salvar Histórico</ActionBtn>
                </div>
              )}
            </HistoryBox>

            {/* Document upload / files list */}
            <div>
              <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--text-gray-light)', marginBottom: 12 }}>Documentação Digitalizada</h3>
              
              {canEdit && (
                <FileUploadArea>
                  <input type="file" onChange={handleFileUpload} disabled={isLoading} />
                  <Upload size={24} style={{ color: 'var(--wine-red-light)', marginBottom: 8 }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Arraste ou clique para enviar arquivos (PDF, XML, Planilhas)</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Conexão direta com Supabase Storage</p>
                </FileUploadArea>
              )}

              <FileList>
                {files.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sem documentos anexados.</div>
                ) : (
                  files.map(f => (
                    <FileCard key={f.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <FileSpreadsheet size={18} style={{ color: 'var(--wine-red-light)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleFileDownload(f)} style={{ color: 'var(--text-gray)', padding: 4 }}>
                          <Download size={14} />
                        </button>
                        {canDelete && (
                          <button onClick={() => handleFileDelete(f)} style={{ color: '#ef4444', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </FileCard>
                  ))
                )}
              </FileList>
            </div>
          </DetailsPanel>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(18, 18, 22, 0.2)', borderRadius: 16, border: '1px dashed rgba(255, 255, 255, 0.05)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Selecione um cliente para abrir a ficha cadastral.</p>
          </div>
        )}
      </AnimatePresence>

      {/* Create Client Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Novo Cliente SaaS</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClient}>
              <FormGroup>
                <label>Razão Social / Nome</label>
                <input 
                  type="text" 
                  required 
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Ex: Acme Corp S/A"
                />
              </FormGroup>

              <FormGroup>
                <label>CNPJ / CPF</label>
                <input 
                  type="text" 
                  value={newClient.document}
                  onChange={(e) => setNewClient({...newClient, document: formatCNPJCPF(e.target.value)})}
                  placeholder="Ex: 00.000.000/0001-00"
                />
              </FormGroup>

              <FormGroup>
                <label>Email Corporativo</label>
                <input 
                  type="email" 
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="financeiro@acme.com"
                />
              </FormGroup>

              <FormGroup>
                <label>Telefone Contato</label>
                <input 
                  type="text" 
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: formatPhone(e.target.value)})}
                  placeholder="(11) 98765-4321"
                />
              </FormGroup>

              <FormGroup>
                <label>Status Operacional</label>
                <select 
                  value={newClient.status}
                  onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </FormGroup>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <ActionBtn type="button" $danger onClick={() => setIsModalOpen(false)}>Cancelar</ActionBtn>
                <ActionBtn type="submit">Confirmar Registro</ActionBtn>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
      
      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </Workspace>
  );
};

export default Clients;
