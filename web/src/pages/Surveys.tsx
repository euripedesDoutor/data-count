import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, FileText, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';

interface Survey {
    id: number;
    title: string;
    description: string;
    questions: any[];
    createdAt: string;
    status: 'AT' | 'IN';
    client?: { name: string };
    goal?: number;
    responseCount?: number;
}

const Surveys: React.FC = () => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newSurvey, setNewSurvey] = useState<{ title: string; description: string; clientId: string; goal?: number }>({ title: '', description: '', clientId: '', goal: 0 });
    const [clients, setClients] = useState<{ id: number; name: string }[]>([]);

    const { token, user } = useAuth();

    useEffect(() => {
        fetchSurveys();
        if (user?.role === 'ADMIN') {
            fetchClients();
        }
    }, [user]);

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

    const fetchSurveys = async () => {
        try {
            const response = await fetch(getApiUrl('/api/surveys'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Fetched surveys:', data);
            console.log('Current user:', user);
            setSurveys(data);
        } catch (error) {
            console.error('Error fetching surveys:', error);
        }
    };

    const handleCreateSurvey = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title: newSurvey.title,
                description: newSurvey.description,
                clientId: newSurvey.clientId || undefined,
                goal: newSurvey.goal,
                questions: []
            };
            console.log('Sending survey creation payload:', payload);

            const response = await fetch(getApiUrl('/api/surveys'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setNewSurvey({ title: '', description: '', clientId: '', goal: 0 });
                setShowForm(false);
                fetchSurveys();
            }
        } catch (error) {
            console.error('Error creating survey:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta pesquisa?')) {
            try {
                await fetch(getApiUrl(`/api/surveys/${id}`), {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSurveys();
            } catch (error) {
                console.error('Error deleting survey:', error);
            }
        }
    };

    const handleClone = async (id: number) => {
        if (!confirm('Deseja clonar esta pesquisa?')) return;
        try {
            const response = await fetch(getApiUrl(`/api/surveys/${id}/clone`), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                fetchSurveys();
            } else {
                alert('Erro ao clonar pesquisa');
            }
        } catch (error) {
            console.error('Error cloning survey:', error);
            alert('Erro ao clonar pesquisa');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brazil-blue">Gerenciar Pesquisas</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-brazil-green text-white px-4 py-2 rounded flex items-center hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Pesquisa
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-brazil-yellow animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Criar Nova Pesquisa</h3>
                    <form onSubmit={handleCreateSurvey} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                value={newSurvey.title}
                                onChange={e => setNewSurvey({ ...newSurvey, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                rows={3}
                                value={newSurvey.description}
                                onChange={e => setNewSurvey({ ...newSurvey, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meta Geral</label>
                            <input
                                type="number"
                                min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                value={newSurvey.goal || ''}
                                onChange={e => setNewSurvey({ ...newSurvey, goal: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        {user?.role === 'ADMIN' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-2 border"
                                    value={newSurvey.clientId}
                                    onChange={e => setNewSurvey({ ...newSurvey, clientId: e.target.value })}
                                    required
                                >
                                    <option value="">Selecione um cliente...</option>
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
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-brazil-blue text-white rounded hover:bg-blue-800 disabled:opacity-50 flex items-center"
                            >
                                {loading ? 'Salvando...' : 'Salvar Pesquisa'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perguntas</th>
                            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            {user?.role === 'ADMIN' && (
                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            )}
                            <th className="hidden md:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {surveys.map((survey) => (
                            <tr key={survey.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-normal">
                                    <div className="flex items-start">
                                        <FileText className="w-5 h-5 text-brazil-blue mr-3 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/surveys/${survey.id}`} className="text-sm font-medium text-gray-900 hover:text-brazil-blue hover:underline block break-words">
                                                {survey.title}
                                            </Link>
                                            <div className="text-sm text-gray-500 whitespace-normal break-words">{survey.description}</div>

                                            {/* Mobile View: Status and Actions */}
                                            <div className="md:hidden mt-3 flex justify-between items-center border-t pt-2 border-gray-100">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${survey.status === 'AT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {survey.status === 'AT' ? 'Ativa' : 'Inativa'}
                                                </span>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleClone(survey.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Clonar Pesquisa"
                                                    >
                                                        <Copy className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(survey.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {survey.questions?.length || 0} perguntas
                                </td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {survey.responseCount || 0} / {survey.goal || 0}
                                </td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${survey.status === 'AT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {survey.status === 'AT' ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                {user?.role === 'ADMIN' && (
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {survey.client?.name || '-'}
                                    </td>
                                )}
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => handleClone(survey.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Clonar Pesquisa"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(survey.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {surveys.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Nenhuma pesquisa encontrada. Crie uma nova para começar.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Surveys;
