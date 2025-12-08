interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface GeezSmsResponse {
  status: string;
  message?: string;
  data?: {
    message_id?: string;
  };
}

export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  const username = process.env.GEEZ_SMS_USERNAME;
  const password = process.env.GEEZ_SMS_PASSWORD;
  const senderIdStr = process.env.GEEZ_SMS_SENDER_ID;

  if (!username || !password) {
    console.error('Geez SMS credentials not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const formattedPhone = formatEthiopianPhone(phone);
    
    const senderId = senderIdStr ? parseInt(senderIdStr, 10) : undefined;
    
    const requestBody: any = {
      token: password,
      phone: formattedPhone,
      msg: message,
    };
    
    if (senderId && !isNaN(senderId)) {
      requestBody.sender_id = senderId;
    }
    
    console.log('Sending SMS to Geez API:', { phone: formattedPhone, hasSenderId: !!senderId });
    
    const response = await fetch('https://api.geezsms.com/api/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: GeezSmsResponse = await response.json();

    if (response.ok && data.status === 'success') {
      console.log(`SMS sent successfully to ${formattedPhone}`);
      return { 
        success: true, 
        messageId: data.data?.message_id 
      };
    } else {
      console.error('Geez SMS API error:', data);
      return { 
        success: false, 
        error: data.message || 'Failed to send SMS' 
      };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('251')) {
    cleaned = '251' + cleaned;
  }
  
  return cleaned;
}

export async function sendPaymentNotification(
  type: 'membership' | 'donation',
  amount: number,
  currency: string,
  notificationPhone: string
): Promise<SendSmsResult> {
  const typeLabel = type === 'membership' ? 'Membership' : 'Donation';
  const message = `New ${typeLabel} Payment Received! Amount: ${amount} ${currency}. Fasil Kenema Fan Club.`;
  
  return sendSms(notificationPhone, message);
}

export async function sendPaymentNotificationWithTotal(
  type: 'membership' | 'donation',
  amount: number,
  currency: string,
  notificationPhone: string,
  totalETB: number,
  totalUSD: number
): Promise<SendSmsResult> {
  const typeLabel = type === 'membership' ? 'Membership' : 'Donation';
  const message = `Fasil FC: New ${typeLabel} ${amount} ${currency} received! Total: ${totalETB} ETB, ${totalUSD} USD.`;
  
  return sendSms(notificationPhone, message);
}
