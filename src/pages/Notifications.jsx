import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bell, Check, FileText } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/social/notifications');
        setNotifications(response.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Nao foi possivel carregar as notificacoes.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await api.post(`/api/social/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, readAt: response.data.notification.readAt } : item))
      );
    } catch (err) {
      setMessage(err.response?.data?.message || 'Nao foi possivel marcar como lida.');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando notificacoes...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Bell size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notificacoes</h1>
          <p className="text-sm font-bold text-slate-400">Curtidas, reposts, amizades e contribuicoes aparecem aqui.</p>
        </div>
      </div>

      {message && <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{message}</div>}

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item.id} className={`bg-white border rounded-lg p-4 flex items-start gap-4 ${item.readAt ? 'border-slate-200' : 'border-indigo-200'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.readAt ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                <Bell size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-700">
                  <span className="font-black text-slate-900">{item.actor?.name || 'Alguem'}</span> {item.message}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">{new Date(item.createdAt).toLocaleString('pt-BR')}</p>
                {item.resume && (
                  <Link to={`/resume/${item.resume.id}`} className="mt-3 inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:underline">
                    <FileText size={14} />
                    {item.resume.title}
                  </Link>
                )}
              </div>
              {!item.readAt && (
                <button onClick={() => markAsRead(item.id)} className="p-2 rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600" title="Marcar como lida">
                  <Check size={17} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
            <p className="text-lg font-black text-slate-700">Nenhuma notificacao ainda.</p>
            <p className="mt-1 text-sm font-bold text-slate-400">Quando alguem interagir com seus posts, aparece aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
