import { useAuth } from '@clerk/clerk-expo';
import React from 'react';
import { Button } from 'react-native';

export default function SignOutButton() {
  const { signOut } = useAuth();
  return <Button title="Cerrar Sesión" onPress={() => signOut()} />;
}
