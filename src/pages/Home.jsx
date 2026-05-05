import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Bookmark,
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Hash,
  Heart,
  Image,
  MessageCircle,
  PlusCircle,
  Repeat2,
  Search,
  Send,
  Share2,
  Sparkles,
  Upload,
  UserPlus,
  Users,
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
  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchBase = async () => {
      setCategoriesLoading(true);

      const [categoriesResult, tagsResult] = await Promise.allSettled([
        api.get('/api/categories'),
        api.get('/api/tags'),
      ]);

      setCategories(categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : []);
      setTags(tagsResult.status === 'fulfilled' ? tagsResult.value.data : []);
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
        setFeedError(err.response?.data?.message || 'Nao foi possivel carregar o feed agora.');
      } finally {
        setFeedLoading(false);
      }
    };

    fetchFeed();
  }, [q, selectedTag, followingOnly]);

  const setTagFilter = (tagName) => {
    const next = new URLSearchParams(searchParams);
    if (!tagName) next.delete('tag');
    else next.set('tag', tagName);
    setSearchParams(next);
  };

  const setFollowingFilter = (value) => {
    if (value && !localStorage.getItem('token')) return navigate('/login');

    const next = new URLSearchParams(searchParams);
    if (value) next.set('following', '1');
    else next.delete('following');
    setSearchParams(next);
  };

  const triggerDownload = (postId) => {
    const link = document.createElement('a');
    const apiBase = api.defaults.baseURL || '';
    link.href = `${apiBase}/api/resumes/${postId}/download`;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const toggleLike = async (postId) => {
    if (!localStorage.getItem('token')) return navigate('/login');

    try {
      const response = await api.post(`/api/resumes/${postId}/like`);
      setFeed((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          const likes = post._count?.likes || 0;
          const liked = Boolean(response.data.liked);
          const nextLikes = liked ? likes + 1 : Math.max(likes - 1, 0);
          return {
            ...post,
            likedByMe: liked,
            _count: { ...(post._count || {}), likes: nextLikes },
          };
        })
      );
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const sharePost = async (post) => {
    const url = `${window.location.origin}/resume/${post.id}`;
    const title = post.title;

    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard?.writeText(url);
    }

    try {
      const response = await api.post(`/api/social/resumes/${post.id}/share`, { target: 'web' });
      setFeed((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, _count: { ...(item._count || {}), shares: response.data.shareCount } }
            : item
        )
      );
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const toggleRepost = async (postId) => {
    if (!localStorage.getItem('token')) return navigate('/login');

    try {
      const response = await api.post(`/api/social/resumes/${postId}/repost`);
      setFeed((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                repostedByMe: Boolean(response.data.reposted),
                _count: { ...(post._count || {}), reposts: response.data.repostCount },
              }
            : post
        )
      );
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const toggleSave = async (postId) => {
    if (!localStorage.getItem('token')) return navigate('/login');

    try {
      const response = await api.post(`/api/social/resumes/${postId}/save`);
      setFeed((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                savedByMe: Boolean(response.data.saved),
                _count: { ...(post._count || {}), savedBy: response.data.savedCount },
              }
            : post
        )
      );
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const createStatus = async () => {
    if (!localStorage.getItem('token')) return navigate('/login');
    const text = window.prompt('Escreva seu status de estudo');
    if (!text?.trim()) return;

    try {
      await api.post('/api/social/stories', { text: text.trim() });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const sendFriendRequest = async (userId) => {
    if (!localStorage.getItem('token')) return navigate('/login');
    if (!userId || userId === savedUser?.id) return;

    try {
      await api.post(`/api/social/friends/${userId}/request`);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const people = feed
    .map((post) => post.user)
    .filter(Boolean)
    .filter((user, index, arr) => arr.findIndex((item) => item.id === user.id) === index)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_280px] gap-6">
      <aside className="hidden lg:block space-y-4 sticky top-24 self-start">
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="h-20 bg-indigo-600" />
          <div className="p-4 -mt-10">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
              {savedUser?.photoUrl ? (
                <img src={savedUser.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-indigo-600">{savedUser?.name?.charAt(0) || 'S'}</span>
              )}
            </div>
            <h2 className="mt-3 text-base font-black text-slate-900">{savedUser?.name || 'Seu perfil academico'}</h2>
            <p className="text-xs font-bold text-slate-500">{savedUser?.area || 'Escolha sua area e comece a publicar'}</p>
          </div>
          <div className="border-t border-slate-100 p-2">
            <Link to={savedUser ? '/profile' : '/register'} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Users size={18} />
              Perfil e amigos
            </Link>
            <Link to="/upload" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Upload size={18} />
              Postar arquivo
            </Link>
            <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Bookmark size={18} />
              Album de salvos
            </button>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-black text-slate-900">Atalhos</h3>
          <div className="space-y-2 text-sm font-bold text-slate-600">
            <button onClick={() => setFollowingFilter(false)} className="block hover:text-indigo-600">Explorar posts</button>
            <button onClick={() => setFollowingFilter(true)} className="block hover:text-indigo-600">Seguindo</button>
            <Link to="/upload" className="block hover:text-indigo-600">Nova contribuicao</Link>
          </div>
        </section>
      </aside>

      <main className="space-y-4 min-w-0">
        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black">
              {savedUser?.name?.charAt(0) || 'S'}
            </div>
            <button
              onClick={() => navigate(savedUser ? '/upload' : '/login')}
              className="flex-1 text-left px-4 py-3 rounded-full bg-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Compartilhe um resumo, trabalho, ideia ou arquivo...
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100">
            <Link to="/upload" className="flex justify-center items-center gap-2 rounded-md py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <FileText size={18} className="text-indigo-600" />
              Postar
            </Link>
            <button onClick={createStatus} className="flex justify-center items-center gap-2 rounded-md py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Image size={18} className="text-emerald-600" />
              Status
            </button>
            <button className="flex justify-center items-center gap-2 rounded-md py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Sparkles size={18} className="text-amber-500" />
              Contribuir
            </button>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <button onClick={createStatus} className="min-w-[96px] h-32 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center gap-2 font-black text-xs">
              <PlusCircle size={22} />
              Criar status
            </button>
            {people.map((person) => (
              <Link key={person.id} to={`/user/${person.id}`} className="min-w-[96px] h-32 rounded-lg bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-indigo-500/40" />
                <div className="absolute top-2 left-2 w-9 h-9 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-indigo-700 font-black">
                  {person.photoUrl ? <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover rounded-full" /> : person.name?.charAt(0)}
                </div>
                <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-black leading-tight">{person.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={q}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value) next.set('q', event.target.value);
                  else next.delete('q');
                  setSearchParams(next);
                }}
                placeholder="Pesquisar no feed"
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFollowingFilter(false)}
                className={`px-3 py-2 rounded-md text-xs font-black ${!followingOnly ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Explorar
              </button>
              <button
                onClick={() => setFollowingFilter(true)}
                className={`px-3 py-2 rounded-md text-xs font-black ${followingOnly ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Seguindo
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pt-3">
            <button
              onClick={() => setTagFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap ${!selectedTag ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Todos
            </button>
            {tags.slice(0, 12).map((tag) => (
              <button
                key={tag.id}
                onClick={() => setTagFilter(tag.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-1 ${
                  selectedTag === tag.name ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Hash size={13} />
                {tag.name}
              </button>
            ))}
          </div>
        </section>

        {feedLoading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 font-bold">Carregando feed...</div>
        ) : feedError ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <p className="font-black text-slate-700">{feedError}</p>
            <p className="text-sm font-bold text-slate-400 mt-1">Tente atualizar a pagina ou publicar o primeiro conteudo.</p>
          </div>
        ) : feed.length > 0 ? (
          <div className="space-y-4">
            {feed.map((post) => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 flex items-start gap-3">
                  <Link to={`/user/${post.user?.id}`} className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black overflow-hidden flex-shrink-0">
                    {post.user?.photoUrl ? <img src={post.user.photoUrl} alt={post.user.name} className="w-full h-full object-cover" /> : post.user?.name?.charAt(0)}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/user/${post.user?.id}`} className="text-sm font-black text-slate-900 hover:underline truncate block">{post.user?.name}</Link>
                        <p className="text-xs font-bold text-slate-500 truncate">
                          {post.user?.area} - {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-[11px] font-black text-slate-500">{post.folder?.category?.name}</span>
                    </div>

                    <Link to={`/resume/${post.id}`} className="block mt-4 space-y-2 group">
                      <h2 className="text-xl font-black text-slate-900 group-hover:text-indigo-600">{post.title}</h2>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed">{post.description || post.content || 'Sem descricao.'}</p>
                    </Link>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {(post.tags || []).slice(0, 5).map((tag) => (
                        <button key={tag.id} onClick={() => setTagFilter(tag.name)} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 border-y border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{post.views} visualizacoes</span>
                  <span>
                    {post._count?.likes || 0} curtidas - {post._count?.comments || 0} comentarios - {post._count?.reposts || 0} reposts
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-1 p-2">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black hover:bg-slate-50 ${post.likedByMe ? 'text-red-600' : 'text-slate-600'}`}>
                    <Heart size={18} />
                    Curtir
                  </button>
                  <Link to={`/resume/${post.id}`} className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
                    <MessageCircle size={18} />
                    Comentar
                  </Link>
                  <button onClick={() => sharePost(post)} className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
                    <Share2 size={18} />
                    Compartilhar
                  </button>
                  <button onClick={() => triggerDownload(post.id)} className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
                    <Download size={18} />
                    Baixar
                  </button>
                  <button onClick={() => toggleSave(post.id)} className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black hover:bg-slate-50 ${post.savedByMe ? 'text-indigo-600' : 'text-slate-600'}`}>
                    <Bookmark size={18} />
                    Salvar
                  </button>
                  <Link to={`/resume/${post.id}`} className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
                    <Send size={18} />
                    Contribuir
                  </Link>
                  <button onClick={() => toggleRepost(post.id)} className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black hover:bg-slate-50 ${post.repostedByMe ? 'text-emerald-600' : 'text-slate-600'}`}>
                    <Repeat2 size={18} />
                    Repostar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
            <BookOpen className="mx-auto text-slate-300" size={42} />
            <p className="mt-3 text-lg font-black text-slate-700">Nenhum post encontrado.</p>
            <Link to="/upload" className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-black">
              <Upload size={17} />
              Publicar agora
            </Link>
          </div>
        )}
      </main>

      <aside className="hidden xl:block space-y-4 sticky top-24 self-start">
        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-black text-slate-900">Areas em alta</h3>
          <div className="mt-3 space-y-2">
            {categoriesLoading ? (
              <p className="text-sm font-bold text-slate-400">Carregando...</p>
            ) : (
              categories.slice(0, 6).map((category) => (
                <Link key={category.id} to={`/category/${category.id}`} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-slate-50">
                  <span className="text-sm font-bold text-slate-700">{category.name}</span>
                  <span className="text-xs font-black text-slate-400">{category.folders?.length || 0}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-black text-slate-900">Pessoas para conhecer</h3>
          <div className="mt-3 space-y-3">
            {people.map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <Link to={`/user/${person.id}`} className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black overflow-hidden">
                  {person.photoUrl ? <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" /> : person.name?.charAt(0)}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/user/${person.id}`} className="block text-sm font-black text-slate-900 truncate">{person.name}</Link>
                  <p className="text-xs font-bold text-slate-500 truncate">{person.area}</p>
                </div>
                <button onClick={() => sendFriendRequest(person.id)} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600" title="Enviar solicitacao de amizade">
                  <UserPlus size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-indigo-600 text-white rounded-lg p-4">
          <h3 className="text-sm font-black">Modulo social ativo</h3>
          <p className="mt-2 text-sm font-semibold text-indigo-100">
            Stories, amizades, reposts, salvos, compartilhamentos e contribuicoes ja possuem persistencia no banco.
          </p>
        </section>
      </aside>
    </div>
  );
};

export default Home;
