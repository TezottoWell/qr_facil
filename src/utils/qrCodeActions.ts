import { Alert, Linking, Clipboard } from 'react-native';
import * as Contacts from 'expo-contacts';
import { QRCodeData } from './qrCodeProcessor';
import { historyDB } from '../services/historyDatabase';

export async function executeQRCodeAction(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  try {
    switch (qrData.type) {
      case 'url':
        await handleURL(qrData, userEmail, fromHistory, t);
        break;
      case 'contact':
        await handleContact(qrData, userEmail, fromHistory, t);
        break;
      case 'wifi':
        await handleWiFi(qrData, userEmail, fromHistory, t);
        break;
      case 'sms':
        await handleSMS(qrData, userEmail, fromHistory, t);
        break;
      case 'phone':
        await handlePhone(qrData, userEmail, fromHistory, t);
        break;
      case 'email':
        await handleEmail(qrData, userEmail, fromHistory, t);
        break;
      case 'geo':
        await handleGeo(qrData, userEmail, fromHistory, t);
        break;
      case 'text':
        await handleText(qrData, userEmail, fromHistory, t);
        break;
      default:
        await handleText(qrData, userEmail, fromHistory, t);
    }
  } catch (error) {
    console.error('Erro ao executar ação do QR code:', error);
    Alert.alert(t?.('error') || 'Erro', t?.('error') || 'Não foi possível executar a ação solicitada.');
  }
}

async function saveToHistory(qrData: QRCodeData, userEmail?: string, t?: (key: string) => string) {
  try {
    await historyDB.saveQRCode(qrData, userEmail);
    Alert.alert(t?.('success') || 'Sucesso', 'Dados salvos no histórico!', [{ text: t?.('ok') || 'OK' }]);
  } catch (error) {
    console.error('Erro ao salvar no histórico:', error);
    Alert.alert(t?.('error') || 'Erro', 'Não foi possível salvar no histórico.', [{ text: t?.('ok') || 'OK' }]);
  }
}

async function handleURL(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const { url } = qrData.parsedData;
  
  Alert.alert(
    `${t?.('url') || 'URL'} ${t?.('scanResult') || 'Detectada'}`,
    qrData.description,
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('save') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyText') || 'Copiar', onPress: () => Clipboard.setString(url) },
      { 
        text: t?.('openLink') || 'Abrir Link', 
        onPress: () => Linking.openURL(url).catch(err => 
          Alert.alert(t?.('error') || 'Erro', 'Não foi possível abrir o link.')
        )
      }
    ]
  );
}

async function handleContact(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const contact = qrData.parsedData;
  
  Alert.alert(
    `${t?.('contact') || 'Contato'} ${t?.('detected') || 'detectado'}`,    
    `${t?.('name') || 'Nome'}: ${contact.name || contact.firstName + ' ' + contact.lastName || t?.('notInformed') || 'Não informado'}\n` +
    `${t?.('phones') || 'Telefones'}: ${contact.phones ? contact.phones.join(', ') : t?.('notInformed') || 'Não informado'}\n` +
    `${t?.('emails') || 'Emails'}: ${contact.emails ? contact.emails.join(', ') : t?.('notInformed') || 'Não informado'}` +
    (contact.organization ? `\n${t?.('company') || 'Empresa'}: ${contact.organization}` : ''),
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('saveData') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyText') || 'Copiar Dados', onPress: () => Clipboard.setString(qrData.rawData) },
      { text: t?.('saveContact') || 'Salvar Contato', onPress: () => saveContact(contact, t) }
    ]
  );
}

async function saveContact(contactData: any, t?: (key: string) => string) {
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
      t?.('success') || 'Sucesso',
      'Contato salvo com sucesso!',
      [{ text: t?.('ok') || 'OK' }]
    );
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    Alert.alert(
      t?.('error') || 'Erro',
      'Não foi possível salvar o contato. Tente novamente.',
      [{ text: t?.('ok') || 'OK' }]
    );
  }
}

async function handleWiFi(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const wifi = qrData.parsedData;
  
  Alert.alert(
    `${t?.('wifi') || 'WiFi'} ${t?.('detected') || 'detectado'}`,
    `${t?.('network') || 'Rede'}: ${wifi.ssid}\n` +
    `${t?.('securityType') || 'Tipo'}: ${wifi.type}\n` +
    `${t?.('password') || 'Senha'}: ${wifi.password ? '●●●●●●●●' : t?.('noPassword') || 'Sem senha'}`,
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('saveData') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyPassword') || 'Copiar Senha', onPress: () => Clipboard.setString(wifi.password || '') },
      { 
        text: t?.('openSettings') || 'Abrir Configurações', 
        onPress: () => Linking.openURL('App-Prefs:WIFI').catch(() => 
          Alert.alert('Info', 'Abra as configurações de WiFi manualmente para conectar.')
        )
      }
    ]
  );
}

