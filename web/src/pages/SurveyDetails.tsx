import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getApiUrl } from '../lib/api';

interface Option {
    id: string;
    text: string;
    nextQuestionId?: number | string;
}

interface Question {
    id: number;
    text: string;
    type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
    options?: Option[];
}

interface Survey {
    id: number;
    title: string;
    description: string;
    questions: Question[];
    client?: { name: string };
    clientId?: number | null;
    collectorIds?: number[];
    status: 'AT' | 'IN';
    goal?: number;
    goalPerCollector?: number;
}

const SurveyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
    const [availableCollectors, setAvailableCollectors] = useState<{ id: number; name: string }[]>([]);

    const { token, user } = useAuth();

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const response = await fetch(getApiUrl(`/api/surveys/${id}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                // Ensure options have ids for dnd and handle skip logic
                const sortedQuestions = data.questions.sort((a: any, b: any) => a.order - b.order);
                const processedData = {
                    ...data,
                    collectorIds: data.collectors?.map((c: any) => c.id) || [],
                    questions: sortedQuestions.map((q: any) => ({
                        ...q,
                        options: q.options ? q.options.map((opt: any) => {
                            let nextQuestionId: number | string | undefined = undefined;
                            if (opt.nextQuestionIndex !== undefined && opt.nextQuestionIndex !== null) {
                                if (opt.nextQuestionIndex === -1) {
                                    nextQuestionId = 'end';
                                } else {
                                    // Find question with that order
                                    const targetQ = sortedQuestions.find((sq: any) => sq.order === opt.nextQuestionIndex);
                                    if (targetQ) nextQuestionId = targetQ.id;
                                }
                            }
                            return {
                                id: opt.id || Date.now().toString() + Math.random().toString(),
                                text: opt.text || opt,
                                nextQuestionId
                            };
                        }) : []
                    }))
                };
                setSurvey(processedData);
            } catch (error) {
                console.error('Error fetching survey:', error);
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

        fetchSurvey();
        if (user?.role === 'ADMIN') {
            fetchClients();
        }
    }, [id, token, user]);

    useEffect(() => {
        const fetchCollectors = async () => {
            if (!survey) return;

            // Determine which client ID to use for fetching collectors
            let targetClientId = null;
            if (user?.role === 'CLIENT') {
                targetClientId = user.id; // Or don't send clientId param, backend handles it
            } else if (user?.role === 'ADMIN') {
                targetClientId = survey.clientId;
            }

            // If Admin and no client selected, maybe show all or none? 
            // Requirement: "filter collectors of the client equal to the linked client"
            // If Admin and no client linked, probably shouldn't show collectors or show all?
            // Let's assume if no client linked, no collectors shown or empty list.

            if (user?.role === 'ADMIN' && !targetClientId) {
                setAvailableCollectors([]);
                return;
            }

            try {
                let url = getApiUrl('/api/collectors');
                if (targetClientId) {
                    url += `?clientId=${targetClientId}`;
                }

                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                setAvailableCollectors(data);
            } catch (error) {
                console.error('Error fetching collectors:', error);
            }
        };

        fetchCollectors();
    }, [survey?.clientId, token, user]);

    const handleAddQuestion = () => {
        if (!survey) return;
        const newQuestion: Question = {
            id: Date.now(), // Temp ID
            text: '',
            type: 'TEXT',
            options: []
        };
        setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
    };

    const handleRemoveQuestion = (qId: number) => {
        if (!survey) return;
        setSurvey({ ...survey, questions: survey.questions.filter(q => q.id !== qId) });
    };

    const handleQuestionChange = (qId: number, field: keyof Question, value: any) => {
        if (!survey) return;
        setSurvey({
            ...survey,
            questions: survey.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
        });
    };

    const handleAddOption = (qId: number) => {
        if (!survey) return;
        setSurvey({
            ...survey,
            questions: survey.questions.map(q => {
                if (q.id === qId) {
                    return {
                        ...q,
                        options: [...(q.options || []), { id: Date.now().toString(), text: '' }]
                    };
                }
                return q;
            })
        });
    };

    const handleOptionChange = (qId: number, optId: string, text: string) => {
        if (!survey) return;
        setSurvey({
            ...survey,
            questions: survey.questions.map(q => {
                if (q.id === qId) {
                    return {
                        ...q,
                        options: q.options?.map(o => o.id === optId ? { ...o, text } : o)
                    };
                }
                return q;
            })
        });
    };

    const handleOptionJumpChange = (qId: number, optId: string, nextQuestionId: string) => {
        if (!survey) return;
        setSurvey({
            ...survey,
            questions: survey.questions.map(q => {
                if (q.id === qId) {
                    return {
                        ...q,
                        options: q.options?.map(o => o.id === optId ? { ...o, nextQuestionId: nextQuestionId === 'end' ? 'end' : Number(nextQuestionId) } : o)
                    };
                }
                return q;
            })
        });
    };

    const handleRemoveOption = (qId: number, optId: string) => {
        if (!survey) return;
        setSurvey({
            ...survey,
            questions: survey.questions.map(q => {
                if (q.id === qId) {
                    return {
                        ...q,
                        options: q.options?.filter(o => o.id !== optId)
                    };
                }
                return q;
            })
        });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !survey) return;

        const { source, destination, type } = result;

        if (type === 'QUESTION') {
            const newQuestions = Array.from(survey.questions);
            const [reorderedItem] = newQuestions.splice(source.index, 1);
            newQuestions.splice(destination.index, 0, reorderedItem);

            setSurvey({ ...survey, questions: newQuestions });
        } else if (type === 'OPTION') {
            // DroppableId for options is `question-${questionId}`
            const questionId = parseInt(source.droppableId.split('-')[1]);
            const questionIndex = survey.questions.findIndex(q => q.id === questionId);

            if (questionIndex === -1) return;

            const question = survey.questions[questionIndex];
            if (!question.options) return;

            const newOptions = Array.from(question.options);
            const [reorderedItem] = newOptions.splice(source.index, 1);
            newOptions.splice(destination.index, 0, reorderedItem);

            const newQuestions = Array.from(survey.questions);
            setSurvey({ ...survey, questions: newQuestions });
        }
    };

    const handleSave = async (statusOverride?: 'AT' | 'IN') => {
        if (!survey) return;
        setSaving(true);
        try {
            // Transform nextQuestionId back to nextQuestionIndex for backend
            const questionsForBackend = survey.questions.map((q) => {
                const options = q.options?.map(opt => {
                    let nextQuestionIndex: number | undefined;
                    if (opt.nextQuestionId === 'end') {
                        nextQuestionIndex = -1;
                    } else if (typeof opt.nextQuestionId === 'number') {
                        // Find the index of the question with this ID
                        const targetIndex = survey.questions.findIndex(sq => sq.id === opt.nextQuestionId);
                        if (targetIndex !== -1) {
                            nextQuestionIndex = targetIndex;
                        }
                    }
                    // If nextQuestionId is undefined, nextQuestionIndex remains undefined
                    return { ...opt, nextQuestionIndex };
                });
                return { ...q, options };
            });

            const body = {
                title: survey.title,
                description: survey.description,
                questions: questionsForBackend,
                collectorIds: survey.collectorIds,
                status: statusOverride || survey.status,
                clientId: survey.clientId,
                goal: survey.goal
            };

            const url = id === 'new'
                ? getApiUrl('/api/surveys')
                : getApiUrl(`/api/surveys/${survey.id}`);

            const method = id === 'new' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                if (statusOverride) {
                    setSurvey({ ...survey, status: statusOverride });
                } else {
                    alert('Pesquisa salva com sucesso!');
                    navigate('/surveys');
                }
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao salvar pesquisa');
            }
        } catch (error) {
            console.error('Error saving survey:', error);
            alert('Erro ao salvar pesquisa');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusToggle = () => {
        if (!survey) return;
        const newStatus = survey.status === 'AT' ? 'IN' : 'AT';
        handleSave(newStatus);
    };

    if (loading) return <div className="p-6">Carregando...</div>;
    if (!survey) return <div className="p-6">Pesquisa não encontrada</div>;

    const isReadOnly = survey.status === 'AT';

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start space-x-4 w-full md:flex-1 md:mr-4">
                    <button onClick={() => navigate('/surveys')} className="p-2 hover:bg-gray-200 rounded-full flex-shrink-0 mt-1">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="w-full space-y-2">
                        <textarea
                            ref={(el) => {
                                if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                }
                            }}
                            value={survey.title}
                            onChange={(e) => {
                                setSurvey({ ...survey, title: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className="text-2xl font-bold text-brazil-blue w-full border-b border-transparent hover:border-gray-300 focus:border-brazil-blue focus:outline-none bg-transparent px-1 resize-none overflow-hidden"
                            placeholder="Título da Pesquisa"
                            disabled={isReadOnly}
                            rows={1}
                            style={{ height: 'auto', minHeight: '2.5rem' }}
                        />
                        <textarea
                            ref={(el) => {
                                if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                }
                            }}
                            value={survey.description || ''}
                            onChange={(e) => {
                                setSurvey({ ...survey, description: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className="text-gray-500 w-full border-b border-transparent hover:border-gray-300 focus:border-brazil-blue focus:outline-none bg-transparent px-1 resize-none overflow-hidden"
                            placeholder="Descrição da Pesquisa"
                            disabled={isReadOnly}
                            rows={2}
                            style={{ height: 'auto', minHeight: '3rem' }}
                        />
                        {user?.role === 'ADMIN' && (
                            <div className="flex items-center space-x-2 px-1">
                                <label className="text-sm font-medium text-gray-700">Cliente:</label>
                                <select
                                    value={survey.clientId || ''}
                                    onChange={(e) => setSurvey({ ...survey, clientId: e.target.value ? Number(e.target.value) : null })}
                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-brazil-blue focus:ring focus:ring-brazil-blue focus:ring-opacity-50 p-1 border"
                                    disabled={isReadOnly}
                                >
                                    <option value="">Nenhum</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}


                        <div className="px-1 pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Geral de Entrevistas:</label>
                            <input
                                type="number"
                                min="0"
                                value={survey.goal || 0}
                                onChange={(e) => {
                                    const newGoal = parseInt(e.target.value) || 0;
                                    const collectorCount = survey.collectorIds?.length || 0;
                                    const newGoalPerCollector = collectorCount > 0 ? Math.ceil(newGoal / collectorCount) : 0;
                                    setSurvey({ ...survey, goal: newGoal, goalPerCollector: newGoalPerCollector });
                                }}
                                className="w-full p-2 border border-gray-300 rounded focus:border-brazil-blue focus:ring-1 focus:ring-brazil-blue"
                                disabled={isReadOnly}
                            />
                            {survey.goalPerCollector !== undefined && survey.goalPerCollector > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Meta por Coletor: <span className="font-semibold text-brazil-blue">{survey.goalPerCollector}</span>
                                </p>
                            )}
                        </div>

                        <div className="px-1 pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Coletores Responsáveis:</label>
                            <div className="flex flex-wrap gap-2">
                                {availableCollectors.map(collector => (
                                    <button
                                        key={collector.id}
                                        onClick={() => {
                                            if (isReadOnly) return;
                                            const currentIds = survey.collectorIds || [];
                                            const newIds = currentIds.includes(collector.id)
                                                ? currentIds.filter(id => id !== collector.id)
                                                : [...currentIds, collector.id];

                                            // Recalculate goal per collector immediately for UI feedback
                                            const newCollectorCount = newIds.length;
                                            const currentGoal = survey.goal || 0;
                                            const newGoalPerCollector = newCollectorCount > 0 ? Math.ceil(currentGoal / newCollectorCount) : 0;

                                            setSurvey({ ...survey, collectorIds: newIds, goalPerCollector: newGoalPerCollector });
                                        }}
                                        disabled={isReadOnly}
                                        className={`px-3 py-1 rounded-full text-sm border ${(survey.collectorIds || []).includes(collector.id)
                                            ? 'bg-brazil-blue text-white border-brazil-blue'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {collector.name}
                                    </button>
                                ))}
                                {availableCollectors.length === 0 && (
                                    <span className="text-sm text-gray-400 italic">Nenhum coletor disponível para este cliente.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full md:w-auto md:items-end space-y-3">
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="bg-brazil-green text-white px-6 py-2 rounded flex justify-center items-center hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm w-full md:w-auto"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>

                    {id !== 'new' && (
                        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                            <div className="flex items-center justify-center md:justify-start space-x-3 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm w-full md:w-auto">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <button
                                    onClick={handleStatusToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brazil-blue ${survey.status === 'AT' ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    title={survey.status === 'AT' ? 'Clique para desativar' : 'Clique para ativar'}
                                >
                                    <span
                                        className={`${survey.status === 'AT' ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
                                    />
                                </button>
                                <span className={`text-sm font-bold min-w-[3rem] ${survey.status === 'AT' ? 'text-green-600' : 'text-gray-500'}`}>
                                    {survey.status === 'AT' ? 'ATIVA' : 'INATIVA'}
                                </span>
                            </div>
                            {survey.status === 'AT' && (
                                <span className="text-[10px] text-orange-500 mt-1 font-medium animate-fade-in">
                                    Desative para editar
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions" type="QUESTION">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-6"
                        >
                            {survey.questions.map((q, index) => (
                                <Draggable key={q.id} draggableId={q.id.toString()} index={index} isDragDisabled={isReadOnly}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`bg-white p-6 rounded shadow border border-gray-200 relative group ${isReadOnly ? 'opacity-75' : ''}`}
                                        >
                                            <div
                                                {...provided.dragHandleProps}
                                                className={`absolute left-2 top-6 text-gray-300 ${isReadOnly ? 'cursor-not-allowed' : 'cursor-move hover:text-gray-500'}`}
                                            >
                                                <GripVertical className="w-6 h-6" />
                                            </div>

                                            <div className="pl-6 space-y-4">
                                                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-start md:gap-4">
                                                    <div className="flex-1 w-full">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Pergunta {index + 1}
                                                            </label>
                                                            <button
                                                                onClick={() => handleRemoveQuestion(q.id)}
                                                                className={`md:hidden text-red-500 hover:text-red-700 p-1 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                title="Remover pergunta"
                                                                disabled={isReadOnly}
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={q.text}
                                                            onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded focus:border-brazil-blue focus:ring-1 focus:ring-brazil-blue"
                                                            placeholder="Digite a pergunta..."
                                                            disabled={isReadOnly}
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-48">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Tipo
                                                        </label>
                                                        <select
                                                            value={q.type}
                                                            onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded focus:border-brazil-blue focus:ring-1 focus:ring-brazil-blue"
                                                            disabled={isReadOnly}
                                                        >
                                                            <option value="TEXT">Texto Livre</option>
                                                            <option value="SINGLE_CHOICE">Múltipla Escolha (Única)</option>
                                                            <option value="MULTIPLE_CHOICE">Caixa de Seleção (Várias)</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveQuestion(q.id)}
                                                        className={`hidden md:block self-end md:self-start md:mt-6 text-red-500 hover:text-red-700 p-1 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title="Remover pergunta"
                                                        disabled={isReadOnly}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                                                    <Droppable droppableId={`question-${q.id}`} type="OPTION">
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className="bg-gray-50 p-4 rounded space-y-3"
                                                            >
                                                                <label className="block text-sm font-medium text-gray-700">Opções de Resposta</label>
                                                                {q.options?.map((opt, optIndex) => (
                                                                    <Draggable key={opt.id} draggableId={opt.id} index={optIndex} isDragDisabled={isReadOnly}>
                                                                        {(provided) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:gap-2 w-full"
                                                                            >
                                                                                <div className="flex items-center w-full">
                                                                                    <div
                                                                                        {...provided.dragHandleProps}
                                                                                        className={`text-gray-300 flex-shrink-0 mr-2 ${isReadOnly ? 'cursor-not-allowed' : 'cursor-move hover:text-gray-500'}`}
                                                                                    >
                                                                                        <GripVertical className="w-4 h-4" />
                                                                                    </div>

                                                                                    <input
                                                                                        type="text"
                                                                                        value={opt.text}
                                                                                        onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)}
                                                                                        className="flex-1 p-1.5 border border-gray-300 rounded text-sm focus:border-brazil-blue focus:ring-1 focus:ring-brazil-blue"
                                                                                        placeholder="Opção..."
                                                                                        disabled={isReadOnly}
                                                                                    />
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 w-full md:w-auto pl-8 md:pl-0">
                                                                                    <select
                                                                                        value={opt.nextQuestionId || ''}
                                                                                        onChange={(e) => handleOptionJumpChange(q.id, opt.id, e.target.value)}
                                                                                        className="flex-1 md:w-48 p-1.5 border border-gray-300 rounded text-sm focus:border-brazil-blue focus:ring-1 focus:ring-brazil-blue text-gray-600"
                                                                                        title="Pular para..."
                                                                                        disabled={isReadOnly}
                                                                                    >
                                                                                        <option value="">Continuar (Padrão)</option>
                                                                                        <option value="end">Finalizar Pesquisa</option>
                                                                                        {survey.questions.map((targetQ, idx) => (
                                                                                            targetQ.id !== q.id && (
                                                                                                <option key={targetQ.id} value={targetQ.id} title={targetQ.text}>
                                                                                                    {idx + 1}. {targetQ.text.substring(0, 20)}{targetQ.text.length > 20 ? '...' : ''}
                                                                                                </option>
                                                                                            )
                                                                                        ))}
                                                                                    </select>
                                                                                    <button
                                                                                        onClick={() => handleRemoveOption(q.id, opt.id)}
                                                                                        className={`text-gray-400 hover:text-red-500 flex-shrink-0 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                                        disabled={isReadOnly}
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                                <button
                                                                    onClick={() => handleAddOption(q.id)}
                                                                    className={`text-sm text-brazil-blue hover:underline flex items-center mt-2 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    disabled={isReadOnly}
                                                                >
                                                                    <Plus className="w-4 h-4 mr-1" />
                                                                    Adicionar Opção
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button
                onClick={handleAddQuestion}
                className={`w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brazil-blue hover:text-brazil-blue transition-colors flex justify-center items-center ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isReadOnly}
            >
                <Plus className="w-6 h-6 mr-2" />
                Adicionar Nova Pergunta
            </button>
        </div>
    );
};


export default SurveyDetails;
