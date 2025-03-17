import { useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Vérifie si un token est présent dans le localStorage
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
    console.log('Token ?', token);
  }, [navigate]); // Le tableau de dépendances inclut `navigate` pour éviter des erreurs

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">µManager</h1>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary transition"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="w-full bg-secondary text-white py-3 rounded-lg hover:bg-primary transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;