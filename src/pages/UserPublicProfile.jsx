import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { resolveMediaUrl } from '../services/api';
import { GraduationCap, Calendar, FileText, Hash, Heart, MessageCircle, Eye, Users, UserPlus, UserMinus, Download } from 'lucide-react';

const UserPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [message, setMessage] = useState('');

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (err) {
      return null;
    }
  })();

  const isMe = Boolean(currentUser?.id && Number(currentUser.id) === Number(id));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/users/${id}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Erro ao buscar perfil público:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando perfil...</div>;
  if (!profile) return <div className="text-center py-12 text-slate-400 font-bold">Perfil não encontrado.</div>;

  const handleFollow = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      setFollowingLoading(true);
      setMessage('');
      const response = await api.post(`/api/users/${id}/follow`);
      setProfile((prev) => (prev ? { ...prev, isFollowing: response.data.following, followersCount: response.data.followersCount } : prev));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro ao seguir usuário.');
      setTimeout(() => setMessage(''), 2500);
    } finally {
      setFollowingLoading(false);
    }
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
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 relative z-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-indigo-100 flex items-center justify-center text-5xl font-black text-indigo-700 border-4 border-white shadow-2xl overflow-hidden">
            {profile.photoUrl ? <img src={resolveMediaUrl(profile.photoUrl)} alt="Foto" className="w-full h-full object-cover" /> : profile.name?.charAt(0)}
          </div>
          <div className="text-center md:text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">{profile.name}</h2>
              {!isMe && (
                <button
                  onClick={handleFollow}
                  disabled={followingLoading}
                  className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 justify-center ${
                    profile.isFollowing ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {profile.isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                  {profile.isFollowing ? 'Deixar de seguir' : 'Seguir'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100">
                <GraduationCap size={14} className="mr-2" /> {profile.area}
              </div>
              <div className="flex items-center px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100">
                <Calendar size={14} className="mr-2" /> Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <Link to={`/user/${id}/followers`} className="flex items-center px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
                <Users size={14} className="mr-2" /> {profile.followersCount || 0} seguidores
              </Link>
              <Link to={`/user/${id}/following`} className="flex items-center px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
                <Users size={14} className="mr-2" /> {profile.followingCount || 0} seguindo
              </Link>
            </div>
            <p className="text-slate-500 font-bold max-w-lg leading-relaxed">{profile.bio || 'Este estudante ainda não adicionou uma biografia.'}</p>
            {message && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
                {message}
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest text-sm">Posts</h3>
          <span className="text-xs font-bold text-slate-400">{profile.resumes?.length || 0} Publicações</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {profile.resumes?.length > 0 ? (
            profile.resumes.map((post) => (
              <Link
                key={post.id}
                to={`/resume/${post.id}`}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <FileText size={24} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="text-lg font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{post.title}</h4>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          triggerDownload(post.id);
                        }}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2 justify-center"
                        title="Baixar"
                      >
                        <Download size={16} />
                      </button>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <p className="text-sm text-slate-500 font-medium line-clamp-2">
                      {post.description || post.content || 'Sem descrição.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {(post.tags || []).slice(0, 6).map((t) => (
                        <span key={t.id} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Hash size={12} />
                          {t.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="text-indigo-600">{post.folder?.category?.name}</span>
                      <span>•</span>
                      <span>{post.folder?.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                      <span className="flex items-center gap-1"><Heart size={12} /> {post._count?.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {post._count?.comments || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-lg font-bold text-slate-400 italic">Este usuário ainda não publicou nenhum post.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPublicProfile;
