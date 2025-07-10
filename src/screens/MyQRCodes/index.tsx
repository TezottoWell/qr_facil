import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Share,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { styles } from './styles';
import { getUserQRCodes, deleteQRCode } from '../../services/database';

interface QRCodeItem {
  id: number;
  title: string;
  content: string;
  qr_type: string;
  background_color: string;
  foreground_color: string;
  logo_enabled: number;
  logo_size: number;
  logo_icon?: string;
  error_correction_level: string;
  created_at: string;
  user_email: string;
}

interface MyQRCodesScreenProps {
  handleBack: () => void;
  userEmail?: string;
}

// Componente QRCode real
const QRCodePreview = ({ item, size = 80 }: { item: QRCodeItem; size?: number }) => (
  <View style={[
    styles.qrCodePreview,
    { 
      width: size, 
      height: size,
      backgroundColor: item.background_color,
      padding: 5,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }
  ]}>
    <QRCode
      value={item.content || 'https://example.com'}
      size={size - 10}
      backgroundColor={item.background_color}
      color={item.foreground_color}
      ecl={item.error_correction_level || 'M'}
    />
    {item.logo_enabled === 1 && (
      <View style={{
        position: 'absolute',
        width: (size - 10) * item.logo_size,
        height: (size - 10) * item.logo_size,
        backgroundColor: item.background_color,
        borderRadius: ((size - 10) * item.logo_size) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: item.background_color,
      }}>
        <Text style={{
          fontSize: ((size - 10) * item.logo_size) * 0.6,
          textAlign: 'center',
        }}>
          {item.logo_icon || '❤️'}
        </Text>
      </View>
    )}
  </View>
);

const QR_TYPE_LABELS: { [key: string]: { label: string; icon: string } } = {
  'text': { label: 'Texto', icon: '📝' },
  'url': { label: 'Link/URL', icon: '🔗' },
  'email': { label: 'Email', icon: '📧' },
  'phone': { label: 'Telefone', icon: '📞' },
  'sms': { label: 'SMS', icon: '💬' },
  'wifi': { label: 'Wi-Fi', icon: '📶' },
  'contact': { label: 'Contato', icon: '👤' },
  'payment': { label: 'Pagamento', icon: '💳' },
};

// Componente QRCode para captura de imagem
const QRCodeForCapture = ({ item, size = 300 }: { item: QRCodeItem; size?: number }) => (
  <View style={{
    width: size,
    height: size,
    backgroundColor: item.background_color,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'relative',
  }}>
    <QRCode
      value={item.content || 'https://example.com'}
      size={size - 40}
      backgroundColor={item.background_color}
      color={item.foreground_color}
      ecl={item.error_correction_level || 'M'}
    />
    {item.logo_enabled === 1 && (
      <View style={{
        position: 'absolute',
        width: (size - 40) * item.logo_size,
        height: (size - 40) * item.logo_size,
        backgroundColor: item.background_color,
        borderRadius: ((size - 40) * item.logo_size) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: item.background_color,
      }}>
        <Text style={{
          fontSize: ((size - 40) * item.logo_size) * 0.6,
          textAlign: 'center',
        }}>
          {item.logo_icon || '❤️'}
        </Text>
      </View>
    )}
  </View>
);

