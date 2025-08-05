import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import { StatsDisplay } from '../components/StatsDisplay';
import palabrasArgentinas from '../constants/palabras-argentinas.json';
import { useScore } from '../context/ScoreContext';

type LetterState = 'default' | 'correct' | 'present' | 'absent';

function getEmptyStates(): LetterState[][] {
  return Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => 'default'));
}

function getInitialLetterStates(): { [key: string]: LetterState } {
  const obj: { [key: string]: LetterState } = {};
  'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('').forEach(l => obj[l] = 'default');
  return obj;
}

function getRandomWord() {
  const idx = Math.floor(Math.random() * palabrasArgentinas.length);
  return palabrasArgentinas[idx].toUpperCase();
}

const GameScreen: React.FC = () => {
  const { addGameResult } = useScore();
  const { signOut } = useAuth();
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>('');
  const [states, setStates] = useState<LetterState[][]>(getEmptyStates());
  const [letterStates, setLetterStates] = useState<{ [key: string]: LetterState }>(getInitialLetterStates());
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');
  const [showStats, setShowStats] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [animateRow, setAnimateRow] = useState<number | undefined>(undefined);
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(100)).current; // 100px abajo
  const [solution, setSolution] = useState<string>(getRandomWord());

  const handleSignOut = () => {
    signOut();
  };

  useEffect(() => {
    if (status !== 'playing' && message) {
      setShowToast(true);
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [status, message, toastAnim]);

  const handleCloseToast = () => {
    Animated.timing(toastAnim, {
      toValue: 100,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setShowToast(false);
    });
  };

  function handleKeyPress(key: string) {
    if (status !== 'playing') return;
    if (key === 'DEL') {
      setCurrent(c => c.slice(0, -1));
    } else if (key === 'ENTER') {
      if (current.length !== 5) {
        shake();
        setMessage('La palabra debe tener 5 letras');
        return;
      }
      const guess = current.toUpperCase();
      const solutionWord = solution.toUpperCase();
      const currentRowIndex = guesses.length;
      
      // Activar animación primero
      setAnimateRow(currentRowIndex);
      
      // Esperar a que termine la animación antes de actualizar estados
      setTimeout(() => {
        const newStates = [...states];
        const guessStates: LetterState[] = Array.from({ length: 5 }, () => 'absent');
        const newLetterStates = { ...letterStates };
        // Marcar correctos
        for (let i = 0; i < 5; i++) {
          if (guess[i] === solutionWord[i]) {
            guessStates[i] = 'correct';
            newLetterStates[guess[i]] = 'correct';
          }
        }
        // Marcar presentes
        for (let i = 0; i < 5; i++) {
          if (guessStates[i] !== 'correct' && solutionWord.indexOf(guess[i]) !== -1) {
            guessStates[i] = 'present';
            if (newLetterStates[guess[i]] !== 'correct')
              newLetterStates[guess[i]] = 'present';
          } else if (guessStates[i] !== 'correct') {
            newLetterStates[guess[i]] = 'absent';
          }
        }
        newStates[currentRowIndex] = guessStates;
        setGuesses([...guesses, guess]);
        setStates(newStates);
        setLetterStates(newLetterStates);
        setCurrent('');
        setMessage('');
        
        if (guess === solutionWord) {
          setStatus('won');
          setMessage('¡Ganaste!');
          // Record the win in user's score
          addGameResult(true, guesses.length + 1);
        } else if (guesses.length + 1 === 6) {
          setStatus('lost');
          setMessage(`Perdiste. La palabra era ${solution}`);
          // Record the loss in user's score
          addGameResult(false, 6);
        }
      }, 1200); // Esperar 1.2 segundos para que termine la animación (5 casillas * 200ms + margen)
      
      // Limpiar animación después de 3 segundos
      setTimeout(() => {
        setAnimateRow(undefined);
      }, 3000);
    } else if (current.length < 5 && /^[A-ZÑ]$/.test(key)) {
      setCurrent(c => c + key);
    }
  }

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function handleRestart() {
    const newWord = getRandomWord();
    setGuesses([]);
    setCurrent('');
    setStates(getEmptyStates());
    setLetterStates(getInitialLetterStates());
    setStatus('playing');
    setMessage('');
    setAnimateRow(undefined);
    setShowToast(false);
    setSolution(newWord);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f8f9fa" />
      {/* Header minimalista solo con iconos */}
      <View style={styles.header}>
        {/* Botón de Sign Out - izquierda */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#003366" />
        </TouchableOpacity>
        
        {/* Espaciador para centrar visual */}
        <View style={styles.headerSpacer} />
        
        {/* Botón de estadísticas - derecha */}
        <TouchableOpacity 
          style={styles.statsButton} 
          onPress={() => setShowStats(true)}
          accessibilityLabel="Ver estadísticas"
        >
          <Ionicons name="stats-chart" size={24} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* Título grande del juego */}
      <View style={styles.gameTitle}>
        <Text style={styles.titleFlag}>Wordle Argentino</Text>
        <View style={styles.flagRow}> 
          <View style={styles.flagBarWrapper}>
            <View style={styles.flagBarCeleste} />
            <View style={styles.flagBarBlanca} />
          </View>
          <View style={styles.flagSunWrapper}>
            <Ionicons name="sunny" size={28} color="#ffd500" />
          </View>
          <View style={styles.flagBarWrapper}>
            <View style={styles.flagBarBlanca} />
            <View style={styles.flagBarCeleste} />
          </View>
        </View>
      </View>
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <Grid 
          guesses={[...guesses, current, ...Array.from({ length: 5 - guesses.length }).map(() => '')]} 
          states={states} 
          animateRow={animateRow}
        />
      </Animated.View>
      {message && status === 'playing' ? <Text style={styles.message}>{message}</Text> : null}
      {/* Toast animado de victoria/derrota */}
      {showToast && (
        <Animated.View style={[styles.toast, {
          transform: [{ translateY: toastAnim }],
        }]}
        pointerEvents="box-none"
        >
          <TouchableOpacity style={styles.toastClose} onPress={handleCloseToast} accessibilityLabel="Cerrar mensaje">
            <Text style={{ fontSize: 22, color: '#003366', fontWeight: 'bold' }}>✖</Text>
          </TouchableOpacity>
          <Text style={status === 'won' ? styles.win : styles.lose}>{message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRestart}>
            <Text style={styles.retryText}>Volver a jugar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {/* Teclado abajo de todo */}
      <View style={styles.keyboardContainer}>
        <Keyboard letterStates={letterStates} onKeyPress={handleKeyPress} />
      </View>
      
      {/* Modal de estadísticas */}
      <Modal
        visible={showStats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStats(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose} 
              onPress={() => setShowStats(false)}
              accessibilityLabel="Cerrar estadísticas"
            >
              <Ionicons name="close" size={24} color="#003366" />
            </TouchableOpacity>
            <StatsDisplay />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dedede',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  signOutButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerSpacer: {
    flex: 1,
  },
  statsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gameTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  titleFlagContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleFlag: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 2,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    marginTop: 2,
  },
  flagBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 10,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 1,
  },
  flagBarCeleste: {
    flex: 3,
    backgroundColor: '#52e0ff',
    height: '100%',
  },
  flagBarBlanca: {
    flex: 1,
    backgroundColor: '#fff',
    height: '100%',
  },
  flagSunWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    zIndex: 2,
  },
  message: {
    color: '#003366',
    fontSize: 18,
    marginVertical: 8,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#74ACDF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
    elevation: 3,
  },
  win: {
    color: '#6AAA64',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  lose: {
    color: '#C9B458',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  keyboardContainer: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#dedede',
    paddingBottom: 16,
    paddingTop: 8,
    marginTop: 'auto',
  },
  toast: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    bottom: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 100,
    minHeight: 100,
    justifyContent: 'center',
  },
  toastClose: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  spacer: {
    width: 40, // Same width as stats button to center the title
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GameScreen;