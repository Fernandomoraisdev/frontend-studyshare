import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { resolveMediaUrl } from '../services/api';
import { Folder, ChevronRight, FileText, User, Eye, Plus } from 'lucide-react';

const FolderView = () => {
  const { id } = useParams();
  const [resumes, setResumes] = useState([]);
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/resumes/folder/${id}`);
        setResumes(response.data);
        // Simulação de busca de detalhes da pasta
        const catRes = await api.get('/api/categories');
        for (const cat of catRes.data) {
          const f = cat.folders.find(f => f.id === parseInt(id));
          if (f) {
            setFolder({ ...f, category: cat });
            break;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar resumos da pasta:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando resumos...</div>;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-12">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <Link to="/" className="text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline">Home</Link>
            <ChevronRight size={12} className="text-slate-300" />
            <Link to={`/category/${folder?.category?.id}`} className="text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline">{folder?.category?.name}</Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{folder?.name}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center justify-center md:justify-start space-x-4">
            <Folder className="text-indigo-600" size={32} />
            <span>{folder?.name}</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-lg">Explore todos os resumos compartilhados nesta pasta temática.</p>
        </div>
        <Link to="/upload" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center space-x-2">
          <Plus size={18} />
          <span>Novo Resumo</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resumes.length > 0 ? (
          resumes.map((resume) => (
            <Link
              key={resume.id}
              to={`/resume/${resume.id}`}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group"
            >
              <div className="flex flex-col h-full justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <FileText size={28} />
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <Eye size={12} />
                    <span>{resume.views}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{resume.title}</h4>
                  <p className="text-sm text-slate-400 font-medium line-clamp-2">{resume.description || 'Sem descrição adicional.'}</p>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700 border-2 border-white shadow-sm overflow-hidden">
                    {resume.user?.photoUrl ? <img src={resolveMediaUrl(resume.user.photoUrl)} alt="Foto" className="w-full h-full object-cover" /> : resume.user?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{resume.user?.name}</p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest truncate">{resume.user?.area}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full p-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
            <FileText className="mx-auto text-slate-200" size={64} />
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-400 italic">Esta pasta ainda está vazia.</p>
              <p className="text-sm text-slate-300 font-medium">Seja o primeiro a contribuir com resumos de {folder?.name}!</p>
            </div>
            <button onClick={() => window.location.href='/upload'} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-100 border border-indigo-50">
              Subir meu conteúdo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderView;
