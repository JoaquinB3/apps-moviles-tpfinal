import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

// Estados posibles: default, correct, present, absent
export type LetterState = 'default' | 'correct' | 'present' | 'absent';

const COLORS: Record<LetterState | 'text', string> = {
  default: '#74ACDF', // Celeste
  correct: '#6AAA64', // Verde
  present: '#C9B458', // Amarillo
  absent: '#787C7E',  // Gris
  text: '#FFFFFF',    // Blanco
};

interface LetterBoxProps {
  letter: string;
  state?: LetterState;
  size?: number;
  animate?: boolean;
  delay?: number;
}

const LetterBox: React.FC<LetterBoxProps> = ({ 
  letter, 
  state = 'default', 
  size = 48, 
  animate = false,
  delay = 0 
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [showResult, setShowResult] = React.useState(false);

  useEffect(() => {
    if (animate && letter && letter.length > 0) {
      setTimeout(() => {
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowResult(true);
        });
      }, delay);
    }
  }, [animate, letter, delay]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      {/* Frente de la casilla */}
      <Animated.View style={[styles.face, styles.front, frontAnimatedStyle]}>
        <Text style={styles.letter}>{letter ? letter.toUpperCase() : ''}</Text>
      </Animated.View>
      
      {/* Dorso de la casilla (resultado) */}
      <Animated.View style={[
        styles.face, 
        styles.back, 
        backAnimatedStyle, 
        { backgroundColor: COLORS[state] }
      ]}>
        <Text style={styles.letter}>{letter ? letter.toUpperCase() : ''}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  front: {
    backgroundColor: '#74ACDF',
  },
  back: {
    backgroundColor: '#74ACDF',
  },
  letter: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 28,
  },
});

export default LetterBox; 