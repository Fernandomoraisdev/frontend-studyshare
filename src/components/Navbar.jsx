import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Home, LogOut, PlusSquare, Search, User } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('q') || '');
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const value = search.trim();
    navigate(value ? `/?q=${encodeURIComponent(value)}` : '/');
  };

  return (
    <nav className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
            <BookOpen className="text-white" size={24} />
          </div>
          <span className="text-xl sm:text-2xl font-black">StudyShare</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar resumos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 ml-auto">
          {user ? (
            <>
              <Link to="/" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Inicio">
                <Home size={20} />
              </Link>
              <Link to="/upload" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Postar">
                <PlusSquare size={20} />
              </Link>
              <Link to="/notifications" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Notificacoes">
                <Bell size={20} />
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-sm font-bold hover:text-indigo-600 transition-colors">
                <User size={20} />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Sair">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold hover:text-indigo-600 transition-colors">Entrar</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-black hover:bg-indigo-700 transition-all shadow-sm">Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
