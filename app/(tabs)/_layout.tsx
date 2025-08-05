import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,


        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e0e0e0',
            borderTopWidth: 1,
            height: 90,
            paddingBottom: 30,
          },
          default: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e0e0e0',
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 10,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Juego',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={focused ? 26 : 24} 
              name="game-controller" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={focused ? 26 : 24} 
              name="trophy" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

