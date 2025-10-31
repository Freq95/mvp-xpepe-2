# MongoDB Atlas Setup Guide

## Steps to connect your backend to MongoDB Atlas:

1. **On the MongoDB Atlas page you're seeing:**
   - Click on **"Drivers"** option (under "Connect to your application")
   - This will show you connection options

2. **Next screen:**
   - Select **"Node.js"** as your driver
   - Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

3. **Update your `.env` file:**
   - Replace `<password>` in the connection string with your actual MongoDB password
   - Replace `<username>` if you haven't set up a database user yet
   - Add the database name at the end: `/xpepe-analytics`

   Final connection string should look like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/xpepe-analytics?retryWrites=true&w=majority
   ```

4. **Add to backend/.env:**
   ```
   PORT=3001
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/xpepe-analytics?retryWrites=true&w=majority
   NODE_ENV=development
   ```

5. **Important:** Make sure your IP address is whitelisted in MongoDB Atlas:
   - Go to "Network Access" in MongoDB Atlas
   - Click "Add IP Address"
   - For development, you can use "Allow Access from Anywhere" (0.0.0.0/0) - though this is less secure
   - Or add your current IP address

