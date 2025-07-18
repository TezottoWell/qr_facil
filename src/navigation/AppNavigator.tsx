import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Login';
import BottomTabNavigator from './BottomTabNavigator';
import { User } from '@react-native-google-signin/google-signin';

const Stack = createStackNavigator();

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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn && user ? (
        <Stack.Screen name="MainTabs">
          {(props) => (
            <BottomTabNavigator 
              {...props}
              user={user} 
              handleSignOut={handleSignOut} 
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen 
              {...props}
              isLoading={isLoading} 
              handleGoogleSignIn={handleGoogleSignIn} 
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}