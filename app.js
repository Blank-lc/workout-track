const { useState, useEffect } = React;

function WorkoutTracker() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutData, setWorkoutData] = useState({}); // Now stores arrays of sets per exercise
  const [history, setHistory] = useState([]);
  const [lastReset, setLastReset] = useState(new Date().toDateString());
  const [todayPerformance, setTodayPerformance] = useState(null);
  const [todayGrade, setTodayGrade] = useState(null);
  const [todayScore, setTodayScore] = useState(null);
  const [customPerformanceMessage, setCustomPerformanceMessage] = useState(null);
  const [showProgressGraph, setShowProgressGraph] = useState(false);
  const [barDetails, setBarDetails] = useState(null); // For showing clicked bar info
  const [graphViewMode, setGraphViewMode] = useState('all'); // 'all' or 'category'
  const [graphCategoryFilter, setGraphCategoryFilter] = useState('chest');
  const [editingDay, setEditingDay] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newExercise, setNewExercise] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [historyViewMode, setHistoryViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [trophiesViewMode, setTrophiesViewMode] = useState('awards'); // 'awards' or 'goals'
  const [expandedCategories, setExpandedCategories] = useState([]); // Track which categories are expanded
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null); // Track which calendar day is selected
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Comprehensive exercise database
  const commonExercises = [
    // Chest
    'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Press', 'Incline Dumbbell Press',
    'Cable Flies', 'Dumbbell Flies', 'Pec Deck', 'Push-ups', 'Chest Dips',
    // Back
    'Deadlift', 'Pull-ups', 'Chin-ups', 'Barbell Row', 'Dumbbell Row', 'T-Bar Row',
    'Lat Pulldown', 'Cable Row', 'Face Pulls', 'Shrugs',
    // Shoulders
    'Overhead Press', 'Military Press', 'Dumbbell Shoulder Press', 'Lateral Raises', 'Front Raises',
    'Rear Delt Flies', 'Arnold Press', 'Upright Row',
    // Arms
    'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl',
    'Tricep Dips', 'Skull Crushers', 'Tricep Pushdown', 'Overhead Tricep Extension', 'Close Grip Bench',
    // Legs
    'Squats', 'Front Squats', 'Leg Press', 'Lunges', 'Bulgarian Split Squats',
    'Leg Curls', 'Leg Extensions', 'Calf Raises', 'Romanian Deadlift', 'Hip Thrusts',
    // Core
    'Planks', 'Crunches', 'Sit-ups', 'Russian Twists', 'Leg Raises', 'Ab Wheel',
    // Cardio
    'Running', 'Cycling', 'Rowing', 'Elliptical', 'Stair Climber', 'Jump Rope', 'Swimming'
  ];

  // Exercise weighting system
  const exerciseWeights = {
    // Compound Multi-joint (3x) - Multiple joints, multiple muscle groups
    'Bench Press': 3, 'Incline Bench Press': 3, 'Decline Bench Press': 3,
    'Deadlift': 3, 'Squats': 3, 'Front Squats': 3,
    'Pull-ups': 3, 'Chin-ups': 3,
    'Overhead Press': 3, 'Military Press': 3,
    'Dips': 3, 'Chest Dips': 3, 'Tricep Dips': 3,
    'Push-ups': 3,
    'Barbell Row': 3, 'T-Bar Row': 3,
    'Lunges': 3, 'Bulgarian Split Squats': 3,
    'Hip Thrusts': 3, 'Romanian Deadlift': 3,
    
    // Compound Single-joint (2x) - Primarily one joint, but significant load
    'Dumbbell Press': 2, 'Incline Dumbbell Press': 2,
    'Dumbbell Shoulder Press': 2, 'Arnold Press': 2,
    'Leg Press': 2,
    'Dumbbell Row': 2, 'Cable Row': 2, 'Lat Pulldown': 2,
    'Close Grip Bench': 2,
    'Skull Crushers': 2,
    
    // Isolation (1x) - Single joint, single muscle group focus
    'Cable Flies': 1, 'Dumbbell Flies': 1, 'Pec Deck': 1,
    'Lateral Raises': 1, 'Front Raises': 1, 'Rear Delt Flies': 1,
    'Face Pulls': 1, 'Shrugs': 1, 'Upright Row': 1,
    'Barbell Curl': 1, 'Dumbbell Curl': 1, 'Hammer Curl': 1, 'Preacher Curl': 1, 'Cable Curl': 1,
    'Tricep Pushdown': 1, 'Overhead Tricep Extension': 1,
    'Leg Curls': 1, 'Leg Extensions': 1, 'Calf Raises': 1,
    'Planks': 1, 'Crunches': 1, 'Sit-ups': 1, 'Russian Twists': 1, 'Leg Raises': 1, 'Ab Wheel': 1,
    
    // Cardio (1x baseline, modified by intensity)
    'Running': 1, 'Cycling': 1, 'Rowing': 1, 'Elliptical': 1, 
    'Stair Climber': 1, 'Jump Rope': 1, 'Swimming': 1
  };

  // Helper function to get exercise weight
  const getExerciseWeight = (exerciseName) => {
    return exerciseWeights[exerciseName] || 1; // Default to 1x if not found
  };

  const defaultCategories = {
    chest: {
      name: 'Chest / Arm Day',
      exercises: [
        'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 
        'Dumbbell Press', 'Incline Dumbbell Press', 'Cable Flies', 
        'Dumbbell Flies', 'Pec Deck', 'Push-ups', 'Chest Dips',
        'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 
        'Cable Curl', 'Tricep Dips', 'Skull Crushers', 'Tricep Pushdown', 
        'Overhead Tricep Extension', 'Close Grip Bench'
      ]
    },
    back: {
      name: 'Back / Shoulder Day',
      exercises: [
        'Deadlift', 'Pull-ups', 'Chin-ups', 'Barbell Row', 
        'Dumbbell Row', 'T-Bar Row', 'Lat Pulldown', 'Cable Row', 
        'Face Pulls', 'Shrugs',
        'Overhead Press', 'Military Press', 'Dumbbell Shoulder Press', 
        'Lateral Raises', 'Front Raises', 'Rear Delt Flies', 
        'Arnold Press', 'Upright Row'
      ]
    },
    legs: {
      name: 'Leg Day',
      exercises: [
        'Squats', 'Front Squats', 'Leg Press', 'Lunges', 
        'Bulgarian Split Squats', 'Leg Curls', 'Leg Extensions', 
        'Calf Raises', 'Romanian Deadlift', 'Hip Thrusts'
      ]
    },
    cardio: {
      name: 'Cardio Day',
      exercises: [
        'Running', 'Cycling', 'Rowing', 'Elliptical', 
        'Stair Climber', 'Jump Rope', 'Swimming',
        'Planks', 'Crunches', 'Sit-ups', 'Russian Twists', 
        'Leg Raises', 'Ab Wheel'
      ]
    }
  };

  const [categories, setCategories] = useState(defaultCategories);

  // Check for midnight reset
  useEffect(() => {
    const checkReset = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== lastReset) {
        setLastReset(today);
        setCurrentView('home');
        setSelectedDay(null);
        setSelectedExercises([]);
        setWorkoutData({});
        setTodayPerformance(null);
        setTodayGrade(null);
        setTodayScore(null);
        setCustomPerformanceMessage(null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkReset);
  }, [lastReset]);

  // Load history and custom categories from storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('workoutHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    const savedPerformance = localStorage.getItem('todayPerformance');
    const savedDate = localStorage.getItem('performanceDate');
    if (savedPerformance && savedDate === new Date().toDateString()) {
      setTodayPerformance(savedPerformance);
    }

    const savedGrade = localStorage.getItem('todayGrade');
    const savedScore = localStorage.getItem('todayScore');
    const savedCustomMessage = localStorage.getItem('customPerformanceMessage');
    if (savedGrade && savedDate === new Date().toDateString()) {
      setTodayGrade(savedGrade);
      setTodayScore(savedScore);
      setCustomPerformanceMessage(savedCustomMessage);
    }
  }, []);

  const toggleExercise = (exercise) => {
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(selectedExercises.filter(e => e !== exercise));
      // Remove exercise data when unselected
      const newData = { ...workoutData };
      delete newData[exercise];
      setWorkoutData(newData);
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
      // Initialize with one empty set
      setWorkoutData({
        ...workoutData,
        [exercise]: {
          metricType: 'weight-reps',
          sets: [{ weight: 0, reps: 0 }]
        }
      });
    }
  };

  const addSet = (exercise) => {
    const exerciseData = workoutData[exercise];
    const metricType = exerciseData?.metricType || 'weight-reps';
    
    // For intensity-time, cap at 3 sets and find first unused intensity
    let newSet;
    if (metricType === 'weight-reps') {
      newSet = { weight: 0, reps: 0 };
    } else {
      // Check if already at 3 sets for intensity-time
      if (exerciseData.sets && exerciseData.sets.length >= 3) {
        return; // Don't add more than 3 sets for intensity-time
      }
      
      // Find which intensities are already used
      const usedIntensities = new Set(exerciseData.sets?.map(s => s.intensity) || []);
      const availableIntensities = ['low', 'moderate', 'high'].filter(i => !usedIntensities.has(i));
      
      newSet = { 
        intensity: availableIntensities[0] || 'low', 
        time: 0 
      };
    }
    
    setWorkoutData({
      ...workoutData,
      [exercise]: {
        ...exerciseData,
        sets: [...(exerciseData?.sets || []), newSet]
      }
    });
  };

  const removeSet = (exercise, setIndex) => {
    const exerciseData = workoutData[exercise];
    setWorkoutData({
      ...workoutData,
      [exercise]: {
        ...exerciseData,
        sets: exerciseData.sets.filter((_, idx) => idx !== setIndex)
      }
    });
  };

  const updateSetData = (exercise, setIndex, field, value) => {
    const exerciseData = workoutData[exercise];
    const updatedSets = exerciseData.sets.map((set, idx) => {
      if (idx === setIndex) {
        return {
          ...set,
          [field]: field === 'intensity' ? value : (parseFloat(value) || 0)
        };
      }
      return set;
    });

    setWorkoutData({
      ...workoutData,
      [exercise]: {
        ...exerciseData,
        sets: updatedSets
      }
    });
  };

  const toggleMetricType = (exercise, metricType) => {
    const newSet = metricType === 'weight-reps'
      ? { weight: 0, reps: 0 }
      : { intensity: 'low', time: 0 };

    setWorkoutData({
      ...workoutData,
      [exercise]: {
        metricType: metricType,
        sets: [newSet]
      }
    });
  };

  const getComparison = (exercise) => {
    const current = workoutData[exercise];
    if (!current || !current.sets || current.sets.length === 0) return null;

    const metricType = current.metricType || 'weight-reps';
    
    // Calculate TOTAL volume across all current sets
    let currentTotalVolume = 0;
    current.sets.forEach(set => {
      if (metricType === 'weight-reps') {
        if (!set.weight || !set.reps) return;
        currentTotalVolume += set.weight * set.reps;
      } else {
        if (!set.intensity || !set.time) return;
        const intensityValue = set.intensity === 'high' ? 2 : set.intensity === 'moderate' ? 1.5 : 1;
        currentTotalVolume += intensityValue * set.time;
      }
    });

    if (currentTotalVolume === 0) return null;
    
    // Find last time this exercise was done
    const lastEntry = [...history].reverse().find(entry => 
      entry.exercises.some(e => e.name === exercise)
    );

    if (!lastEntry) return null;

    const lastExercise = lastEntry.exercises.find(e => e.name === exercise);
    
    // Calculate TOTAL volume across all previous sets
    let lastTotalVolume = 0;
    if (lastExercise.sets && lastExercise.sets.length > 0) {
      lastExercise.sets.forEach(set => {
        if (lastExercise.metricType === 'intensity-time') {
          const intensityValue = set.intensity === 'high' ? 2 : set.intensity === 'moderate' ? 1.5 : 1;
          lastTotalVolume += intensityValue * set.time;
        } else {
          lastTotalVolume += set.weight * set.reps;
        }
      });
    } else {
      // Old format compatibility
      if (lastExercise.metricType === 'intensity-time') {
        const intensityValue = lastExercise.intensity === 'high' ? 2 : lastExercise.intensity === 'moderate' ? 1.5 : 1;
        lastTotalVolume = intensityValue * lastExercise.time;
      } else {
        lastTotalVolume = lastExercise.weight * lastExercise.reps;
      }
    }

    return currentTotalVolume >= lastTotalVolume ? 'better' : 'worse';
  };

  const saveWorkout = () => {
    // Calculate score: strictly weight x reps, summed across all sets
    let totalScore = 0;
    selectedExercises.forEach(ex => {
      const data = workoutData[ex] || {};
      const metricType = data.metricType || 'weight-reps';
      
      if (data.sets && data.sets.length > 0) {
        data.sets.forEach(set => {
          if (metricType === 'weight-reps') {
            totalScore += (set.weight || 0) * (set.reps || 0);
          } else {
            // Cardio: score is total duration in minutes
            totalScore += (set.time || 0);
          }
        });
      }
    });
    
    const workout = {
      date: new Date().toISOString(),
      dayType: selectedDay,
      exercises: selectedExercises.map(ex => {
        const data = workoutData[ex] || {};
        const metricType = data.metricType || 'weight-reps';
        
        return {
          name: ex,
          metricType: metricType,
          sets: data.sets || []
        };
      }),
      score: Math.round(totalScore)
    };

    // Calculate grade based on last 5 workouts from the SAME CATEGORY
    const recentWorkoutsInCategory = [...history]
      .filter(w => w.dayType === selectedDay) // Same category only
      .slice(-5);
    
    let grade = 10;
    let gradeDisplay = '10';
    let customPerformanceMessage = null; // For special cardio messages
    
    // Special logic for cardio workouts (check if any exercise uses intensity-time)
    let hasIntensityTimeExercise = false;
    selectedExercises.forEach(ex => {
      const data = workoutData[ex] || {};
      if (data.metricType === 'intensity-time') {
        hasIntensityTimeExercise = true;
      }
    });
    
    const isCardioWorkout = selectedDay === 'cardio' || hasIntensityTimeExercise;
    
    if (isCardioWorkout) {
      // Calculate total duration and intensity breakdown for this workout
      let totalDuration = 0;
      let highIntensityTime = 0;
      let moderateIntensityTime = 0;
      let lowIntensityTime = 0;
      
      selectedExercises.forEach(ex => {
        const data = workoutData[ex] || {};
        if (data.sets && data.sets.length > 0) {
          data.sets.forEach(set => {
            const time = set.time || 0;
            totalDuration += time;
            if (set.intensity === 'high') highIntensityTime += time;
            else if (set.intensity === 'moderate') moderateIntensityTime += time;
            else lowIntensityTime += time;
          });
        }
      });
      
      if (recentWorkoutsInCategory.length === 0) {
        // First cardio workout - this becomes the baseline
        grade = 10;
        gradeDisplay = '10';
        customPerformanceMessage = "Great first cardio workout! This is your baseline!";
      } else {
      
      // Find best duration from last 5 cardio workouts (raw duration, no intensity weighting)
      let bestDuration = 0;
      recentWorkoutsInCategory.forEach(w => {
        let workoutDuration = 0;
        w.exercises.forEach(ex => {
          if (ex.sets && ex.sets.length > 0) {
            ex.sets.forEach(set => {
              workoutDuration += set.time || 0;
            });
          } else if (ex.time) {
            // Old format
            workoutDuration += ex.time;
          }
        });
        if (workoutDuration > bestDuration) bestDuration = workoutDuration;
      });
      
      // Grade based on duration percentage ONLY
      const durationPercentage = bestDuration > 0 ? (totalDuration / bestDuration) * 100 : 100;
      
      // Calculate intensity breakdown for messages
      const highIntensityPercentage = totalDuration > 0 ? (highIntensityTime / totalDuration) * 100 : 0;
      const lowIntensityPercentage = totalDuration > 0 ? (lowIntensityTime / totalDuration) * 100 : 0;
      const moderateIntensityPercentage = totalDuration > 0 ? (moderateIntensityTime / totalDuration) * 100 : 0;
      
      if (totalDuration >= bestDuration) {
        // Beat or matched best duration - grade 10 with intensity-based messages
        grade = 10;
        
        if (highIntensityPercentage >= 50) {
          // 50%+ high intensity
          gradeDisplay = totalDuration > bestDuration ? '10!!!' : '10!';
          customPerformanceMessage = "High intensity! Nice work!";
        } else if (lowIntensityPercentage >= 60) {
          // 60%+ low intensity
          gradeDisplay = totalDuration > bestDuration ? '10!!!' : '10!';
          customPerformanceMessage = "Good job! Let's ramp up the intensity next time!";
        } else {
          // Moderate/balanced (30-60% low, or moderate dominant)
          gradeDisplay = totalDuration > bestDuration ? '10!!!' : '10!';
          customPerformanceMessage = "Great work! Keep it up!";
        }
      } else {
        // Lower grades based on duration percentage
        
        if (durationPercentage >= 90) {
          grade = 10;
          if (highIntensityPercentage >= 50) {
            customPerformanceMessage = "High intensity! Nice work!";
          } else if (lowIntensityPercentage >= 60) {
            customPerformanceMessage = "Good job! Let's ramp up the intensity next time!";
          } else {
            customPerformanceMessage = "Great work! Keep it up!";
          }
        }
        else if (durationPercentage >= 80) {
          grade = 9;
          if (highIntensityPercentage >= 50) {
            customPerformanceMessage = "Almost there! High intensity pays off!";
          } else if (lowIntensityPercentage >= 60) {
            customPerformanceMessage = "Almost there! Try adding more intensity!";
          } else {
            customPerformanceMessage = "So close! Just a bit more next time!";
          }
        }
        else if (durationPercentage >= 70) {
          grade = 8;
          if (highIntensityPercentage >= 50) {
            customPerformanceMessage = "Good effort! Keep that intensity up!";
          } else if (lowIntensityPercentage >= 60) {
            customPerformanceMessage = "Good effort! Let's increase the intensity!";
          } else {
            customPerformanceMessage = "Great work! Push a little harder next time!";
          }
        }
        else if (durationPercentage >= 60) {
          grade = 7;
          if (highIntensityPercentage >= 50) {
            customPerformanceMessage = "Solid workout! Love the intensity!";
          } else if (lowIntensityPercentage >= 60) {
            customPerformanceMessage = "Solid workout! More intensity will help!";
          } else {
            customPerformanceMessage = "Solid workout! Keep building on this!";
          }
        }
        else if (durationPercentage >= 50) {
          grade = 6;
          if (highIntensityPercentage >= 50) {
            customPerformanceMessage = "Halfway there! Intensity is on point!";
          } else if (lowIntensityPercentage >= 60) {
            customPerformanceMessage = "Halfway there! More intensity will help!";
          } else {
            customPerformanceMessage = "Halfway there! Keep pushing!";
          }
        }
        else if (durationPercentage >= 40) {
          grade = 5;
          customPerformanceMessage = "You got this! Try to extend your workout!";
        }
        else if (durationPercentage >= 30) {
          grade = 4;
          customPerformanceMessage = "Every minute counts! Keep building!";
        }
        else if (durationPercentage >= 20) {
          grade = 3;
          customPerformanceMessage = "Good start! Work up to longer sessions!";
        }
        else if (durationPercentage >= 10) {
          grade = 2;
          customPerformanceMessage = "You showed up! That's what matters!";
        }
        else {
          grade = 1;
          customPerformanceMessage = "You're here! Build from this!";
        }
        
        gradeDisplay = grade.toString();
      }
      } // End of cardio workout with previous history
    } else if (recentWorkoutsInCategory.length > 0) {
      // Regular weight training logic
      const recentScores = recentWorkoutsInCategory.map(w => w.score || 0);
      const bestScore = Math.max(...recentScores);
      
      if (totalScore >= bestScore) {
        if (totalScore > bestScore) {
          gradeDisplay = '10!!!';
          customPerformanceMessage = "New personal best! Absolutely crushing it!";
        } else {
          gradeDisplay = '10!';
          customPerformanceMessage = "Matched your best! Incredible consistency!";
        }
        grade = 10;
      } else {
        const percentage = (totalScore / bestScore) * 100;
        
        if (percentage >= 90) {
          grade = 10;
          customPerformanceMessage = "So close to your best! Keep pushing!";
        }
        else if (percentage >= 80) {
          grade = 9;
          customPerformanceMessage = "Strong session! You're right there!";
        }
        else if (percentage >= 70) {
          grade = 8;
          customPerformanceMessage = "Solid work! A little more and you'll hit your best!";
        }
        else if (percentage >= 60) {
          grade = 7;
          customPerformanceMessage = "Good effort! Keep building that strength!";
        }
        else if (percentage >= 50) {
          grade = 6;
          customPerformanceMessage = "Halfway to your best! Keep showing up!";
        }
        else if (percentage >= 40) {
          grade = 5;
          customPerformanceMessage = "Getting there! Every rep counts!";
        }
        else if (percentage >= 30) {
          grade = 4;
          customPerformanceMessage = "Keep grinding! Progress takes time!";
        }
        else if (percentage >= 20) {
          grade = 3;
          customPerformanceMessage = "You showed up! Now let's build on this!";
        }
        else if (percentage >= 10) {
          grade = 2;
          customPerformanceMessage = "Tough day but you did it! Come back stronger!";
        }
        else {
          grade = 1;
          customPerformanceMessage = "You're here and that matters! Keep going!";
        }
        
        gradeDisplay = grade.toString();
      }
    }
    
    // First workout in this category - no previous history to compare
    if (grade === 10 && gradeDisplay === '10' && !customPerformanceMessage) {
      customPerformanceMessage = "First session logged! This is your baseline!";
    }

    // Save grade onto the workout object so the graph can read it directly
    workout.grade = grade;
    workout.gradeDisplay = gradeDisplay;

    // Every completed workout gets positive performance
    const performance = 'better';
    
    setTodayPerformance(performance);
    setTodayGrade(gradeDisplay);
    setTodayScore(totalScore.toString());
    setCustomPerformanceMessage(customPerformanceMessage); // SET THE STATE!
    localStorage.setItem('todayPerformance', performance);
    localStorage.setItem('performanceDate', new Date().toDateString());
    localStorage.setItem('todayGrade', gradeDisplay);
    localStorage.setItem('todayScore', totalScore.toString());
    
    // Store custom message if exists
    if (customPerformanceMessage) {
      localStorage.setItem('customPerformanceMessage', customPerformanceMessage);
    } else {
      localStorage.removeItem('customPerformanceMessage');
    }

    const newHistory = [...history, workout];
    setHistory(newHistory);
    localStorage.setItem('workoutHistory', JSON.stringify(newHistory));
    
    alert('Workout saved! 💪');
    setCurrentView('home');
    setSelectedDay(null);
    setSelectedExercises([]);
    setWorkoutData({});
  };

  const addExercise = (categoryId) => {
    if (newExercise.trim()) {
      const updated = {
        ...categories,
        [categoryId]: {
          ...categories[categoryId],
          exercises: [...categories[categoryId].exercises, newExercise.trim()]
        }
      };
      setCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
      setNewExercise('');
      setShowSuggestions(false);
    }
  };

  const handleExerciseInput = (value) => {
    setNewExercise(value);
    
    if (value.trim().length > 0) {
      // Filter suggestions based on input
      const filtered = commonExercises.filter(exercise =>
        exercise.toLowerCase().includes(value.toLowerCase())
      );
      setExerciseSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (exercise) => {
    setNewExercise(exercise);
    setShowSuggestions(false);
  };

  const removeExercise = (categoryId, exercise) => {
    const updated = {
      ...categories,
      [categoryId]: {
        ...categories[categoryId],
        exercises: categories[categoryId].exercises.filter(ex => ex !== exercise)
      }
    };
    setCategories(updated);
    localStorage.setItem('customCategories', JSON.stringify(updated));
  };

  const addCategory = () => {
    if (newCategoryName.trim() && Object.keys(categories).length < 7) {
      const categoryId = 'category_' + Date.now();
      const updated = {
        ...categories,
        [categoryId]: {
          name: newCategoryName.trim(),
          exercises: []
        }
      };
      setCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
      setNewCategoryName('');
      setAddingCategory(false);
    }
  };

  const removeCategory = (categoryId) => {
    const updated = {};
    Object.entries(categories).forEach(([id, cat]) => {
      if (id !== categoryId) {
        updated[id] = cat;
      }
    });
    setCategories(updated);
    localStorage.setItem('customCategories', JSON.stringify(updated));
    setDeletingCategoryId(null);
  };

  const updateCategoryName = (categoryId, newName) => {
    if (newName.trim()) {
      const updated = {
        ...categories,
        [categoryId]: {
          ...categories[categoryId],
          name: newName.trim()
        }
      };
      setCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Home View
  if (currentView === 'home') {
    const categoryColors = ['bg-blue-600 hover:bg-blue-700', 'bg-purple-600 hover:bg-purple-700', 'bg-green-600 hover:bg-green-700', 'bg-orange-600 hover:bg-orange-700', 'bg-pink-600 hover:bg-pink-700', 'bg-indigo-600 hover:bg-indigo-700', 'bg-teal-600 hover:bg-teal-700'];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            💪
            <h1 className="text-3xl font-bold">Workout Tracker</h1>
            <p className="text-slate-400 mt-2">Select your training day</p>
            
            <div className="mt-4">
              {/* Single row: streak left, message center, grade right */}
              <div className="relative flex items-center justify-center min-h-[40px] px-14">
                {/* Streak Tracker - Absolute Left */}
                {(() => {
                  // Calculate current streak
                  const calculateStreak = () => {
                    if (history.length === 0) return 0;
                    
                    let streak = 0;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Create a set of dates with workouts
                    const workoutDates = new Set();
                    history.forEach(workout => {
                      const date = new Date(workout.date);
                      date.setHours(0, 0, 0, 0);
                      workoutDates.add(date.toDateString());
                    });
                    
                    // Check if today has a workout
                    const hasWorkoutToday = workoutDates.has(today.toDateString());
                    
                    // Start from today or yesterday depending on if today has a workout
                    let checkDate = new Date(today);
                    if (!hasWorkoutToday) {
                      checkDate.setDate(checkDate.getDate() - 1);
                    }
                    
                    // Count consecutive days backwards
                    while (workoutDates.has(checkDate.toDateString())) {
                      streak++;
                      checkDate.setDate(checkDate.getDate() - 1);
                    }
                    
                    return streak;
                  };
                  
                  const currentStreak = calculateStreak();
                  
                  // Check if today has a workout to determine if streak should be faded
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const hasWorkoutToday = history.some(workout => {
                    const workoutDate = new Date(workout.date);
                    workoutDate.setHours(0, 0, 0, 0);
                    return workoutDate.toDateString() === today.toDateString();
                  });
                  
                  if (currentStreak > 0) {
                    return (
                      <div className={`absolute left-0 flex items-center gap-1 ${!hasWorkoutToday ? 'opacity-30' : ''}`}>
                        <span className="text-xl">🔥</span>
                        <span className="text-lg font-bold text-orange-400">{currentStreak}</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Performance Message - Centered */}
                {todayPerformance && (
                  <div className="text-center text-sm leading-tight max-w-[160px]">
                    {todayPerformance === 'better' ? (
                      <span className="text-green-500 font-semibold">
                        {(() => {
                            if (customPerformanceMessage) return customPerformanceMessage;
                            const todayWorkout = history.length > 0 && 
                              new Date(history[history.length - 1].date).toDateString() === new Date().toDateString() &&
                              history[history.length - 1].dayType === 'rest';
                            if (todayWorkout) {
                              const recentWorkouts = history.slice(-2);
                              const consecutiveRestDays = recentWorkouts.filter(w => w.dayType === 'rest').length;
                              if (consecutiveRestDays === 2) return "Let's get a workout tomorrow!";
                              return 'Recovery day complete!';
                            }
                            return 'Great work today!';
                          })()}
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Keep pushing!
                      </span>
                    )}
                  </div>
                )}

                {/* Workout Grade - Absolute Right */}
                {todayGrade && todayScore && (
                  <div className="absolute right-0">
                    <div className="bg-slate-800 py-1 px-3 rounded-lg border-2 border-yellow-500">
                      <div className="text-xl font-bold text-yellow-400">{todayGrade}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(categories).map(([categoryId, category], index) => (
              <button
                key={categoryId}
                onClick={() => { 
                  setSelectedDay(categoryId); 
                  setSelectedExercises([]);
                  setWorkoutData({});
                  setCurrentView('exercises'); 
                }}
                className={`w-full ${categoryColors[index % categoryColors.length]} text-white font-semibold py-4 px-6 rounded-lg transition transform hover:scale-105`}
              >
                {category.name}
              </button>
            ))}
            
            {/* Rest Day Button */}
            <button
              onClick={() => { 
                setSelectedDay('rest'); 
                setSelectedExercises(['Rest']); 
                setWorkoutData({}); 
                setCurrentView('exercises'); 
              }}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-4 px-6 rounded-lg transition transform hover:scale-105"
            >
              😴 Rest Day
            </button>
          </div>

          <div className="space-y-3">
            {/* Progress Graph Button - always visible */}
            <button
              onClick={() => setShowProgressGraph(true)}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              📊
              View Progress Graph
            </button>
            
            
            <button
              onClick={() => setCurrentView('history')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              📜
              View History
            </button>
            <button
              onClick={() => setCurrentView('trophies')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              🏆
              Trophies
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              ⚙️
              Settings
            </button>
          </div>
        </div>

        {/* Progress Graph Modal */}
        {showProgressGraph && (() => {
          // Get filtered workouts based on view mode
          const filteredWorkouts = graphViewMode === 'all' 
            ? history.slice(-7)
            : history.filter(w => w.dayType === graphCategoryFilter).slice(-7);
          
          return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowProgressGraph(false)}>
              <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full border-2 border-yellow-500" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-yellow-400">Progress Graph</h3>
                  <button
                    onClick={() => setShowProgressGraph(false)}
                    className="text-slate-400 hover:text-white text-3xl"
                  >
                    ×
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setGraphViewMode('all')}
                    className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                      graphViewMode === 'all'
                        ? 'bg-yellow-500 text-slate-900'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    All Workouts
                  </button>
                  <button
                    onClick={() => setGraphViewMode('category')}
                    className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                      graphViewMode === 'category'
                        ? 'bg-yellow-500 text-slate-900'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    By Category
                  </button>
                </div>

                {/* Category Dropdown - only show in category mode */}
                {graphViewMode === 'category' && (
                  <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">Select Category:</label>
                    <select
                      value={graphCategoryFilter}
                      onChange={(e) => setGraphCategoryFilter(e.target.value)}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border-2 border-slate-600 focus:border-yellow-500 focus:outline-none"
                    >
                      {Object.entries(categories).map(([id, cat]) => (
                        <option key={id} value={id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Show message if not enough workouts */}
                {filteredWorkouts.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    No workouts found for this category yet. Complete some workouts to see your progress!
                  </div>
                ) : (
                  <>
                    {/* Vertical Bar Graph */}
                    <div className="flex items-end justify-around gap-3 h-80 bg-slate-900/50 rounded-lg p-4 border-b-2 border-slate-700">
                      {filteredWorkouts.map((workout, idx) => {
                  const score = workout.score || 0;
                  const categoryName = workout.dayType === 'rest' ? 'Rest' : (categories[workout.dayType]?.name || workout.dayType);
                  const date = new Date(workout.date);
                  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                  
                  // Use saved grade directly from workout object
                  const grade = workout.grade || (workout.dayType !== 'rest' && score > 0 ? 10 : 0);
                  const gradeDisplay = workout.gradeDisplay || (workout.dayType !== 'rest' && score > 0 ? '10' : '-');
                  
                  const heightPercent = Math.max((grade / 10) * 100, score > 0 ? 10 : 2);
                  
                  // Get category color based on position in categories object
                  const categoryColorMap = {
                    'chest': 'from-blue-500 to-blue-600',
                    'back': 'from-purple-500 to-purple-600',
                    'legs': 'from-green-500 to-green-600',
                    'cardio': 'from-orange-500 to-orange-600',
                  };
                  
                  // Use category color in both modes
                  const categoryColor = categoryColorMap[workout.dayType] || 'from-yellow-500 to-orange-500';
                  const barColor = score > 0 ? `bg-gradient-to-t ${categoryColor}` : 'bg-slate-600';
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex flex-col items-center justify-end flex-1 min-w-0 h-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (workout.dayType === 'rest') {
                          setBarDetails({
                            categoryName: 'Rest Day',
                            dateStr,
                            isRest: true
                          });
                        } else {
                          const scoreText = workout.dayType === 'cardio' 
                            ? `${score} minutes`
                            : `${score.toLocaleString()} lbs lifted`;
                          setBarDetails({
                            categoryName,
                            dateStr,
                            scoreText,
                            gradeDisplay,
                            isRest: false
                          });
                        }
                      }}
                    >
                      {/* Grade label above bar */}
                      <div className="text-xs text-yellow-400 font-bold mb-1 whitespace-nowrap">
                        {gradeDisplay}
                      </div>
                      
                      {/* Vertical bar container */}
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div 
                          className={`w-full ${barColor} rounded-t transition-all duration-500 relative group min-h-[8px]`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                            {categoryName}
                            {score > 0 && (
                              <div className="text-yellow-400">
                                {workout.dayType === 'cardio' 
                                  ? `${score} mins`
                                  : `${score.toLocaleString()} lbs`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Date label */}
                      <div className="text-xs text-slate-400 mt-2 whitespace-nowrap">
                        {dateStr}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  {graphViewMode === 'all' 
                    ? 'Grades are based on your performance in each category! 💪'
                    : `Showing last ${filteredWorkouts.length} ${categories[graphCategoryFilter]?.name || ''} workouts`
                  }
                </p>
                
                {/* Color Legend - only in All Workouts mode */}
                {graphViewMode === 'all' && (
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded"></div>
                      <span className="text-xs text-slate-400">{categories.chest?.name || 'Chest/Arm'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-600 rounded"></div>
                      <span className="text-xs text-slate-400">{categories.back?.name || 'Back/Shoulder'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-600 rounded"></div>
                      <span className="text-xs text-slate-400">{categories.legs?.name || 'Legs'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gradient-to-t from-orange-500 to-orange-600 rounded"></div>
                      <span className="text-xs text-slate-400">{categories.cardio?.name || 'Cardio'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bar Details Popup */}
              {barDetails && (
                <div className="absolute inset-0 flex items-center justify-center z-10" onClick={() => setBarDetails(null)}>
                  <div className="bg-slate-800 border-2 border-yellow-500 rounded-lg p-4 m-4 max-w-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400 mb-2">{barDetails.categoryName}</div>
                      <div className="text-sm text-slate-400 mb-3">{barDetails.dateStr}</div>
                      {!barDetails.isRest && (
                        <>
                          <div className="text-xl font-bold text-white mb-2">{barDetails.scoreText}</div>
                          <div className="text-2xl font-bold text-yellow-400">Grade: {barDetails.gradeDisplay}</div>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => setBarDetails(null)}
                      className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
            </div>
          </div>
        );
        })()}
      </div>
    );
  }

  // Exercise Selection View
  if (currentView === 'exercises') {
    const currentCategory = categories[selectedDay];
    const isRestDay = selectedDay === 'rest';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="text-slate-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          {isRestDay ? (
            /* Rest Day View */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😴</div>
              <h2 className="text-3xl font-bold mb-2">Rest Day</h2>
              <p className="text-slate-400 mb-8">Recovery is just as important as training!</p>
              
              <button
                onClick={() => {
                  // Save rest day
                  const workout = {
                    date: new Date().toISOString(),
                    dayType: 'rest',
                    exercises: [{
                      name: 'Rest',
                      metricType: 'rest'
                    }]
                  };

                  // Check last 2 days for consecutive rest
                  const recentWorkouts = history.slice(-2);
                  const consecutiveRestDays = recentWorkouts.filter(w => w.dayType === 'rest').length;
                  
                  // If this would be 3rd rest day in a row, mark as worse
                  const performance = consecutiveRestDays >= 2 ? 'worse' : 'better';
                  
                  setTodayPerformance(performance);
                  setCustomPerformanceMessage(null); // Clear any custom messages
                  setTodayGrade(null); // Clear grade state
                  setTodayScore(null); // Clear score state
                  localStorage.setItem('todayPerformance', performance);
                  localStorage.setItem('performanceDate', new Date().toDateString());
                  localStorage.removeItem('customPerformanceMessage'); // Clear custom message
                  localStorage.removeItem('todayGrade'); // Clear grade too
                  localStorage.removeItem('todayScore'); // Clear score too

                  const newHistory = [...history, workout];
                  setHistory(newHistory);
                  localStorage.setItem('workoutHistory', JSON.stringify(newHistory));
                  
                  if (consecutiveRestDays >= 2) {
                    alert('Rest logged! But 3 rest days in a row - time to get moving! 💪');
                  } else if (consecutiveRestDays === 1) {
                    alert("Let's get a workout tomorrow! 💪");
                  } else {
                    alert('Give those muscles time to recover! 💤');
                  }
                  
                  setCurrentView('home');
                  setSelectedDay(null);
                  setSelectedExercises([]);
                  setWorkoutData({});
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg text-lg"
              >
                Log Rest Day
              </button>
            </div>
          ) : (
            /* Regular Exercise Selection */
            <>
              <h2 className="text-2xl font-bold mb-2">{currentCategory.name}</h2>
              <p className="text-slate-400 mb-6">Select exercises ({selectedExercises.length} selected)</p>

              <div className="space-y-3 mb-8">
                {(() => {
                  // Get recently used exercises for this category from history
                  const recentExercises = [...history]
                    .reverse()
                    .filter(w => w.dayType === selectedDay)
                    .flatMap(w => w.exercises.map(e => e.name))
                    .filter((ex, idx, arr) => arr.indexOf(ex) === idx) // unique
                    .slice(0, 5); // top 5 most recent

                  // Sort: recently used first, then alphabetically
                  const sortedExercises = [...currentCategory.exercises].sort((a, b) => {
                    const aRecent = recentExercises.indexOf(a);
                    const bRecent = recentExercises.indexOf(b);
                    
                    // Both recent: sort by recency
                    if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
                    // Only a is recent
                    if (aRecent !== -1) return -1;
                    // Only b is recent
                    if (bRecent !== -1) return 1;
                    // Neither recent: alphabetical
                    return a.localeCompare(b);
                  });

                  return (
                    <>
                      {recentExercises.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-500 mb-2">Recently Used</p>
                        </div>
                      )}
                      {sortedExercises.map((exercise, idx) => {
                        const isRecent = recentExercises.includes(exercise);
                        return (
                          <button
                            key={exercise}
                            onClick={() => toggleExercise(exercise)}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                              selectedExercises.includes(exercise)
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            } ${isRecent ? 'border-2 border-blue-400' : ''}`}
                          >
                            {isRecent && '⭐ '}{exercise}
                          </button>
                        );
                      })}
                    </>
                  );
                })()}
              </div>

              {selectedExercises.length > 0 && (
                <button
                  onClick={() => setCurrentView('input')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Continue to Input
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Input View
  if (currentView === 'input') {
    const allFilled = selectedExercises.every(ex => {
      const data = workoutData[ex];
      if (!data || !data.sets || data.sets.length === 0) return false;
      const metricType = data.metricType || 'weight-reps';
      
      // Check that all sets are filled
      return data.sets.every(set => {
        if (metricType === 'weight-reps') {
          return set.weight > 0 && set.reps > 0;
        } else {
          return set.intensity && set.time > 0;
        }
      });
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('exercises')}
            className="text-slate-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold mb-6">Enter Your Sets</h2>

          <div className="space-y-6 mb-8">
            {selectedExercises.map(exercise => {
              const comparison = getComparison(exercise);
              const metricType = workoutData[exercise]?.metricType || 'weight-reps';
              
              return (
                <div key={exercise} className="bg-slate-800 p-4 rounded-lg border-2 border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{exercise}</h3>
                    {comparison && (
                      <div className={`px-2 py-1 rounded text-sm font-bold ${
                        comparison === 'better' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {comparison === 'better' ? '↑' : '↓'}
                      </div>
                    )}
                  </div>

                  {/* Metric type toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => toggleMetricType(exercise, 'weight-reps')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                        metricType === 'weight-reps'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Weight × Reps
                    </button>
                    <button
                      onClick={() => toggleMetricType(exercise, 'intensity-time')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                        metricType === 'intensity-time'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Intensity × Time
                    </button>
                  </div>

                  {/* Input fields for each set */}
                  <div className="space-y-3">
                    {(workoutData[exercise]?.sets || []).map((set, setIndex) => (
                      <div key={setIndex}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-300">Set {setIndex + 1}</label>
                          {setIndex > 0 && (
                            <button
                              onClick={() => removeSet(exercise, setIndex)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {metricType === 'weight-reps' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Weight (lbs)</label>
                              <input
                                type="number"
                                placeholder="0"
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                                value={set.weight || ''}
                                onChange={(e) => updateSetData(exercise, setIndex, 'weight', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Reps</label>
                              <input
                                type="number"
                                placeholder="0"
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                                value={set.reps || ''}
                                onChange={(e) => updateSetData(exercise, setIndex, 'reps', e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Intensity</label>
                              <select
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                                value={set.intensity || 'low'}
                                onChange={(e) => updateSetData(exercise, setIndex, 'intensity', e.target.value)}
                              >
                                {(() => {
                                  // Get all used intensities except the current set's intensity
                                  const usedIntensities = (workoutData[exercise]?.sets || [])
                                    .map((s, idx) => idx !== setIndex ? s.intensity : null)
                                    .filter(Boolean);
                                  
                                  return (
                                    <>
                                      <option value="low" disabled={usedIntensities.includes('low')}>Low</option>
                                      <option value="moderate" disabled={usedIntensities.includes('moderate')}>Moderate</option>
                                      <option value="high" disabled={usedIntensities.includes('high')}>High</option>
                                    </>
                                  );
                                })()}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Time (min)</label>
                              <input
                                type="number"
                                placeholder="0"
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                                value={set.time || ''}
                                onChange={(e) => updateSetData(exercise, setIndex, 'time', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Set Button - hidden for intensity-time at 3 sets */}
                    {!(metricType === 'intensity-time' && (workoutData[exercise]?.sets?.length >= 3)) && (
                      <button
                        onClick={() => addSet(exercise)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded border-2 border-slate-600 hover:border-blue-500 transition flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">+</span>
                        <span>Add Set</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={saveWorkout}
            disabled={!allFilled}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Save Workout
          </button>
        </div>
      </div>
    );
  }

  // History View
  if (currentView === 'history') {
    // Helper function to get workouts for a specific date
    const getWorkoutsForDate = (date) => {
      const dateStr = new Date(date).toDateString();
      return history.filter(workout => {
        const workoutDate = new Date(workout.date).toDateString();
        return workoutDate === dateStr;
      });
    };

    // Generate calendar days
    const generateCalendarDays = () => {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startingDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      
      const days = [];
      
      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const workouts = getWorkoutsForDate(date);
        days.push({ date, day, workouts });
      }
      
      return days;
    };

    const previousMonth = () => {
      setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
    };

    const nextMonth = () => {
      setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
    };

    const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const calendarDays = generateCalendarDays();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="text-slate-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📅
              Workout History
            </h2>
            
            {/* Toggle between list and calendar */}
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  historyViewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setHistoryViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  historyViewMode === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              📜
              <p>No workouts logged yet!</p>
            </div>
          ) : historyViewMode === 'list' ? (
            /* List View */
            <div className="space-y-4">
              {[...history].reverse().map((workout, idx) => {
                const isRestDay = workout.dayType === 'rest';
                const categoryName = isRestDay ? 'Rest Day' : (categories[workout.dayType]?.name || workout.dayType);
                
                return (
                  <div key={idx} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        {isRestDay && '😴'} {categoryName}
                      </h3>
                      <span className="text-sm text-slate-400">{formatDate(workout.date)}</span>
                    </div>
                    {!isRestDay && (
                      <div className="space-y-3">
                        {workout.exercises.map((ex, i) => {
                          const metricType = ex.metricType || 'weight-reps';
                          
                          return (
                            <div key={i} className="bg-slate-700 p-2 rounded">
                              <div className="font-medium text-sm mb-1">{ex.name}</div>
                              {ex.sets && ex.sets.length > 0 ? (
                                <div className="space-y-1">
                                  {ex.sets.map((set, setIdx) => {
                                    const displayText = metricType === 'weight-reps'
                                      ? `${set.weight} lbs × ${set.reps} reps`
                                      : `${set.intensity} × ${set.time} min`;
                                    return (
                                      <div key={setIdx} className="text-xs text-slate-400 flex justify-between">
                                        <span>Set {setIdx + 1}</span>
                                        <span>{displayText}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                // Old format compatibility
                                <div className="text-xs text-slate-400">
                                  {metricType === 'weight-reps'
                                    ? `${ex.weight} lbs × ${ex.reps} reps`
                                    : `${ex.intensity} × ${ex.time} min`}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Calendar View */
            <div>
              {/* Month navigation */}
              <div className="flex justify-between items-center mb-4 bg-slate-800 p-4 rounded-lg">
                <button
                  onClick={previousMonth}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ←
                </button>
                <h3 className="text-xl font-semibold">{monthName}</h3>
                <button
                  onClick={nextMonth}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  →
                </button>
              </div>

              {/* Calendar grid */}
              <div className="bg-slate-800 p-4 rounded-lg">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayData, idx) => {
                    if (!dayData) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const { date, day, workouts } = dayData;
                    const isToday = new Date().toDateString() === date.toDateString();
                    const hasWorkout = workouts.length > 0;
                    // Check if most recent workout is a rest day, not all workouts
                    const mostRecentWorkout = workouts[workouts.length - 1];
                    const isRestDay = hasWorkout && mostRecentWorkout.dayType === 'rest';

                    return (
                      <button
                        key={day}
                        onClick={() => hasWorkout ? setSelectedCalendarDay({ date, workouts }) : null}
                        disabled={!hasWorkout}
                        className={`aspect-square p-1 rounded-lg border-2 ${
                          isToday 
                            ? 'border-blue-500 bg-blue-900/30' 
                            : isRestDay
                            ? 'border-slate-400 bg-slate-600/30'
                            : hasWorkout
                            ? 'border-green-500 bg-green-900/30'
                            : 'border-slate-700 bg-slate-700/30'
                        } ${hasWorkout ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      >
                        <div className="h-full flex flex-col">
                          <div className="text-center text-sm font-medium">{day}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-4 text-xs text-slate-400 justify-center flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
                    <span>Workout</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-slate-400 rounded"></div>
                    <span>Rest</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Calendar Day Details Modal */}
          {selectedCalendarDay && (() => {
            // Get only the most recent workout from that day
            const mostRecentWorkout = selectedCalendarDay.workouts[selectedCalendarDay.workouts.length - 1];
            const isRestDay = mostRecentWorkout.dayType === 'rest';
            const categoryName = isRestDay ? 'Rest Day' : (categories[mostRecentWorkout.dayType]?.name || mostRecentWorkout.dayType);
            
            return (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCalendarDay(null)}>
                <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border-2 border-slate-700" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">
                      {formatDate(selectedCalendarDay.date)}
                    </h3>
                    <button
                      onClick={() => setSelectedCalendarDay(null)}
                      className="text-slate-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-slate-700">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      {isRestDay && '😴'} {categoryName}
                    </h4>
                    {!isRestDay && (
                      <div className="space-y-2">
                        {mostRecentWorkout.exercises.map((ex, i) => {
                          const metricType = ex.metricType || 'weight-reps';
                          
                          return (
                            <div key={i} className="bg-slate-600 p-2 rounded">
                              <div className="font-medium text-sm mb-1">{ex.name}</div>
                              {ex.sets && ex.sets.length > 0 ? (
                                <div className="space-y-1">
                                  {ex.sets.map((set, setIdx) => {
                                    const displayText = metricType === 'weight-reps'
                                      ? `${set.weight} lbs × ${set.reps} reps`
                                      : `${set.intensity} × ${set.time} min`;
                                    return (
                                      <div key={setIdx} className="text-xs text-slate-300 flex justify-between">
                                        <span>Set {setIdx + 1}</span>
                                        <span>{displayText}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                // Old format compatibility
                                <div className="text-xs text-slate-300">
                                  {metricType === 'weight-reps'
                                    ? `${ex.weight} lbs × ${ex.reps} reps`
                                    : `${ex.intensity} × ${ex.time} min`}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // Trophies View
  if (currentView === 'trophies') {
    // Calculate achievement progress for each category
    const getAchievements = () => {
      const achievements = [];
      
      // Add achievements for each workout category
      Object.entries(categories).forEach(([categoryId, category]) => {
        const sessions = history.filter(w => w.dayType === categoryId).length;
        const milestones = [5, 10, 25, 50, 100];
        
        // Find the next uncompleted milestone or the highest completed one
        let targetMilestone = milestones.find(m => sessions < m);
        if (!targetMilestone) {
          targetMilestone = milestones[milestones.length - 1]; // Show highest if all complete
        }
        
        const completed = sessions >= targetMilestone;
        const progress = Math.min(sessions, targetMilestone);
        const emoji = targetMilestone === 5 ? '🥉' : targetMilestone === 10 ? '🥈' : targetMilestone === 25 ? '🥇' : targetMilestone === 50 ? '💎' : '👑';
        
        achievements.push({
          id: `${categoryId}-${targetMilestone}`,
          categoryName: category.name,
          categoryId: categoryId,
          milestone: targetMilestone,
          progress: progress,
          completed: completed,
          emoji: emoji
        });
      });
      
      // Add rest day achievement
      const restSessions = history.filter(w => w.dayType === 'rest').length;
      const restMilestones = [5, 10, 25];
      let targetRestMilestone = restMilestones.find(m => restSessions < m);
      if (!targetRestMilestone) {
        targetRestMilestone = restMilestones[restMilestones.length - 1];
      }
      
      achievements.push({
        id: `rest-${targetRestMilestone}`,
        categoryName: 'Rest Days',
        categoryId: 'rest',
        milestone: targetRestMilestone,
        progress: Math.min(restSessions, targetRestMilestone),
        completed: restSessions >= targetRestMilestone,
        emoji: targetRestMilestone === 5 ? '😴' : targetRestMilestone === 10 ? '💤' : '🛌'
      });
      
      // Add total workout achievement
      const totalWorkouts = history.filter(w => w.dayType !== 'rest').length;
      const totalMilestones = [10, 25, 50, 100, 200];
      let targetTotalMilestone = totalMilestones.find(m => totalWorkouts < m);
      if (!targetTotalMilestone) {
        targetTotalMilestone = totalMilestones[totalMilestones.length - 1];
      }
      
      achievements.push({
        id: `total-${targetTotalMilestone}`,
        categoryName: 'Total Workouts',
        categoryId: 'total',
        milestone: targetTotalMilestone,
        progress: Math.min(totalWorkouts, targetTotalMilestone),
        completed: totalWorkouts >= targetTotalMilestone,
        emoji: targetTotalMilestone === 10 ? '💪' : targetTotalMilestone === 25 ? '🔥' : targetTotalMilestone === 50 ? '⚡' : targetTotalMilestone === 100 ? '🎯' : '🌟'
      });
      
      return achievements;
    };

    const achievements = getAchievements();
    const completedCount = achievements.filter(a => a.completed).length;
    const totalCount = achievements.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="text-slate-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              🏆 Trophies
            </h2>
            
            {/* Toggle between Current Awards and Next Goals */}
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => setTrophiesViewMode('awards')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  trophiesViewMode === 'awards' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Current Awards
              </button>
              <button
                onClick={() => setTrophiesViewMode('goals')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  trophiesViewMode === 'goals' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Next Goals
              </button>
            </div>
          </div>

          {trophiesViewMode === 'awards' ? (
            /* Current Awards View */
            <>
              {/* Category Awards */}
              <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wide mb-3">Category Awards</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(categories).map(([categoryId, category]) => {
                  const sessions = history.filter(w => w.dayType === categoryId).length;
                  const milestones = [
                    { level: 5, name: 'Bronze', emoji: '🥉' },
                    { level: 10, name: 'Silver', emoji: '🥈' },
                    { level: 25, name: 'Gold', emoji: '🥇' },
                    { level: 50, name: 'Diamond', emoji: '💎' },
                    { level: 100, name: 'Crown', emoji: '👑' }
                  ];
                  
                  let currentAward = null;
                  let awardNumber = 0;
                  
                  for (let i = milestones.length - 1; i >= 0; i--) {
                    if (sessions >= milestones[i].level) {
                      currentAward = milestones[i];
                      awardNumber = i + 1;
                      break;
                    }
                  }
                  
                  return (
                    <div key={categoryId} className="bg-slate-800 p-4 rounded-lg text-center">
                      <p className="text-sm font-semibold mb-2">{category.name}</p>
                      {currentAward ? (
                        <>
                          <div className="text-5xl mb-2">{currentAward.emoji}</div>
                          <p className="text-xs font-semibold">{currentAward.name}</p>
                          <p className="text-xs text-slate-400">{awardNumber}/5</p>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl mb-2 opacity-20">🥉</div>
                          <p className="text-xs text-slate-500">No award</p>
                          <p className="text-xs text-slate-400">0/5</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exercise Awards */}
              <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wide mb-3">Exercise Awards</h3>
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  // Get all currently available exercises from categories
                  const availableExercises = new Set();
                  Object.values(categories).forEach(category => {
                    category.exercises.forEach(ex => availableExercises.add(ex));
                  });
                  
                  // Get all unique exercises from history
                  const exerciseCounts = {};
                  history.forEach(workout => {
                    if (workout.dayType !== 'rest') {
                      workout.exercises.forEach(ex => {
                        if (ex.name !== 'Rest' && availableExercises.has(ex.name)) {
                          exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
                        }
                      });
                    }
                  });

                  // Sort by most completed
                  const sortedExercises = Object.entries(exerciseCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 12); // Show top 12

                  const exerciseMilestones = [
                    { level: 5, emoji: '⭐' },
                    { level: 10, emoji: '🌟' },
                    { level: 25, emoji: '✨' }
                  ];

                  return sortedExercises.map(([exercise, count]) => {
                    let currentAward = null;
                    let awardNumber = 0;

                    for (let i = exerciseMilestones.length - 1; i >= 0; i--) {
                      if (count >= exerciseMilestones[i].level) {
                        currentAward = exerciseMilestones[i];
                        awardNumber = i + 1;
                        break;
                      }
                    }

                    return (
                      <div key={exercise} className="bg-slate-800 p-2 rounded-lg text-center">
                        <p className="text-xs font-medium mb-1 truncate">{exercise}</p>
                        {currentAward ? (
                          <>
                            <div className="text-2xl mb-1">{currentAward.emoji}</div>
                            <p className="text-xs text-slate-400">{awardNumber}/3</p>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl mb-1 opacity-20">⭐</div>
                            <p className="text-xs text-slate-500">0/3</p>
                          </>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          ) : (
            /* Next Goals View (existing code) */
            <>
          {/* Workout Categories */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wide">Workout Goals</h3>
            {Object.entries(categories).map(([categoryId, category]) => {
              const achievement = achievements.find(a => a.categoryId === categoryId);
              if (!achievement) return null;
              
              const isExpanded = expandedCategories.includes(categoryId);
              
              // Get exercise counts for exercises in this category (but count globally across all workouts)
              const categoryExercises = new Set(category.exercises); // Exercises that belong to this category
              const exerciseCounts = {};
              
              // Count how many times each exercise in this category has been done (across ALL categories)
              history.forEach(workout => {
                if (workout.dayType !== 'rest') {
                  workout.exercises.forEach(ex => {
                    // Only count exercises that are in this category's list
                    if (categoryExercises.has(ex.name)) {
                      exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
                    }
                  });
                }
              });
              
              return (
                <div key={achievement.id}>
                  <div 
                    className={`p-4 rounded-lg ${
                      achievement.completed 
                        ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-600' 
                        : 'bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{achievement.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            {category.name}
                            {achievement.completed && ' ✅'}
                          </p>
                          <button
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
                              } else {
                                setExpandedCategories([...expandedCategories, categoryId]);
                              }
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">
                          {achievement.milestone} sessions goal
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-700 rounded-full h-2 flex-1 overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                achievement.completed ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${(achievement.progress / achievement.milestone) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-300 font-medium min-w-[3rem] text-right">
                            {achievement.progress}/{achievement.milestone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Exercise Goals Dropdown */}
                  {isExpanded && Object.keys(exerciseCounts).length > 0 && (
                    <div className="mt-2 bg-slate-700 p-3 rounded-lg space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Exercise Goals</p>
                      {Object.entries(exerciseCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([exercise, count]) => {
                          const exerciseMilestones = [5, 10, 25];
                          const nextMilestone = exerciseMilestones.find(m => count < m) || exerciseMilestones[exerciseMilestones.length - 1];
                          const completed = count >= nextMilestone;
                          
                          return (
                            <div key={exercise} className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                              <span className="text-lg">{completed ? '✨' : count >= 10 ? '🌟' : count >= 5 ? '⭐' : '⭐'}</span>
                              <div className="flex-1">
                                <p className="text-xs font-medium">{exercise}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="bg-slate-600 rounded-full h-1.5 flex-1 overflow-hidden">
                                    <div 
                                      className="h-full bg-purple-500 transition-all"
                                      style={{ width: `${(count / nextMilestone) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-400 min-w-[2.5rem] text-right">
                                    {count}/{nextMilestone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rest Days */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wide">Recovery Goal</h3>
            {(() => {
              const achievement = achievements.find(a => a.categoryId === 'rest');
              if (!achievement) return null;
              
              return (
                <div 
                  className={`p-4 rounded-lg ${
                    achievement.completed 
                      ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-2 border-blue-600' 
                      : 'bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{achievement.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Rest Days
                        {achievement.completed && ' ✅'}
                      </p>
                      <p className="text-sm text-slate-400 mb-2">
                        {achievement.milestone} rest days goal
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700 rounded-full h-2 flex-1 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              achievement.completed ? 'bg-blue-500' : 'bg-blue-400'
                            }`}
                            style={{ width: `${(achievement.progress / achievement.milestone) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-300 font-medium min-w-[3rem] text-right">
                          {achievement.progress}/{achievement.milestone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Total Workouts */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wide">Overall Progress</h3>
            {(() => {
              const achievement = achievements.find(a => a.categoryId === 'total');
              if (!achievement) return null;
              
              return (
                <div 
                  className={`p-4 rounded-lg ${
                    achievement.completed 
                      ? 'bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-2 border-purple-600' 
                      : 'bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{achievement.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Total Workouts
                        {achievement.completed && ' ✅'}
                      </p>
                      <p className="text-sm text-slate-400 mb-2">
                        {achievement.milestone} workouts goal
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700 rounded-full h-2 flex-1 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              achievement.completed ? 'bg-purple-500' : 'bg-purple-400'
                            }`}
                            style={{ width: `${(achievement.progress / achievement.milestone) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-300 font-medium min-w-[3rem] text-right">
                          {achievement.progress}/{achievement.milestone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Settings View
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="text-slate-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ⚙️
            Customize Workout Categories
          </h2>

          {/* TEMPORARY: Reset to Defaults Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg mb-6 font-semibold"
          >
            🔄 Reset Categories to Defaults (Click to Reset)
          </button>

          {/* Add new category button */}
          {Object.keys(categories).length < 7 && !addingCategory && (
            <button
              onClick={() => setAddingCategory(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6"
            >
              ➕
              Add New Category ({Object.keys(categories).length}/7)
            </button>
          )}

          {/* Adding category form */}
          {addingCategory && (
            <div className="bg-slate-800 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">New Category</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Category name (e.g., 'Core Day')"
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') addCategory();
                  }}
                />
                <button
                  onClick={addCategory}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing categories */}
          <div className="space-y-6">
            {Object.entries(categories).map(([categoryId, category]) => (
              <div key={categoryId} className="bg-slate-800 p-4 rounded-lg">
                {/* Category header with rename/delete */}
                <div className="flex items-center justify-between mb-3">
                  {editingCategoryId === categoryId ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateCategoryName(categoryId, editCategoryName);
                            setEditingCategoryId(null);
                            setEditCategoryName('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          updateCategoryName(categoryId, editCategoryName);
                          setEditingCategoryId(null);
                          setEditCategoryName('');
                        }}
                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategoryId(null);
                          setEditCategoryName('');
                        }}
                        className="bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setEditingCategoryId(categoryId);
                            setEditCategoryName(category.name);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => setDeletingCategoryId(categoryId)}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/30 rounded transition"
                          title="Delete category"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Exercises list */}
                <div className="space-y-2 mb-4">
                  {category.exercises.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No exercises yet - add some below!</p>
                  ) : (
                    category.exercises.map(exercise => (
                      <div key={exercise} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                        <span>{exercise}</span>
                        <button
                          onClick={() => removeExercise(categoryId, exercise)}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add exercise */}
                {editingDay === categoryId ? (
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="New exercise name"
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                          value={newExercise}
                          onChange={(e) => handleExerciseInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addExercise(categoryId);
                              setEditingDay(null);
                            }
                          }}
                          onFocus={() => {
                            if (newExercise.trim().length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                        />
                        
                        {/* Autocomplete dropdown */}
                        {showSuggestions && exerciseSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-slate-700 border-2 border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {exerciseSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white"
                                onClick={() => selectSuggestion(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          addExercise(categoryId);
                          setEditingDay(null);
                        }}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setEditingDay(null);
                          setNewExercise('');
                          setShowSuggestions(false);
                        }}
                        className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDay(categoryId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
                  >
                    ➕
                    Add Exercise
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingCategoryId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border-2 border-slate-700">
              <h3 className="text-xl font-bold mb-2">Delete Category?</h3>
              <p className="text-slate-300 mb-6">
                Delete "{categories[deletingCategoryId]?.name}"? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => removeCategory(deletingCategoryId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeletingCategoryId(null)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-sm border-2 border-red-500">
              <h3 className="text-xl font-bold text-white mb-4">Reset Categories?</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to reset all categories to defaults? This will remove all custom categories and exercises. Your workout history will not be affected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCategories(defaultCategories);
                    localStorage.removeItem('customCategories');
                    setShowResetConfirm(false);
                    alert('Categories reset to defaults! ✅');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WorkoutTracker />);
