import nodemailer from "nodemailer";

const BANK_DETAILS = {
  accountName: process.env.BANK_ACCOUNT_NAME || "Factory L LLC",
  bankName: process.env.BANK_NAME || "Mock National Bank",
  bankAddress: process.env.BANK_ADDRESS || "12 Greenfield Ave, Tbilisi, Georgia",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "01904917",
  swift: process.env.BANK_SWIFT || "MNBGGE22",
};

let transporterPromise;

const createTransporter = async () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    console.warn("[email] SMTP_HOST or SMTP_PORT is not configured. Emails will not be sent.");
    return null;
  }

  const secure =
    SMTP_SECURE != null
      ? SMTP_SECURE === "true"
      : Number(SMTP_PORT) === 465;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    auth:
      SMTP_USER && SMTP_PASS
        ? {
            user: SMTP_USER,
            pass: SMTP_PASS,
          }
        : undefined,
  });

  try {
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error("[email] SMTP transport verification failed:", error);
    return null;
  }
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
};

const formatCurrency = (value, currency = "USD") => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toFixed(2)}`;
};

const resolveLineTotal = (item) => {
  if (item.lineTotal != null) {
    return Number(item.lineTotal);
  }
  if (item.unitPrice != null) {
    return Number(item.unitPrice) * Number(item.quantity || 0);
  }
  return 0;
};

const buildItemsSection = (order) =>
  (order.items || [])
    .map((item) => {
      const lineTotal = resolveLineTotal(item);
      return `<li><strong>${item.name}</strong> &times; ${item.quantity}${
        item.material ? ` • ${item.material}` : ""
      } — ${formatCurrency(lineTotal, order.currency)}</li>`;
    })
    .join("");

export const sendOrderConfirmationEmail = async ({ to, order, user }) => {
  if (!to || !order) {
    return;
  }

  const transporter = await getTransporter();
  if (!transporter) {
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@factory-l.com";
  const bccRaw = process.env.ORDER_NOTIFICATIONS_BCC;
  const bcc = bccRaw ? bccRaw.split(",").map((entry) => entry.trim()).filter(Boolean) : undefined;

  const recipientName = user?.displayName || order.shippingAddress?.fullName || to.split("@")[0];
  const subject = `Factory L order ${order.orderId} — awaiting payment`;
  const paymentDeadline = order.paymentDueBy
    ? new Date(order.paymentDueBy).toLocaleString()
    : null;

  const textLines = [
    `Hi ${recipientName || "there"},`,
    "",
    `Thank you for placing order ${order.orderId} with Factory L.`,
    "",
    "To keep things moving, please complete a bank transfer using the reference below.",
    `Payment reference: ${order.orderId}`,
    "",
    "Bank details:",
    `  • Payee: ${BANK_DETAILS.accountName}`,
    `  • Bank: ${BANK_DETAILS.bankName}`,
    `  • Bank address: ${BANK_DETAILS.bankAddress}`,
    `  • Account number: ${BANK_DETAILS.accountNumber}`,
    `  • SWIFT: ${BANK_DETAILS.swift}`,
    `  • Amount: ${formatCurrency(order.total, order.currency)}`,
  ];

  if (paymentDeadline) {
    textLines.push(`  • Payment due by: ${paymentDeadline}`);
  }

  textLines.push(
    "",
    "Payments usually register within 30 minutes. If you have already sent the funds, the order status will update automatically after we confirm the transfer.",
    "Need a hand or an urgent update? Reply to this email and we’ll help right away.",
    "",
    "Order summary:"
  );

  (order.items || []).forEach((item) => {
    const lineTotal = resolveLineTotal(item);
    textLines.push(
      `  • ${item.name} x${item.quantity}${
        item.material ? ` (${item.material})` : ""
      } — ${formatCurrency(lineTotal, order.currency)}`
    );
  });

  textLines.push(
    "",
    `Subtotal: ${formatCurrency(order.subtotal, order.currency)}`,
    `Shipping: ${formatCurrency(order.shippingFee, order.currency)}`,
    `Total: ${formatCurrency(order.total, order.currency)}`,
    "",
    "We’ll email you again as soon as we confirm your payment.",
    "",
    "Thank you,",
    "Factory L team"
  );

  const itemsHtml = buildItemsSection(order);

  const html = `
    <p>Hi ${recipientName || "there"},</p>
    <p>Thank you for placing order <strong>${order.orderId}</strong> with Factory L.</p>
    <p>
      To keep things moving, please complete a bank transfer using the reference below.
      Payments usually register within 30 minutes—once we confirm the funds we’ll move your project into production.
      If you’ve already paid, the status will update automatically.
    </p>

    <div style="padding:16px;border-radius:12px;background:#f9f5eb;border:1px solid #e3d4b2;">
      <p style="margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;font-size:12px;color:#715c2a;">
        Payment reference
      </p>
      <p style="margin:0;font-size:20px;font-weight:700;color:#4a3712;">${order.orderId}</p>
    </div>

    <h3 style="margin-top:24px;">Bank details</h3>
    <ul>
      <li><strong>Payee:</strong> ${BANK_DETAILS.accountName}</li>
      <li><strong>Bank:</strong> ${BANK_DETAILS.bankName}</li>
      <li><strong>Bank address:</strong> ${BANK_DETAILS.bankAddress}</li>
      <li><strong>Account number:</strong> ${BANK_DETAILS.accountNumber}</li>
      <li><strong>SWIFT:</strong> ${BANK_DETAILS.swift}</li>
      <li><strong>Amount:</strong> ${formatCurrency(order.total, order.currency)}</li>
      ${paymentDeadline ? `<li><strong>Payment due by:</strong> ${paymentDeadline}</li>` : ""}
    </ul>

    <p style="margin-top:16px;">
      Need a hand or have already paid? Reply to this email and we’ll make sure everything is progressing smoothly.
    </p>

    <h3 style="margin-top:24px;">Order summary</h3>
    <ul>
      ${itemsHtml}
    </ul>
    <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal, order.currency)}</p>
    <p><strong>Shipping:</strong> ${formatCurrency(order.shippingFee, order.currency)}</p>
    <p><strong>Total:</strong> ${formatCurrency(order.total, order.currency)}</p>

    <p>We’ll email you again as soon as we confirm your payment.</p>
    <p style="margin-top:24px;">Thank you,<br />Factory L team</p>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: textLines.join("\n"),
      html,
      ...(bcc ? { bcc } : {}),
    });
  } catch (error) {
    console.error("[email] Failed to send order confirmation:", error);
  }
};

export default sendOrderConfirmationEmail;

