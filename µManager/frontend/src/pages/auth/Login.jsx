import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const navigate = useNavigate();

  // Fonction pour gérer le login
  const loginUser = async (loginData) => {
    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, ...data };
      } else {
        return { success: false, error: data.message || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const doUserHaveCompany = async (userId) => {
    try {
      const response = await fetch('http://localhost:3000/companies', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      console.log('data', data);
      if(response.ok) {
        console.log(response.ok);
        for(let i = 0; i < data.length; i++) {
          if(data[i].user.userId === userId) {
            localStorage.setItem('companyId', data[i].companyId);
            return true;
        }
      }
      return false;
    }
    }
    catch (error) {
      console.error('Erreur réseau :', error);
      return { success: false, error: 'Erreur réseau' };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      if (response.success && response.token && response.userId) {
        setMessage('Connexion réussie');
        setIsSuccess(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);

        doUserHaveCompany(response.userId).then((response) => {
          if(response === true) {

            setTimeout(() => navigate('/dashboard'), 2000);

          } else {
            setTimeout(() => navigate('/create-company'), 2000);
          }
        });
      } else {
        setMessage('Erreur : Identifiants incorrects');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Erreur réseau');
      setIsSuccess(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-md transition"
          >
            Login
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;