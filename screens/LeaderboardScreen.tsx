import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

interface PlayerStats {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress: string;
  totalGames: number;
  gamesWon: number;
  winRate: number;
  totalScore: number;
  bestStreak: number;
  averageGuesses: number;
}

const LeaderboardScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'winRate' | 'streak'>('score');

  const handleSignOut = () => {
    signOut();
  };

  // Función para obtener el ranking con usuarios reales de Clerk
  // Nota: Por seguridad, Clerk no permite acceso directo a todos los usuarios desde el cliente
  // En una app real, esto se haría a través de una API backend
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const allPlayers: PlayerStats[] = [];

      // Siempre incluir al usuario actual si tiene datos
      if (user?.unsafeMetadata?.gameStats) {
        const userStats = user.unsafeMetadata.gameStats as any;
        const winRate = userStats.totalGames > 0 ? Math.round((userStats.gamesWon / userStats.totalGames) * 100) : 0;
        
        const currentUserStats: PlayerStats = {
          id: user.id,
          firstName: user.firstName || 'Usuario',
          lastName: user.lastName || 'Actual',
          emailAddress: user.emailAddresses[0]?.emailAddress || '',
          totalGames: userStats.totalGames || 0,
          gamesWon: userStats.gamesWon || 0,
          winRate,
          totalScore: userStats.totalScore || 0,
          bestStreak: userStats.bestStreak || 0,
          averageGuesses: userStats.averageGuesses || 0,
        };

        allPlayers.push(currentUserStats);
      }

      // Si solo hay un usuario (el actual), mostrar mensaje apropiado
      if (allPlayers.length === 0) {
        setPlayers([]);
      } else if (allPlayers.length === 1) {
        // Agregar algunos usuarios de ejemplo para mostrar cómo funcionaría el ranking
        // En una app real, estos vendrían de tu backend/API
        const examplePlayers: PlayerStats[] = [
          {
            id: 'example1',
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            emailAddress: 'carlos.rodriguez@gmail.com',
            totalGames: Math.floor(Math.random() * 50) + 20,
            gamesWon: 0,
            winRate: 0,
            totalScore: Math.floor(Math.random() * 2000) + 500,
            bestStreak: Math.floor(Math.random() * 15) + 5,
            averageGuesses: Math.random() * 2 + 3,
          },
          {
            id: 'example2',
            firstName: 'María',
            lastName: 'Fernández',
            emailAddress: 'maria.fernandez@hotmail.com',
            totalGames: Math.floor(Math.random() * 40) + 15,
            gamesWon: 0,
            winRate: 0,
            totalScore: Math.floor(Math.random() * 1800) + 400,
            bestStreak: Math.floor(Math.random() * 12) + 3,
            averageGuesses: Math.random() * 2 + 3.5,
          },
          {
            id: 'example3',
            firstName: 'Diego',
            lastName: 'González',
            emailAddress: 'diego.gonzalez@outlook.com',
            totalGames: Math.floor(Math.random() * 35) + 10,
            gamesWon: 0,
            winRate: 0,
            totalScore: Math.floor(Math.random() * 1500) + 300,
            bestStreak: Math.floor(Math.random() * 10) + 2,
            averageGuesses: Math.random() * 2 + 4,
          },
          {
            id: 'example4',
            firstName: 'Ana',
            lastName: 'López',
            emailAddress: 'ana.lopez@gmail.com',
            totalGames: Math.floor(Math.random() * 60) + 25,
            gamesWon: 0,
            winRate: 0,
            totalScore: Math.floor(Math.random() * 2200) + 600,
            bestStreak: Math.floor(Math.random() * 18) + 6,
            averageGuesses: Math.random() * 1.5 + 3,
          },
          {
            id: 'example5',
            firstName: 'Martín',
            lastName: 'Pérez',
            emailAddress: 'martin.perez@yahoo.com',
            totalGames: Math.floor(Math.random() * 45) + 18,
            gamesWon: 0,
            winRate: 0,
            totalScore: Math.floor(Math.random() * 1700) + 450,
            bestStreak: Math.floor(Math.random() * 14) + 4,
            averageGuesses: Math.random() * 2 + 3.2,
          },
        ];
        
        // Calcular winRate para ejemplos
        examplePlayers.forEach(player => {
          player.gamesWon = Math.floor(player.totalGames * (0.6 + Math.random() * 0.3));
          player.winRate = Math.round((player.gamesWon / player.totalGames) * 100);
        });

        allPlayers.push(...examplePlayers);
      }

      // Ordenar según el criterio seleccionado
      let sortedPlayers: PlayerStats[];
      switch (sortBy) {
        case 'winRate':
          sortedPlayers = allPlayers.sort((a, b) => b.winRate - a.winRate);
          break;
        case 'streak':
          sortedPlayers = allPlayers.sort((a, b) => b.bestStreak - a.bestStreak);
          break;
        default: // 'score'
          sortedPlayers = allPlayers.sort((a, b) => b.totalScore - a.totalScore);
      }
      
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Reordenar cuando cambie el criterio de ordenamiento
    if (players.length > 0) {
      let sortedPlayers;
      switch (sortBy) {
        case 'winRate':
          sortedPlayers = [...players].sort((a, b) => b.winRate - a.winRate);
          break;
        case 'streak':
          sortedPlayers = [...players].sort((a, b) => b.bestStreak - a.bestStreak);
          break;
        default: // 'score'
          sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
      }
      setPlayers(sortedPlayers);
    }
  }, [sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <View style={[styles.rankContainer, { backgroundColor: '#FFD700' }]}>
            <Ionicons name="trophy" size={22} color="#fff" />
          </View>
        );
      case 2:
        return (
          <View style={[styles.rankContainer, { backgroundColor: '#C0C0C0' }]}>
            <Ionicons name="medal" size={22} color="#fff" />
          </View>
        );
      case 3:
        return (
          <View style={[styles.rankContainer, { backgroundColor: '#CD7F32' }]}>
            <Ionicons name="medal" size={22} color="#fff" />
          </View>
        );
      default:
        return (
          <View style={styles.rankContainer}>
            <ThemedText style={styles.rankNumber}>{position}</ThemedText>
          </View>
        );
    }
  };

  const isCurrentUser = (playerId: string) => user?.id === playerId;

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
          <ThemedText style={styles.title}>Ranking</ThemedText>
        </ThemedView>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Cargando ranking...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f8f9fa" />
      {/* Header minimalista solo con iconos */}
      <ThemedView style={styles.header}>
        {/* Botón de Sign Out - izquierda */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#003366" />
        </TouchableOpacity>
        
        {/* Título centrado */}
        <View style={styles.titleContainer}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <ThemedText style={styles.title}>Ranking</ThemedText>
        </View>
        
        {/* Espaciador para balance */}
        <View style={styles.spacer} />
      </ThemedView>

      {/* Botones de filtro con más separación */}
      <ThemedView style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, sortBy === 'score' && styles.activeFilter]}
          onPress={() => setSortBy('score')}
        >
          <ThemedText style={[styles.filterText, sortBy === 'score' && styles.activeFilterText]}>
            Puntos
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, sortBy === 'winRate' && styles.activeFilter]}
          onPress={() => setSortBy('winRate')}
        >
          <ThemedText style={[styles.filterText, sortBy === 'winRate' && styles.activeFilterText]}>
            Victoria
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, sortBy === 'streak' && styles.activeFilter]}
          onPress={() => setSortBy('streak')}
        >
          <ThemedText style={[styles.filterText, sortBy === 'streak' && styles.activeFilterText]}>
            Racha
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {players.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              No hay estadísticas disponibles
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Juega algunas partidas para aparecer en el ranking
            </ThemedText>
          </ThemedView>
        ) : players.length === 1 && isCurrentUser(players[0].id) ? (
          <ThemedView style={styles.singleUserContainer}>
            <ThemedText style={styles.singleUserTitle}>¡Eres el primero!</ThemedText>
            <ThemedText style={styles.singleUserSubtext}>
              Invita a tus amigos para competir en el ranking
            </ThemedText>
            {players.map((player, index) => (
              <ThemedView 
                key={player.id} 
                style={[styles.playerCard, styles.currentUserCard]}
              >
                <View style={styles.cardHeader}>
                  {getRankIcon(index + 1)}
                  
                  <View style={styles.playerInfo}>
                    <View style={styles.nameRow}>
                      <ThemedText 
                        style={[styles.playerName, styles.currentUserText]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {player.firstName} {player.lastName}
                      </ThemedText>
                      <View style={styles.youBadge}>
                        <ThemedText style={styles.youBadgeText}>TÚ</ThemedText>
                      </View>
                    </View>
                    <ThemedText 
                      style={styles.playerEmail}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {player.emailAddress}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statColumn}>
                    <ThemedText style={styles.statValue}>{player.totalScore}</ThemedText>
                    <ThemedText style={styles.statLabel}>Puntos</ThemedText>
                  </View>
                  <View style={styles.statColumn}>
                    <ThemedText style={styles.statValue}>{player.winRate}%</ThemedText>
                    <ThemedText style={styles.statLabel}>Victoria</ThemedText>
                  </View>
                  <View style={styles.statColumn}>
                    <ThemedText style={styles.statValue}>{player.bestStreak}</ThemedText>
                    <ThemedText style={styles.statLabel}>Racha</ThemedText>
                  </View>
                  <View style={styles.statColumn}>
                    <ThemedText style={styles.statValue}>
                      {player.averageGuesses > 0 ? player.averageGuesses.toFixed(1) : '0'}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Promedio</ThemedText>
                  </View>
                </View>
              </ThemedView>
            ))}
          </ThemedView>
        ) : (
          players.map((player, index) => (
            <ThemedView 
              key={player.id} 
              style={[
                styles.playerCard,
                isCurrentUser(player.id) && styles.currentUserCard
              ]}
            >
              {/* Header con ranking y nombre */}
              <View style={styles.cardHeader}>
                {getRankIcon(index + 1)}
                
                <View style={styles.playerInfo}>
                  <View style={styles.nameRow}>
                    <ThemedText 
                      style={[
                        styles.playerName,
                        isCurrentUser(player.id) && styles.currentUserText
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {player.firstName} {player.lastName}
                    </ThemedText>
                    {isCurrentUser(player.id) && (
                      <View style={styles.youBadge}>
                        <ThemedText style={styles.youBadgeText}>TÚ</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText 
                    style={styles.playerEmail}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {player.emailAddress}
                  </ThemedText>
                </View>
              </View>

              {/* Estadísticas en una fila separada */}
              <View style={styles.statsContainer}>
                <View style={styles.statColumn}>
                  <ThemedText style={styles.statValue}>{player.totalScore}</ThemedText>
                  <ThemedText style={styles.statLabel}>Puntos</ThemedText>
                </View>
                <View style={styles.statColumn}>
                  <ThemedText style={styles.statValue}>{player.winRate}%</ThemedText>
                  <ThemedText style={styles.statLabel}>Victoria</ThemedText>
                </View>
                <View style={styles.statColumn}>
                  <ThemedText style={styles.statValue}>{player.bestStreak}</ThemedText>
                  <ThemedText style={styles.statLabel}>Racha</ThemedText>
                </View>
                <View style={styles.statColumn}>
                  <ThemedText style={styles.statValue}>
                    {player.averageGuesses > 0 ? player.averageGuesses.toFixed(1) : '0'}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Promedio</ThemedText>
                </View>
              </View>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
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
  signOutContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  spacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#003366',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  singleUserContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  singleUserTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#4CAF50',
  },
  singleUserSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  playerCard: {
    padding: 16,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  currentUserCard: {
    backgroundColor: '#e8f4fd',
    borderColor: '#2196f3',
    borderWidth: 2,
    shadowColor: '#2196f3',
    shadowOpacity: 0.2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankContainer: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 22.5,
    backgroundColor: '#f8f9fa',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  playerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
    maxWidth: '75%',
  },
  currentUserText: {
    color: '#1976d2',
  },
  youBadge: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  youBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    flexShrink: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 70,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#003366',
    borderColor: '#003366',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
});

export default LeaderboardScreen;
