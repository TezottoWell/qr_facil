import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface NewQRCodeScreenProps {
  handleBack: () => void;
}

export default function NewQRCodeScreen({ handleBack }: NewQRCodeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerar Novo QR Code</Text>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}