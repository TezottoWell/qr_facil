import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import WelcomeScreen from '../screens/Welcome';
import MyQRCodesScreen from '../screens/MyQRCodes';
import NewQRCodeScreen from '../screens/NewQRCode';
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
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyQRCodes') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'NewQRCode') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />;
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          paddingTop: 12,
          paddingBottom: 12,
          height: 75,
          position: 'absolute',
          marginHorizontal: 15,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
        },
        headerStyle: {
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
          color: '#ffffff',
        },
        headerTitleAlign: 'center',
        headerBackground: () => (
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
          }} />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ 
          title: 'Início',
          headerTitle: 'QR Fácil'
        }}
      >
        {(props) => (
          <WelcomeScreen 
            {...props}
            user={user} 
            handleSignOut={handleSignOut}
            handleMyQRCodes={() => props.navigation.navigate('MyQRCodes')}
            handleNewQRCode={() => props.navigation.navigate('NewQRCode')}
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
    </Tab.Navigator>
  );
}