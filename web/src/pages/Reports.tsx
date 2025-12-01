import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';

interface Client {
    id: number;
    name: string;
}

interface Survey {
    id: number;
    title: string;
    client?: { id: number };
    clientId?: number;
}

interface ReportData {
    surveyTitle: string;
    totalResponses: number;
    questions: {
        id: number;
        text: string;
        type: string;
        total: number;
        data?: { name: string; value: number; percentage: number }[];
        filledCount?: number;
        filledPercentage?: number;
        textAnswers?: string[];
    }[];
}

const Reports: React.FC = () => {
    const { user, token } = useAuth();
    const userRole = user?.role;

    const [clients, setClients] = useState<Client[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [selectedSurvey, setSelectedSurvey] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<{ questionId: number; answer: string } | null>(null);
    const [viewMode, setViewMode] = useState<'charts' | 'text'>('charts');
    const [isPrinting, setIsPrinting] = useState(false);
    // Fetch Report Data
    useEffect(() => {
        if (!selectedSurvey || !token) return;

        setLoading(true);
        setError(null);
        let url = getApiUrl(`/api/surveys/${selectedSurvey}/report`);
        if (filter) {
            url += `?filterQuestionId=${filter.questionId}&filterAnswer=${encodeURIComponent(filter.answer)}`;
        }

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Erro ao carregar relatório: ${res.statusText}`);
                return res.json();
            })
            .then(data => {
                setReportData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching report:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [selectedSurvey, filter, token]);

    const handleBarClick = (data: any, questionId: number) => {
        if (filter && filter.questionId === questionId && filter.answer === data.name) {
            setFilter(null); // Deselect
        } else {
            setFilter({ questionId, answer: data.name });
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);
        // Wait for render to update chart widths
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'SINGLE_CHOICE': return 'Escolha Única';
            case 'MULTIPLE_CHOICE': return 'Múltipla Escolha';
            case 'TEXT': return 'Texto';
            default: return type;
        }
    };

    return (
        <div className="space-y-6 p-6 print:p-0">
            <h1 className="text-2xl font-bold text-gray-800">Relatórios de Pesquisa</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end print:hidden">
                {userRole === 'ADMIN' && (
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select
                            className="w-full border rounded p-2"
                            value={selectedClient}
                            onChange={(e) => {
                                setSelectedClient(e.target.value);
                                setSelectedSurvey('');
                                setReportData(null);
                                setFilter(null);
                            }}
                        >
                            <option value="">Selecione um Cliente</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisa</label>
                    <select
                        className="w-full border rounded p-2"
                        value={selectedSurvey}
                        onChange={(e) => {
                            setSelectedSurvey(e.target.value);
                            setFilter(null);
                        }}
                        disabled={userRole === 'ADMIN' && !selectedClient}
                    >
                        <option value="">Selecione uma Pesquisa</option>
                        {surveys.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                </div>

                {/* Filter by Question */}
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Pergunta</label>
                    <select
                        className="w-full border rounded p-2"
                        value={filter?.questionId || ''}
                        onChange={(e) => {
                            const qId = Number(e.target.value);
                            if (qId) {
                                setFilter({ questionId: qId, answer: '' });
                            } else {
                                setFilter(null);
                            }
                        }}
                        disabled={!reportData}
                    >
                        <option value="">Selecione uma Pergunta</option>
                        {reportData?.questions
                            .filter(q => q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE')
                            .map(q => (
                                <option key={q.id} value={q.id}>{q.text}</option>
                            ))}
                    </select>
                </div>

                {/* Filter by Answer */}
                {filter && filter.questionId && (
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Resposta</label>
                        <select
                            className="w-full border rounded p-2"
                            value={filter.answer}
                            onChange={(e) => setFilter({ ...filter, answer: e.target.value })}
                        >
                            <option value="">Selecione uma Resposta</option>
                            {reportData?.questions
                                .find(q => q.id === filter.questionId)
                                ?.data?.map((d, i) => (
                                    <option key={i} value={d.name}>{d.name}</option>
                                ))}
                        </select>
                    </div>
                )}

                {filter && filter.answer && (
                    <div className="pb-1">
                        <button
                            onClick={() => setFilter(null)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm"
                        >
                            Limpar Filtro
                        </button>
                    </div>
                )}

                {/* View Mode Toggle & Print */}
                {reportData && (
                    <div className="w-full md:w-auto ml-auto flex items-end gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Visualização</label>
                            <div className="inline-flex rounded-md shadow-sm print:hidden" role="group">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('charts')}
                                    className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${viewMode === 'charts'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    Gráficos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('text')}
                                    className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${viewMode === 'text'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    Texto
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handlePrint}
                            className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 print:hidden h-[38px]"
                            title="Imprimir Relatório"
                        >
                            Imprimir
                        </button>
                    </div>
                )}
            </div>

            {/* Report Content */}
            {loading && <div className="text-center py-10">Carregando dados...</div>}
            {error && <div className="text-center py-10 text-red-600">{error}</div>}

            {!loading && !error && reportData && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-blue-700">{reportData.surveyTitle}</h2>
                                <p className="text-blue-600">Total de Respostas: <span className="font-bold text-2xl">{reportData.totalResponses}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Print-only Filter Description */}
                    {filter && (
                        <div className="hidden print:block mb-6 p-4 border border-gray-200 rounded bg-gray-50">
                            <h3 className="font-bold text-gray-800 mb-2">Filtro Aplicado:</h3>
                            <p className="text-gray-700">
                                <span className="font-semibold">Pergunta:</span> {reportData.questions.find(q => q.id === filter.questionId)?.text}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Resposta:</span> {filter.answer}
                            </p>
                        </div>
                    )}

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
                        {reportData.questions.map((q, index) => (
                            <div key={q.id} className="bg-white p-6 rounded-lg shadow-md print:shadow-none print:border print:break-inside-avoid print:p-0">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{index + 1}. {q.text}</h3>
                                <p className="text-sm text-gray-500 mb-4">Tipo: {getQuestionTypeLabel(q.type)}</p>

                                {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && q.data && (
                                    viewMode === 'charts' ? (
                                        <div
                                            style={{
                                                height: Math.max(300, (q.data.length * 50)),
                                                width: isPrinting ? '16cm' : '100%',
                                                marginLeft: isPrinting ? '-1cm' : '0'
                                            }}
                                            className="w-full"
                                        >
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={q.data}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 50, left: 40, bottom: 5 }}
                                                    onClick={(data: any) => {
                                                        if (data && data.activePayload && data.activePayload.length > 0) {
                                                            handleBarClick(data.activePayload[0].payload, q.id);
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]} allowDecimals={false} />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        width={150}
                                                        interval={0}
                                                        tick={{ fontSize: 12, width: 140 }}
                                                    />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" name="Respostas" fill="#8884d8" isAnimationActive={false}>
                                                        {q.data.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={filter?.questionId === q.id && filter.answer === entry.name ? '#82ca9d' : COLORS[index % COLORS.length]} />
                                                        ))}
                                                        <LabelList dataKey="value" position="right" fill="#000" fontWeight="bold" />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resposta</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contagem</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentagem</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {q.data.map((entry, i) => (
                                                        <tr key={i} className={filter?.questionId === q.id && filter.answer === entry.name ? 'bg-green-50' : ''}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.value}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.percentage}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}

                                {q.type === 'TEXT' && (
                                    <div className="h-64 bg-gray-50 rounded p-4 overflow-y-auto border border-gray-200 print:h-auto print:overflow-visible">
                                        <div className="flex justify-between items-center mb-2 border-b pb-2">
                                            <span className="font-semibold text-gray-700">Respostas ({q.filledCount})</span>
                                            <span className="text-sm text-gray-500">{q.filledPercentage}% preenchido</span>
                                        </div>
                                        {q.textAnswers && q.textAnswers.length > 0 ? (
                                            <ul className="space-y-2">
                                                {q.textAnswers.map((ans: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-800 bg-white p-2 rounded shadow-sm border border-gray-100">
                                                        {ans}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-400 mt-10">Nenhuma resposta de texto encontrada.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
