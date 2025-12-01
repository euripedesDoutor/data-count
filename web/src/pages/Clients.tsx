import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { getApiUrl } from '../lib/api';

interface Client {
    id: number;
    name: string;
    email: string;
    _count: {
        clientSurveys: number;
    };
}

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { token } = useAuth();

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPin, setResetPin] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch(getApiUrl('/api/clients'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setClients(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setLoading(false);
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            password: ''
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingClient(null);
        setFormData({ name: '', email: '', password: '' });
        setResetPin(null);
    };

    const handleResetPassword = async () => {
        if (!editingClient) return;
        setResetLoading(true);
        try {
            const response = await fetch(getApiUrl(`/api/users/${editingClient.id}/reset-password`), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setResetPin(data.password);
            } else {
                alert('Erro ao resetar senha');
                setShowResetModal(false);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Erro ao resetar senha');
            setShowResetModal(false);
        } finally {
            setResetLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingClient
                ? getApiUrl(`/api/clients/${editingClient.id}`)
                : getApiUrl('/api/clients');

            const method = editingClient ? 'PUT' : 'POST';

            const body: any = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.password) {
                body.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                handleCancel();
                fetchClients();
            }
        }
    };

    if (loading) return <div className="p-6">Carregando clientes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brazil-blue">Gerenciar Clientes</h2>
                <button
                    onClick={() => {
                        handleCancel();
                        setShowForm(!showForm);
                    }}
                    className="bg-brazil-green text-white px-4 py-2 rounded flex items-center hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Cliente
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-brazil-yellow animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome da Empresa/Cliente</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {editingClient ? 'Senha' : 'Senha'}
                            </label>
                            {editingClient ? (
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(true)}
                                    className="mt-1 w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center justify-center"
                                >
                                    Resetar Senha
                                </button>
                            ) : (
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-brazil-blue text-white rounded hover:bg-blue-800 flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {editingClient ? 'Salvar Alterações' : 'Salvar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesquisas</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client) => (
                            <tr
                                key={client.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleEdit(client)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                            <div className="text-sm text-gray-500">{client.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {client._count.clientSurveys} Pesquisas
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ResetPasswordModal
                isOpen={showResetModal}
                onClose={() => {
                    setShowResetModal(false);
                    setResetPin(null);
                }}
                onConfirm={handleResetPassword}
                pin={resetPin}
                loading={resetLoading}
            />
        </div>
    );
};

export default Clients;
