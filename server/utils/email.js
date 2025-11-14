import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { emailTranslations } from './emailTranslations.js';

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
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail App Password (not regular password!)
    },
  });
};

/**
 * Send contact form email
 * @param {string} fromEmail - Email of the person submitting the form
 * @param {string} fromName - Name of the person submitting the form
 * @param {string} subject - Subject of the message
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Result of email sending
 */
export const sendContactEmail = async (fromEmail, fromName, subject, message) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  // Email to you (the business owner)
  const mailOptions = {
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    replyTo: fromEmail, // So you can reply directly
    to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER, // Where to send contact form submissions
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">New Contact Form Submission</h2>
        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #2d5016; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This email was sent from the Makers Hub contact form.
        </p>
      </div>
    `,
    text: `
New Contact Form Submission

From: ${fromName} (${fromEmail})
Subject: ${subject}

Message:
${message}
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

/**
 * Send auto-reply confirmation email to the user
 * @param {string} toEmail - Email of the person who submitted the form
 * @param {string} toName - Name of the person who submitted the form
 * @returns {Promise<Object>} - Result of email sending
 */
export const sendAutoReply = async (toEmail, toName) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    // Don't throw error for auto-reply, just log
    console.warn('Email service not configured, skipping auto-reply');
    return { success: false, skipped: true };
  }

  const mailOptions = {
    from: `"Makers Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Thank you for contacting Makers Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Thank you for reaching out!</h2>
        <p>Hi ${toName},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>Our team typically responds within 24-48 hours during business days.</p>
        <p style="margin-top: 30px;">Best regards,<br><strong>Makers Hub Team</strong></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated confirmation email. Please do not reply to this message.
        </p>
      </div>
    `,
    text: `
Thank you for reaching out!

Hi ${toName},

We've received your message and will get back to you as soon as possible.

Our team typically responds within 24-48 hours during business days.

Best regards,
Makers Hub Team
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Auto-reply sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Don't fail the whole request if auto-reply fails
    console.error('Error sending auto-reply (non-critical):', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email to customer
 * @param {Object} params - Email parameters
 * @param {string} params.to - Customer email address
 * @param {Object} params.order - Order object
 * @param {Object} params.user - User object
 * @param {string} params.language - Language code (KA or EN), defaults to KA
 * @returns {Promise<Object>} - Result of email sending
 */
export const sendOrderConfirmationEmail = async ({ to, order, user, language = 'KA' }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('Email service not configured, skipping order confirmation email');
    return { success: false, skipped: true };
  }

  const lang = language === 'EN' ? 'EN' : 'KA';
  const t = emailTranslations[lang].orderConfirmation;

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const itemsHtml = order.items?.map((item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; vertical-align: top;">
        ${item.name || 'N/A'}
        ${item.material ? `<br><small style="color: #666;">${t.material} ${item.material}</small>` : ''}
        ${item.color ? `<br><small style="color: #666;">${t.color} ${item.color}</small>` : ''}
        ${item.notes ? `<br><small style="color: #666;">${t.notes} ${item.notes}</small>` : ''}
      </td>
      <td style="padding: 12px; text-align: center; vertical-align: top;">${item.quantity || 0}</td>
      <td style="padding: 12px; text-align: right; vertical-align: top;">${formatCurrency(item.unitPrice, order.currency)}</td>
      <td style="padding: 12px; text-align: right; vertical-align: top;">${formatCurrency(item.lineTotal, order.currency)}</td>
    </tr>
  `).join('') || '';

  const shippingAddress = order.shippingAddress;
  const addressHtml = shippingAddress ? `
    <p style="margin: 5px 0;">
      ${shippingAddress.fullName || ''}<br>
      ${shippingAddress.company ? `${shippingAddress.company}<br>` : ''}
      ${shippingAddress.line1 || ''}<br>
      ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
      ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}<br>
      ${shippingAddress.country || ''}<br>
      ${shippingAddress.phone ? `Phone: ${shippingAddress.phone}` : ''}
    </p>
  ` : `<p>${t.noAddress}</p>`;

  const userName = user?.displayName || user?.name || 'Customer';
  const mailOptions = {
    from: `"Makers Hub" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: t.subject.replace('{orderId}', order.orderId || 'N/A'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">${t.subject.replace('{orderId}', order.orderId || 'N/A')}</h2>
        <p>${t.greeting.replace('{name}', userName)}</p>
        <p>${t.thankYou}</p>
        
        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5016; margin-top: 0;">${t.orderDetails}</h3>
          <p><strong>${t.orderId}</strong> ${order.orderId || 'N/A'}</p>
          <p><strong>${t.orderDate}</strong> ${formatDate(order.createdAt)}</p>
          <p><strong>${t.status}</strong> ${order.status || 'N/A'}</p>
          ${order.paymentDueBy ? `<p><strong>${t.paymentDueBy}</strong> ${formatDate(order.paymentDueBy)}</p>` : ''}
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #2d5016;">${t.orderItems}</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
              <tr style="background: #f8faf9; border-bottom: 2px solid #2d5016;">
                <th style="padding: 12px; text-align: left;">${t.item}</th>
                <th style="padding: 12px; text-align: center;">${t.qty}</th>
                <th style="padding: 12px; text-align: right;">${t.unitPrice}</th>
                <th style="padding: 12px; text-align: right;">${t.total}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="text-align: right;">
            <p style="margin: 5px 0;"><strong>${t.subtotal}</strong> ${formatCurrency(order.subtotal, order.currency)}</p>
            ${order.shippingFee > 0 ? `<p style="margin: 5px 0;"><strong>${t.shipping}</strong> ${formatCurrency(order.shippingFee, order.currency)}</p>` : ''}
            <p style="margin: 10px 0; font-size: 18px; color: #2d5016;"><strong>${t.totalAmount} ${formatCurrency(order.total, order.currency)}</strong></p>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #2d5016;">${t.shippingAddress}</h3>
          ${addressHtml}
        </div>

        ${order.customerNotes ? `
          <div style="background: #ffffff; padding: 15px; border-left: 4px solid #2d5016; margin: 20px 0;">
            <h4 style="color: #2d5016; margin-top: 0;">${t.yourNotes}</h4>
            <p style="white-space: pre-wrap; margin: 0;">${order.customerNotes}</p>
          </div>
        ` : ''}

        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5016; margin-top: 0;">${t.whatsNext}</h3>
          ${order.status === 'awaiting_payment' ? `
            <p>${t.awaitingPayment}</p>
            ${order.paymentDueBy ? `<p><strong>${t.paymentDue.replace('{date}', formatDate(order.paymentDueBy))}</strong></p>` : ''}
          ` : ''}
          <p>${t.updates}</p>
        </div>

        <p style="margin-top: 30px;">${t.regards}<br><strong>${t.team}</strong></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          ${t.automated}
        </p>
      </div>
    `,
    text: `
${t.subject.replace('{orderId}', order.orderId || 'N/A')}

${t.greeting.replace('{name}', userName)}

${t.thankYou}

${t.orderDetails}:
${t.orderId} ${order.orderId || 'N/A'}
${t.orderDate} ${formatDate(order.createdAt)}
${t.status} ${order.status || 'N/A'}
${order.paymentDueBy ? `${t.paymentDueBy} ${formatDate(order.paymentDueBy)}` : ''}

${t.orderItems}:
${order.items?.map((item) => 
  `- ${item.name || 'N/A'} (${t.qty}: ${item.quantity || 0}) - ${formatCurrency(item.lineTotal, order.currency)}`
).join('\n') || 'No items'}

${t.subtotal} ${formatCurrency(order.subtotal, order.currency)}
${order.shippingFee > 0 ? `${t.shipping} ${formatCurrency(order.shippingFee, order.currency)}` : ''}
${t.totalAmount} ${formatCurrency(order.total, order.currency)}

${t.shippingAddress}:
${shippingAddress ? `
${shippingAddress.fullName || ''}
${shippingAddress.company || ''}
${shippingAddress.line1 || ''}
${shippingAddress.line2 || ''}
${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}
${shippingAddress.country || ''}
${shippingAddress.phone ? `Phone: ${shippingAddress.phone}` : ''}
` : t.noAddress}

${order.customerNotes ? `${t.yourNotes}:\n${order.customerNotes}` : ''}

${t.whatsNext}?
${order.status === 'awaiting_payment' ? `
${t.awaitingPayment}
${order.paymentDueBy ? `${t.paymentDue.replace('{date}', formatDate(order.paymentDueBy))}` : ''}
` : ''}
${t.updates}

${t.regards}
${t.team}
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send new order notification email to admin
 * @param {Object} params - Email parameters
 * @param {Object} params.order - Order object
 * @param {Object} params.user - User object
 * @param {string} params.language - Language code (KA or EN), defaults to EN for admin emails
 * @returns {Promise<Object>} - Result of email sending
 */
export const sendNewOrderNotificationEmail = async ({ order, user, language = 'EN' }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('Email service not configured, skipping admin order notification');
    return { success: false, skipped: true };
  }

  // Collect all admin/power user emails to notify
  const adminEmails = [];
  
  // Add main admin email if configured
  const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  if (adminEmail) {
    adminEmails.push(adminEmail);
  }
  
  // Add power user email
  const powerUserEmail = 'l.kantaria1999@gmail.com';
  if (powerUserEmail && !adminEmails.includes(powerUserEmail)) {
    adminEmails.push(powerUserEmail);
  }
  
  if (adminEmails.length === 0) {
    console.warn('No admin emails configured, skipping order notification');
    return { success: false, skipped: true };
  }

  const lang = language === 'KA' ? 'KA' : 'EN';
  const t = emailTranslations[lang].adminNotification;

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const itemsHtml = order.items?.map((item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; vertical-align: top;">
        ${item.name || 'N/A'}
        ${item.material ? `<br><small style="color: #666;">${t.material} ${item.material}</small>` : ''}
        ${item.color ? `<br><small style="color: #666;">${t.color} ${item.color}</small>` : ''}
        ${item.notes ? `<br><small style="color: #666;">${t.notes} ${item.notes}</small>` : ''}
      </td>
      <td style="padding: 12px; text-align: center; vertical-align: top;">${item.quantity || 0}</td>
      <td style="padding: 12px; text-align: right; vertical-align: top;">${formatCurrency(item.unitPrice, order.currency)}</td>
      <td style="padding: 12px; text-align: right; vertical-align: top;">${formatCurrency(item.lineTotal, order.currency)}</td>
    </tr>
  `).join('') || '';

  const shippingAddress = order.shippingAddress;
  const addressHtml = shippingAddress ? `
    <p style="margin: 5px 0;">
      ${shippingAddress.fullName || ''}<br>
      ${shippingAddress.company ? `${shippingAddress.company}<br>` : ''}
      ${shippingAddress.line1 || ''}<br>
      ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
      ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}<br>
      ${shippingAddress.country || ''}<br>
      ${shippingAddress.phone ? `Phone: ${shippingAddress.phone}` : ''}
    </p>
  ` : `<p>${t.noAddress}</p>`;

  const mailOptions = {
    from: `"Makers Hub Orders" <${process.env.EMAIL_USER}>`,
    to: adminEmails.join(', '), // Send to all admin/power user emails
    subject: t.subject.replace('{orderId}', order.orderId || 'N/A'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">${t.title}</h2>
        <p>${t.description}</p>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">${t.actionRequired}</h3>
          <p style="margin: 0; color: #856404;"><strong>${t.status}</strong> ${order.status || 'awaiting_payment'}</p>
          ${order.status === 'awaiting_payment' ? `<p style="margin: 5px 0 0 0; color: #856404;">${t.awaitingPaymentNote}</p>` : ''}
        </div>

        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5016; margin-top: 0;">${t.orderDetails}</h3>
          <p><strong>${t.orderId}</strong> ${order.orderId || 'N/A'}</p>
          <p><strong>${t.orderDate}</strong> ${formatDate(order.createdAt)}</p>
          <p><strong>${t.status}</strong> ${order.status || 'N/A'}</p>
          <p><strong>${t.paymentMethod}</strong> ${order.paymentMethod || 'N/A'}</p>
          ${order.paymentDueBy ? `<p><strong>Payment Due By:</strong> ${formatDate(order.paymentDueBy)}</p>` : ''}
          <p><strong>${t.total}</strong> <span style="font-size: 18px; color: #2d5016; font-weight: bold;">${formatCurrency(order.total, order.currency)}</span></p>
        </div>

        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5016; margin-top: 0;">${t.customerInformation}</h3>
          <p><strong>${t.name}</strong> ${user?.displayName || user?.name || 'N/A'}</p>
          <p><strong>${t.email}</strong> ${user?.email || 'N/A'}</p>
          <p><strong>${t.userId}</strong> ${order.userId || 'N/A'}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #2d5016;">${t.orderItems}</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
              <tr style="background: #f8faf9; border-bottom: 2px solid #2d5016;">
                <th style="padding: 12px; text-align: left;">${t.item}</th>
                <th style="padding: 12px; text-align: center;">${t.qty}</th>
                <th style="padding: 12px; text-align: right;">${t.unitPrice}</th>
                <th style="padding: 12px; text-align: right;">${t.total}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="text-align: right;">
            <p style="margin: 5px 0;"><strong>${t.subtotal}</strong> ${formatCurrency(order.subtotal, order.currency)}</p>
            ${order.shippingFee > 0 ? `<p style="margin: 5px 0;"><strong>${t.shipping}</strong> ${formatCurrency(order.shippingFee, order.currency)}</p>` : ''}
            <p style="margin: 10px 0; font-size: 18px; color: #2d5016;"><strong>${t.total} ${formatCurrency(order.total, order.currency)}</strong></p>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #2d5016;">${t.shippingAddress}</h3>
          ${addressHtml}
        </div>

        ${order.customerNotes ? `
          <div style="background: #ffffff; padding: 15px; border-left: 4px solid #2d5016; margin: 20px 0;">
            <h4 style="color: #2d5016; margin-top: 0;">${t.customerNotes}</h4>
            <p style="white-space: pre-wrap; margin: 0;">${order.customerNotes}</p>
          </div>
        ` : ''}

        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #004085;"><strong>${t.nextSteps}</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px; color: #004085;">
            ${order.status === 'awaiting_payment' ? `<li>${t.waitPayment}</li>` : ''}
            <li>${t.review}</li>
            <li>${t.updateStatus}</li>
            <li>${t.processOrder}</li>
          </ul>
        </div>
      </div>
    `,
    text: `
New Order Received

A new order has been placed and requires your attention.

⚠️ Action Required
Status: ${order.status || 'awaiting_payment'}
${order.status === 'awaiting_payment' ? 'This order is awaiting payment confirmation.' : ''}

Order Details:
Order ID: ${order.orderId || 'N/A'}
Order Date: ${formatDate(order.createdAt)}
Status: ${order.status || 'N/A'}
Payment Method: ${order.paymentMethod || 'N/A'}
${order.paymentDueBy ? `Payment Due By: ${formatDate(order.paymentDueBy)}` : ''}
Total: ${formatCurrency(order.total, order.currency)}

Customer Information:
Name: ${user?.displayName || user?.name || 'N/A'}
Email: ${user?.email || 'N/A'}
User ID: ${order.userId || 'N/A'}

Order Items:
${order.items?.map((item) => 
  `- ${item.name || 'N/A'} (Qty: ${item.quantity || 0}) - ${formatCurrency(item.lineTotal, order.currency)}`
).join('\n') || 'No items'}

Subtotal: ${formatCurrency(order.subtotal, order.currency)}
${order.shippingFee > 0 ? `Shipping: ${formatCurrency(order.shippingFee, order.currency)}` : ''}
Total: ${formatCurrency(order.total, order.currency)}

Shipping Address:
${shippingAddress ? `
${shippingAddress.fullName || ''}
${shippingAddress.company || ''}
${shippingAddress.line1 || ''}
${shippingAddress.line2 || ''}
${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}
${shippingAddress.country || ''}
${shippingAddress.phone ? `Phone: ${shippingAddress.phone}` : ''}
` : 'No shipping address provided'}

${order.customerNotes ? `Customer Notes:\n${order.customerNotes}` : ''}

Next Steps:
${order.status === 'awaiting_payment' ? '- Wait for payment confirmation' : ''}
- Review order details and customer information
- Update order status in the admin panel as needed
- Process the order once payment is confirmed
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin order notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin order notification email:', error);
    throw error;
  }
};

