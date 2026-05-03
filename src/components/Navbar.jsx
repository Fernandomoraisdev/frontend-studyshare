import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, User, LogOut, Search } from 'lucide-react';

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
    <nav className="bg-indigo-700 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-white p-2 rounded-xl group-hover:scale-110 transition-transform">
            <BookOpen className="text-indigo-700" size={24} />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter">StudyShare</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
            <input
              type="text"
              placeholder="Pesquisar resumos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-indigo-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-indigo-400 focus:ring-2 focus:ring-white outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 ml-auto">
          {user ? (
            <>
              <Link to="/upload" className="flex items-center space-x-2 text-sm font-bold hover:text-indigo-200 transition-colors">
                <Upload size={18} />
                <span className="hidden sm:inline">Subir Resumo</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-sm font-bold hover:text-indigo-200 transition-colors">
                <User size={18} />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-indigo-300 hover:text-red-300 transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold hover:text-indigo-200 transition-colors">Entrar</Link>
              <Link to="/register" className="bg-white text-indigo-700 px-4 sm:px-5 py-2 rounded-xl text-sm font-black hover:bg-indigo-50 transition-all shadow-lg">Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
