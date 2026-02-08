interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  const apiKey = process.env.AFRO_SMS_API_KEY;

  if (!apiKey) {
    console.error('Afro SMS API key not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const formattedPhone = formatEthiopianPhone(phone);
    
    const payload = {
      to: formattedPhone,
      message: message,
    };
    
    console.log('Sending SMS via Afro Message API:', { phone: formattedPhone });
    
    const response = await fetch('https://api.afromessage.com/api/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log('Afro SMS API response:', data);

    if (response.ok && (data.acknowledge === 'success' || data.response?.status === 'sent')) {
      console.log(`SMS sent successfully to ${formattedPhone}`);
      return { 
        success: true, 
        messageId: data.response?.id?.toString() || data.id?.toString()
      };
    } else {
      console.error('Afro SMS API error:', data);
      return { 
        success: false, 
        error: data.response?.errors?.[0] || data.message || 'Failed to send SMS'
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

export async function sendOtp(phone: string): Promise<{ success: boolean; code?: string; error?: string }> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const message = `Your Mechal FC verification code is: ${code}. Valid for 5 minutes.`;
  
  const result = await sendSms(phone, message);
  
  if (result.success) {
    return { success: true, code };
  }
  return { success: false, error: result.error };
}

function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('251')) {
    cleaned = '251' + cleaned;
  }
  
  return '+' + cleaned;
}

export async function sendPaymentNotification(
  type: 'membership' | 'donation',
  amount: number,
  currency: string,
  notificationPhone: string
): Promise<SendSmsResult> {
  const typeLabel = type === 'membership' ? 'Membership' : 'Donation';
  const message = `New ${typeLabel} Payment Received! Amount: ${amount} ${currency}. Mechal FC Fan Club.`;
  
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
  const message = `Mechal FC: New ${typeLabel} ${amount} ${currency} received! Total: ${totalETB} ETB, ${totalUSD} USD.`;
  
  return sendSms(notificationPhone, message);
}
