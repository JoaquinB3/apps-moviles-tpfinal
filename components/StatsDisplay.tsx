import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useScore } from '../context/ScoreContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export const StatsDisplay: React.FC = () => {
  const { stats, isLoading } = useScore();

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Cargando estadísticas...</ThemedText>
      </ThemedView>
    );
  }

  const winRate = stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) : 0;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Estadísticas</ThemedText>
      
      {/* Grid de estadísticas responsive */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.totalGames}</ThemedText>
            <ThemedText style={styles.statLabel}>Jugados</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{winRate}%</ThemedText>
            <ThemedText style={styles.statLabel}>% Ganados</ThemedText>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.currentStreak}</ThemedText>
            <ThemedText style={styles.statLabel}>Racha Actual</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.bestStreak}</ThemedText>
            <ThemedText style={styles.statLabel}>Mejor Racha</ThemedText>
          </View>
        </View>
      </View>
      {stats.averageGuesses > 0 && (
        <ThemedText style={styles.average}>
          Promedio de intentos: {stats.averageGuesses.toFixed(1)}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#003366',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 6,
    minHeight: 80,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
    lineHeight: 13,
    flexWrap: 'wrap',
  },
  average: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});
