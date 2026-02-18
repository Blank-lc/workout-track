# Quick Setup Guide

## Option 1: GitHub Pages (Recommended)

1. **Create a new repository on GitHub**
   - Name it `workout-tracker` (or any name you want)
   - Make it Public
   - Don't initialize with README (we already have one)

2. **Upload these files**
   - Upload all files from this folder to your new repo
   - Or use git commands (see below)

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, folder: `/ (root)`
   - Click Save

4. **Access your app**
   - URL will be: `https://yourusername.github.io/workout-tracker/`
   - Takes 2-3 minutes to go live

## Option 2: Use Git Commands

```bash
# In your local folder with these files
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/workout-tracker.git
git push -u origin main
```

Then enable GitHub Pages in Settings.

## Option 3: Local Use

Just open `index.html` in your browser. Works offline!

## Updating Your Tracker

When you want to update with new features:

```bash
git add .
git commit -m "Update workout tracker"
git push
```

GitHub Pages will automatically redeploy (takes 2-3 minutes).

## Your Data

All workout data is saved in your browser's localStorage. It persists between updates!

To backup your data:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Copy the values for `workoutHistory`, `customCategories`, etc.
4. Save to a text file

To restore:
1. Paste the values back into Local Storage
2. Refresh the page
