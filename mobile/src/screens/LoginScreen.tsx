import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                navigation.replace('Home');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogin = async () => {
        // Mock login for now - In real app, fetch from API
        if (email && password) {
            if (rememberMe) {
                try {
                    await AsyncStorage.setItem('userToken', 'dummy-token');
                } catch (e) {
                    console.error(e);
                }
            }
            navigation.replace('Home');
        } else {
            Alert.alert('Erro', 'Preencha todos os campos');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>DataCount</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.rememberContainer}>
                <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={rememberMe ? "#009c3b" : "#f4f3f4"}
                />
                <Text style={styles.rememberText}>Manter Conectado</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#002776',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    rememberText: {
        marginLeft: 10,
        color: '#555',
    },
    button: {
        backgroundColor: '#009c3b',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
