import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart } from 'lucide-react';
import { getApiUrl } from '../lib/api';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.token) {
                login(data.token, data.user, rememberMe);
                if (data.user.mustChangePassword) {
                    navigate('/change-password');
                } else if (data.user.role === 'INTERVIEWER') {
                    navigate('/collector/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                throw new Error('No token received');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded shadow-md w-full max-w-md overflow-hidden">
                <div className="bg-brazil-blue p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <PieChart className="w-16 h-16 text-brazil-yellow" />
                    </div>
                    <h2 className="text-2xl font-bold text-brazil-yellow">DataCount Login</h2>
                </div>
                <div className="p-8">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-brazil-blue focus:ring-brazil-blue border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Manter Conectado
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-brazil-blue text-white py-2 rounded hover:bg-blue-800 transition-colors"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
