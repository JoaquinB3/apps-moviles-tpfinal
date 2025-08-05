import { useUser } from '@clerk/clerk-expo';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  totalScore: number;
  bestStreak: number;
  currentStreak: number;
  averageGuesses: number;
  lastPlayed: string;
}

interface ScoreContextType {
  stats: GameStats;
  addGameResult: (won: boolean, guesses: number) => Promise<void>;
  isLoading: boolean;
}

const defaultStats: GameStats = {
  totalGames: 0,
  gamesWon: 0,
  gamesLost: 0,
  totalScore: 0,
  bestStreak: 0,
  currentStreak: 0,
  averageGuesses: 0,
  lastPlayed: '',
};

const ScoreContext = createContext<ScoreContextType>({
  stats: defaultStats,
  addGameResult: async () => {},
  isLoading: false,
});

export const useScore = () => useContext(ScoreContext);

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = () => {
      if (!user) return;
      
      try {
        const savedStats = user.unsafeMetadata.gameStats as GameStats;
        if (savedStats) {
          setStats(savedStats);
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      loadUserStats();
    }
  }, [isLoaded, user]);

  const saveUserStats = async (newStats: GameStats) => {
    if (!user) return;

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          gameStats: newStats,
        },
      });
    } catch (error) {
      console.error('Error saving user stats:', error);
      throw error;
    }
  };

  const calculateScore = (won: boolean, guesses: number): number => {
    if (!won) return 0;
    
    // Puntuación base por ganar
    let score = 100;
    
    // Bonus por resolver en pocos intentos
    if (guesses === 1) score += 100; // Bonus por acertar al primer intento
    else if (guesses === 2) score += 75;
    else if (guesses === 3) score += 50;
    else if (guesses === 4) score += 25;
    else if (guesses === 5) score += 10;
    
    return score;
  };

  const addGameResult = async (won: boolean, guesses: number) => {
    if (!user) return;

    const score = calculateScore(won, guesses);
    const newStreak = won ? stats.currentStreak + 1 : 0;
    
    const newStats: GameStats = {
      totalGames: stats.totalGames + 1,
      gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
      gamesLost: won ? stats.gamesLost : stats.gamesLost + 1,
      totalScore: stats.totalScore + score,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      currentStreak: newStreak,
      averageGuesses: stats.totalGames > 0 
        ? ((stats.averageGuesses * stats.totalGames) + guesses) / (stats.totalGames + 1)
        : guesses,
      lastPlayed: new Date().toISOString(),
    };

    setStats(newStats);
    await saveUserStats(newStats);
  };

  return (
    <ScoreContext.Provider value={{ stats, addGameResult, isLoading }}>
      {children}
    </ScoreContext.Provider>
  );
};
