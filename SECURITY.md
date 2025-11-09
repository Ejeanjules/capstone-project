# 🔒 Security Checklist for GitHub

## ✅ What's Already Protected

1. **`.env` file is in `.gitignore`**
   - Your Supabase password is safe
   - Django secret key won't be exposed
   - Git will ignore this file automatically

2. **`.env.example` exists**
   - Safe template for other developers
   - Shows what variables are needed
   - No actual secrets included

3. **Python cache ignored**
   - `__pycache__/` in `.gitignore`
   - `*.pyc` files won't be committed

4. **Database files ignored**
   - `db.sqlite3` won't be committed
   - `/media/` folder (uploaded files) ignored

## 🔍 Before Pushing to GitHub

### Check what will be committed:
```powershell
git status
```

### Verify .env is NOT listed:
If you see `backend/.env` in red or green, **DON'T COMMIT!**

### Safe check - Try adding .env (it should fail):
```powershell
git add backend/.env
# Should show: "The following paths are ignored by one of your .gitignore files"
```

## 🚀 When Deploying (Production)

### On deployment platform (Render, Heroku, etc.):
1. Set environment variables in platform dashboard
2. Never put secrets in code
3. Use platform's environment variable system

### Example for Render.com:
- Go to: Dashboard → Your Service → Environment
- Add:
  - `DATABASE_URL` = your Supabase connection string
  - `SECRET_KEY` = generate new random key
  - `DEBUG` = False
  - `ALLOWED_HOSTS` = your-domain.com

## 🔑 Generate New Secret Key for Production

Run this in Django shell:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

**IMPORTANT:** Use a DIFFERENT secret key for production!

## ⚠️ If You Accidentally Commit `.env`

### If you haven't pushed yet:
```powershell
git reset HEAD backend/.env
git restore backend/.env
```

### If you already pushed to GitHub:
1. **IMMEDIATELY change your Supabase password**
2. Go to Supabase Dashboard → Settings → Database → Reset password
3. Update local `.env` with new password
4. Remove from git history:
```powershell
git rm --cached backend/.env
git commit -m "Remove .env from git history"
git push
```
5. Consider the old password compromised

## ✅ Final Checklist Before Push

- [ ] `.env` is in `.gitignore`
- [ ] Run `git status` and verify `.env` is NOT listed
- [ ] `.env.example` has placeholders, not real values
- [ ] `db.sqlite3` is ignored
- [ ] No passwords in code files
- [ ] No API keys hardcoded anywhere

## 📝 Good Practices

1. **Never** share `.env` via email/chat
2. **Always** use environment variables for secrets
3. **Rotate** passwords if you think they're compromised
4. **Use** different credentials for dev/staging/production
5. **Keep** `.env` only on your local machine

---

**Your current setup is secure!** ✅ 
The `.gitignore` is already protecting your secrets.
