import React from 'react';
import LoginScreen from '../screens/Login';
import BottomTabNavigator from './BottomTabNavigator';
import { User } from '@react-native-google-signin/google-signin';

interface AppNavigatorProps {
  isSignedIn: boolean;
  user: User | null;
  isLoading: boolean;
  handleGoogleSignIn: () => void;
  handleSignOut: () => void;
}

export default function AppNavigator({ 
  isSignedIn, 
  user, 
  isLoading, 
  handleGoogleSignIn, 
  handleSignOut 
}: AppNavigatorProps) {
  // Renderização condicional simples sem Stack Navigator
  if (isSignedIn && user) {
    return (
      <BottomTabNavigator 
        user={user} 
        handleSignOut={handleSignOut} 
      />
    );
  }

  return (
    <LoginScreen 
      isLoading={isLoading} 
      handleGoogleSignIn={handleGoogleSignIn} 
    />
  );
}