async function handleSMS(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const sms = qrData.parsedData;
  const smsUrl = `sms:${sms.number}${sms.body ? `?body=${encodeURIComponent(sms.body)}` : ''}`;
  
  Alert.alert(
    `${t?.('sms') || 'SMS'} ${t?.('detected') || 'detectado'}`,
    `${t?.('number') || 'Número'}: ${sms.number}\n${sms.body ? `${t?.('message') || 'Mensagem'}: ${sms.body}` : ''}`,
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('saveData') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyNumber') || 'Copiar Número', onPress: () => Clipboard.setString(sms.number) },
      { 
        text: t?.('sendSMS') || 'Enviar SMS', 
        onPress: () => Linking.openURL(smsUrl).catch(() => 
          Alert.alert(t?.('error') || 'Erro', 'Não foi possível abrir o app de SMS.')
        )
      }
    ]
  );
}

async function handlePhone(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const phone = qrData.parsedData;
  
  Alert.alert(
    `${t?.('phone') || 'Telefone'} ${t?.('detected') || 'detectado'}`,
    `${t?.('number') || 'Número'}: ${phone.number}`,
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('saveData') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyNumber') || 'Copiar Número', onPress: () => Clipboard.setString(phone.number) },
      { 
        text: t?.('call') || 'Ligar', 
        onPress: () => Linking.openURL(`tel:${phone.number}`).catch(() => 
          Alert.alert(t?.('error') || 'Erro', 'Não foi possível fazer a ligação.')
        )
      }
    ]
  );
}

async function handleEmail(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const email = qrData.parsedData;
  const emailUrl = `mailto:${email.address}${email.subject ? `?subject=${encodeURIComponent(email.subject)}` : ''}${email.body ? `&body=${encodeURIComponent(email.body)}` : ''}`;
  
  Alert.alert(
    `${t?.('email') || 'Email'} ${t?.('detected') || 'detectado'}`,
    `${t?.('email') || 'Email'}: ${email.address}\n${email.subject ? `${t?.('subject') || 'Assunto'}: ${email.subject}\n` : ''}${email.body ? `${t?.('message') || 'Mensagem'}: ${email.body}` : ''}`,
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('saveData') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyEmail') || 'Copiar Email', onPress: () => Clipboard.setString(email.address) },
      { 
        text: t?.('sendEmail') || 'Enviar Email', 
        onPress: () => Linking.openURL(emailUrl).catch(() => 
          Alert.alert(t?.('error') || 'Erro', 'Não foi possível abrir o app de email.')
        )
      }
    ]
  );
}

async function handleGeo(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const geo = qrData.parsedData;
  const mapsUrl = `https://maps.google.com/maps?q=${geo.latitude},${geo.longitude}`;
  
  Alert.alert(
    'Localização detectada',
    `${t?.('latitude') || 'Latitude'}: ${geo.latitude}\n${t?.('longitude') || 'Longitude'}: ${geo.longitude}`,
    [
      { text: t?.('cancel') || 'Cancelar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('saveData') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyCoordinates') || 'Copiar Coordenadas', onPress: () => Clipboard.setString(`${geo.latitude},${geo.longitude}`) },
      { 
        text: t?.('openMap') || 'Abrir no Mapa', 
        onPress: () => Linking.openURL(mapsUrl).catch(() => 
          Alert.alert(t?.('error') || 'Erro', 'Não foi possível abrir o mapa.')
        )
      }
    ]
  );
}

async function handleText(qrData: QRCodeData, userEmail?: string, fromHistory: boolean = false, t?: (key: string) => string) {
  const text = qrData.parsedData.text || qrData.rawData;
  
  Alert.alert(
    `${t?.('text') || 'Texto'} ${t?.('scanResult') || 'Detectado'}`,
    text,
    [
      { text: t?.('close') || 'Fechar', style: 'cancel' },
      ...(fromHistory ? [] : [{ text: t?.('save') || 'Salvar Dados', onPress: () => saveToHistory(qrData, userEmail, t) }]),
      { text: t?.('copyText') || 'Copiar Texto', onPress: () => Clipboard.setString(text) }
    ]
  );
}