import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { useState } from 'react';

GoogleSignin.configure({
  webClientId: '582095097887-2epk6v4iu0l250jsrjrtkvkjltl2l09j.apps.googleusercontent.com', 
  iosClientId: '582095097887-mfhhm812r98v4b53qqr3invlnj4cqgu6.apps.googleusercontent.com',
});

export default function App() {
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setUserInfo(response.data);
      } else {
        console.log('Login cancelado pelo usuário');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Login em andamento');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Serviços do Google não disponíveis');
            break;
          default:
            Alert.alert('Erro ao fazer login');
            break;
        }
      } else {
        Alert.alert('Erro ao fazer login');
      }
    }
  }
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <GoogleSigninButton
        style={{ width: 212, height: 42 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      /> 
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
