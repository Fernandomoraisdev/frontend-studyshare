import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload as UploadIcon, CheckCircle, AlertCircle, FileText, Folder } from 'lucide-react';

const Upload = () => {
  const [categories, setCategories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', content: '', tags: '', folderId: '', resume: null
  });
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    const category = categories.find(c => c.id === parseInt(categoryId));
    setFolders(category ? category.folders : []);
    setFormData((current) => ({ ...current, folderId: '' }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!selectedCategory || !name) return;

    try {
      setCreatingFolder(true);
      setMessage({ type: '', text: '' });
      const response = await api.post('/api/categories/folders', {
        name,
        categoryId: selectedCategory,
      });
      const folder = response.data;
      setFolders((current) => [...current, folder]);
      setCategories((current) =>
        current.map((category) =>
          category.id === parseInt(selectedCategory)
            ? { ...category, folders: [...(category.folders || []), folder] }
            : category
        )
      );
      setFormData((current) => ({ ...current, folderId: String(folder.id) }));
      setNewFolderName('');
      setMessage({ type: 'success', text: 'Pasta criada e selecionada.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao criar pasta.' });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.resume && !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Escreva um texto ou anexe um arquivo para publicar.' });
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('content', formData.content);
    data.append('tags', formData.tags);
    data.append('folderId', formData.folderId);
    if (formData.resume) data.append('resume', formData.resume);

    try {
      await api.post('/api/resumes/upload', data, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'Seu post foi publicado com sucesso!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao publicar post.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-indigo-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter mb-4">Compartilhar Conhecimento</h2>
          <p className="text-indigo-200 font-bold max-w-md">Publique um post de estudo com texto, tags e (se quiser) um arquivo PDF, imagem ou documento.</p>
        </div>
        <UploadIcon size={200} className="absolute -right-20 -bottom-20 text-white/5" />
      </div>

      {message.text && (
        <div className={`p-6 rounded-3xl flex items-center text-sm font-bold ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} className="mr-3" /> : <AlertCircle size={20} className="mr-3" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área de Estudo</label>
              <select
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                onChange={handleCategoryChange}
                value={selectedCategory}
              >
                <option value="" disabled>Selecione a área</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pasta / Assunto</label>
              <select
                name="folderId"
                required
                disabled={!selectedCategory}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none disabled:opacity-50"
                onChange={handleChange}
                value={formData.folderId}
              >
                <option value="" disabled>Selecione a pasta</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  disabled={!selectedCategory}
                  className="min-w-0 flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  placeholder="Criar nova pasta ou subpasta"
                />
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  disabled={!selectedCategory || !newFolderName.trim() || creatingFolder}
                  className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {creatingFolder ? '...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Post</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                name="title"
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Anotações de Neuroanatomia - Parte 1"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Opcional</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Dê uma breve explicação sobre o conteúdo deste post..."
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Texto do Post (Opcional)</label>
            <textarea
              name="content"
              rows="6"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Cole trechos de livro, escreva suas ideias, um resumo em texto, etc..."
              onChange={handleChange}
              value={formData.content}
            ></textarea>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Dica: você pode postar só texto, só arquivo, ou os dois</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags (Opcional)</label>
            <input
              name="tags"
              type="text"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: neuro, anatomia, prova1"
              onChange={handleChange}
              value={formData.tags}
            />
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Separe por vírgulas. Ex: biologia, citologia</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arquivo (Opcional)</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer group">
              <input
                name="resume"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
              />
              <div className="space-y-2">
                <UploadIcon className="mx-auto text-slate-300 group-hover:text-indigo-500 transition-colors" size={32} />
                <p className="text-sm font-bold text-slate-500">
                  {formData.resume ? formData.resume.name : 'Clique para selecionar ou arraste o arquivo'}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">PDF, JPG, PNG ou DOCX</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Publicar na Plataforma'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
