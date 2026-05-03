import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileText, User, Calendar, Eye, Download, Share2, ChevronRight, BookOpen, Heart, MessageCircle, Hash, ExternalLink, Pencil, Trash2 } from 'lucide-react';

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeRes, commentsRes] = await Promise.all([
          api.get(`/api/resumes/${id}`),
          api.get(`/api/resumes/${id}/comments`),
        ]);
        setResume(resumeRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do resumo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando conteúdo...</div>;

  const hasFile = Boolean(resume?.fileUrl);
  const fileType = (resume?.fileType || '').toLowerCase();
  const isPdf = fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (err) {
      return null;
    }
  })();

  const isOwner = Boolean(currentUser?.id && resume?.user?.id && currentUser.id === resume.user.id);

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      setLiking(true);
      const response = await api.post(`/api/resumes/${id}/like`);
      setResume((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likedByMe: response.data.liked,
          _count: { ...(prev._count || {}), likes: response.data.likeCount },
        };
      });
    } catch (err) {
      console.error('Erro ao curtir:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const content = newComment.trim();
    if (!content) return;

    try {
      setCommenting(true);
      const response = await api.post(`/api/resumes/${id}/comments`, { content });
      setComments((prev) => [response.data, ...prev]);
      setNewComment('');
      setResume((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          _count: { ...(prev._count || {}), comments: (prev._count?.comments || 0) + 1 },
        };
      });
    } catch (err) {
      console.error('Erro ao comentar:', err);
    } finally {
      setCommenting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copiado!');
    } catch (err) {
      setShareMessage('Não foi possível copiar automaticamente. Copie o link do navegador.');
    } finally {
      setTimeout(() => setShareMessage(''), 2500);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const confirmed = window.confirm('Tem certeza que deseja excluir este post?');
    if (!confirmed) return;

    try {
      await api.delete(`/api/resumes/${id}`);
      navigate('/profile');
    } catch (err) {
      console.error('Erro ao excluir post:', err);
      setShareMessage(err.response?.data?.message || 'Erro ao excluir post.');
      setTimeout(() => setShareMessage(''), 2500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="space-y-6">
        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Link to="/" className="text-indigo-600 hover:underline">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${resume?.folder?.category?.id}`} className="text-indigo-600 hover:underline">{resume?.folder?.category?.name}</Link>
          <ChevronRight size={12} />
          <span>{resume?.folder?.name}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">{resume?.title}</h1>
            <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center space-x-2">
                <User size={14} className="text-indigo-600" />
                <Link to={`/user/${resume?.user?.id}`} className="text-slate-900 hover:underline">{resume?.user?.name}</Link>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-indigo-600" />
                <span>{new Date(resume?.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye size={14} className="text-indigo-600" />
                <span>{resume?.views} Visualizações</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart size={14} className={resume?.likedByMe ? 'text-red-500' : 'text-indigo-600'} />
                <span>{resume?._count?.likes || 0} Curtidas</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle size={14} className="text-indigo-600" />
                <span>{resume?._count?.comments || 0} Comentários</span>
              </div>
            </div>

            {(resume?.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {resume.tags.map((t) => (
                  <Link
                    key={t.id}
                    to={`/?tag=${encodeURIComponent(t.name)}`}
                    className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <Hash size={12} />
                    {t.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <a
              href={`/api/resumes/${id}/download`}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
            >
              <Download size={18} />
              <span>Baixar</span>
            </a>
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${
                resume?.likedByMe ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              } disabled:opacity-50`}
            >
              <Heart size={18} />
              <span>{resume?.likedByMe ? 'Curtido' : 'Curtir'}</span>
            </button>
            <button onClick={handleShare} className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
              <Share2 size={18} />
            </button>
            {isOwner && (
              <>
                <button onClick={() => navigate(`/resume/${id}/edit`)} className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm" title="Editar">
                  <Pencil size={18} />
                </button>
                <button onClick={handleDelete} className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:text-red-600 hover:border-red-100 transition-all shadow-sm" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {shareMessage && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
            {shareMessage}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest text-sm border-b border-slate-50 pb-6 flex items-center space-x-3">
              <BookOpen size={20} className="text-indigo-600" />
              <span>Visualização do Conteúdo</span>
            </h3>
            
            <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
              {hasFile && isPdf ? (
                <iframe
                  title="Visualizador"
                  src={resume?.fileUrl}
                  className="w-full h-[70vh]"
                />
              ) : hasFile && isImage ? (
                <div className="p-6">
                  <img src={resume?.fileUrl} alt="Conteúdo" className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 bg-white" />
                </div>
              ) : hasFile ? (
                <div className="p-12 text-center space-y-6">
                  <div className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 inline-flex">
                    <FileText size={64} className="text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900">Arquivo anexado</p>
                    <p className="text-sm font-bold text-slate-400">Clique para abrir ou baixar o arquivo.</p>
                  </div>
                  <a
                    href={resume?.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline"
                  >
                    <ExternalLink size={14} />
                    Abrir em nova aba
                  </a>
                </div>
              ) : (
                <div className="p-10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texto do post</p>
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                    {resume?.content || 'Sem conteúdo em texto.'}
                  </div>
                </div>
              )}
            </div>

            {hasFile && resume?.content && (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Texto do Post</h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                  {resume.content}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Descrição do Estudante</h4>
              <p className="text-slate-600 font-medium leading-relaxed">{resume?.description || 'Nenhuma descrição adicional fornecida para este resumo.'}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-indigo-600" />
              Comentários
            </h3>

            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
                placeholder="Escreva um comentário..."
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commenting || !newComment.trim()}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                >
                  {commenting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-700 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        {c.user?.photoUrl ? <img src={c.user.photoUrl} alt="Foto" className="w-full h-full object-cover" /> : c.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <Link to={`/user/${c.user?.id}`} className="text-sm font-black text-slate-900 hover:underline truncate">
                            {c.user?.name}
                          </Link>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {new Date(c.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-slate-700 font-medium whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm font-bold text-slate-400 italic">Ainda não há comentários.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">Sobre o Autor</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-black text-indigo-700 border-2 border-white shadow-lg overflow-hidden">
                {resume?.user?.photoUrl ? <img src={resume.user.photoUrl} alt="Foto" className="w-full h-full object-cover" /> : resume?.user?.name.charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-900">{resume?.user?.name}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{resume?.user?.area}</p>
              </div>
            </div>
            <button onClick={() => navigate(`/user/${resume?.user?.id}`)} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100">
              Ver Perfil Completo
            </button>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest">Dica StudyShare</h3>
              <p className="text-indigo-200 text-xs font-bold leading-relaxed">Gostou deste resumo? Não esqueça de deixar seu feedback para o autor e compartilhar com seus colegas de classe.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-800 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;
