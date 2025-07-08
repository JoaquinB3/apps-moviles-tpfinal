import React from 'react';
import { StyleSheet, View } from 'react-native';
import LetterBox, { LetterState } from './LetterBox';

interface GridProps {
  guesses: string[]; // Palabras ingresadas
  states: LetterState[][]; // Estados de cada letra
  animateRow?: number;
}

const NUM_ROWS = 6;
const NUM_COLS = 5;

const Grid: React.FC<GridProps> = ({ guesses, states, animateRow }) => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: NUM_ROWS }).map((_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: NUM_COLS }).map((_, colIdx) => {
            const letter = guesses[rowIdx]?.[colIdx] || '';
            const state: LetterState = states[rowIdx]?.[colIdx] || 'default';
            const shouldAnimate = animateRow === rowIdx && letter.length > 0;
            const delay = colIdx * 200; // 200ms entre cada casilla
            
            return (
              <LetterBox 
                key={colIdx} 
                letter={letter} 
                state={state} 
                animate={shouldAnimate}
                delay={delay}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default Grid; 