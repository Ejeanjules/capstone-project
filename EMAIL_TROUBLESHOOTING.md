# Email Troubleshooting Guide for Render Deployment

## Issue
Password reset emails are failing with error: `[Errno 101] Network is unreachable`

## Root Cause
Render's server cannot establish an SMTP connection to Gmail's servers. This could be due to:
1. Network restrictions on Render's infrastructure
2. Gmail security requirements
3. SMTP port blocking
4. Invalid credentials or configuration

---

## Solution Options

### Option 1: Try Alternative SMTP Port (Recommended First Step)

Gmail supports multiple ports. Try using port **465 with SSL** instead of port **587 with TLS**.

**Update these environment variables in Render:**

```
EMAIL_PORT=465
EMAIL_USE_TLS=False
EMAIL_USE_SSL=True
```

### Option 2: Use SendGrid (Recommended for Production)

SendGrid is a reliable email service provider that works well with Render and has a free tier.

1. **Sign up for SendGrid**:
   - Go to https://sendgrid.com/
   - Create a free account (100 emails/day limit)

2. **Create an API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Choose "Restricted Access" and enable "Mail Send" permission
   - Copy the API key immediately (you won't see it again)

3. **Update Render environment variables**:
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=<your-sendgrid-api-key>
   DEFAULT_FROM_EMAIL=genie.jobboardnorespond@gmail.com
   ```

4. **Verify sender email**:
   - In SendGrid, go to Settings → Sender Authentication
   - Verify your sender email address (genie.jobboardnorespond@gmail.com)
   - Follow the verification steps SendGrid provides

### Option 3: Use Mailgun

Mailgun is another excellent email service with a free tier.

1. **Sign up for Mailgun**:
   - Go to https://www.mailgun.com/
   - Create a free account

2. **Get SMTP credentials**:
   - Go to Sending → Domain Settings → SMTP credentials
   - Copy your SMTP credentials

3. **Update Render environment variables**:
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False
   EMAIL_HOST_USER=<your-mailgun-smtp-username>
   EMAIL_HOST_PASSWORD=<your-mailgun-smtp-password>
   DEFAULT_FROM_EMAIL=genie.jobboardnorespond@gmail.com
   ```

### Option 4: Test Gmail App Password

If you want to continue using Gmail, ensure you're using an App Password, not your regular Gmail password.

1. **Verify App Password**:
   - Go to Google Account → Security
   - Enable 2-Step Verification if not already enabled
   - Go to "App passwords" section
   - Generate a new app password for "Mail"
   - Copy the 16-character password (remove spaces)

2. **Update Render environment variable**:
   ```
   EMAIL_HOST_PASSWORD=<16-character-app-password-no-spaces>
   ```

3. **Try the alternative port configuration** (Option 1)

---

## Testing the Email Configuration

### Method 1: Django Shell on Render

1. Connect to your Render shell:
   ```bash
   # In Render dashboard, open Shell
   python manage.py shell
   ```

2. Test email sending:
   ```python
   from django.core.mail import send_mail
   from django.conf import settings
   
   # Test email
   try:
       send_mail(
           subject='Test Email',
           message='This is a test email from Render.',
           from_email=settings.DEFAULT_FROM_EMAIL,
           recipient_list=['your-test-email@example.com'],
           fail_silently=False,
       )
       print("✅ Email sent successfully!")
   except Exception as e:
       print(f"❌ Error: {e}")
       import traceback
       traceback.print_exc()
   ```

### Method 2: Create a Test Endpoint

Add this temporary view to test emails:

```python
# In backend/accounts/views.py
from django.core.mail import send_mail
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def test_email(request):
    try:
        send_mail(
            subject='Test Email from Genie Job Board',
            message='This is a test email. If you receive this, email is working!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.GET.get('email', 'e.jeanjules@outlook.com')],
            fail_silently=False,
        )
        return Response({'message': 'Email sent successfully!'})
    except Exception as e:
        return Response({
            'error': str(e),
            'config': {
                'host': settings.EMAIL_HOST,
                'port': settings.EMAIL_PORT,
                'use_tls': settings.EMAIL_USE_TLS,
                'use_ssl': getattr(settings, 'EMAIL_USE_SSL', False),
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'user': settings.EMAIL_HOST_USER[:5] + '***' if settings.EMAIL_HOST_USER else 'Not set'
            }
        }, status=500)
```

Add to `backend/accounts/urls.py`:
```python
path('test-email/', views.test_email, name='test_email'),
```

Then visit: `https://genie-job-board.onrender.com/api/accounts/test-email/?email=your-email@example.com`

---

## Steps to Fix on Render

1. **Navigate to your Render service**
2. **Go to Environment tab**
3. **Add/Update these variables based on your chosen solution**:

   For SendGrid (Recommended):
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=<your-sendgrid-api-key>
   DEFAULT_FROM_EMAIL=genie.jobboardnorespond@gmail.com
   ```

4. **Save changes** - Render will automatically redeploy
5. **Monitor the logs** during deployment
6. **Test the password reset functionality**

---

## Verify Current Configuration

Check what's currently set in Render:

1. Go to Render Dashboard → Your Service → Environment
2. Verify these variables exist:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USE_TLS`
   - `EMAIL_HOST_USER`
   - `EMAIL_HOST_PASSWORD`
   - `DEFAULT_FROM_EMAIL`

3. Make sure `DEBUG=False` is set (so production email settings are used)

---

## Why This Happens

- **Network restrictions**: Some hosting providers block certain ports or SMTP traffic
- **Gmail security**: Gmail has strict policies about SMTP access from cloud servers
- **Firewall rules**: Render may have firewall rules that need special configuration
- **Port blocking**: Port 587 might be restricted; port 465 often works better

---

## Best Practice Recommendation

**Use SendGrid or Mailgun for production** rather than Gmail because:
- ✅ More reliable from cloud hosting environments
- ✅ Better deliverability rates
- ✅ Detailed analytics and monitoring
- ✅ Higher sending limits
- ✅ Professional email infrastructure
- ✅ Better reputation management

Gmail is fine for development but not ideal for production email sending.

---

## Quick Check Commands

```bash
# Check if SMTP ports are accessible from Render
telnet smtp.gmail.com 587
telnet smtp.gmail.com 465

# Or using curl
curl -v telnet://smtp.gmail.com:587
curl -v telnet://smtp.gmail.com:465
```

If these commands fail, it confirms network connectivity issues with Gmail's SMTP servers.

---

## Need More Help?

If issues persist:
1. Check Render's documentation on email sending
2. Look for any firewall or network restrictions in Render settings
3. Contact Render support about SMTP connectivity
4. Consider using Render's recommended email service providers

---

## Current Status

Your app is currently configured to:
- Use Gmail SMTP on port 587 with TLS
- Send from: genie.jobboardnorespond@gmail.com
- App password is configured

**Next Step**: Try Option 1 (port 465) or switch to SendGrid (Option 2) for best results.
