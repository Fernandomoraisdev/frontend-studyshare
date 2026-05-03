import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Folder, ChevronRight, FileText, User, Plus } from 'lucide-react';

const CategoryView = () => {
  const { id } = useParams();
  const [folders, setFolders] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, foldersRes] = await Promise.all([
          api.get('/api/categories'),
          api.get(`/api/categories/${id}/folders`)
        ]);
        const cat = categoriesRes.data.find(c => c.id === parseInt(id));
        setCategory(cat);
        setFolders(foldersRes.data);
      } catch (err) {
        console.error('Erro ao buscar pastas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando pastas...</div>;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-12">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <Link to="/" className="text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline">Home</Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{category?.name}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">{category?.name}</h1>
          <p className="text-slate-500 font-bold max-w-lg">Explore as pastas de resumos enviadas por estudantes da área de {category?.name}.</p>
        </div>
        <Link to="/upload" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center space-x-2">
          <Plus size={18} />
          <span>Novo Resumo</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {folders.map((folder) => (
          <div key={folder.id} className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center space-x-3">
                <Folder className="text-indigo-600" size={24} />
                <span>{folder.name}</span>
              </h2>
              <Link to={`/folder/${folder.id}`} className="text-sm font-bold text-indigo-600 hover:underline flex items-center space-x-1">
                <span>Ver tudo</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folder.resumes?.length > 0 ? (
                folder.resumes.map((resume) => (
                  <Link
                    key={resume.id}
                    to={`/resume/${resume.id}`}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate mb-1">{resume.title}</h4>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <User size={12} />
                          <span className="truncate">{resume.user?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                  <p className="text-sm font-bold text-slate-400 italic">Nenhum resumo nesta pasta ainda.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryView;
