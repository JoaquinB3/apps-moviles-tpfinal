import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ onStart }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a Wordle Argentino 🇦🇷!</Text>
      <Text style={styles.subtitle}>Adivina la palabra secreta en 6 intentos.</Text>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Empezar a jugar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#74ACDF',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#003366',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 