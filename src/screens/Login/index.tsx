import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { styles } from './styles';

// Componente de gradiente personalizado usando View com backgroundColor
const GradientBackground = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.gradientContainer}>
    <View style={styles.gradientOverlay} />
    {children}
  </View>
);

interface LoginScreenProps {
  isLoading: boolean;
  handleGoogleSignIn: () => void;
}

export default function LoginScreen({ isLoading, handleGoogleSignIn }: LoginScreenProps) {
  return (
    <GradientBackground>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../../../assets/logo.png")} style={styles.logoImg}></Image>
          </View>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        <View style={styles.loginContainer}>
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]} 
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={styles.googleButtonContent}>
              <Image
                source={{
                  uri: 'https://developers.google.com/identity/images/g-logo.png',
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                {isLoading ? 'Entrando...' : 'Continuar com Google'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.disclaimer}>
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Novo no QR Fácil?{' '}
          <Text style={styles.footerLink}>Saiba mais</Text>
        </Text>
      </View>
    </GradientBackground>
  );
}
