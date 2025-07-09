import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
  User,
} from '@react-native-google-signin/google-signin';

// Configuração do Google Sign-In
GoogleSignin.configure({
  webClientId: '582095097887-2epk6v4iu0l250jsrjrtkvkjltl2l09j.apps.googleusercontent.com', 
  iosClientId: '582095097887-mfhhm812r98v4b53qqr3invlnj4cqgu6.apps.googleusercontent.com',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkSignedInUser();
  }, []);

  const checkSignedInUser = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const userInfo = await GoogleSignin.signInSilently();
        if (isSuccessResponse(userInfo)) {
          setUser(userInfo.data.user);
          setIsSignedIn(true);
        }
      }
    } catch (error) {
      console.log('Erro ao verificar usuário logado:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse(response)) {
        console.log('Login successful:', response.data);
        setUser(response.data.user);
        setIsSignedIn(true);
        Alert.alert('Sucesso', `Bem-vindo, ${response.data.user.name}!`);
      } else {
        console.log('Login cancelled by user');
        Alert.alert('Cancelado', 'Login cancelado pelo usuário');
      }
    } catch (error) {
      console.log('Erro no login:', error);
      
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert('Cancelado', 'Login cancelado pelo usuário');
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert('Aguarde', 'Login em progresso...');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Erro', 'Google Play Services não disponível');
            break;
          default:
            Alert.alert('Erro', 'Algo deu errado durante o login');
            break;
        }
      } else {
        Alert.alert('Erro', 'Algo deu errado durante o login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUser(null);
      setIsSignedIn(false);
      Alert.alert('Sucesso', 'Logout realizado com sucesso!');
    } catch (error) {
      console.log('Erro no logout:', error);
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  };

  // Componente de gradiente personalizado usando View com backgroundColor
  const GradientBackground = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.gradientContainer}>
      <View style={styles.gradientOverlay} />
      {children}
    </View>
  );

  // Se o usuário está logado, mostra tela de boas-vindas
  if (isSignedIn && user) {
    return (
      <GradientBackground>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>QR Fácil</Text>
            </View>
            <Text style={styles.subtitle}>Bem-vindo!</Text>
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

  // Tela de login
  return (
    <GradientBackground>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>QR Fácil</Text>
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

const styles = StyleSheet.create({
  // Gradiente personalizado
  gradientContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Para web
  },
  
  // Estilos existentes
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 320,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Estilos para a tela de usuário logado
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});