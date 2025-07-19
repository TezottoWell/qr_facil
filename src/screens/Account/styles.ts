import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  
  headerLeft: {
    width: 40,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  
  headerRight: {
    width: 40,
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150, // Espaço maior para o bottom menu
  },

  // Profile Card
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },

  profileImageContainer: {
    marginRight: 15,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // Plan Card
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  planTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },

  planStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },

  planStatusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },

  planStatusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },

  planStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  planStatusTextActive: {
    color: '#22c55e',
  },

  planStatusTextInactive: {
    color: '#ef4444',
  },

  planDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 15,
  },

  // Upgrade Button
  upgradeButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },

  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },

  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  testButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Language Card
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },

  languageTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 15,
  },

  languageOptions: {
    gap: 10,
  },

  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  languageOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },

  languageName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    flex: 1,
  },

  languageNameSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },

  languageDisclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },

  // Danger Zone
  dangerZoneCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 20,
  },

  dangerZoneTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 10,
  },

  dangerZoneDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 15,
  },

  deleteAccountButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 1)',
  },

  deleteAccountButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  deleteModalContent: {
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  deleteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  deleteModalTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    flex: 1,
  },

  deleteModalWarning: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 15,
    lineHeight: 22,
  },

  deleteModalItems: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    lineHeight: 20,
  },

  deleteModalConfirmation: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 10,
  },

  deleteConfirmationInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },

  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  deleteModalCancelText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  deleteModalConfirmButtonDisabled: {
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
  },

  deleteModalConfirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});