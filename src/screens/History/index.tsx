import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { historyDB, QRCodeHistoryItem } from '../../services/historyDatabase';
import { processQRCode } from '../../utils/qrCodeProcessor';
import { executeQRCodeAction } from '../../utils/qrCodeActions';
import { styles } from './styles';
import { useLanguage } from '../../contexts/LanguageContext';

interface HistoryScreenProps {
  userEmail?: string;
}

export default function HistoryScreen({ userEmail }: HistoryScreenProps) {
  const { t } = useLanguage();
  const [historyItems, setHistoryItems] = useState<QRCodeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const items = await historyDB.getHistory(userEmail);
      setHistoryItems(items);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      Alert.alert(t('error'), 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [userEmail])
  );

  const handleItemPress = (item: QRCodeHistoryItem) => {
    // Recriar o objeto QRCodeData a partir dos dados salvos
    const qrData = {
      type: item.type as any,
      rawData: item.rawData,
      parsedData: JSON.parse(item.parsedData),
      description: item.description,
      actionText: item.actionText
    };

    // Executar a ação original (sem opção de salvar novamente)
    executeQRCodeAction(qrData, userEmail, true, t);
  };

  const handleDeleteItem = (item: QRCodeHistoryItem) => {
    Alert.alert(
      t('delete'),
      t('deleteItemMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: async () => {
            if (item.id) {
              const success = await historyDB.deleteHistoryItem(item.id);
              if (success) {
                await loadHistory();
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o item.');
              }
            }
          }
        }
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      t('clearHistory'),
      t('clearHistoryMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('confirm'), 
          style: 'destructive',
          onPress: async () => {
            const success = await historyDB.clearHistory(userEmail);
            if (success) {
              await loadHistory();
            } else {
              Alert.alert('Erro', 'Não foi possível limpar o histórico.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'url': 'link',
      'contact': 'person',
      'wifi': 'wifi',
      'sms': 'chatbubble',
      'phone': 'call',
      'email': 'mail',
      'geo': 'location',
      'text': 'document-text'
    };
    return icons[type] || 'qr-code';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'url': '#007AFF',
      'contact': '#34C759',
      'wifi': '#FF9500',
      'sms': '#AF52DE',
      'phone': '#FF3B30',
      'email': '#5AC8FA',
      'geo': '#FF2D92',
      'text': '#8E8E93'
    };
    return colors[type] || '#00ff88';
  };

  const getTypeDisplayName = (type: string): string => {
    const typeNames: Record<string, string> = {
      'url': t('url'),
      'contact': t('contact'),
      'wifi': t('wifi'),
      'sms': t('sms'),
      'phone': t('phone'),
      'email': t('email'),
      'geo': 'Localização',
      'text': t('text')
    };
    
    return typeNames[type] || 'QR Code';
  };

  const getTranslatedActionText = (type: string): string => {
    const actionTexts: Record<string, string> = {
      'url': t('openLink'),
      'contact': t('saveContact'),
      'wifi': t('connectWifi'),
      'sms': t('sendSMS'),
      'phone': t('call'),
      'email': t('sendEmail'),
      'geo': t('openMap'),
      'text': t('copyText')
    };
    
    return actionTexts[type] || t('copyText');
  };

  const renderHistoryItem = ({ item }: { item: QRCodeHistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.typeContainer}>
          <Ionicons 
            name={getTypeIcon(item.type) as any} 
            size={24} 
            color={getTypeColor(item.type)} 
          />
          <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {getTypeDisplayName(item.type)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.itemFooter}>
        <Text style={styles.timestamp}>
          {formatDate(item.timestamp)}
        </Text>
        <Text style={styles.actionText}>
          {getTranslatedActionText(item.type)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>{t('myHistory')}</Text>
        {historyItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : historyItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-text-outline" size={80} color="rgba(255, 255, 255, 0.3)" />
            </View>
            <Text style={styles.emptyTitle}>{t('noHistory')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('startScanning')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={historyItems}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id?.toString() || ''}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
                colors={['#ffffff']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  );
}

