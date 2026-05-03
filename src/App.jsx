import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoryView from './pages/CategoryView';
import FolderView from './pages/FolderView';
import ResumeDetails from './pages/ResumeDetails';
import EditPost from './pages/EditPost';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserPublicProfile from './pages/UserPublicProfile';
import UserFollowers from './pages/UserFollowers';
import UserFollowing from './pages/UserFollowing';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen font-bold text-indigo-600">Carregando StudyShare...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar user={user} setUser={setUser} />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<CategoryView />} />
            <Route path="/folder/:id" element={<FolderView />} />
            <Route path="/resume/:id/edit" element={user ? <EditPost /> : <Navigate to="/login" />} />
            <Route path="/resume/:id" element={<ResumeDetails />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/user/:id/followers" element={<UserFollowers />} />
            <Route path="/user/:id/following" element={<UserFollowing />} />
            <Route path="/user/:id" element={<UserPublicProfile />} />
            
            {/* Rotas Protegidas */}
            <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
