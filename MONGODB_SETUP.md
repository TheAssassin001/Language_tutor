# MongoDB Setup Guide

MongoDB is not currently installed on your system. You have two options:

## Option 1: MongoDB Atlas (Cloud) - **RECOMMENDED** ✅

This is the easiest option - no installation required!

### Steps:
1. **Sign up for MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account (no credit card needed)

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select a region close to you
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `admin` (or your choice)
   - Password: Create a strong password (save it!)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update `.env` file**
   - Open: `C:\Users\jayak\Documents\Projects\server\.env`
   - Replace `<password>` with your actual password
   - Update the MONGODB_URI line:
     ```env
     MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chinese-tutor?retryWrites=true&w=majority
     ```

7. **Done!** Start your server:
   ```powershell
   cd C:\Users\jayak\Documents\Projects\server
   npm start
   ```

---

## Option 2: Local MongoDB Installation

If you prefer to run MongoDB on your computer:

### Steps:
1. **Download MongoDB Community Edition**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows"
   - Download the MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Optionally install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service**
   - MongoDB should start automatically as a Windows service
   - Or manually start it:
     ```powershell
     net start MongoDB
     ```

5. **Your `.env` file should already be configured**
   ```env
   MONGODB_URI=mongodb://localhost:27017/chinese-tutor
   ```

6. **Start your server**
   ```powershell
   cd C:\Users\jayak\Documents\Projects\server
   npm start
   ```

---

## Which Option Should I Choose?

| Feature | MongoDB Atlas (Cloud) | Local MongoDB |
|---------|----------------------|---------------|
| Setup Time | 5 minutes | 15-20 minutes |
| Installation | None | Required |
| Accessible Anywhere | ✅ Yes | ❌ Only on this computer |
| Free Tier | ✅ 512MB storage | ✅ Unlimited |
| Backups | ✅ Automatic | ❌ Manual |
| Best For | **Recommended for most users** | Advanced users |

**Recommendation:** Start with MongoDB Atlas - it's faster, easier, and you can access your data from anywhere!

---

## Testing Your Setup

Once MongoDB is configured, test your connection:

```powershell
cd C:\Users\jayak\Documents\Projects\server
npm start
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running on port 5000
```

If you see this, you're all set! 🎉