export default function MyQRCodesScreen({ handleBack, userEmail = 'test@example.com' }: MyQRCodesScreenProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCodeItem[]>([]);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    loadQRCodes();
  }, []);

  useEffect(() => {
    filterQRCodes();
  }, [qrCodes, searchQuery]);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const userQRCodes = await getUserQRCodes(userEmail);
      setQrCodes(userQRCodes as QRCodeItem[]);
    } catch (error) {
      console.error('Erro ao carregar QR codes:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus QR codes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQRCodes();
    setRefreshing(false);
  };

  const filterQRCodes = () => {
    if (!searchQuery.trim()) {
      setFilteredQRCodes(qrCodes);
      return;
    }

    const filtered = qrCodes.filter(qr => 
      qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      QR_TYPE_LABELS[qr.qr_type]?.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQRCodes(filtered);
  };

  const handleDeleteQRCode = async (qrCode: QRCodeItem) => {
    try {
      await deleteQRCode(qrCode.id, userEmail);
      setQrCodes(prev => prev.filter(item => item.id !== qrCode.id));
      setShowDeleteModal(false);
      setSelectedQRCode(null);
      Alert.alert('Sucesso', 'QR Code deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar QR code:', error);
      Alert.alert('Erro', 'Não foi possível deletar o QR code');
    }
  };

  const handleShareQRCode = async (qrCode: QRCodeItem) => {
    try {
      if (viewShotRef.current) {
        // Capturar a imagem do QR code
        const imageUri = await viewShotRef.current.capture();
        
        // Verificar se o compartilhamento está disponível
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/png',
            dialogTitle: `Compartilhar QR Code - ${qrCode.title}`,
          });
        } else {
          // Fallback para compartilhamento de texto
          await Share.share({
            message: `${qrCode.title}\n\n${qrCode.content}`,
            title: qrCode.title,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o QR Code');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderQRCodeItem = ({ item }: { item: QRCodeItem }) => {
    const typeInfo = QR_TYPE_LABELS[item.qr_type] || { label: 'Desconhecido', icon: '❓' };
    
    return (
      <TouchableOpacity
        style={styles.qrCodeItem}
        onPress={() => {
          setSelectedQRCode(item);
          setShowDetailModal(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.qrCodeItemContent}>
          <QRCodePreview item={item} size={60} />
          
          <View style={styles.qrCodeItemInfo}>
            <View style={styles.qrCodeHeader}>
              <Text style={styles.qrCodeTitle}>{item.title}</Text>
              <View style={styles.qrCodeType}>
                <Text style={styles.qrCodeTypeIcon}>{typeInfo.icon}</Text>
                <Text style={styles.qrCodeTypeLabel}>{typeInfo.label}</Text>
              </View>
            </View>
            
            <Text style={styles.qrCodeContent}>
              {truncateContent(item.content)}
            </Text>
            
            <Text style={styles.qrCodeDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📱</Text>
      <Text style={styles.emptyStateTitle}>Nenhum QR Code encontrado</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? 'Tente uma busca diferente' : 'Crie seu primeiro QR Code para começar'}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus QR Codes</Text>
        <View style={styles.headerRight}>
          <Text style={styles.qrCodeCount}>{qrCodes.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar QR codes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* QR Codes List */}
      <FlatList
        data={filteredQRCodes}
        renderItem={renderQRCodeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ffffff']}
            tintColor="#ffffff"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedQRCode && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedQRCode.title}</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Text style={styles.modalCloseButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.qrCodeDetailPreview}>
                    <ViewShot
                      ref={viewShotRef}
                      options={{
                        format: 'png',
                        quality: 1.0,
                        result: 'tmpfile',
                      }}
                    >
                      <QRCodeForCapture item={selectedQRCode} size={200} />
                    </ViewShot>
                  </View>

                  <View style={styles.qrCodeDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo:</Text>
                      <View style={styles.detailValue}>
                        <Text style={styles.detailTypeIcon}>
                          {QR_TYPE_LABELS[selectedQRCode.qr_type]?.icon}
                        </Text>
                        <Text style={styles.detailTypeLabel}>
                          {QR_TYPE_LABELS[selectedQRCode.qr_type]?.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Conteúdo:</Text>
                      <Text style={styles.detailContent}>{selectedQRCode.content}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Criado em:</Text>
                      <Text style={styles.detailDate}>{formatDate(selectedQRCode.created_at)}</Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.shareButton]}
                      onPress={() => handleShareQRCode(selectedQRCode)}
                    >
                      <Text style={styles.actionButtonText}>Compartilhar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => {
                        setShowDetailModal(false);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Text style={styles.actionButtonText}>Deletar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Deletar QR Code</Text>
            <Text style={styles.confirmMessage}>
              Tem certeza que deseja deletar "{selectedQRCode?.title}"?
            </Text>
            <Text style={styles.confirmWarning}>Esta ação não pode ser desfeita.</Text>
            
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={() => selectedQRCode && handleDeleteQRCode(selectedQRCode)}
              >
                <Text style={styles.deleteConfirmButtonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}