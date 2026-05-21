import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  FileText, 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  HardDrive, 
  Layers, 
  UserCheck, 
  ChevronRight,
  Database,
  Calendar
} from 'lucide-react';

const DocsGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const MainPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const KPIHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPIBox = styled.div`
  background: rgba(28, 28, 35, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.75rem;
    color: var(--text-gray);
    text-transform: uppercase;
    font-weight: 600;
  }

  select {
    background: rgba(14, 14, 18, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--text-white);
  }
`;

const DocumentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;

  th {
    padding: 12px 16px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }
`;

const FormatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

import ConfirmModal from '../components/ConfirmModal';

const Documents = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const canEdit = profile && ['developer', 'owner', 'client', 'employee'].includes(profile.role);
  const canDelete = profile && ['developer', 'owner'].includes(profile.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      let docs = await dbService.documents.getAll(profile);
      const clis = await dbService.clients.getAll(profile);
      
      if (profile?.role === 'client') {
        docs = docs.filter(d => d.client_id === 'cli-default' || d.clients?.name === 'Cliente Gold');
        setSelectedClientId('cli-default');
      } else {
        if (clis.length > 0) {
          setSelectedClientId(clis[0].id);
        }
      }
      
      setDocuments(docs);
      setClients(clis);
    } catch (err) {
      toast.error('Erro ao buscar diretório de arquivos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedClientId) {
      toast.error('Selecione um cliente para vincular o documento.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await dbService.documents.upload(selectedClientId, file, profile);
      // Re-fetch all documents to reflect client name relations
      const docs = await dbService.documents.getAll(profile);
      setDocuments(docs);
      toast.success(`Arquivo ${file.name} arquivado com sucesso.`);
    } catch (err) {
      toast.error('Erro ao realizar upload do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await dbService.documents.download(doc.file_path, doc.name);
    } catch (err) {
      toast.error('Erro ao baixar documento.');
    }
  };

  const handleDelete = (doc) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir Documento',
      message: `Excluir permanentemente o documento "${doc.name}"?`,
      onConfirm: async () => {
        try {
          await dbService.documents.delete(doc.id, doc.file_path, doc.name, profile);
          setDocuments(prev => prev.filter(d => d.id !== doc.id));
          toast.success('Documento deletado.');
        } catch (err) {
          toast.error('Erro ao deletar documento.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.clients?.name && doc.clients.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Storage KPIs */}
      <KPIHeader>
        <KPIBox>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Volume Armazenado</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{FormatBytes(totalSize)}</span>
          </div>
          <HardDrive size={24} style={{ color: 'var(--wine-red-light)' }} />
        </KPIBox>
        <KPIBox>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total de Documentos</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{documents.length}</span>
          </div>
          <Layers size={24} style={{ color: '#3b82f6' }} />
        </KPIBox>
        <KPIBox>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Infraestrutura Cloud</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>Supabase Storage</span>
          </div>
          <Database size={24} style={{ color: '#10b981' }} />
        </KPIBox>
      </KPIHeader>

      <DocsGrid>
        {/* Left Column - Actions/Upload */}
        <SidebarPanel>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-white)' }}>Arquivo Digital</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vincule balanços, guias fiscais e contratos diretamente à ficha de seus clientes cadastrados.</p>
          
          {canEdit && (
            <>
              {profile?.role !== 'client' && (
                <FormGroup>
                  <label>Selecionar Cliente Vinculado</label>
                  <select 
                    value={selectedClientId} 
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormGroup>
              )}

              <FileUploadArea>
                <input type="file" onChange={handleFileUpload} disabled={uploading || !selectedClientId} />
                <Upload size={24} style={{ color: 'var(--wine-red-light)', marginBottom: 8 }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{uploading ? 'Enviando...' : 'Fazer Upload'}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>PDF, XML, XLSX ou Imagens</p>
              </FileUploadArea>
            </>
          )}
        </SidebarPanel>

        {/* Right Column - Table of Docs */}
        <MainPanel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Explorer de Documentos</h3>
            <SearchBox style={{ width: 250 }}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Escaneando diretório de arquivos...</div>
            ) : filteredDocs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum documento encontrado.</div>
            ) : (
              <DocumentTable>
                <thead>
                  <tr>
                    <th>Nome do Documento</th>
                    <th>Cliente Associado</th>
                    <th>Tamanho</th>
                    <th>Data de Upload</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={16} style={{ color: 'var(--wine-red-light)' }} />
                        <span>{doc.name}</span>
                      </td>
                      <td style={{ color: 'var(--text-gray-light)' }}>{doc.clients?.name || 'Geral/Sem cliente'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{FormatBytes(doc.file_size)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={12} />
                          <span>{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleDownload(doc)} style={{ color: 'var(--text-gray)', padding: 4 }} title="Download">
                            <Download size={14} />
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDelete(doc)} style={{ color: '#ef4444', padding: 4 }} title="Excluir">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DocumentTable>
            )}
          </div>
        </MainPanel>
      </DocsGrid>

      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default Documents;
