# Email Service Alternatives - Setup Guide

Since Mailgun SMTP isn't working on Render, here are your best alternatives:

---

## ✅ OPTION 1: SendGrid (RECOMMENDED)

**Why**: Most reliable on Render, easy setup, generous free tier (100 emails/day)

### Setup Steps:

1. **Sign up at SendGrid**: https://sendgrid.com/

2. **Verify your sender email**:
   - Go to Settings → Sender Authentication
   - Verify `genie.jobboardnorespond@gmail.com` (or use a custom domain)

3. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: `Genie-Job-Board-Production`
   - Permissions: Select "Mail Send" (Full Access)
   - Copy the key (starts with `SG.`) - **save it immediately, you won't see it again**

4. **Configure Render Environment Variables**:
   ```
   USE_ANYMAIL=False
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=<your-sendgrid-api-key>
   DEFAULT_FROM_EMAIL=genie.jobboardnorespond@gmail.com
   ```

5. **Redeploy on Render**

---

## 🔧 OPTION 2: Mailgun API (Not SMTP)

**Why**: Mailgun's API is more reliable than their SMTP service

### Setup Steps:

1. **Get Mailgun API credentials**:
   - Log into https://mailgun.com
   - Go to Sending → Domain Settings → API Keys
   - Copy your **Private API Key**
   - Note your **Domain name** (e.g., `sandboxXXX.mailgun.org` for sandbox)

2. **Verify authorized recipients** (for sandbox domain):
   - Go to Sending → Domain Settings → Authorized Recipients
   - Add and verify `genie.jobboardnorespond@gmail.com` and any test emails
   - Check your email and click the verification link

3. **Configure Render Environment Variables**:
   ```
   USE_ANYMAIL=True
   MAILGUN_API_KEY=<your-private-api-key>
   MAILGUN_DOMAIN=<your-domain>
   DEFAULT_FROM_EMAIL=genie.jobboardnorespond@gmail.com
   ```

4. **Redeploy on Render**

---

## 📧 OPTION 3: Resend (Modern Alternative)

**Why**: Developer-friendly, great documentation, built for modern apps

### Setup Steps:

1. **Sign up at Resend**: https://resend.com/

2. **Add Anymail support for Resend**:
   - Already included in `requirements.txt` (anymail package)

3. **Get API Key**:
   - Go to API Keys in Resend dashboard
   - Create new key
   - Copy the key (starts with `re_`)

4. **Update settings.py** (add after Mailgun config):
   ```python
   elif config('EMAIL_SERVICE', default='') == 'resend':
       EMAIL_BACKEND = 'anymail.backends.resend.EmailBackend'
       ANYMAIL = {
           'RESEND_API_KEY': config('RESEND_API_KEY', default=''),
       }
   ```

5. **Configure Render Environment Variables**:
   ```
   EMAIL_SERVICE=resend
   USE_ANYMAIL=True
   RESEND_API_KEY=<your-resend-api-key>
   DEFAULT_FROM_EMAIL=genie.jobboardnorespond@gmail.com
   ```

---

## 🧪 Testing After Setup

1. **Use the test endpoint**:
   ```bash
   curl -X POST https://genie-job-board.onrender.com/api/accounts/test-email/ \
     -H "Content-Type: application/json" \
     -d '{"to_email": "your-test@email.com"}'
   ```

2. **Check Render logs**:
   ```
   Render Dashboard → Your Service → Logs
   ```

3. **Look for**:
   - ✅ "Test email sent successfully"
   - ❌ Any error messages

---

## 📊 Comparison

| Service | Free Tier | Reliability | Setup Difficulty | Recommended For |
|---------|-----------|-------------|------------------|-----------------|
| **SendGrid** | 100/day | ⭐⭐⭐⭐⭐ | Easy | Production (Best) |
| **Mailgun API** | 5,000/month* | ⭐⭐⭐⭐ | Medium | High volume |
| **Resend** | 100/day | ⭐⭐⭐⭐⭐ | Easy | Modern apps |

*Mailgun sandbox requires recipient verification

---

## 🚨 Important Notes

1. **Don't use Gmail SMTP on Render** - it's blocked by network restrictions
2. **Mailgun SMTP doesn't work** - use their API instead via Anymail
3. **Always verify sender email** with your chosen service
4. **Test before going live** using the test endpoint
5. **Monitor email logs** in your service dashboard

---

## 💡 My Recommendation

**Start with SendGrid** - it's the most straightforward and reliable option for your use case:
- Easy verification
- Simple SMTP setup (no code changes needed)
- Great free tier
- Excellent deliverability
- Works well on Render

If you need higher volume later, switch to Mailgun API.
