# Email Setup for Password Reset

## Option 1: Gmail (Recommended - Free)

### Steps:
1. **Enable 2-Step Verification** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "JobBoard" and click Generate
   - Copy the 16-character password

3. **Add to Render Environment Variables**
   - Go to your Render dashboard
   - Select your web service
   - Go to "Environment" tab
   - Add these variables:
     ```
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USE_TLS=True
     EMAIL_HOST_USER=your-email@gmail.com
     EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx (the app password)
     DEFAULT_FROM_EMAIL=your-email@gmail.com
     ```

## Option 2: SendGrid (Better for Production)

### Steps:
1. **Sign up for SendGrid** (free tier: 100 emails/day)
   - Go to https://signup.sendgrid.com/

2. **Create API Key**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Add to Render Environment Variables**
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=SG.xxxxxxxxxxxxxxxxxx (your API key)
   DEFAULT_FROM_EMAIL=your-verified-sender@yourdomain.com
   ```

4. **Verify Sender Identity**
   - In SendGrid, go to Settings > Sender Authentication
   - Verify a single sender email address

## Option 3: Mailgun (Alternative)

### Steps:
1. **Sign up for Mailgun** (free tier: 1000 emails/month)
   - Go to https://signup.mailgun.com/

2. **Get SMTP Credentials**
   - Go to Sending > Domain Settings
   - Find SMTP credentials section

3. **Add to Render Environment Variables**
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=postmaster@your-sandbox-domain.mailgun.org
   EMAIL_HOST_PASSWORD=your-mailgun-password
   DEFAULT_FROM_EMAIL=noreply@your-sandbox-domain.mailgun.org
   ```

## Testing

After setting up:
1. Deploy your app (push to GitHub)
2. Go to your app and click "Forgot Password?"
3. Enter your email
4. Check your inbox for the reset email

## Troubleshooting

- **Email not received**: Check spam folder
- **Gmail blocking**: Make sure 2-Step Verification is enabled and you're using an App Password
- **SendGrid errors**: Verify your sender email address
- **Render logs**: Check logs in Render dashboard for email errors
