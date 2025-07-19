import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { styles } from './styles';
import db from '../../services/database';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t } = useLanguage();
  
  const handleLogin = () => {
    handleGoogleSignIn();
  };

  return (
    <GradientBackground>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../../../assets/logo.png")} style={styles.logoImg}></Image>
          </View>
          <Text style={styles.subtitle}>{t('loginToContinue')}</Text>
        </View>

        <View style={styles.loginContainer}>
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]} 
            onPress={handleLogin}
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
                {isLoading ? t('loggingIn') : t('continueWithGoogle')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.disclaimer}>
            {t('termsDisclaimer')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('newToApp')}{' '}
          <Text style={styles.footerLink}>{t('learnMore')}</Text>
        </Text>
      </View>
    </GradientBackground>
  );
}
