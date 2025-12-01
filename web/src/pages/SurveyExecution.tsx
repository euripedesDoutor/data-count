import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';
import { ChevronRight, Save, MapPin, AlertCircle } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
    options?: any[]; // Options can be strings or objects
    order: number;
}

interface Survey {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

interface Location {
    lat: number;
    lng: number;
}

const SurveyExecution: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [history, setHistory] = useState<number[]>([]);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [locations, setLocations] = useState<Record<number, Location>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const fetchSurvey = async () => {
            if (!id || !token) return;
            try {
                const response = await fetch(getApiUrl(`/api/surveys/${id}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSurvey(data);
                } else {
                    alert('Erro ao carregar pesquisa');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching survey:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [id, token, navigate]);

    const getCurrentLocation = (): Promise<Location> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };

    const handleAnswer = async (value: any, shouldCaptureLocation = true) => {
        setGpsError(null);
        const currentQuestion = survey?.questions[currentQuestionIndex];

        if (currentQuestion) {
            setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));

            if (shouldCaptureLocation) {
                try {
                    const location = await getCurrentLocation();
                    setLocations(prev => ({ ...prev, [currentQuestion.id]: location }));
                } catch (error) {
                    console.error('GPS Error:', error);
                    setGpsError('Erro ao obter localização GPS. Verifique se o GPS está ativado.');
                }
            }
        }
    };

    const handleNext = () => {
        if (!survey) return;

        const currentQuestion = survey.questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestion.id];

        if (!currentAnswer && currentAnswer !== 0) {
            alert('Por favor, responda a pergunta atual.');
            return;
        }

        // Check for skip logic
        let nextIndex = currentQuestionIndex + 1;
        let shouldFinish = false;

        if (currentQuestion.options) {
            // Handle both single value and array (in case multiple choice is fixed later)
            const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer];

            for (const value of selectedValues) {
                const selectedOption = currentQuestion.options.find((opt: any) => {
                    const optValue = typeof opt === 'string' ? opt : opt.text;
                    return optValue === value;
                });

                if (selectedOption && typeof selectedOption !== 'string') {
                    if (selectedOption.nextQuestionIndex === -1) {
                        shouldFinish = true;
                        break; // End survey takes precedence
                    } else if (typeof selectedOption.nextQuestionIndex === 'number') {
                        // If multiple options selected, jump to the furthest one
                        if (selectedOption.nextQuestionIndex > nextIndex) {
                            nextIndex = selectedOption.nextQuestionIndex;
                        }
                    }
                }
            }
        }

        if (shouldFinish) {
            handleSubmit();
            return;
        }

        if (nextIndex < survey.questions.length) {
            setHistory(prev => [...prev, currentQuestionIndex]);
            setCurrentQuestionIndex(nextIndex);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevIndex = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setCurrentQuestionIndex(prevIndex);
        } else {
            // Fallback if history is empty (shouldn't happen if button disabled correctly)
            setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
        }
    };

    const handleSubmit = () => {
        if (!survey) return;
        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        if (!survey) return;

        setShowConfirmation(false);
        setSubmitting(true);
        try {
            const response = await fetch(getApiUrl('/api/responses'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    surveyId: survey.id,
                    data: answers,
                    location: locations // Map of questionId -> location
                })
            });

            if (response.ok) {
                setCompleted(true);
            } else {
                alert('Erro ao enviar pesquisa');
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Erro ao enviar pesquisa');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Carregando...</div>;
    if (!survey) return <div className="flex justify-center items-center h-screen">Pesquisa não encontrada</div>;

    if (completed) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <Save className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesquisa Finalizada!</h2>
                    <p className="text-gray-600 mb-8">
                        As respostas foram enviadas com sucesso. Obrigado pela colaboração.
                    </p>
                    <button
                        onClick={() => navigate('/collector/dashboard')}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brazil-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Voltar para o Painel
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = survey.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <h1 className="text-lg font-bold text-gray-800 truncate">{survey.title}</h1>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                        className="bg-brazil-green h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                    Pergunta {currentQuestionIndex + 1} de {survey.questions.length}
                </p>
            </div>

            {/* Question Content */}
            <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <h2 className="text-xl font-medium text-gray-900 mb-6">{currentQuestion.text}</h2>

                    {gpsError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center text-sm">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {gpsError}
                        </div>
                    )}

                    <div className="space-y-4">
                        {currentQuestion.type === 'TEXT' && (
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-brazil-blue focus:border-brazil-blue"
                                rows={4}
                                placeholder="Digite sua resposta..."
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswer(e.target.value, false)}
                                onBlur={() => handleAnswer(answers[currentQuestion.id], true)}
                            />
                        )}

                        {(currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'MULTIPLE_CHOICE') && (
                            <div className="space-y-2">
                                {currentQuestion.options?.map((option: any, idx) => {
                                    const optionText = typeof option === 'string' ? option : option.text;
                                    const optionValue = typeof option === 'string' ? option : option.text;

                                    return (
                                        <label
                                            key={idx}
                                            className={`
                                                flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                                                ${answers[currentQuestion.id] === optionValue ? 'bg-blue-50 border-brazil-blue' : 'hover:bg-gray-50 border-gray-200'}
                                            `}
                                        >
                                            <input
                                                type={currentQuestion.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                                                name={`question-${currentQuestion.id}`}
                                                value={optionValue}
                                                checked={answers[currentQuestion.id] === optionValue}
                                                onChange={() => handleAnswer(optionValue, true)}
                                                className="h-4 w-4 text-brazil-blue focus:ring-brazil-blue border-gray-300"
                                            />
                                            <span className="ml-3 text-gray-700">{optionText}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white p-4 border-t border-gray-200 sticky bottom-0">
                <div className="max-w-2xl mx-auto w-full flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 text-gray-600 disabled:opacity-50"
                    >
                        Voltar
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={submitting}
                        className="flex items-center px-6 py-2 bg-brazil-blue text-white rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Enviando...' : isLastQuestion ? 'Finalizar' : 'Próxima'}
                        {!submitting && !isLastQuestion && <ChevronRight className="ml-2 w-4 h-4" />}
                        {!submitting && isLastQuestion && <Save className="ml-2 w-4 h-4" />}
                    </button>
                </div>
                <div className="h-6 text-center mt-2 text-xs text-green-600 flex items-center justify-center">
                    {locations[currentQuestion.id] ? (
                        <>
                            <MapPin className="w-3 h-3 mr-1" />
                            Localização capturada
                        </>
                    ) : (
                        <span className="invisible">Espaço reservado</span>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Finalizar Pesquisa?</h3>
                        <p className="text-gray-600 mb-6">
                            Você tem certeza que deseja finalizar a pesquisa e enviar as respostas? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmSubmit}
                                className="px-4 py-2 text-white bg-brazil-blue rounded-md hover:bg-blue-800 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurveyExecution;
