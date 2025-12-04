import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { saveResponse } from '../services/database';
import { calculateNextQuestionIndex } from '../utils/surveyLogic';

// Mock Question Interface
interface Question {
    id: number;
    text: string;
    type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
    options?: string[];
    nextQuestionId?: number; // Default next
    skipLogic?: { answer: string; nextQuestionId: number }[]; // Logic
}

// Mock Data for testing (would come from DB/API)
const MOCK_QUESTIONS: Question[] = [
    { id: 1, text: 'Qual sua idade?', type: 'TEXT' },
    {
        id: 2,
        text: 'Em quem você votaria para Presidente?',
        type: 'SINGLE_CHOICE',
        options: ['Candidato A', 'Candidato B', 'Candidato C', 'Indeciso', 'Branco/Nulo'],
        skipLogic: [{ answer: 'Indeciso', nextQuestionId: 4 }]
    },
    { id: 3, text: 'Por que você escolheu esse candidato?', type: 'TEXT' },
    { id: 4, text: 'Como você avalia a gestão atual?', type: 'SINGLE_CHOICE', options: ['Ótima', 'Boa', 'Regular', 'Ruim', 'Péssima'] },
];

export default function SurveyScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params; // Survey ID

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [loadingLocation, setLoadingLocation] = useState(false);

    const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];

    const handleAnswer = (value: any) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleNext = () => {
        if (!answers[currentQuestion.id]) {
            Alert.alert('Atenção', 'Por favor, responda a pergunta para continuar.');
            return;
        }

        // Check Skip Logic
        const nextIndex = calculateNextQuestionIndex(currentQuestion, currentQuestionIndex, answers[currentQuestion.id], MOCK_QUESTIONS);

        if (nextIndex < MOCK_QUESTIONS.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            finishSurvey();
        }
    };

    const finishSurvey = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos da localização para validar a pesquisa.');
                setLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const locationData = JSON.stringify({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            });

            saveResponse(id, JSON.stringify(answers), locationData);

            Alert.alert('Sucesso', 'Pesquisa salva com sucesso!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível capturar a localização.');
        } finally {
            setLoadingLocation(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <Text style={styles.progressText}>
                    Pergunta {currentQuestionIndex + 1} de {MOCK_QUESTIONS.length}
                </Text>
                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }
                        ]}
                    />
                </View>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.questionText}>{currentQuestion.text}</Text>

                {currentQuestion.type === 'TEXT' && (
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua resposta..."
                        value={answers[currentQuestion.id] || ''}
                        onChangeText={handleAnswer}
                        multiline
                    />
                )}

                {currentQuestion.type === 'SINGLE_CHOICE' && currentQuestion.options?.map(option => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.optionButton,
                            answers[currentQuestion.id] === option && styles.optionSelected
                        ]}
                        onPress={() => handleAnswer(option)}
                    >
                        <Text style={[
                            styles.optionText,
                            answers[currentQuestion.id] === option && styles.optionTextSelected
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                {loadingLocation ? (
                    <ActivityIndicator size="large" color="#009c3b" />
                ) : (
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentQuestionIndex === MOCK_QUESTIONS.length - 1 ? 'Finalizar' : 'Próxima'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    progressBar: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    progressText: {
        color: '#666',
        marginBottom: 10,
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#009c3b',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    questionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#002776',
        marginBottom: 30,
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    optionButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    optionSelected: {
        backgroundColor: '#e6f4ea',
        borderColor: '#009c3b',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionTextSelected: {
        color: '#009c3b',
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    nextButton: {
        backgroundColor: '#ffdf00',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#002776',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
