import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Save } from 'lucide-react';
import { getApiUrl } from '../lib/api';

const ChangePassword: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();

    const isForced = user?.mustChangePassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl('/api/auth/change-password'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (response.ok) {
                alert('Senha alterada com sucesso! Por favor, faça login novamente.');
                logout();
                navigate('/login');
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao alterar senha');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-brazil-blue p-3 rounded-full">
                        <Lock className="w-8 h-8 text-brazil-yellow" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Alterar Senha</h2>
                {isForced ? (
                    <p className="text-center text-gray-600 mb-6">
                        Por segurança, você precisa alterar sua senha antes de continuar.
                    </p>
                ) : (
                    <p className="text-center text-gray-600 mb-6">
                        Digite sua nova senha abaixo.
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {isForced ? 'Senha Atual (PIN recebido)' : 'Senha Atual'}
                        </label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brazil-green text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                        </button>
                        {!isForced && (
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
