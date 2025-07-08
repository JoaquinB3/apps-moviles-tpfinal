import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LetterState } from './LetterBox';

const KEYS: string[][] = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['DEL','Z','X','C','V','B','N','M','ENTER'],
];

const COLORS: Record<LetterState | 'text', string> = {
  default: '#74ACDF', // Celeste
  correct: '#6AAA64', // Verde
  present: '#C9B458', // Amarillo
  absent: '#787C7E',  // Gris
  text: '#FFFFFF',    // Blanco
};

interface KeyboardProps {
  letterStates: { [key: string]: LetterState };
  onKeyPress: (key: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ letterStates, onKeyPress }) => {
  return (
    <View style={styles.keyboard}>
      {KEYS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((key) => {
            const state: LetterState = letterStates[key] || 'default';
            return (
              <TouchableOpacity
                key={key}
                style={[styles.key, { backgroundColor: COLORS[state] }]}
                onPress={() => onKeyPress(key)}
                activeOpacity={0.7}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'center',
    width: '100%',
  },
  key: {
    marginHorizontal: 1.5,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 10,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  keyText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default Keyboard; 