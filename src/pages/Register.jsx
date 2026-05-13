import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, Mail, Search, User, UserPlus } from 'lucide-react';
import api from '../services/api';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', area: '', password: '' });
  const [studyAreas, setStudyAreas] = useState([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudyAreas = async () => {
      try {
        const response = await api.get('/api/study-areas');
        setStudyAreas(response.data);
      } catch (err) {
        setStudyAreas([]);
      }
    };

    fetchStudyAreas();
  }, []);

  const areaSuggestions = useMemo(() => {
    const value = areaSearch.trim().toLowerCase();
    return studyAreas
      .filter((area) => {
        if (!value) return true;
        return area.name.toLowerCase().includes(value) || area.group?.toLowerCase().includes(value);
      })
      .slice(0, 8);
  }, [areaSearch, studyAreas]);

  const selectedKnownArea = studyAreas.some((area) => area.name.toLowerCase() === formData.area.trim().toLowerCase());

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', {
        ...formData,
        area: formData.area.trim(),
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleAreaInput = (event) => {
    const value = event.target.value;
    setAreaSearch(value);
    setFormData({ ...formData, area: value });
  };

  const selectArea = (areaName) => {
    setAreaSearch(areaName);
    setFormData({ ...formData, area: areaName });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-8 text-white">
          <h1 className="text-3xl font-black tracking-tight">Criar conta</h1>
          <p className="mt-2 text-indigo-100 text-sm font-semibold">
            Monte seu perfil academico e encontre pessoas da sua area.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center text-sm font-bold">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome e sobrenome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Area de estudos</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="area"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Busque ou escreva sua formacao"
                    value={formData.area}
                    onChange={handleAreaInput}
                  />
                </div>

                {areaSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {areaSuggestions.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => selectArea(area.name)}
                        className={`text-left rounded-xl border px-4 py-3 transition-all ${
                          formData.area === area.name
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        <span className="block text-sm font-black">{area.name}</span>
                        <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">{area.group || 'Area academica'}</span>
                      </button>
                    ))}
                  </div>
                )}

                {formData.area && !selectedKnownArea && (
                  <p className="text-xs font-bold text-indigo-600 flex items-center gap-2 pt-1">
                    <GraduationCap size={14} />
                    Vamos salvar "{formData.area.trim()}" como uma area personalizada.
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Minimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Finalizar cadastro
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-bold text-slate-500">
            Ja possui uma conta?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
