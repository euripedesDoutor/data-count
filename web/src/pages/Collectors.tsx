
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { getApiUrl } from '../lib/api';

interface Collector {
    id: number;
    name: string;
    email: string;
    manager?: { name: string };
}

interface Client {
    id: number;
    name: string;
}

const Collectors: React.FC = () => {
    const [collectors, setCollectors] = useState<Collector[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCollector, setEditingCollector] = useState<Collector | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        clientId: ''
    });

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPin, setResetPin] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);

    const { token, user } = useAuth();

    const fetchCollectors = async () => {
        try {
            const response = await fetch(getApiUrl('/api/collectors'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setCollectors(data);
        } catch (error) {
            console.error('Error fetching collectors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(getApiUrl('/api/clients'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        fetchCollectors();
        if (user?.role === 'ADMIN') {
            fetchClients();
        }
    }, [token, user]);

    const handleEdit = (collector: Collector) => {
        setEditingCollector(collector);
        setFormData({
            name: collector.name,
            email: collector.email,
            password: '',
            clientId: '' // Client ID handling is complex without extra fetch, keeping simple for now
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCollector(null);
        setFormData({ name: '', email: '', password: '', clientId: '' });
        setResetPin(null);
    };

    const handleResetPassword = async () => {
        if (!editingCollector) return;
        setResetLoading(true);
        try {
            const response = await fetch(getApiUrl(`/api/users/${editingCollector.id}/reset-password`), {
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
            const url = editingCollector
                ? getApiUrl(`/api/collectors/${editingCollector.id}`)
                : getApiUrl('/api/collectors');

            const method = editingCollector ? 'PUT' : 'POST';

            const body: any = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.password) {
                body.password = formData.password;
            }

            if (user?.role === 'ADMIN' && !editingCollector) {
                body.clientId = formData.clientId;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save collector');
            }

            handleCancel();
            fetchCollectors();
        } catch (error) {
            console.error('Error saving collector:', error);
            alert('Erro ao salvar coletor');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este coletor?')) return;

        try {
            await fetch(getApiUrl(`/api/collectors/${id}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCollectors();
        } catch (error) {
            console.error('Error deleting collector:', error);
            alert('Erro ao excluir coletor');
        }
    };

    if (loading) return <div className="p-6">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brazil-blue">Gerenciar Coletores</h2>
                <button
                    onClick={() => {
                        setEditingCollector(null);
                        setFormData({ name: '', email: '', password: '', clientId: '' });
                        setShowForm(!showForm);
                    }}
                    className="bg-brazil-green text-white px-4 py-2 rounded flex items-center hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Coletor
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-brazil-yellow animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingCollector ? 'Editar Coletor' : 'Cadastrar Novo Coletor'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {editingCollector ? 'Senha' : 'Senha'}
                            </label>
                            {editingCollector ? (
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
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                />
                            )}
                        </div>

                        {user?.role === 'ADMIN' && !editingCollector && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                <select
                                    required
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                >
                                    <option value="">Selecione um cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                                {editingCollector ? 'Salvar Alterações' : 'Salvar Coletor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            {user?.role === 'ADMIN' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {collectors.map((collector) => (
                            <tr
                                key={collector.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleEdit(collector)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{collector.name}</div>
                                            <div className="text-sm text-gray-500">{collector.email}</div>
                                        </div>
                                    </div>
                                </td>
                                {user?.role === 'ADMIN' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {collector.manager?.name || '-'}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(collector)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(collector.id)}
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

export default Collectors;
