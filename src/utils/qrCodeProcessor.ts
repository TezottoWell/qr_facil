export interface QRCodeData {
  type: 'url' | 'contact' | 'wifi' | 'sms' | 'phone' | 'email' | 'text' | 'geo';
  rawData: string;
  parsedData: any;
  actionText: string;
  description: string;
}

export function processQRCode(data: string): QRCodeData {
  const trimmedData = data.trim();

  // URL (HTTP/HTTPS)
  if (trimmedData.match(/^https?:\/\//i)) {
    return {
      type: 'url',
      rawData: data,
      parsedData: { url: trimmedData },
      actionText: 'Abrir Link',
      description: `URL: ${trimmedData}`
    };
  }

  // vCard (Contato)
  if (trimmedData.startsWith('BEGIN:VCARD') || trimmedData.includes('VCARD')) {
    const contact = parseVCard(trimmedData);
    return {
      type: 'contact',
      rawData: data,
      parsedData: contact,
      actionText: 'Salvar Contato',
      description: `Contato: ${contact.name || 'Nome não informado'}`
    };
  }

  // WiFi
  if (trimmedData.startsWith('WIFI:')) {
    const wifi = parseWiFi(trimmedData);
    return {
      type: 'wifi',
      rawData: data,
      parsedData: wifi,
      actionText: 'Conectar WiFi',
      description: `WiFi: ${wifi.ssid || 'Rede não identificada'}`
    };
  }

  // SMS
  if (trimmedData.startsWith('sms:') || trimmedData.startsWith('SMS:')) {
    const sms = parseSMS(trimmedData);
    return {
      type: 'sms',
      rawData: data,
      parsedData: sms,
      actionText: 'Enviar SMS',
      description: `SMS para: ${sms.number}`
    };
  }

  // Telefone
  if (trimmedData.startsWith('tel:') || trimmedData.startsWith('TEL:')) {
    const phone = parsePhone(trimmedData);
    return {
      type: 'phone',
      rawData: data,
      parsedData: phone,
      actionText: 'Ligar',
      description: `Telefone: ${phone.number}`
    };
  }

  // Email
  if (trimmedData.startsWith('mailto:') || trimmedData.includes('@') && !trimmedData.includes(' ')) {
    const email = parseEmail(trimmedData);
    return {
      type: 'email',
      rawData: data,
      parsedData: email,
      actionText: 'Enviar Email',
      description: `Email: ${email.address}`
    };
  }

  // Localização/GPS
  if (trimmedData.startsWith('geo:') || trimmedData.match(/^-?\d+\.\d+,-?\d+\.\d+/)) {
    const geo = parseGeo(trimmedData);
    return {
      type: 'geo',
      rawData: data,
      parsedData: geo,
      actionText: 'Abrir no Mapa',
      description: `Localização: ${geo.latitude}, ${geo.longitude}`
    };
  }

  // Texto simples
  return {
    type: 'text',
    rawData: data,
    parsedData: { text: trimmedData },
    actionText: 'Copiar Texto',
    description: `Texto: ${trimmedData.substring(0, 50)}${trimmedData.length > 50 ? '...' : ''}`
  };
}

function parseVCard(data: string) {
  const contact: any = {};
  
  const lines = data.split('\n').map(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('FN:')) {
      contact.name = line.substring(3);
    } else if (line.startsWith('N:')) {
      const parts = line.substring(2).split(';');
      contact.lastName = parts[0] || '';
      contact.firstName = parts[1] || '';
    } else if (line.startsWith('TEL:') || line.includes('TEL;')) {
      if (!contact.phones) contact.phones = [];
      const phone = line.replace(/^TEL[^:]*:/, '');
      contact.phones.push(phone);
    } else if (line.startsWith('EMAIL:') || line.includes('EMAIL;')) {
      if (!contact.emails) contact.emails = [];
      const email = line.replace(/^EMAIL[^:]*:/, '');
      contact.emails.push(email);
    } else if (line.startsWith('ORG:')) {
      contact.organization = line.substring(4);
    } else if (line.startsWith('TITLE:')) {
      contact.title = line.substring(6);
    } else if (line.startsWith('URL:')) {
      contact.url = line.substring(4);
    }
  }
  
  return contact;
}

function parseWiFi(data: string) {
  const wifi: any = {};
  
  // Formato: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
  const match = data.match(/WIFI:T:([^;]*);S:([^;]*);P:([^;]*);H:([^;]*)/i);
  
  if (match) {
    wifi.type = match[1]; // WPA, WEP, nopass
    wifi.ssid = match[2];
    wifi.password = match[3];
    wifi.hidden = match[4] === 'true';
  }
  
  return wifi;
}

function parseSMS(data: string) {
  const sms: any = {};
  
  if (data.startsWith('sms:') || data.startsWith('SMS:')) {
    const parts = data.substring(4).split('?');
    sms.number = parts[0];
    
    if (parts[1]) {
      const params = new URLSearchParams(parts[1]);
      sms.body = params.get('body') || '';
    }
  }
  
  return sms;
}

function parsePhone(data: string) {
  const phone: any = {};
  
  if (data.startsWith('tel:') || data.startsWith('TEL:')) {
    phone.number = data.substring(4);
  }
  
  return phone;
}

function parseEmail(data: string) {
  const email: any = {};
  
  if (data.startsWith('mailto:')) {
    const parts = data.substring(7).split('?');
    email.address = parts[0];
    
    if (parts[1]) {
      const params = new URLSearchParams(parts[1]);
      email.subject = params.get('subject') || '';
      email.body = params.get('body') || '';
    }
  } else {
    email.address = data;
  }
  
  return email;
}

function parseGeo(data: string) {
  const geo: any = {};
  
  if (data.startsWith('geo:')) {
    const coords = data.substring(4).split(',');
    geo.latitude = parseFloat(coords[0]);
    geo.longitude = parseFloat(coords[1]);
  } else {
    // Formato simples: lat,lng
    const coords = data.split(',');
    geo.latitude = parseFloat(coords[0]);
    geo.longitude = parseFloat(coords[1]);
  }
  
  return geo;
}