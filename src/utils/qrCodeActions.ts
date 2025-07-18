import { Alert, Linking, Clipboard } from 'react-native';
import * as Contacts from 'expo-contacts';
import { QRCodeData } from './qrCodeProcessor';
import { historyDB } from '../services/historyDatabase';

export async function executeQRCodeAction(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  try {
    switch (qrData.type) {
      case 'url':
        await handleURL(qrData, userEmail, fromHistory);
        break;
      case 'contact':
        await handleContact(qrData, userEmail, fromHistory);
        break;
      case 'wifi':
        await handleWiFi(qrData, userEmail, fromHistory);
        break;
      case 'sms':
        await handleSMS(qrData, userEmail, fromHistory);
        break;
      case 'phone':
        await handlePhone(qrData, userEmail, fromHistory);
        break;
      case 'email':
        await handleEmail(qrData, userEmail, fromHistory);
        break;
      case 'geo':
        await handleGeo(qrData, userEmail, fromHistory);
        break;
      case 'text':
        await handleText(qrData, userEmail, fromHistory);
        break;
      default:
        await handleText(qrData, userEmail, fromHistory);
    }
  } catch (error) {
    console.error('Erro ao executar ação do QR code:', error);
    Alert.alert('Erro', 'Não foi possível executar a ação solicitada.');
  }
}

async function saveToHistory(qrData: QRCodeData, userEmail?: string) {
  try {
    await historyDB.saveQRCode(qrData, userEmail);
    Alert.alert('Sucesso', 'Dados salvos no histórico!');
  } catch (error) {
    console.error('Erro ao salvar no histórico:', error);
    Alert.alert('Erro', 'Não foi possível salvar no histórico.');
  }
}

async function handleURL(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const { url } = qrData.parsedData;
  
  Alert.alert(
    'URL Detectada',
    qrData.description,
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar', onPress: () => Clipboard.setString(url) },
      { 
        text: 'Abrir Link', 
        onPress: () => Linking.openURL(url).catch(err => 
          Alert.alert('Erro', 'Não foi possível abrir o link.')
        )
      }
    ]
  );
}

async function handleContact(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const contact = qrData.parsedData;
  
  Alert.alert(
    'Contato Detectado',
    `Nome: ${contact.name || contact.firstName + ' ' + contact.lastName || 'Não informado'}\n` +
    `Telefones: ${contact.phones ? contact.phones.join(', ') : 'Não informado'}\n` +
    `Emails: ${contact.emails ? contact.emails.join(', ') : 'Não informado'}` +
    (contact.organization ? `\nEmpresa: ${contact.organization}` : ''),
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Dados', onPress: () => Clipboard.setString(qrData.rawData) },
      { text: 'Salvar Contato', onPress: () => saveContact(contact) }
    ]
  );
}

async function saveContact(contactData: any) {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'É necessário permitir acesso aos contatos para salvar este contato.',
        [{ text: 'OK' }]
      );
      return;
    }

    const contact: any = {
      contactType: Contacts.ContactTypes.Person,
      name: contactData.name || `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
      firstName: contactData.firstName || '',
      lastName: contactData.lastName || '',
    };

    if (contactData.phones && contactData.phones.length > 0) {
      contact.phoneNumbers = contactData.phones.map((phone: string) => ({
        number: phone,
        isPrimary: true,
        label: 'mobile',
      }));
    }

    if (contactData.emails && contactData.emails.length > 0) {
      contact.emails = contactData.emails.map((email: string) => ({
        email: email,
        isPrimary: true,
        label: 'home',
      }));
    }

    if (contactData.organization) {
      contact.company = contactData.organization;
    }

    if (contactData.title) {
      contact.jobTitle = contactData.title;
    }

    const contactId = await Contacts.addContactAsync(contact);
    
    Alert.alert(
      'Sucesso',
      'Contato salvo com sucesso!',
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    Alert.alert(
      'Erro',
      'Não foi possível salvar o contato. Tente novamente.',
      [{ text: 'OK' }]
    );
  }
}

async function handleWiFi(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const wifi = qrData.parsedData;
  
  Alert.alert(
    'WiFi Detectado',
    `Rede: ${wifi.ssid}\n` +
    `Tipo: ${wifi.type}\n` +
    `Senha: ${wifi.password ? '●●●●●●●●' : 'Sem senha'}`,
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Senha', onPress: () => Clipboard.setString(wifi.password || '') },
      { 
        text: 'Abrir Configurações', 
        onPress: () => Linking.openURL('App-Prefs:WIFI').catch(() => 
          Alert.alert('Info', 'Abra as configurações de WiFi manualmente para conectar.')
        )
      }
    ]
  );
}

async function handleSMS(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const sms = qrData.parsedData;
  const smsUrl = `sms:${sms.number}${sms.body ? `?body=${encodeURIComponent(sms.body)}` : ''}`;
  
  Alert.alert(
    'SMS Detectado',
    `Número: ${sms.number}\n${sms.body ? `Mensagem: ${sms.body}` : ''}`,
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Número', onPress: () => Clipboard.setString(sms.number) },
      { 
        text: 'Enviar SMS', 
        onPress: () => Linking.openURL(smsUrl).catch(() => 
          Alert.alert('Erro', 'Não foi possível abrir o app de SMS.')
        )
      }
    ]
  );
}

async function handlePhone(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const phone = qrData.parsedData;
  
  Alert.alert(
    'Telefone Detectado',
    `Número: ${phone.number}`,
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Número', onPress: () => Clipboard.setString(phone.number) },
      { 
        text: 'Ligar', 
        onPress: () => Linking.openURL(`tel:${phone.number}`).catch(() => 
          Alert.alert('Erro', 'Não foi possível fazer a ligação.')
        )
      }
    ]
  );
}

async function handleEmail(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const email = qrData.parsedData;
  const emailUrl = `mailto:${email.address}${email.subject ? `?subject=${encodeURIComponent(email.subject)}` : ''}${email.body ? `&body=${encodeURIComponent(email.body)}` : ''}`;
  
  Alert.alert(
    'Email Detectado',
    `Email: ${email.address}\n${email.subject ? `Assunto: ${email.subject}\n` : ''}${email.body ? `Mensagem: ${email.body}` : ''}`,
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Email', onPress: () => Clipboard.setString(email.address) },
      { 
        text: 'Enviar Email', 
        onPress: () => Linking.openURL(emailUrl).catch(() => 
          Alert.alert('Erro', 'Não foi possível abrir o app de email.')
        )
      }
    ]
  );
}

async function handleGeo(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const geo = qrData.parsedData;
  const mapsUrl = `https://maps.google.com/maps?q=${geo.latitude},${geo.longitude}`;
  
  Alert.alert(
    'Localização Detectada',
    `Latitude: ${geo.latitude}\nLongitude: ${geo.longitude}`,
    [
      { text: 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Coordenadas', onPress: () => Clipboard.setString(`${geo.latitude},${geo.longitude}`) },
      { 
        text: 'Abrir no Mapa', 
        onPress: () => Linking.openURL(mapsUrl).catch(() => 
          Alert.alert('Erro', 'Não foi possível abrir o mapa.')
        )
      }
    ]
  );
}

async function handleText(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false) {
  const text = qrData.parsedData.text || qrData.rawData;
  
  Alert.alert(
    'Texto Detectado',
    text,
    [
      { text: 'Fechar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail) }]),
      { text: 'Copiar Texto', onPress: () => Clipboard.setString(text) }
    ]
  );
}