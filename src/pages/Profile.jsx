import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { resolveMediaUrl } from '../services/api';
import { GraduationCap, FileText, Calendar, Upload, Download, Pencil, Trash2, Users, Eye, EyeOff, Lock } from 'lucide-react';

const Profile = ({ user, setUser }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState({ type: '', text: '' });
  const [postMessage, setPostMessage] = useState({ type: '', text: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/profile');
        setProfileData(response.data);
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUploadPhoto = async () => {
    if (!photoFile) return;

    try {
      setUploadingPhoto(true);
      setPhotoMessage({ type: '', text: '' });

      const data = new FormData();
      data.append('photo', photoFile);

      const response = await api.post('/api/users/profile/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileData((prev) => (prev ? { ...prev, photoUrl: response.data.user.photoUrl } : prev));
      setUser?.((prev) => {
        const updated = { ...(prev || {}), photoUrl: response.data.user.photoUrl };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      setPhotoFile(null);
      setPhotoMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
    } catch (err) {
      setPhotoMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar foto.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const response = await api.post('/api/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordMessage({ type: 'success', text: response.data.message || 'Senha atualizada.' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Nao foi possivel trocar a senha.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este post?');
    if (!confirmed) return;

    try {
      await api.delete(`/api/resumes/${postId}`);
      setProfileData((prev) => (prev ? { ...prev, resumes: (prev.resumes || []).filter((r) => r.id !== postId) } : prev));
      setPostMessage({ type: 'success', text: 'Post excluído.' });
      setTimeout(() => setPostMessage({ type: '', text: '' }), 2500);
    } catch (err) {
      setPostMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao excluir post.' });
      setTimeout(() => setPostMessage({ type: '', text: '' }), 2500);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Carregando seu perfil acadêmico...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 relative z-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-indigo-100 flex items-center justify-center text-5xl font-black text-indigo-700 border-4 border-white shadow-2xl overflow-hidden">
            {profileData?.photoUrl ? <img src={resolveMediaUrl(profileData.photoUrl)} alt="Foto" className="w-full h-full object-cover" /> : profileData?.name.charAt(0)}
          </div>
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">{profileData?.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100">
                <GraduationCap size={14} className="mr-2" /> {profileData?.area}
              </div>
              <div className="flex items-center px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100">
                <Calendar size={14} className="mr-2" /> Membro desde {new Date(profileData?.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <Link to={`/user/${profileData?.id}/followers`} className="flex items-center px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
                <Users size={14} className="mr-2" /> {profileData?.followersCount || 0} seguidores
              </Link>
              <Link to={`/user/${profileData?.id}/following`} className="flex items-center px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
                <Users size={14} className="mr-2" /> {profileData?.followingCount || 0} seguindo
              </Link>
            </div>
            <p className="text-slate-500 font-bold max-w-lg leading-relaxed">{profileData?.bio || 'Este estudante ainda não adicionou uma biografia ao seu perfil acadêmico.'}</p>

            <div className="space-y-3 pt-2">
              {photoMessage.text && (
                <div className={`px-4 py-3 rounded-2xl text-xs font-bold border ${
                  photoMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {photoMessage.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="flex-1 cursor-pointer px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 hover:border-indigo-200 transition-colors flex items-center gap-2">
                  <Upload size={18} className="text-slate-400" />
                  <span className="truncate">{photoFile ? photoFile.name : 'Selecionar nova foto (JPG/PNG)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  onClick={handleUploadPhoto}
                  disabled={!photoFile || uploadingPhoto}
                  className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 whitespace-nowrap"
                >
                  {uploadingPhoto ? 'Enviando...' : 'Atualizar Foto'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      </div>

      <form onSubmit={handlePasswordChange} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Trocar senha</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Use quando quiser atualizar sua senha de acesso.</p>
          </div>
          <button type="button" onClick={() => setShowPasswords((value) => !value)} className="p-2 rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600" title={showPasswords ? 'Ocultar senha' : 'Ver senha'}>
            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {passwordMessage.text && (
          <div className={`px-4 py-3 rounded-md text-sm font-bold border ${
            passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {passwordMessage.text}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type={showPasswords ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              className="w-full pl-10 pr-3 py-3 rounded-md bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Senha atual"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type={showPasswords ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full pl-10 pr-3 py-3 rounded-md bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Nova senha (min. 8)"
              minLength={8}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={passwordLoading} className="px-5 py-3 rounded-md bg-slate-900 text-white text-sm font-black hover:bg-indigo-700 disabled:opacity-50">
          {passwordLoading ? 'Salvando...' : 'Atualizar senha'}
        </button>
      </form>

      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest text-sm">Meus Posts</h3>
          <span className="text-xs font-bold text-slate-400">{profileData?.resumes?.length || 0} Contribuições</span>
        </div>

        {postMessage.text && (
          <div className={`px-6 py-4 rounded-3xl text-sm font-bold border ${
            postMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {postMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {profileData?.resumes?.length > 0 ? (
            profileData.resumes.map((resume) => (
              <div key={resume.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl hover:border-indigo-100 transition-all group">
                <Link to={`/resume/${resume.id}`} className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-lg font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{resume.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="text-indigo-600">{resume.folder?.category?.name}</span>
                      <span>•</span>
                      <span>{resume.folder?.name}</span>
                      <span>•</span>
                      <span>{resume.views} visualizações</span>
                      <span>•</span>
                      <span>{resume._count?.likes || 0} curtidas</span>
                      <span>•</span>
                      <span>{resume._count?.comments || 0} comentários</span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <a
                    href={`/api/resumes/${resume.id}/download`}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100 bg-white"
                    title="Baixar"
                  >
                    <Download size={18} />
                  </a>
                  <Link
                    to={`/resume/${resume.id}/edit`}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100 bg-white"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeletePost(resume.id)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100 bg-white"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-lg font-bold text-slate-400 italic mb-6">Você ainda não publicou nenhum post.</p>
              <button onClick={() => window.location.href='/upload'} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                Publicar meu primeiro conteúdo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
