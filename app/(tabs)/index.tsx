import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import GameScreen from '../../screens/GameScreen';

export default function Main() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <GameScreen />
    </ScrollView>
  );
}