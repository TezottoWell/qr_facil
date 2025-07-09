import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { styles } from './styles';
import { User } from '@react-native-google-signin/google-signin';

// Componente de gradiente personalizado usando View com backgroundColor
const GradientBackground = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.gradientContainer}>
    <View style={styles.gradientOverlay} />
    {children}
  </View>
);

interface WelcomeScreenProps {
  user: User;
  handleSignOut: () => void;
}

export default function WelcomeScreen({ user, handleSignOut }: WelcomeScreenProps) {
  return (
    <GradientBackground>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Bem-vindo {user.name ? user.name : ""}!</Text>
        </View>

        <View style={styles.userInfo}>
          <Image
            source={{ uri: user.photo || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}
