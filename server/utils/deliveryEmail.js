import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send delivery code to customer
 * 
 * @param {string} orderId - Order ID
 * @param {string} deliveryCode - Delivery code
 * @param {string} customerEmail - Customer email
 * @param {string} customerName - Customer name
 * @param {string} orderNumber - Order number (e.g., FL-ABC123)
 * @param {string} language - Language code (KA or EN)
 */
export async function sendDeliveryCodeEmail(
  orderId,
  deliveryCode,
  customerEmail,
  customerName,
  orderNumber,
  language = 'KA'
) {
  const formattedCode = formatCodeForDisplay(deliveryCode, ' ');
  
  const translations = {
    KA: {
      subject: `თქვენი შეკვეთის მიწოდების კოდი - ${orderNumber}`,
      greeting: `გამარჯობა ${customerName || 'ძვირფასო კლიენტო'},`,
      message: `თქვენი შეკვეთა ${orderNumber} დადასტურებულია და მზადყოფნაშია.`,
      codeLabel: 'მიწოდების კოდი:',
      instructions: 'გთხოვთ, შეინახოთ ეს კოდი. მწარმოებელს დაგჭირდებათ ეს კოდი მიწოდების დასადასტურებლად.',
      warning: '⚠️ ეს კოდი გამოიყენება მხოლოდ ერთხელ. გთხოვთ, არ გაუზიაროთ ეს კოდი სხვებს.',
      footer: 'მადლობა, რომ აირჩიეთ Makers Hub!'
    },
    EN: {
      subject: `Your Order Delivery Code - ${orderNumber}`,
      greeting: `Hello ${customerName || 'Valued Customer'},`,
      message: `Your order ${orderNumber} has been confirmed and is being prepared.`,
      codeLabel: 'Delivery Code:',
      instructions: 'Please save this code. The maker will need this code to confirm delivery.',
      warning: '⚠️ This code can only be used once. Please do not share this code with others.',
      footer: 'Thank you for choosing Makers Hub!'
    }
  };
  
  const t = translations[language] || translations.EN;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box { 
          background: #f4f4f4; 
          border: 2px dashed #333; 
          padding: 20px; 
          text-align: center; 
          margin: 20px 0;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          font-family: 'Courier New', monospace;
        }
        .warning { 
          background: #fff3cd; 
          border-left: 4px solid #ffc107; 
          padding: 10px; 
          margin: 20px 0; 
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${t.subject}</h2>
        <p>${t.greeting}</p>
        <p>${t.message}</p>
        
        <p><strong>${t.codeLabel}</strong></p>
        <div class="code-box">
          ${formattedCode}
        </div>
        
        <p>${t.instructions}</p>
        
        <div class="warning">
          <strong>${t.warning}</strong>
        </div>
        
        <div class="footer">
          <p>${t.footer}</p>
          <p>Makers Hub</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('[Email] Email service not configured. Delivery code not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    await transporter.sendMail({
      from: `"Makers Hub" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: t.subject,
      html: html,
    });
    
    console.log(`[Email] Delivery code sent to ${customerEmail} for order ${orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send delivery code:', error);
    throw error;
  }
}

/**
 * Format code for display (add spacing)
 */
function formatCodeForDisplay(code, separator = ' ') {
  if (!code) return '';
  const normalized = code.trim().toUpperCase();
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)}${separator}${normalized.slice(3)}`;
  }
  return normalized;
}

