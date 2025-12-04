import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getSurveys, initDatabase, saveSurvey } from '../services/database';

export default function HomeScreen() {
    const [surveys, setSurveys] = useState<any[]>([]);
    const navigation = useNavigation<any>();

    useEffect(() => {
        initDatabase();
        // Mock data for testing
        saveSurvey(1, 'Pesquisa Eleitoral 2026', JSON.stringify([]));
        loadSurveys();
    }, []);

    const loadSurveys = () => {
        const data = getSurveys();
        setSurveys(data);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pesquisas Disponíveis</Text>
            <FlatList
                data={surveys}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Survey', { id: item.id })}
                    >
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardStatus}>Disponível Offline</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#002776',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 5,
        borderLeftColor: '#ffdf00',
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardStatus: {
        color: '#009c3b',
        marginTop: 5,
        fontSize: 12,
    },
});
