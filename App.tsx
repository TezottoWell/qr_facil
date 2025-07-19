import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
  User,
} from '@react-native-google-signin/google-signin';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, insertUser } from './src/services/database';
import { historyDB } from './src/services/historyDatabase';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';

// Configuração do Google Sign-In
GoogleSignin.configure({
  webClientId: '582095097887-2epk6v4iu0l250jsrjrtkvkjltl2l09j.apps.googleusercontent.com', 
  iosClientId: '582095097887-mfhhm812r98v4b53qqr3invlnj4cqgu6.apps.googleusercontent.com',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

// Componente interno que tem acesso ao contexto de tradução
function AppContent() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Inicializar banco de dados principal
      await initDatabase();
      
      // Inicializar banco de dados do histórico
      await historyDB.initDatabase();
      
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
      Alert.alert(t('error'), t('databaseNotReady'));
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

        Alert.alert(t('success'), `${t('welcome')}, ${response.data.user.name}!`);
      } else {
        console.log('Login cancelled by user');
        Alert.alert(t('cancelled'), t('loginCancelled'));
      }
    } catch (error) {
      console.log('Erro no login:', error);
      
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert(t('cancelled'), t('loginCancelled'));
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert(t('pleaseWait'), t('loginInProgress'));
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(t('error'), t('playServicesNotAvailable'));
            break;
          default:
            Alert.alert(t('error'), t('loginError'));
            break;
        }
      } else {
        Alert.alert(t('error'), t('loginError'));
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
      Alert.alert(t('success'), t('logoutSuccess'));
    } catch (error) {
      console.log('Erro no logout:', error);
      Alert.alert(t('error'), t('logoutError'));
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <AppNavigator 
          isSignedIn={isSignedIn}
          user={user}
          isLoading={isLoading}
          handleGoogleSignIn={handleGoogleSignIn}
          handleSignOut={handleSignOut}
        />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}