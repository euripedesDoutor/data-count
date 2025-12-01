import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Client {
    id: number;
    name: string;
}

interface Survey {
    id: number;
    title: string;
}

interface Question {
    id: number;
    text: string;
    type: string;
    options?: string[] | any;
    data?: { name: string; value: number }[];
}

interface ReportData {
    surveyTitle: string;
    totalResponses: number;
    questions: Question[];
}

interface Location {
    lat: number;
    lng: number;
}

// Component to update map center based on points
const MapUpdater = ({ locations }: { locations: Location[] }) => {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = locations.map(l => [l.lat, l.lng] as [number, number]);
            map.fitBounds(bounds);
        }
    }, [locations, map]);

    return null;
};

export const Heatmap = () => {
    const { token, user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedSurvey, setSelectedSurvey] = useState('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<{ questionId: number; answer: string } | null>(null);

    // Fetch Clients (Admin only)
    useEffect(() => {
        if (user?.role === 'ADMIN' && token) {
            fetch(getApiUrl('/api/clients'), {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setClients(data))
                .catch(err => console.error('Error fetching clients:', err));
        }
    }, [user, token]);

    // Fetch Surveys
    useEffect(() => {
        if (!token) return;

        let url = getApiUrl('/api/surveys');
        if (user?.role === 'ADMIN' && selectedClient) {
            url += `?clientId=${selectedClient}`;
        }

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setSurveys(data))
            .catch(err => console.error('Error fetching surveys:', err));
    }, [user, token, selectedClient]);

    // Fetch Report Data for Filters
    useEffect(() => {
        if (!selectedSurvey || !token) return;

        fetch(getApiUrl(`/api/surveys/${selectedSurvey}/report`), {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setReportData(data))
            .catch(err => console.error('Error fetching report data:', err));
    }, [selectedSurvey, token]);

    const fetchHeatmapData = () => {
        if (!selectedSurvey || !token) return;

        setLoading(true);
        let url = getApiUrl(`/api/surveys/${selectedSurvey}/heatmap`);

        if (filter) {
            url += `?questionId=${filter.questionId}&answer=${encodeURIComponent(filter.answer)}`;
        }

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setLocations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching heatmap:', err);
                setLoading(false);
            });
    };

    // Re-fetch heatmap when filter changes
    useEffect(() => {
        if (selectedSurvey) {
            fetchHeatmapData();
        }
    }, [filter]);

    return (
        <div className="space-y-6 p-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">Mapa de Calor</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
                {user?.role === 'ADMIN' && (
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select
                            className="w-full border rounded p-2"
                            value={selectedClient}
                            onChange={(e) => {
                                setSelectedClient(e.target.value);
                                setSelectedSurvey('');
                                setReportData(null);
                                setFilter(null);
                                setLocations([]);
                            }}
                        >
                            <option value="">Selecione um Cliente</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisa</label>
                    <select
                        className="w-full border rounded p-2"
                        value={selectedSurvey}
                        onChange={(e) => {
                            setSelectedSurvey(e.target.value);
                            setFilter(null);
                        }}
                        disabled={user?.role === 'ADMIN' && !selectedClient}
                    >
                        <option value="">Selecione uma Pesquisa</option>
                        {surveys.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                </div>

                {/* Filter by Question */}
                <div className="w-full md:w-1/4">
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
                    <div className="w-full md:w-1/4">
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
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden relative border border-gray-200">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
                        <div className="text-lg font-semibold text-gray-600">Carregando mapa...</div>
                    </div>
                )}

                {!selectedSurvey ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Selecione uma pesquisa para visualizar o mapa de calor.
                    </div>
                ) : (
                    <MapContainer
                        center={[-14.2350, -51.9253] as [number, number]}
                        zoom={4}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {locations.map((loc, idx) => (
                            <CircleMarker
                                key={idx}
                                center={[loc.lat, loc.lng] as [number, number]}
                                radius={8}
                                fillColor="red"
                                color="darkred"
                                weight={1}
                                opacity={1}
                                fillOpacity={0.6}
                            >
                                <Popup>
                                    Lat: {loc.lat}<br />
                                    Lng: {loc.lng}
                                </Popup>
                            </CircleMarker>
                        ))}
                        <MapUpdater locations={locations} />
                    </MapContainer>
                )}
            </div>

            {locations.length > 0 && (
                <div className="bg-white p-2 rounded shadow text-sm text-gray-600">
                    Total de pontos exibidos: <strong>{locations.length}</strong>
                </div>
            )}
        </div>
    );
};
