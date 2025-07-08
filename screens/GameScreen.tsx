import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Grid from '../components/Grid';
import Keyboard from '../components/Keyboard';
import palabrasArgentinas from '../constants/palabras-argentinas.json';

interface GameScreenProps {
  onHome: () => void;
  onRestart: () => void;
}

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

const GameScreen: React.FC<GameScreenProps> = ({ onHome, onRestart }) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>('');
  const [states, setStates] = useState<LetterState[][]>(getEmptyStates());
  const [letterStates, setLetterStates] = useState<{ [key: string]: LetterState }>(getInitialLetterStates());
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [titleWidth, setTitleWidth] = useState<number>(180);
  const [animateRow, setAnimateRow] = useState<number | undefined>(undefined);
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(100)).current; // 100px abajo
  const [solution, setSolution] = useState<string>(getRandomWord());

  useEffect(() => {
    if (status !== 'playing' && message) {
      setShowToast(true);
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [status, message]);

  const handleCloseToast = () => {
    Animated.timing(toastAnim, {
      toValue: 100,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setShowToast(false);
      if (onHome) onHome();
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
        } else if (guesses.length + 1 === 6) {
          setStatus('lost');
          setMessage(`Perdiste. La palabra era ${solution}`);
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
    if (onRestart) onRestart();
  }

  return (
    <View style={styles.container}>
      {/* Header con título */}
      <View style={styles.header}>
        <View style={styles.titleFlagContainer}>
          <Text
            style={styles.titleFlag}
            onLayout={e => setTitleWidth(e.nativeEvent.layout.width)}
          >
            Wordle Argentino
          </Text>
          <View style={[styles.flagRow, { width: titleWidth }]}> 
            {/* Barra izquierda */}
            <View style={styles.flagBarWrapper}>
              <View style={styles.flagBarCeleste} />
              <View style={styles.flagBarBlanca} />
            </View>
            <View style={styles.flagSunWrapper}>
              <Ionicons name="sunny" size={28} color="#ffd500" />
            </View>
            {/* Barra derecha */}
            <View style={styles.flagBarWrapper}>
              <View style={styles.flagBarBlanca} />
              <View style={styles.flagBarCeleste} />
            </View>
          </View>
        </View>
      </View>
      {/* Icono de casita centrado debajo del título */}
      <TouchableOpacity style={styles.homeIconCentered} onPress={onHome} accessibilityLabel="Ir al inicio">
        <Ionicons name="home" size={32} color="#003366" />
      </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dedede',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  homeIconCentered: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  titleFlagContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
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
});

export default GameScreen; 