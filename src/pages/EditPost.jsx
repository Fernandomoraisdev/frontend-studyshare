import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, AlertCircle, FileText, Upload as UploadIcon, Hash, Paperclip, Trash2, ChevronRight } from 'lucide-react';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [post, setPost] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    folderId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, postRes] = await Promise.all([
          api.get('/api/categories'),
          api.get(`/api/resumes/${id}/edit`),
        ]);

        setCategories(categoriesRes.data);
        setPost(postRes.data);

        const currentCategoryId = postRes.data?.folder?.category?.id;
        const currentFolderId = postRes.data?.folder?.id;
        const tagsText = (postRes.data?.tags || []).map((t) => t.name).join(', ');

        setSelectedCategory(currentCategoryId ? String(currentCategoryId) : '');
        const cat = categoriesRes.data.find((c) => c.id === currentCategoryId);
        setFolders(cat ? cat.folders : []);

        setFormData({
          title: postRes.data?.title || '',
          description: postRes.data?.description || '',
          content: postRes.data?.content || '',
          tags: tagsText,
          folderId: currentFolderId ? String(currentFolderId) : '',
        });
      } catch (err) {
        if (err.response?.status === 401) return navigate('/login');
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao carregar post para edição.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    const category = categories.find((c) => c.id === parseInt(categoryId));
    setFolders(category ? category.folders : []);
    setFormData((prev) => ({ ...prev, folderId: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put(`/api/resumes/${id}`, {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        tags: formData.tags,
        folderId: formData.folderId,
        removeFile,
      });

      setMessage({ type: 'success', text: 'Post atualizado com sucesso!' });
      setTimeout(() => navigate(`/resume/${id}`), 800);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar post.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReplaceFile = async () => {
    if (!newFile) return;

    try {
      setUploadingFile(true);
      setMessage({ type: '', text: '' });

      const data = new FormData();
      data.append('resume', newFile);

      const response = await api.post(`/api/resumes/${id}/file`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPost(response.data.resume);
      setNewFile(null);
      setRemoveFile(false);
      setMessage({ type: 'success', text: response.data.message || 'Arquivo atualizado!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao trocar arquivo.' });
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando edição...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Link to="/" className="text-indigo-600 hover:underline">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/resume/${id}`} className="text-indigo-600 hover:underline">Post</Link>
        <ChevronRight size={12} />
        <span>Editar</span>
      </div>

      <div className="bg-indigo-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter mb-4">Editar Post</h2>
          <p className="text-indigo-200 font-bold max-w-md">Atualize o texto, tags e organização do seu conteúdo.</p>
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
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
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
                placeholder="Título"
                onChange={handleChange}
                value={formData.title}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição (Opcional)</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Descrição"
              onChange={handleChange}
              value={formData.description}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Texto do Post (Opcional)</label>
            <textarea
              name="content"
              rows="7"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Conteúdo em texto..."
              onChange={handleChange}
              value={formData.content}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags (Opcional)</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                name="tags"
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: biologia, prova1"
                onChange={handleChange}
                value={formData.tags}
              />
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Separe por vírgulas</p>
          </div>

          <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
                <Paperclip size={18} className="text-indigo-600" />
                {post?.fileUrl ? 'Arquivo anexado' : 'Adicionar arquivo'}
              </div>
              {post?.fileUrl && (
                <a href={post.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
                  Abrir
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <label className="flex-1 cursor-pointer px-6 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 hover:border-indigo-200 transition-colors flex items-center gap-2">
                <UploadIcon size={18} className="text-slate-400" />
                <span className="truncate">{newFile ? newFile.name : 'Selecionar novo arquivo (PDF/JPG/PNG/DOCX)'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewFile(file);
                    if (file) setRemoveFile(false);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleReplaceFile}
                disabled={!newFile || uploadingFile}
                className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 whitespace-nowrap"
              >
                {uploadingFile ? 'Enviando...' : post?.fileUrl ? 'Trocar arquivo' : 'Anexar arquivo'}
              </button>
            </div>

            {post?.fileUrl && (
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={removeFile}
                    onChange={(e) => setRemoveFile(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                    disabled={Boolean(newFile)}
                  />
                  Remover arquivo deste post
                </label>
              </div>
            )}

            {removeFile && (
              <div className="text-xs font-bold text-red-600 flex items-center gap-2">
                <Trash2 size={16} />
                O arquivo será removido ao salvar.
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingFile}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
};

export default EditPost;
