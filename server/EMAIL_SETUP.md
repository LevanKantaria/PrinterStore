# Email Setup Guide

## Quick Setup with Gmail (Good for Development & Low Volume)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Still in Security settings, go to **App passwords**
2. Select **Mail** and **Other (Custom name)**
3. Enter "Makers Hub Contact Form" as the name
4. Click **Generate**
5. **Copy the 16-character password** (you'll need this!)

### Step 3: Set Environment Variables
Create or update your `.env` file in the `server` directory:

```env
# Gmail credentials
EMAIL_USER=l.kantaria1999@gmail.com
EMAIL_PASS=eckq aprx aaoz ohtt


# Where to send contact form submissions (defaults to EMAIL_USER if not set)
CONTACT_EMAIL=your-email@gmail.com
```

### Step 4: Restart Server
```bash
cd server
npm start
```

## Gmail Limitations

⚠️ **Important Limits:**
- **Daily sending limit**: ~500 emails/day for regular Gmail accounts
- **Rate limit**: ~100 emails/hour
- **Account security**: If you send too many emails, Google may temporarily restrict your account
- **Not recommended for production** with high volume

## When to Upgrade

Consider upgrading to a professional email service when:
- You're sending more than 100 emails/day
- You need better deliverability
- You want analytics and tracking
- You need to send transactional emails (order confirmations, etc.)

## Production Email Services

### Option 1: SendGrid (Recommended for Startups)
- **Free tier**: 100 emails/day forever
- **Paid**: $19.95/month for 50,000 emails
- Easy setup, good deliverability

### Option 2: AWS SES (Best for Scale)
- **Free tier**: 62,000 emails/month (first year)
- **Paid**: $0.10 per 1,000 emails
- Very reliable, scales well

### Option 3: Mailgun
- **Free tier**: 5,000 emails/month for 3 months
- **Paid**: $35/month for 50,000 emails
- Good for transactional emails

### Option 4: Resend (Modern Alternative)
- **Free tier**: 3,000 emails/month
- **Paid**: $20/month for 50,000 emails
- Developer-friendly API

## Testing

Test your setup by submitting the contact form on your website. You should receive:
1. An email to your `CONTACT_EMAIL` with the form submission
2. An auto-reply to the person who submitted the form

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2FA is enabled on your Google account

### "Connection timeout" error
- Check your internet connection
- Verify firewall isn't blocking SMTP (port 587)

### Emails going to spam
- This is common with Gmail. Consider:
  - Using a custom domain email
  - Setting up SPF/DKIM records
  - Using a professional email service

## Security Notes

⚠️ **Never commit your `.env` file to git!**
- Add `.env` to your `.gitignore`
- Use environment variables in production
- Rotate your App Password if it's ever exposed

