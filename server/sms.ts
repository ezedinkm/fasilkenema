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
  const token = process.env.GEEZ_SMS_PASSWORD;
  const shortcodeId = process.env.GEEZ_SMS_SENDER_ID;

  if (!token) {
    console.error('Geez SMS token not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const formattedPhone = formatEthiopianPhone(phone);
    
    const formData = new FormData();
    formData.append('token', token);
    formData.append('phone', formattedPhone);
    formData.append('msg', message);
    
    if (shortcodeId) {
      formData.append('shortcode_id', shortcodeId);
    }
    
    console.log('Sending SMS to Geez API:', { phone: formattedPhone, hasShortcode: !!shortcodeId });
    
    const response = await fetch('https://api.geezsms.com/api/v1/sms/send', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    console.log('Geez SMS API response:', data);

    if (response.ok && (data.status === 'success' || data.message_status === 'success' || !data.error)) {
      console.log(`SMS sent successfully to ${formattedPhone}`);
      return { 
        success: true, 
        messageId: data.api_log_id?.toString() || data.log
      };
    } else {
      console.error('Geez SMS API error:', data);
      return { 
        success: false, 
        error: data.msg || data.message || 'Failed to send SMS' 
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
