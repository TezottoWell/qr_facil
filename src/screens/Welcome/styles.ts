import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Gradiente personalizado
  gradientContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Para web
  },
  
  // Header styles
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 70, // Para status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomLeftRadius:35,
    borderBottomRightRadius:35,
    },
  
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  avatarHeader: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
  },
  
  welcomeTextContainer: {
    flex: 1,
  },
  
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  
  userNameHeader: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  signOutIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    transform: [{ rotate: '180deg' }], // Para fazer uma seta apontando para fora
  },
  
  // Conteúdo principal
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  mainContent: {
    alignItems: 'center',
  },
  
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  button: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});