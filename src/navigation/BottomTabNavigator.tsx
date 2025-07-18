import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import QRScannerScreen from '../screens/QRScanner';
import MyQRCodesScreen from '../screens/MyQRCodes';
import NewQRCodeScreen from '../screens/NewQRCode';
import HistoryScreen from '../screens/History';
import { User } from '@react-native-google-signin/google-signin';

const Tab = createBottomTabNavigator();

interface BottomTabNavigatorProps {
  user: User;
  handleSignOut: () => void;
}

export default function BottomTabNavigator({ user, handleSignOut }: BottomTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'MyQRCodes') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'NewQRCode') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />;
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          borderTopWidth: 0,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          height: Platform.OS === 'ios' ? 88 : 75,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 10,
          overflow: 'hidden',
          position:'absolute'
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ 
          title: 'Scanner',
          headerTitle: 'QR Scanner'
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
          title: 'Meus QR Codes',
          headerTitle: 'Meus QR Codes'
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
        name="NewQRCode" 
        options={{ 
          title: 'Novo QR Code',
          headerTitle: 'Criar QR Code'
        }}
      >
        {(props) => (
          <NewQRCodeScreen 
            {...props}
            userEmail={user?.email}
          />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="History" 
        options={{ 
          title: 'Histórico',
          headerTitle: 'Meu Histórico'
        }}
      >
        {(props) => (
          <HistoryScreen 
            {...props}
            userEmail={user?.email}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}