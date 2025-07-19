import React, { useState } from 'react';
import { View, Platform, Modal, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRScannerScreen from '../screens/QRScanner';
import MyQRCodesScreen from '../screens/MyQRCodes';
import NewQRCodeScreen from '../screens/NewQRCode';
import HistoryScreen from '../screens/History';
import AccountScreen from '../screens/Account';
import { User } from '@react-native-google-signin/google-signin';
import { useLanguage } from '../contexts/LanguageContext';

const Tab = createBottomTabNavigator();

interface BottomTabNavigatorProps {
  user: User;
  handleSignOut: () => void;
}

// Componente customizado para o botão "+"
const AddButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      top: -25, // Posicionar mais alto para ultrapassar a borda
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#667eea',
      borderWidth: 4,
      borderColor: '#FFF', // Borda branca para destacar
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 12,
      zIndex: 10, // Garantir que fique por cima
    }}
  >
    <Ionicons name="add" size={32} color="#ffffff" />
  </TouchableOpacity>
);

export default function BottomTabNavigator({ user, handleSignOut }: BottomTabNavigatorProps) {
  const { t } = useLanguage();
  const [showNewQRCodeModal, setShowNewQRCodeModal] = useState(false);
  
  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={showNewQRCodeModal}
        onRequestClose={() => setShowNewQRCodeModal(false)}
      >
        <NewQRCodeScreen 
          userEmail={user?.email}
          onClose={() => setShowNewQRCodeModal(false)}
        />
      </Modal>
    <Tab.Navigator
      initialRouteName="MyQRCodes"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'AddNew') {
            return <AddButton onPress={() => setShowNewQRCodeModal(true)} />;
          } else if (route.name === 'Home') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'MyQRCodes') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />;
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          backgroundColor: 'transparent', // Deixar transparente para o gradiente aparecer
          borderTopWidth: 0,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingHorizontal: 0, // Reduzir espaçamento horizontal
          height: Platform.OS === 'ios' ? 100 : 80,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 10,
          overflow: 'visible',
          position:'absolute'
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#4852A2', '#202020']} // Gradiente do roxo para quase preto
            style={{
              flex: 1,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          />
        ),
        tabBarItemStyle: {
          paddingHorizontal: -5, // Reduzir padding dos itens individuais
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 5,
        },
        headerShown: false,
      })}
    >

      <Tab.Screen 
        name="Home" 
        options={{ 
          title: t('scanner'),
          headerTitle: t('qrScanner')
        }}
      >
        {(props) => (
          <QRScannerScreen 
            {...props}
            userEmail={user?.email}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="MyQRCodes" 
        options={{ 
          title: t('myQRCodes'),
          headerTitle: t('myQRCodes')
        }}
      >
        {(props) => (
          <MyQRCodesScreen 
            {...props}
            userEmail={user?.email}
          />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="AddNew" 
        options={{ 
          title: '',
          tabBarLabel: () => null, // Remove o label
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Previne navegação
            setShowNewQRCodeModal(true);
          },
        }}
      >
        {() => <View />} 
      </Tab.Screen>

      <Tab.Screen 
        name="History" 
        options={{ 
          title: t('history'),
          headerTitle: t('myHistory')
        }}
      >
        {(props) => (
          <HistoryScreen 
            {...props}
            userEmail={user?.email}
          />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="Account" 
        options={{ 
          title: t('account'),
          headerTitle: t('account')
        }}
      >
        {(props) => (
          <AccountScreen 
            {...props}
            user={user}
            handleSignOut={handleSignOut}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
    </>
  );
}