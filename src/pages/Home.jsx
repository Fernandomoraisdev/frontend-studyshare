import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Brain,
  Calculator,
  ChevronRight,
  Database,
  Download,
  Eye,
  Globe,
  GraduationCap,
  Hash,
  Heart,
  History,
  LogIn,
  MessageCircle,
  Microscope,
  Paperclip,
  UserPlus,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [feed, setFeed] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') || '';
  const selectedTag = searchParams.get('tag') || '';
  const followingOnly = searchParams.get('following') === '1';

  useEffect(() => {
    const fetchBase = async () => {
      setCategoriesLoading(true);

      const [categoriesResult, tagsResult] = await Promise.allSettled([
        api.get('/api/categories'),
        api.get('/api/tags'),
      ]);

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data);
      } else {
        setCategories([]);
      }

      if (tagsResult.status === 'fulfilled') {
        setTags(tagsResult.value.data);
      } else {
        setTags([]);
      }

      setCategoriesLoading(false);
    };

    fetchBase();
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setFeedLoading(true);
        setFeedError('');

        const params = {};
        if (q) params.q = q;
        if (selectedTag) params.tag = selectedTag;
        if (followingOnly) params.following = 1;

        const response = await api.get('/api/resumes/feed', { params });
        setFeed(response.data);
      } catch (err) {
        setFeed([]);
        if (err.response?.status === 401) {
          setFeedError(err.response?.data?.message || 'Faca login para ver o feed de seguindo.');
        } else {
          setFeedError('Nao foi possivel carregar o feed agora.');
        }
      } finally {
        setFeedLoading(false);
      }
    };

    fetchFeed();
  }, [q, selectedTag, followingOnly]);

  const getIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'psicologia':
        return <Brain size={32} />;
      case 'matematica':
      case 'matemática':
        return <Calculator size={32} />;
      case 'biologia':
        return <Microscope size={32} />;
      case 'ensino medio':
      case 'ensino médio':
        return <GraduationCap size={32} />;
      case 'historia':
      case 'história':
        return <History size={32} />;
      default:
        return <Globe size={32} />;
    }
  };

  const setTagFilter = (tagName) => {
    const next = new URLSearchParams(searchParams);
    if (!tagName) next.delete('tag');
    else next.set('tag', tagName);
    setSearchParams(next);
  };

  const setFollowingFilter = (value) => {
    if (value) {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
    }

    const next = new URLSearchParams(searchParams);
    if (value) next.set('following', '1');
    else next.delete('following');
    setSearchParams(next);
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next);
  };

  const triggerDownload = (postId) => {
    const link = document.createElement('a');
    link.href = `/api/resumes/${postId}/download`;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-12">
      <header className="text-center space-y-6 max-w-3xl mx-auto py-12">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
          Onde o conhecimento &eacute; <span className="text-indigo-600">compartilhado</span>.
        </h1>
        <p className="text-lg text-slate-500 font-bold leading-relaxed">
          Encontre e compartilhe conte&uacute;dos de estudo organizados por &aacute;reas, pastas e tags. De alunos para alunos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            <LogIn size={18} />
            Entrar
          </Link>
          <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-sm border border-indigo-100">
            <UserPlus size={18} />
            Criar conta
          </Link>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest text-sm">Feed</h2>
            {(q || selectedTag) && (
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-400">
                {q && (
                  <button onClick={clearSearch} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                    Busca: <span className="text-slate-700">{q}</span> (limpar)
                  </button>
                )}
                {selectedTag && (
                  <button onClick={() => setTagFilter('')} className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1">
                    <Hash size={14} /> {selectedTag} (remover)
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFollowingFilter(false)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                  !followingOnly ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Explorar
              </button>
              <button
                onClick={() => setFollowingFilter(true)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                  followingOnly ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-700'
                }`}
              >
                Seguindo
              </button>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <button
                onClick={() => setTagFilter('')}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                  !selectedTag ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Todos
              </button>
              {tags.slice(0, 10).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagFilter(tag.name)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-1 ${
                    selectedTag === tag.name
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-700'
                  }`}
                  title={`${tag.posts} posts`}
                >
                  <Hash size={14} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {feedLoading ? (
          <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando feed...</div>
        ) : feedError ? (
          <div className="p-12 bg-white rounded-[2rem] border border-amber-100 text-center space-y-3 shadow-sm">
            <p className="text-lg font-bold text-slate-600">{feedError}</p>
            <p className="text-sm text-slate-400 font-medium">
              Nenhum post disponível no momento.
            </p>
          </div>
        ) : feed.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feed.map((post) => (
              <Link
                key={post.id}
                to={`/resume/${post.id}`}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-base font-black text-indigo-700 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                    {post.user?.photoUrl ? (
                      <img src={post.user.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      post.user?.name?.charAt(0)
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{post.user?.name}</p>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest truncate">{post.user?.area}</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {post.fileUrl && (
                            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Paperclip size={18} />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              triggerDownload(post.id);
                            }}
                            className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            title="Baixar"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-3">
                        {post.description || post.content || 'Sem descricao.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(post.tags || []).slice(0, 5).map((t) => (
                        <span key={t.id} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Hash size={12} />
                          {t.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="text-indigo-600">{post.folder?.category?.name}</span>
                      <span>-</span>
                      <span>{post.folder?.name}</span>
                      <span className="hidden sm:inline">-</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                      <span className="flex items-center gap-1"><Heart size={12} /> {post._count?.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {post._count?.comments || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-3">
            <p className="text-lg font-bold text-slate-400 italic">Nenhum post encontrado.</p>
            <p className="text-sm text-slate-300 font-medium">Tente remover filtros ou publique o primeiro conteudo.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest text-sm">&Aacute;reas de Estudo</h2>
          <span className="text-xs font-bold text-slate-400">{categories.length} Categorias</span>
        </div>

        {categoriesLoading ? (
          <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando &aacute;reas de estudo...</div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                      {getIcon(category.name)}
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={24} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{category.name}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      {category.folders?.length || 0} Pastas de Resumos
                    </p>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 text-indigo-50/50 group-hover:text-indigo-100 transition-colors duration-500">
                  {getIcon(category.name)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-[2.5rem] border border-amber-100 shadow-sm text-center space-y-4">
            <Database className="mx-auto text-amber-500" size={42} />
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-sm font-bold text-slate-500 max-w-2xl mx-auto">
                Ainda não há categorias cadastradas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login" className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                Abrir login
              </Link>
              <Link to="/register" className="w-full sm:w-auto bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Abrir cadastro
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left space-y-4">
            <h2 className="text-3xl font-black tracking-tighter">N&atilde;o encontrou o que procurava?</h2>
            <p className="text-indigo-200 font-bold text-lg">Seja o primeiro a contribuir na sua &aacute;rea e ajude milhares de estudantes pelo Brasil.</p>
          </div>
          <Link to="/upload" className="bg-white text-indigo-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20 whitespace-nowrap">
            Publicar meu primeiro post
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