/**
 * Send order status update email to customer
 * @param {Object} params - Email parameters
 * @param {string} params.to - Customer email address
 * @param {Object} params.order - Order object
 * @param {string} params.oldStatus - Previous order status
 * @param {string} params.newStatus - New order status
 * @param {string} params.note - Optional note about the status change
 * @param {string} params.language - Language code (KA or EN), defaults to KA
 * @returns {Promise<Object>} - Result of email sending
 */
export const sendOrderStatusUpdateEmail = async ({ to, order, oldStatus, newStatus, note, language = 'KA' }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('Email service not configured, skipping order status update email');
    return { success: false, skipped: true };
  }

  const lang = language === 'EN' ? 'EN' : 'KA';
  const t = emailTranslations[lang].orderStatusUpdate;

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const getStatusMessage = (status) => {
    const statusMessages = {
      'awaiting_payment': {
        title: t.paymentPending.title,
        message: t.paymentPending.message,
        color: '#ffc107',
      },
      'payment_received': {
        title: t.paymentReceived.title,
        message: t.paymentReceived.message,
        color: '#28a745',
      },
      'processing': {
        title: t.processing.title,
        message: t.processing.message,
        color: '#17a2b8',
      },
      'fulfilled': {
        title: t.fulfilled.title,
        message: t.fulfilled.message,
        color: '#28a745',
      },
      'cancelled': {
        title: t.cancelled.title,
        message: t.cancelled.message,
        color: '#dc3545',
      },
    };
    return statusMessages[status] || {
      title: t.update,
      message: t.update,
      color: '#6c757d',
    };
  };

  const statusInfo = getStatusMessage(newStatus);

  const mailOptions = {
    from: `"Makers Hub" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: t.subject.replace('{orderId}', order.orderId || 'N/A').replace('{title}', statusInfo.title),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">${t.update}</h2>
        <p>${t.greeting}</p>
        <p>${t.update}</p>
        
        <div style="background: ${statusInfo.color}20; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin: 20px 0;">
          <h3 style="color: ${statusInfo.color}; margin-top: 0;">${statusInfo.title}</h3>
          <p style="margin: 0; color: #333;">${statusInfo.message}</p>
        </div>

        <div style="background: #f8faf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5016; margin-top: 0;">${t.orderInformation}</h3>
          <p><strong>${t.orderId}</strong> ${order.orderId || 'N/A'}</p>
          <p><strong>${t.status}</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus || 'N/A'}</span></p>
          ${oldStatus ? `<p><strong>${t.previousStatus}</strong> ${oldStatus}</p>` : ''}
        </div>

        ${note ? `
          <div style="background: #ffffff; padding: 15px; border-left: 4px solid #2d5016; margin: 20px 0;">
            <h4 style="color: #2d5016; margin-top: 0;">${t.additionalInfo}</h4>
            <p style="white-space: pre-wrap; margin: 0;">${note}</p>
          </div>
        ` : ''}

        ${newStatus === 'fulfilled' ? `
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;"><strong>${t.fulfilled.onTheWay}</strong></p>
            <p style="margin: 10px 0 0 0; color: #155724;">${t.fulfilled.soon}</p>
          </div>
        ` : ''}

        ${newStatus === 'payment_received' || newStatus === 'processing' ? `
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0c5460;">${t.paymentReceivedProcessing}</p>
          </div>
        ` : ''}

        <p style="margin-top: 30px;">${t.questions}</p>
        <p>${t.regards}<br><strong>${t.team}</strong></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          ${t.automated}
        </p>
      </div>
    `,
    text: `
${t.update}

${t.greeting}

${t.update}

${statusInfo.title}
${statusInfo.message}

${t.orderInformation}:
${t.orderId} ${order.orderId || 'N/A'}
${t.status} ${newStatus || 'N/A'}
${oldStatus ? `${t.previousStatus} ${oldStatus}` : ''}

${note ? `${t.additionalInfo}:\n${note}` : ''}

${newStatus === 'fulfilled' ? `${t.fulfilled.onTheWay} ${t.fulfilled.soon}` : ''}
${newStatus === 'payment_received' || newStatus === 'processing' ? t.paymentReceivedProcessing : ''}

${t.questions}

${t.regards}
${t.team}
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};
