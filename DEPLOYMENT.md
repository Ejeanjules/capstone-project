# 🚀 Deployment Guide - Render.com

## Prerequisites
- GitHub account with your code pushed
- Supabase database (already set up ✅)
- Render.com account (free)

## Step-by-Step Deployment

### 1. Push to GitHub

```powershell
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

### 3. Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `capstone-project`
3. Give it a name: `genie-jobs` (or whatever you want)
4. Select region: **Ohio** (closest to your Supabase)

### 4. Configure Build Settings

Render should auto-detect from `render.yaml`, but verify:

- **Build Command:**
  ```
  chmod +x build.sh && ./build.sh
  ```

- **Start Command:**
  ```
  cd backend && gunicorn backend.wsgi:application
  ```

- **Branch:** `main`

### 5. Add Environment Variables

In Render Dashboard → Environment:

**Required:**
```
DATABASE_URL = postgresql://postgres.lzcklchxapnncaekahdh:Eserisalive56003@aws-1-us-east-2.pooler.supabase.com:6543/postgres

DEBUG = False

ALLOWED_HOSTS = genie-jobs.onrender.com,genie-jobs-xxxxx.onrender.com
(Replace with your actual Render URL after deployment)
```

**Optional (Render auto-generates if not provided):**
```
SECRET_KEY = your-new-random-secret-key-here
```

To generate a new SECRET_KEY:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 6. Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for first build
3. Watch the logs for any errors

### 7. Update ALLOWED_HOSTS

After deployment, you'll get a URL like: `https://genie-jobs.onrender.com`

Update the `ALLOWED_HOSTS` environment variable to include this domain.

### 8. Test Your App

Visit: `https://your-app-name.onrender.com`

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `build.sh` has correct permissions
- Make sure all dependencies are in `requirements.txt`

### Static Files Not Loading
- Run `python manage.py collectstatic` manually
- Check `STATIC_ROOT` in settings.py
- Verify WhiteNoise is in MIDDLEWARE

### Database Connection Error
- Verify `DATABASE_URL` in environment variables
- Check Supabase project is active
- Test connection from Render's shell

### CORS Errors
- Add your Render domain to `CORS_ALLOWED_ORIGINS` in settings.py
- Redeploy after changes

## Post-Deployment Checklist

- [ ] App loads at Render URL
- [ ] Can register new user
- [ ] Can post a job
- [ ] Can upload resume
- [ ] Can view applications
- [ ] Static files (CSS/JS) load correctly
- [ ] Media files (resumes) upload/download work

## Free Tier Limits

Render Free Tier includes:
- ✅ 750 hours/month (enough for always-on)
- ✅ Automatic HTTPS
- ✅ Auto-deploys from GitHub
- ⚠️ Spins down after 15 minutes of inactivity (30s cold start)

## Upgrade Options

If you need:
- No spin-down → $7/month
- Custom domain → Free on any plan
- More resources → $7-25/month

## Domain Setup (Optional)

### Using Custom Domain:
1. Buy domain (Namecheap, Google Domains, etc.)
2. In Render: Settings → Custom Domain
3. Add your domain
4. Update DNS records (Render provides instructions)
5. Update `ALLOWED_HOSTS` in environment variables

### Using Free Subdomain:
Render provides: `your-app-name.onrender.com`
No setup needed!

## Monitoring

- **Logs:** Render Dashboard → Logs tab
- **Metrics:** Render Dashboard → Metrics tab
- **Database:** Supabase Dashboard → Database tab

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Django Deployment: https://docs.djangoproject.com/en/5.2/howto/deployment/

---

**You're ready to deploy!** 🎉

Follow the steps above and your app will be live on the internet!
