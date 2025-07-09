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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfoHeader}>
          <Image
            source={{ uri: user.photo || 'https://via.placeholder.com/40' }}
            style={styles.avatarHeader}
          />
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Bem-vindo</Text>
            <Text style={styles.userNameHeader}>{user.name || 'Usuário'}!</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.subtitle}>Sua conta está conectada</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>
    </GradientBackground>
  );
}