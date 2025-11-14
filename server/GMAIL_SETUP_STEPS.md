# How to Get Gmail Credentials - Step by Step

## Step 1: Get Your Email Address (EMAIL_USER)

This is simple - it's just your Gmail address:
- Example: `yourname@gmail.com`
- This is what you'll use for `EMAIL_USER`

## Step 2: Enable 2-Step Verification

**Why?** Google requires 2FA to generate App Passwords (for security).

### Steps:
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Find **"2-Step Verification"** section
4. Click **"Get started"** or **"Turn on"**
5. Follow the prompts:
   - Enter your password
   - Add your phone number
   - Verify with a code sent to your phone
   - Click **"Turn on"**

✅ **Done!** 2-Step Verification is now enabled.

## Step 3: Generate App Password (EMAIL_PASS)

**What is this?** An App Password is a special 16-character password that allows apps (like your server) to access your Gmail account securely.

### Steps:
1. Still in **Security** settings: https://myaccount.google.com/security
2. Scroll down to find **"2-Step Verification"** section
3. Click on **"App passwords"** (it's a link under 2-Step Verification)
   - If you don't see it, make sure 2-Step Verification is enabled first!
4. You might need to sign in again
5. On the App passwords page:
   - **Select app**: Choose **"Mail"**
   - **Select device**: Choose **"Other (Custom name)"**
   - **Name**: Type `Makers Hub Contact Form` (or any name you want)
   - Click **"Generate"**
6. **IMPORTANT**: Google will show you a 16-character password
   - It looks like: `abcd efgh ijkl mnop` (with spaces)
   - **Copy this immediately!** You won't be able to see it again
   - Remove the spaces when using it: `abcdefghijklmnop`
   - This is what you'll use for `EMAIL_PASS`

✅ **Done!** You now have your App Password.

## Step 4: Add to Your .env File

1. Go to your `server` folder
2. Create or open `.env` file
3. Add these lines:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
CONTACT_EMAIL=your-email@gmail.com
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with your 16-character App Password (no spaces!)

### Example:
```env
EMAIL_USER=levani.kantaria@gmail.com
EMAIL_PASS=abcd1234efgh5678
CONTACT_EMAIL=levani.kantaria@gmail.com
```

## Step 5: Test It

1. Restart your server:
   ```bash
   cd server
   npm start
   ```

2. Submit the contact form on your website

3. Check:
   - Your email inbox (you should receive the form submission)
   - The user's email (they should get an auto-reply)
   - Server console (should show "Contact email sent successfully")

## Troubleshooting

### "I don't see App passwords option"
- Make sure 2-Step Verification is **enabled first**
- Try refreshing the page
- Make sure you're signed into the correct Google account

### "Invalid login" error
- Make sure you're using the **App Password**, not your regular Gmail password
- Remove all spaces from the App Password
- Make sure 2-Step Verification is enabled

### "I lost my App Password"
- No problem! Just generate a new one:
  - Go back to App passwords
  - Generate a new one
  - Update your `.env` file with the new password

### "Can't find Security settings"
- Direct link: https://myaccount.google.com/security
- Make sure you're signed into Google

## Security Tips

⚠️ **Important:**
- Never share your App Password
- Never commit `.env` file to git
- If you suspect it's compromised, generate a new one
- Each App Password is unique - you can have multiple for different apps

## Quick Reference

**EMAIL_USER** = Your Gmail address (e.g., `yourname@gmail.com`)

**EMAIL_PASS** = 16-character App Password (no spaces, e.g., `abcd1234efgh5678`)

**CONTACT_EMAIL** = Where to send contact form submissions (usually same as EMAIL_USER)

