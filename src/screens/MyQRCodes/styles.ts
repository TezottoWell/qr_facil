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
  
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
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
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  qrCodeCount: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 12,
    paddingRight: 10,
  },
  
  searchIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  
  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  qrCodeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  
  qrCodeItemContent: {
    flexDirection: 'row',
    padding: 15,
  },
  
  qrCodeItemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  
  qrCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  qrCodeTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  
  qrCodeType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  qrCodeTypeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  
  qrCodeTypeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  qrCodeContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  qrCodeDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  
  // QR Code Preview
  qrCodePreview: {
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  qrCodePreviewText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  qrCodeLogo: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  qrCodeLogoText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptyStateSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  
  modalCloseButton: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
    padding: 5,
  },
  
  modalBody: {
    padding: 20,
  },
  
  qrCodeDetailPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  qrCodeDetails: {
    gap: 15,
  },
  
  detailRow: {
    gap: 5,
  },
  
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  detailTypeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  
  detailTypeLabel: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  
  detailContent: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  
  detailDate: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  shareButton: {
    backgroundColor: '#667eea',
  },
  
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Confirmation Modal
  confirmModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  
  confirmMessage: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  confirmWarning: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  
  deleteConfirmButton: {
    backgroundColor: '#ef4444',
  },
  
  cancelButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  
  deleteConfirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  // Overlay de bloqueio
  lockedOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  lockedContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  lockedDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },

  upgradeButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },

  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Aviso do Plano Free
  freeWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },

  freeWarningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  freeWarningText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});