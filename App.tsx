import React, { useState, useEffect } from 'react';
import {
  Alert,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
  User,
} from '@react-native-google-signin/google-signin';
import LoginScreen from './src/screens/Login';
import WelcomeScreen from './src/screens/Welcome';
import { initDatabase, insertUser } from './src/services/database';

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
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Inicializar banco de dados
      await initDatabase();
      setIsDatabaseReady(true);
      
      // Verificar se há usuário logado
      await checkSignedInUser();
    } catch (error) {
      console.error('Erro ao inicializar aplicativo:', error);
    }
  };

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
    if (!isDatabaseReady) {
      Alert.alert('Erro', 'Banco de dados não está pronto. Tente novamente em alguns segundos.');
      return;
    }

    try {
      setIsLoading(true);
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse(response)) {
        console.log('Login successful:', response.data);
        setUser(response.data.user);
        setIsSignedIn(true);

        // Inserir usuário no banco de dados usando a nova API
        try {
          await insertUser({
            email: response.data.user.email,
            name: response.data.user.name || '',
            photo: response.data.user.photo || ''
          });
        } catch (dbError) {
          console.error('Erro ao salvar usuário no banco:', dbError);
          // Não bloqueamos o login mesmo se houver erro no banco
        }

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

  if (isSignedIn && user) {
    return <WelcomeScreen user={user} handleSignOut={handleSignOut} />;
  }

  return <LoginScreen isLoading={isLoading} handleGoogleSignIn={handleGoogleSignIn} />;
}