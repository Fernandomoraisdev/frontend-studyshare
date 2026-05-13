import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { resolveMediaUrl } from '../services/api';
import { ChevronRight, Users, UserPlus, UserMinus } from 'lucide-react';

const UserFollowers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);
  const [message, setMessage] = useState('');

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (err) {
      return null;
    }
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setMessage('');
        const [summaryRes, followersRes] = await Promise.all([
          api.get(`/api/users/${id}/summary`),
          api.get(`/api/users/${id}/followers`),
        ]);
        setSummary(summaryRes.data);
        setFollowers(followersRes.data);
      } catch (err) {
        console.error('Erro ao carregar seguidores:', err);
        setMessage(err.response?.data?.message || 'Erro ao carregar seguidores.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggleFollow = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      setActionUserId(userId);
      const response = await api.post(`/api/users/${userId}/follow`);
      setFollowers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: response.data.following } : u))
      );
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro ao seguir usuário.');
      setTimeout(() => setMessage(''), 2500);
    } finally {
      setActionUserId(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando seguidores...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Link to="/" className="text-indigo-600 hover:underline">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/user/${id}`} className="text-indigo-600 hover:underline">Perfil</Link>
        <ChevronRight size={12} />
        <span>Seguidores</span>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-black text-indigo-700 border-2 border-white shadow-lg overflow-hidden">
              {summary?.photoUrl ? <img src={resolveMediaUrl(summary.photoUrl)} alt="Foto" className="w-full h-full object-cover" /> : summary?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{summary?.name || 'Usuário'}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{summary?.area}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/user/${id}/followers`} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-600">
              <Users size={14} className="mr-2" /> {summary?.followersCount || 0} seguidores
            </Link>
            <Link to={`/user/${id}/following`} className="flex items-center px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
              <Users size={14} className="mr-2" /> {summary?.followingCount || 0} seguindo
            </Link>
          </div>
        </div>

        {message && (
          <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
            {message}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {followers.length > 0 ? (
          followers.map((u) => (
            <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between gap-6">
              <Link to={`/user/${u.id}`} className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-base font-black text-indigo-700 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                  {u.photoUrl ? <img src={resolveMediaUrl(u.photoUrl)} alt="Foto" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{u.name}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest truncate">{u.area}</p>
                  {u.bio && <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">{u.bio}</p>}
                </div>
              </Link>

              {Number(currentUser?.id) !== Number(u.id) && (
                <button
                  onClick={() => handleToggleFollow(u.id)}
                  disabled={actionUserId === u.id}
                  className={`px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 whitespace-nowrap ${
                    u.isFollowing ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {u.isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                  {u.isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-16 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-3">
            <p className="text-lg font-bold text-slate-400 italic">Ainda não há seguidores.</p>
            <p className="text-sm text-slate-300 font-medium">Compartilhe conteúdos para atrair mais estudantes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFollowers;
