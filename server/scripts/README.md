# User Management Scripts

These scripts help manage users and roles in the Language Tutor application.

## Prerequisites

Make sure you're in the `server/` directory and have the `.env` file configured:

```bash
cd server
```

## Available Scripts

### 1. Create Tutor Account

Creates a new tutor account (bypasses public signup restrictions).

```bash
node scripts/create-tutor.js
```

**Example:**
```
Tutor Name: John Smith
Tutor Email: john@school.edu
Password (min 6 characters): password123
```

### 2. List All Users

Shows all registered users with their roles.

```bash
node scripts/list-users.js
```

**Output:**
```
=== ALL USERS ===
Total Users: 5

1. 👨‍🏫 John Smith
   Email: john@school.edu
   Role: tutor
   Created: 1/8/2026
   ID: 507f1f77bcf86cd799439011

2. 👨‍🎓 Jane Doe
   Email: jane@student.com
   Role: student
   Created: 1/8/2026
   ID: 507f1f77bcf86cd799439012
```

### 3. Change User Role

Changes an existing user's role between student and tutor.

```bash
node scripts/change-role.js
```

**Example:**
```
Enter user email: student@example.com
Current Role: student
Enter new role (student/tutor): tutor
Change role from "student" to "tutor"? (yes/no): yes
✅ Role updated successfully!
```

## Common Tasks

### Create your first tutor account:
```bash
cd server
node scripts/create-tutor.js
```

### View all users:
```bash
node scripts/list-users.js
```

### Promote a student to tutor:
```bash
node scripts/change-role.js
```

## Security Notes

- These scripts require direct database access
- Should only be run by administrators
- Passwords are automatically hashed before storage
- All operations are logged to the console

## Troubleshooting

**Error: Cannot connect to database**
- Check your `.env` file has the correct `MONGODB_URI`
- Ensure MongoDB is accessible from your network

**Error: User already exists**
- The email is already registered
- Use `list-users.js` to view existing users
- Use `change-role.js` to modify an existing user

**Error: Module not found**
- Make sure you're in the `server/` directory
- Run `npm install` to install dependencies
