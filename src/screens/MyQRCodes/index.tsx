import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface MyQRCodesScreenProps {
  handleBack: () => void;
}

export default function MyQRCodesScreen({ handleBack }: MyQRCodesScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus QR Codes</Text>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}