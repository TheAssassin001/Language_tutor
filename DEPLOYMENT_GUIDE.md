# 🚀 Deployment Guide - Make Your App Live Online

## **Option 1: Render (Backend) + Vercel (Frontend) - RECOMMENDED**

### **✅ What You Get:**
- Free hosting for both frontend and backend
- Custom domains available
- Automatic SSL (HTTPS)
- Easy deployment from GitHub

---

## **Step-by-Step Deployment**

### **PART 1: Deploy Backend to Render**

1. **Create Render Account**
   - Go to: https://render.com
   - Sign up (free account)
   - Connect your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your repository: `Language_tutor`
   - Click "Connect"

3. **Configure Service**
   - **Name**: `chinese-tutor-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free"

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   
   ```
   MONGODB_URI = mongodb+srv://admin:admin123!@tutor.yccbyhv.mongodb.net/chinese-tutor?retryWrites=true&w=majority&appName=tutor
   
   JWT_SECRET = chinese_tutor_secret_key_2026_change_in_production
   
   PORT = 5000
   
   NODE_ENV = production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://chinese-tutor-api.onrender.com`
   - **COPY THIS URL** - you'll need it!

6. **Test Your API**
   Visit: `https://your-render-url.onrender.com/api/health`
   Should show: `{"status":"ok","message":"Chinese Tutor API is running"}`

---

### **PART 2: Update Frontend with Your Backend URL**

**IMPORTANT:** Replace the placeholder URL with YOUR actual Render URL!

1. **Open these files and update the URL:**

   **File: `auth-client.js`** (Line 8)
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000/api' 
     : 'https://YOUR-RENDER-URL.onrender.com/api'; // ← Replace this!
   ```

   **File: `progress-api.js`** (Line 8)
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000/api' 
     : 'https://YOUR-RENDER-URL.onrender.com/api'; // ← Replace this!
   ```

   **File: `tutor-dashboard.html`** (Lines 263, 298, 348 - already updated with placeholder)
   - Search for `chinese-tutor-api.onrender.com` 
   - Replace with YOUR actual Render URL

2. **Commit and push changes:**
   ```powershell
   git add .
   git commit -m "Update API URLs for production deployment"
   git push
   ```

---

### **PART 3: Deploy Frontend to Vercel**

1. **Create Vercel Account**
   - Go to: https://vercel.com
   - Sign up (free account)
   - Connect your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import `Language_tutor` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Other (it's a static site)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - Click "Deploy"

4. **Wait for Deployment**
   - Takes ~30 seconds
   - You'll get a URL like: `https://language-tutor-abc123.vercel.app`

5. **Test Your Site**
   - Visit your Vercel URL
   - Try creating an account
   - Try logging in
   - Everything should work!

---

## **🎉 Your App is Now LIVE!**

### **Your URLs:**
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-api.onrender.com`
- **Database**: MongoDB Atlas (already set up)

### **Share With Others:**
Just send them your Vercel URL! They can:
- Sign up as students
- Take quizzes
- Track progress
- Tutors can view all student data

---

## **Option 2: All-in-One with Railway** (Alternative)

If you prefer a single platform:

1. Sign up at https://railway.app
2. Deploy from GitHub
3. Add environment variables
4. Get a single URL for everything

---

## **Free Tier Limitations**

### **Render Free Tier:**
- ✅ 750 hours/month (plenty for testing)
- ⚠️ Spins down after 15 min of inactivity (first request takes ~30s)
- ✅ Automatic SSL
- ✅ Custom domains

### **Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Fast global CDN
- ✅ Automatic SSL
- ✅ Custom domains

### **MongoDB Atlas Free Tier:**
- ✅ 512MB storage (thousands of users)
- ✅ Always on
- ✅ No time limits

---

## **Upgrading Later**

When your app grows:
- **Render**: $7/month for always-on server
- **Vercel**: Free tier is usually enough
- **MongoDB Atlas**: $9/month for 2GB storage

---

## **Troubleshooting**

### **"Network Error" when logging in:**
- Make sure you updated the API URLs in all files
- Check Render logs to see if backend is running
- Verify MongoDB connection string is correct

### **Backend "Cold Start" (Render free tier):**
- First request after 15 min takes ~30 seconds
- Add a "Please wait..." message on login page
- Or upgrade to paid tier ($7/month) for always-on

### **CORS Errors:**
- Already configured in your backend (cors package)
- Should work out of the box

---

## **Quick Commands**

**To update your live site:**
```powershell
# Make changes to your code
git add .
git commit -m "Description of changes"
git push
```

Both Render and Vercel will **automatically redeploy** when you push to GitHub!

---

**Your Chinese Language Tutor Platform is ready to go live! 🚀**
