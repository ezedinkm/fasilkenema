import { Resend } from 'resend';

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

let connectionSettings: any;

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Resend authentication token not available');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email || 'noreply@fasilkenema.com'
  };
}

async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlContent: string
): Promise<SendEmailResult> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const toAddresses = Array.isArray(to) ? to : [to];
    
    console.log('Sending email via Resend:', { to: toAddresses, subject });
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: toAddresses,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

export async function sendPaymentNotificationEmail(
  emails: string[],
  type: 'membership' | 'donation',
  amount: number,
  currency: string,
  totalETB: number,
  totalUSD: number
): Promise<SendEmailResult> {
  const typeLabel = type === 'membership' ? 'Membership' : 'Donation';
  
  const subject = `New ${typeLabel} Payment - Fasil Kenema Fan Club`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #C41E3A 0%, #8B0000 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .amount { font-size: 32px; font-weight: bold; color: #C41E3A; }
        .total-section { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Fasil Kenema Fan Club</h1>
          <p>The Emperors</p>
        </div>
        <div class="content">
          <h2>New ${typeLabel} Payment Received!</h2>
          <p>A new payment has been successfully processed:</p>
          <p class="amount">${amount} ${currency}</p>
          <p><strong>Payment Type:</strong> ${typeLabel}</p>
          
          <div class="total-section">
            <h3>Current Revenue Totals</h3>
            <p><strong>Total ETB:</strong> ${totalETB.toLocaleString()} ETB</p>
            <p><strong>Total USD:</strong> ${totalUSD.toLocaleString()} USD</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from the Fasil Kenema Fan Club platform.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  if (emails.length === 0) {
    return { success: false, error: 'No email addresses configured' };
  }
  
  return sendEmail(emails, subject, htmlContent);
}
