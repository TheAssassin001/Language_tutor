# Chinese Language Tutor Platform

A comprehensive web-based platform for learning and practicing Mandarin Chinese, with built-in authentication, progress tracking, and tutor dashboard for monitoring student performance.

## 🎯 Features

### For Students
- **Interactive Quizzes & Tests** - Practice vocabulary, grammar, and characters
- **Digital Flashcards** - Review and memorize at your own pace
- **Writing Practice** - Learn stroke order and character writing
- **Progress Tracking** - Monitor improvement with detailed statistics
- **Study Streaks** - Track daily practice and build habits
- **Cross-device Sync** - Access your progress from any device

### For Tutors
- **Student Dashboard** - View all students and their activity
- **Detailed Analytics** - Track individual student progress and scores
- **Performance Insights** - Identify struggling areas and top performers
- **Activity Timeline** - Monitor student engagement over time

## 🏗️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design for mobile and desktop
- Dark mode support

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT authentication
- RESTful API architecture

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
- **Git** (optional, for cloning the repository)

## 🚀 Installation & Setup

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download and install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service:
  - Windows: MongoDB should start automatically, or run `net start MongoDB`
  - Mac: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 2. Setup Backend

Open PowerShell and navigate to your project directory:

```powershell
cd C:\Users\jayak\Documents\Projects\server
```

Install dependencies:

```powershell
npm install
```

Create environment configuration file:

```powershell
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/chinese-tutor

# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/chinese-tutor

# Change this to a secure random string in production!
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

PORT=5000
NODE_ENV=development
```

### 3. Start the Backend Server

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

### 4. Open the Frontend

Simply open any of the HTML files in your browser:
- `index.html` - Home page
- `login.html` - Login page
- `signup.html` - Sign up page
- `tutor-dashboard.html` - Tutor dashboard (requires tutor account)

Or use a simple HTTP server (recommended):

```powershell
# Using Python (if installed)
python -m http.server 8000

# Or using Node.js http-server (install globally first: npm install -g http-server)
http-server -p 8000
```

Then visit: `http://localhost:8000`

## 👥 Creating Accounts

### First Tutor Account
1. Go to `signup.html` or click "Sign Up" from the home page
2. Fill in your details
3. Select **"Tutor / Teacher"** from the dropdown
4. Click "Create Account"
5. You'll be redirected to the tutor dashboard

### Student Accounts
1. Students sign up the same way but select **"Student"**
2. They'll be redirected to the main platform
3. All their progress will be tracked and visible to tutors

## 📁 Project Structure

```
C:\Users\jayak\Documents\Projects\
├── server/                      # Backend API
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User schema (students & tutors)
│   │   └── Progress.js         # Progress tracking schema
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── progress.js         # Progress tracking endpoints
│   │   └── tutor.js            # Tutor dashboard endpoints
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── .env                    # Environment variables (create this!)
│   ├── .env.example            # Example environment file
│   ├── package.json            # Dependencies
│   └── server.js               # Main server file
│
├── index.html                  # Home page
├── login.html                  # Login page
├── signup.html                 # Sign up page
├── tutor-dashboard.html        # Tutor dashboard
├── progress.html               # Student progress page
├── quiz-select.html            # Quiz selection
├── test-select.html            # Test selection
├── flashcards.html             # Flashcards
├── writing.html                # Writing practice
├── resources.html              # Resources
│
├── app.js                      # Main app logic
├── auth-client.js              # Authentication API client
├── progress-api.js             # Progress API client
├── quizzes.js                  # Quiz functionality
├── style.css                   # Styles
│
└── README.md                   # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Progress (Students)
- `POST /api/progress` - Save quiz/test score (requires auth)
- `GET /api/progress` - Get all progress (requires auth)
- `GET /api/progress/stats` - Get statistics (requires auth)
- `GET /api/progress/streak` - Get study streak (requires auth)

### Tutor Dashboard (Tutors only)
- `GET /api/tutor/students` - Get all students
- `GET /api/tutor/students/:id` - Get detailed student progress
- `GET /api/tutor/analytics` - Get overall analytics

## 🛠️ Troubleshooting

### Backend won't start
- **Error: "Cannot find module"** → Run `npm install` in the server folder
- **Error: "EADDRINUSE"** → Port 5000 is in use. Change `PORT` in `.env` file
- **MongoDB connection error** → Check if MongoDB is running or verify your connection string

### Frontend can't connect to backend
- Make sure the backend is running (`npm start` in server folder)
- Check that `API_BASE_URL` in `auth-client.js` and `progress-api.js` matches your backend URL (default: `http://localhost:5000/api`)

### CORS errors
- The backend has CORS enabled by default
- If you're accessing from a different domain, you may need to configure CORS in `server.js`

## 🔐 Security Notes

### For Development
- The default JWT secret is insecure - change it in `.env`!
- Never commit `.env` file to version control

### For Production
1. Change `JWT_SECRET` to a strong random string
2. Use MongoDB Atlas with IP whitelist and strong password
3. Enable HTTPS
4. Set `NODE_ENV=production` in `.env`
5. Consider using environment variables instead of `.env` file

## 📱 Browser Support

- Chrome, Edge, Firefox, Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome Android)
- Dark mode supported in all browsers

## 🎓 Usage

### For Students
1. Sign up with your email
2. Take quizzes and tests to practice
3. View your progress on the Progress page
4. Build your study streak!

### For Tutors
1. Sign up as a tutor
2. Access the Tutor Dashboard from the navigation
3. View all registered students
4. Click on any student to see detailed progress
5. Monitor overall class analytics

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 💡 Tips

- **Backup your data**: Export MongoDB regularly if using local database
- **Study daily**: Build a streak to improve retention!
- **Mix it up**: Alternate between quizzes, tests, and flashcards
- **Track progress**: Tutors should review student progress weekly

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify MongoDB is running
4. Check the browser console for errors (F12)
5. Check the server terminal for error messages

---

**Happy Learning! 加油！(Jiā yóu! - Keep it up!)** 🎉
