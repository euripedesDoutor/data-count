import React, { useEffect, useState } from 'react';
import { Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';

const Dashboard: React.FC = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState({ surveys: 0, collectors: 0, clients: 0, questions: 0, responses: 0 });
    const [dashboardSurveys, setDashboardSurveys] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
        fetchDashboardSurveys();
    }, [user]);

    const fetchStats = async () => {
        try {
            const response = await fetch(getApiUrl('/api/stats'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchDashboardSurveys = async () => {
        try {
            const response = await fetch(getApiUrl('/api/stats/dashboard-surveys'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard surveys');
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setDashboardSurveys(data);
            } else {
                console.error('Dashboard surveys data is not an array:', data);
                setDashboardSurveys([]);
            }
        } catch (error) {
            console.error('Error fetching dashboard surveys:', error);
            setDashboardSurveys([]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {user?.role === 'ADMIN' && (
                    <div className="bg-white p-4 rounded shadow border-l-4 border-brazil-yellow">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Total de Clientes</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.clients}</h3>
                            </div>
                            <Users className="text-brazil-yellow w-8 h-8" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Cadastrados</p>
                    </div>
                )}
                <div className="bg-white p-4 rounded shadow border-l-4 border-brazil-blue">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Total de Pesquisas</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.surveys}</h3>
                        </div>
                        <FileText className="text-brazil-blue w-8 h-8" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Cadastradas</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-gray-400">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Total de Perguntas</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.questions}</h3>
                        </div>
                        <FileText className="text-gray-400 w-8 h-8" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Perguntas ativas</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-brazil-green">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Total de Respostas</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.responses}</h3>
                        </div>
                        <FileText className="text-brazil-green w-8 h-8" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Coletadas</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-brazil-yellow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Total de Coletores</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.collectors}</h3>
                        </div>
                        <Users className="text-brazil-yellow w-8 h-8" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Cadastrados</p>
                </div>
            </div>

            {/* Survey List */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Pesquisas Ativas</h2>

                {user?.role === 'ADMIN' ? (
                    // Admin View: Grouped by Client
                    Object.entries(dashboardSurveys.reduce((acc: any, survey) => {
                        const clientName = survey.clientName || 'Sem Cliente';
                        if (!acc[clientName]) acc[clientName] = [];
                        acc[clientName].push(survey);
                        return acc;
                    }, {})).map(([clientName, surveys]: [string, any]) => (
                        <div key={clientName} className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">{clientName}</h3>
                            {surveys.map((survey: any) => (
                                <SurveyCard key={survey.id} survey={survey} />
                            ))}
                        </div>
                    ))
                ) : (
                    // Non-Admin View: Flat List
                    dashboardSurveys.map((survey) => (
                        <SurveyCard key={survey.id} survey={survey} />
                    ))
                )}

                {dashboardSurveys.length === 0 && (
                    <p className="text-gray-500">Nenhuma pesquisa ativa encontrada.</p>
                )}
            </div>
        </div>
    );
};

const SurveyCard = ({ survey }: { survey: any }) => (
    <div className="bg-white p-6 rounded shadow border-l-4 border-brazil-blue">
        <h3 className="text-lg font-semibold text-gray-800">{survey.title}</h3>
        <p className="text-gray-600 mb-4">{survey.description}</p>

        <div className="space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Meta Geral</span>
                    <span className="text-gray-500">{survey.totalCount} de {survey.goal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-brazil-blue h-2.5 rounded-full"
                        style={{ width: `${Math.min((survey.totalCount / (survey.goal || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <h4 className="text-sm font-medium text-gray-500 uppercase pt-2">Progresso dos Coletores</h4>
            {survey.collectors.map((collector: any) => (
                <div key={collector.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{collector.name}</span>
                        <span className="text-gray-500">{collector.count} de {collector.goal}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-brazil-green h-2.5 rounded-full"
                            style={{ width: `${Math.min((collector.count / (collector.goal || 1)) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            ))}
            {survey.collectors.length === 0 && (
                <p className="text-sm text-gray-400 italic">Nenhum coletor atribuído.</p>
            )}
        </div>
    </div>
);


export default Dashboard;
