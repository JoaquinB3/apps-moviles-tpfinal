import React, { useState } from 'react';
import GameScreen from '../../screens/GameScreen';
import HomeScreen from '../../screens/HomeScreen';

export default function Main() {
  const [screen, setScreen] = useState('home');

  const handleStart = () => setScreen('game');
  const handleHome = () => setScreen('home');
  const handleRestart = () => setScreen('game');

  if (screen === 'home') {
    return <HomeScreen onStart={handleStart} />;
  }
  return <GameScreen onHome={handleHome} onRestart={handleRestart} />;
}
