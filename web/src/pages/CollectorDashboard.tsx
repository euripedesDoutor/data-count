import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';
import { FileText, Play } from 'lucide-react';

interface Survey {
    id: number;
    title: string;
    description: string;
    status: 'AT' | 'IN';
    createdAt: string;
    goalPerCollector?: number;
    responseCount?: number;
}

const CollectorDashboard: React.FC = () => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const response = await fetch(getApiUrl('/api/surveys'), {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                const activeSurveys = data.filter((s: Survey) => s.status === 'AT');
                setSurveys(activeSurveys);
            } catch (error) {
                console.error('Error fetching surveys:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveys();
    }, [token]);

if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
}

return (
    <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesquisas Disponíveis</h1>

        {surveys.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma pesquisa atribuída</h3>
                <p className="mt-1 text-sm text-gray-500">Você não tem pesquisas ativas para coletar no momento.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {surveys.map((survey) => {
                    const progress = survey.goalPerCollector && survey.goalPerCollector > 0
                        ? Math.min(100, Math.round(((survey.responseCount || 0) / survey.goalPerCollector) * 100))
                        : 0;

                    return (
                        <div key={survey.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{survey.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{survey.description || 'Sem descrição'}</p>

                                    {/* Progress Bar */}
                                    {survey.goalPerCollector && survey.goalPerCollector > 0 ? (
                                        <div className="mb-6">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-medium text-gray-700">Meta: {survey.responseCount || 0}/{survey.goalPerCollector}</span>
                                                <span className="text-xs text-gray-500 font-semibold">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-brazil-green h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-6 text-sm text-gray-400 italic">
                                            Sem meta definida
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate(`/surveys/${survey.id}/run`)}
                                        disabled={progress >= 100}
                                        className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${progress >= 100
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-brazil-green hover:bg-green-700'
                                            }`}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        {progress >= 100 ? 'Meta Atingida' : 'Iniciar pesquisa'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);
};

export default CollectorDashboard;
