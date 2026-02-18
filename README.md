# Workout Tracker

A comprehensive workout tracking PWA built with React and Tailwind CSS.

## Features

- 📊 **Multiple Workout Categories**: Track Chest/Arm, Back/Shoulder, Leg, and Cardio workouts
- 💪 **Multiple Sets**: Log multiple sets per exercise with progressive overload tracking
- 📈 **Progress Graph**: Visualize your performance with color-coded graphs (grades 1-10)
- 🏆 **Trophies & Achievements**: Earn awards for workout milestones and consistency
- 🔥 **Streak Tracking**: Build and maintain workout streaks
- 📅 **Calendar View**: See your complete workout history at a glance
- ⭐ **Exercise Grading**: Get grades based on performance vs your best of last 5 workouts
- 🎯 **Cardio Tracking**: Duration and intensity-based tracking with custom messages
- 🎨 **Customizable**: Add custom categories and exercises
- 💾 **Local Storage**: All data saved locally in your browser

## Scoring System

### Weight Training
- Score = Total weight lifted (weight × reps, summed across all sets)
- Grade compares current workout to best of last 5 in same category
- Green/red arrows show progressive overload status

### Cardio
- Score = Total duration in minutes
- Grade based on duration compared to best of last 5
- Custom messages based on intensity breakdown (high/moderate/low)

## Grading Scale

- **10!!!** - Beat your best score (new personal record)
- **10!** - Matched your best score
- **10** - 90-100% of your best
- **9** - 80-90% of your best
- **8** - 70-80% of your best
- Down to **1** for 0-10% of your best

## Setup for GitHub Pages

1. **Fork or clone this repository**

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`), folder: `/ (root)`
   - Save

3. **Access your tracker**:
   - Your site will be available at: `https://yourusername.github.io/workout-tracker/`
   - May take a few minutes to deploy

## Local Development

Simply open `index.html` in a web browser. No build process required!

## File Structure

```
workout-tracker/
├── index.html       # Main HTML file with React/Tailwind CDN links
├── app.jsx          # Main React component with all functionality
└── README.md        # This file
```

## Data Storage

All data is stored in browser localStorage:
- `workoutHistory` - All completed workouts
- `customCategories` - Your category customizations
- `todayPerformance` - Current day's performance status
- `todayGrade` - Current day's grade
- `todayScore` - Current day's score

## Browser Compatibility

Works on all modern browsers with localStorage support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Updates

To update your tracker:
1. Pull latest changes from this repo
2. GitHub Pages will automatically redeploy
3. Your workout data persists in localStorage

## Privacy

All data stays on your device. Nothing is sent to any server.

## License

MIT License - feel free to modify and use as you wish!
