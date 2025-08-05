# Local Setup Guide - Workout Tracker App

This guide will help you set up and run the workout tracking app on your own computer. No technical knowledge required!

## What You'll Need

Before starting, make sure you have these programs installed on your computer:

### 1. Install Node.js
- Go to [nodejs.org](https://nodejs.org/)
- Download the "LTS" version (the green button)
- Run the installer and follow the setup wizard
- Keep all default settings

### 2. Install Git (Optional but Recommended)
- Go to [git-scm.com](https://git-scm.com/)
- Download and install Git for your operating system
- Use default settings during installation

## Getting the App Files

### Option A: Using Git (Recommended)
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want the app folder:
   ```
   cd Desktop
   ```
3. Download the app:
   ```
   git clone [YOUR_REPOSITORY_URL]
   cd workout-tracker
   ```

### Option B: Download as ZIP
1. Download the project as a ZIP file
2. Extract it to your Desktop or Documents folder
3. Remember the folder location

## Setting Up the App

### Step 1: Open Terminal/Command Prompt
- **Windows**: Press Windows key + R, type `cmd`, press Enter
- **Mac**: Press Cmd + Space, type "Terminal", press Enter

### Step 2: Navigate to the App Folder
Type this command (replace with your actual folder path):
```
cd Desktop/workout-tracker
```

### Step 3: Install Required Components
This downloads all the pieces the app needs to work:
```
npm install
```
*This may take 2-3 minutes. You'll see lots of text scrolling - this is normal!*

### Step 4: Start the App
Run this command to start the workout tracker:
```
npm run dev
```

### Step 5: Open the App
1. Wait for the message "serving on port 5000"
2. Open your web browser (Chrome, Firefox, Safari, etc.)
3. Go to: `http://localhost:5000`
4. You should see the workout tracker app!

## Using the App

Once the app is running:

1. **Log Workouts**: Click "Start New Workout" to begin tracking
2. **Add Exercises**: Select exercises and enter weight (in kg) and reps
3. **Use Timers**: Track your workout time and rest between sets
4. **View History**: See all your past workouts
5. **Check Stats**: View your progress charts and statistics
6. **Export Data**: Download your workout data as CSV or JSON files

## Stopping the App

When you're done using the app:
1. Go back to Terminal/Command Prompt
2. Press `Ctrl + C` (Windows) or `Cmd + C` (Mac)
3. Close the browser tab
4. Close Terminal/Command Prompt

## Starting the App Again Later

To use the app again:
1. Open Terminal/Command Prompt
2. Navigate to the app folder: `cd Desktop/workout-tracker`
3. Start the app: `npm run dev`
4. Open browser to: `http://localhost:5000`

## Important Notes

### Data Storage
- Your workout data is stored temporarily in memory
- Data will be lost when you stop the app
- Always export your data before closing if you want to keep it

### Troubleshooting

**App won't start?**
- Make sure Node.js is installed: type `node --version` in terminal
- Make sure you're in the right folder: `ls` (Mac) or `dir` (Windows) should show package.json

**Browser shows error?**
- Wait a few seconds after running `npm run dev`
- Try refreshing the browser page
- Make sure you're going to `http://localhost:5000`

**Port already in use?**
- Another app might be using port 5000
- Stop other development apps first
- Or change the port in the code

### Getting Help

If you run into problems:
1. Make sure Node.js is properly installed
2. Check that you're in the correct folder
3. Try closing and reopening Terminal/Command Prompt
4. Restart your computer if nothing else works

## App Features Overview

### Main Features
- **Workout Logging**: Track exercises, sets, reps, and weights
- **Body Part Classification**: Automatically categorizes upper/lower body exercises
- **Built-in Timers**: Session timer and rest timer with presets
- **Progress Tracking**: View statistics and progress charts
- **Workout History**: Browse and filter past workouts
- **Data Export**: Export workout data in CSV or JSON format

### Exercise Database
The app comes with common exercises pre-loaded:
- Bench Press, Squats, Deadlifts
- Pull-ups, Push-ups, Rows
- And many more...

You can also add custom exercises for any movement not included.

### Metric System
All weights are measured in kilograms (kg) for consistency with international standards.

---

*This workout tracker helps you log and analyze your fitness progress. Keep track of your gains and stay motivated on your fitness journey!*