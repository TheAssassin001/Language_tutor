# Quick Start Guide

## Windows PowerShell Commands

### 1. Install Backend Dependencies
```powershell
cd C:\Users\jayak\Documents\Projects\server
npm install
```

### 2. Start MongoDB (if using local MongoDB)
MongoDB should start automatically. If not:
```powershell
net start MongoDB
```

### 3. Start Backend Server
```powershell
cd C:\Users\jayak\Documents\Projects\server
npm start
```

### 4. Open Frontend
Open `index.html` in your browser or start a local server:
```powershell
cd C:\Users\jayak\Documents\Projects
python -m http.server 8000
```
Then visit: http://localhost:8000

## Quick Test

### Create Tutor Account
1. Go to http://localhost:8000/signup.html
2. Name: Test Tutor
3. Email: tutor@test.com
4. Password: test123
5. Role: Tutor / Teacher
6. Click "Create Account"

### Create Student Account
1. Go to http://localhost:8000/signup.html
2. Name: Test Student
3. Email: student@test.com
4. Password: test123
5. Role: Student
6. Click "Create Account"

### Test the System
1. As student: Take a quiz or test
2. As tutor: Login and visit Dashboard to see student progress

## Troubleshooting

### Can't connect to MongoDB?
Use MongoDB Atlas (cloud) instead:
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in server/.env

### Port 5000 in use?
Change PORT in server/.env to another number (e.g., 5001)

### Backend errors?
Check server terminal for error messages
Make sure all npm packages are installed
