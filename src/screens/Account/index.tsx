import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@react-native-google-signin/google-signin';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { usePremiumFeatures } from '../../contexts/PremiumContext';
import { deleteUserAccount } from '../../services/database';
import { historyDB } from '../../services/historyDatabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';

interface AccountScreenProps {
  user?: User;
  handleSignOut?: () => void;
}

export default function AccountScreen({ user, handleSignOut }: AccountScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const premium = usePremiumFeatures();
  
  // Estado temporário para o plano (mockado)
  const [planStatus] = useState<'ativo' | 'inativo'>('inativo');
  
  // Estados para deletar conta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Configuração dos idiomas
  const languages = [
    { code: 'pt-BR' as Language, name: t('portuguese'), flag: '🇧🇷' },
    { code: 'en-US' as Language, name: t('english'), flag: '🇺🇸' },
    { code: 'es-ES' as Language, name: t('spanish'), flag: '🇪🇸' },
  ];

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      Alert.alert(t('error'), 'No user email found');
      return;
    }

    // Verificar se o usuário digitou a confirmação correta
    const expectedConfirmation = language === 'pt-BR' ? 'DELETAR' : language === 'es-ES' ? 'ELIMINAR' : 'DELETE';
    if (deleteConfirmation.trim().toUpperCase() !== expectedConfirmation) {
      Alert.alert(t('error'), t('confirmationRequired'));
      return;
    }

    setIsDeleting(true);

    try {
      // Deletar histórico do usuário
      await historyDB.deleteUserHistory(user.email);
      
      // Deletar conta do usuário e todos os dados associados
      const success = await deleteUserAccount(user.email);
      
      // Remover preferência de idioma do AsyncStorage
      await AsyncStorage.removeItem('userLanguage');
      
      if (success) {
        // Fazer logout do Google
        await GoogleSignin.signOut();
        
        // Fechar modal
        setShowDeleteModal(false);
        setDeleteConfirmation('');
        
        // Mostrar mensagem de sucesso
        Alert.alert(t('success'), t('deleteAccountSuccess'));
        
        // Chamar função de logout para atualizar o estado do app
        if (handleSignOut) {
          handleSignOut();
        }
      } else {
        Alert.alert(t('error'), t('deleteAccountError'));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(t('error'), t('deleteAccountError'));
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>{t('account')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: user?.photo || 'https://via.placeholder.com/80' }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || t('user')}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'email@exemplo.com'}
            </Text>
          </View>
          {handleSignOut && (
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{t('plan')}</Text>
            <View style={[
              styles.planStatusBadge,
              premium.isPremium ? styles.planStatusActive : styles.planStatusInactive
            ]}>
              <Text style={[
                styles.planStatusText,
                premium.isPremium ? styles.planStatusTextActive : styles.planStatusTextInactive
              ]}>
                {premium.isPremium ? 'PRO' : 'FREE'}
              </Text>
            </View>
          </View>
          <Text style={styles.planDescription}>
            {premium.isPremium 
              ? 'Você tem acesso completo a todos os recursos premium.'
              : 'Você pode criar 1 QR Code gratuito. Faça upgrade para acesso completo.'
            }
          </Text>
          
          {/* Botão de Upgrade (apenas se não for premium) */}
          {!premium.isPremium && (
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => premium.showUpgradeModal()}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeButtonGradient}
              >
                <Ionicons name="diamond-outline" size={20} color="#ffffff" />
                <Text style={styles.upgradeButtonText}>
                  {t('upgradeToPro')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Language Card */}
        <View style={styles.languageCard}>
          <Text style={styles.languageTitle}>{t('language')}</Text>
          <View style={styles.languageOptions}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionSelected
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.languageNameSelected
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.languageDisclaimer}>
            {t('translationDisclaimer')}
          </Text>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZoneCard}>
          <Text style={styles.dangerZoneTitle}>⚠️ {t('dangerZone')}</Text>
          <Text style={styles.dangerZoneDescription}>
            {t('deleteAccountDescription')}
          </Text>
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
            <Text style={styles.deleteAccountButtonText}>
              {t('deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmação para deletar conta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>{t('confirmDeleteAccount')}</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteModalWarning}>
              {t('deleteAccountWarning')}
            </Text>

            <Text style={styles.deleteModalItems}>
              {t('deleteAccountItems')}
            </Text>

            <Text style={styles.deleteModalConfirmation}>
              {t('deleteAccountConfirmation')}
            </Text>

            <TextInput
              style={styles.deleteConfirmationInput}
              placeholder={t('typeDeleteToConfirm')}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              autoCapitalize="characters"
            />

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.deleteModalCancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.deleteModalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.deleteModalConfirmButton,
                  isDeleting && styles.deleteModalConfirmButtonDisabled
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Text style={styles.deleteModalConfirmText}>
                  {isDeleting ? t('accountDeletionInProgress') : t('deleteAccount')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}