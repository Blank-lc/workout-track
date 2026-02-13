const { useState, useEffect } = React;
const { Calendar, Dumbbell, TrendingUp, History, Settings, Plus, Trash2, CheckCircle, XCircle } = lucideReact;

function WorkoutTracker() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutData, setWorkoutData] = useState({});
  const [history, setHistory] = useState([]);
  const [lastReset, setLastReset] = useState(new Date().toDateString());
  const [todayPerformance, setTodayPerformance] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [newExercise, setNewExercise] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const defaultCategories = {
    chest: {
      name: 'Chest / Arm Day',
      exercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Flies', 'Push-ups', 'Chest Dips', 'Pec Deck']
    },
    back: {
      name: 'Back / Shoulder Day',
      exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Cable Row', 'Face Pulls']
    },
    legs: {
      name: 'Leg Day',
      exercises: ['Squats', 'Leg Press', 'Lunges', 'Leg Curls', 'Leg Extensions', 'Calf Raises']
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
  }, []);

  const toggleExercise = (exercise) => {
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(selectedExercises.filter(e => e !== exercise));
    } else if (selectedExercises.length < 4) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const updateWorkoutData = (exercise, field, value) => {
    setWorkoutData({
      ...workoutData,
      [exercise]: {
        ...workoutData[exercise],
        [field]: field === 'intensity' ? value : (parseFloat(value) || 0)
      }
    });
  };

  const toggleMetricType = (exercise, metricType) => {
    setWorkoutData({
      ...workoutData,
      [exercise]: {
        ...workoutData[exercise],
        metricType: metricType,
        // Reset values when switching
        weight: 0,
        reps: 0,
        intensity: 'low',
        time: 0
      }
    });
  };

  const getComparison = (exercise) => {
    const current = workoutData[exercise];
    if (!current) return null;

    const metricType = current.metricType || 'weight-reps';
    
    let currentVolume;
    if (metricType === 'weight-reps') {
      if (!current.weight || !current.reps) return null;
      currentVolume = current.weight * current.reps;
    } else {
      // intensity-time
      if (!current.intensity || !current.time) return null;
      const intensityValue = current.intensity === 'high' ? 2 : 1;
      currentVolume = intensityValue * current.time;
    }
    
    // Find last time this exercise was done
    const lastEntry = [...history].reverse().find(entry => 
      entry.exercises.some(e => e.name === exercise)
    );

    if (!lastEntry) return null;

    const lastExercise = lastEntry.exercises.find(e => e.name === exercise);
    
    let lastVolume;
    if (lastExercise.metricType === 'intensity-time') {
      const intensityValue = lastExercise.intensity === 'high' ? 2 : 1;
      lastVolume = intensityValue * lastExercise.time;
    } else {
      lastVolume = lastExercise.weight * lastExercise.reps;
    }

    return currentVolume >= lastVolume ? 'better' : 'worse';
  };

  const saveWorkout = () => {
    const workout = {
      date: new Date().toISOString(),
      dayType: selectedDay,
      exercises: selectedExercises.map(ex => {
        const data = workoutData[ex] || {};
        const metricType = data.metricType || 'weight-reps';
        
        if (metricType === 'weight-reps') {
          return {
            name: ex,
            metricType: 'weight-reps',
            weight: data.weight || 0,
            reps: data.reps || 0
          };
        } else {
          return {
            name: ex,
            metricType: 'intensity-time',
            intensity: data.intensity || 'low',
            time: data.time || 0
          };
        }
      })
    };

    // Calculate overall performance
    let betterCount = 0;
    let worseCount = 0;
    selectedExercises.forEach(ex => {
      const comparison = getComparison(ex);
      if (comparison === 'better') betterCount++;
      if (comparison === 'worse') worseCount++;
    });

    // Find the most recent workout to get the baseline exercise count
    const lastWorkout = history.length > 0 ? history[history.length - 1] : null;
    const lastExerciseCount = lastWorkout ? lastWorkout.exercises.length : selectedExercises.length;
    
    // Need to beat/match 75% of the last workout's exercise count
    const requiredBetter = Math.ceil(lastExerciseCount * 0.75);
    const performance = betterCount >= requiredBetter ? 'better' : 'worse';
    
    setTodayPerformance(performance);
    localStorage.setItem('todayPerformance', performance);
    localStorage.setItem('performanceDate', new Date().toDateString());

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
    }
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
            <Dumbbell className="inline-block w-12 h-12 mb-2 text-blue-400" />
            <h1 className="text-3xl font-bold">Workout Tracker</h1>
            <p className="text-slate-400 mt-2">Select your training day</p>
            
            {todayPerformance && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {todayPerformance === 'better' ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="text-green-500 font-semibold">Great work today!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500" />
                    <span className="text-red-500 font-semibold">Keep pushing!</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(categories).map(([categoryId, category], index) => (
              <button
                key={categoryId}
                onClick={() => { 
                  setSelectedDay(categoryId); 
                  setSelectedExercises([]); // Clear previous selections
                  setWorkoutData({}); // Clear previous workout data
                  setCurrentView('exercises'); 
                }}
                className={`w-full ${categoryColors[index % categoryColors.length]} text-white font-semibold py-4 px-6 rounded-lg transition transform hover:scale-105`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('history')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              View History
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exercise Selection View
  if (currentView === 'exercises') {
    const currentCategory = categories[selectedDay];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="text-slate-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold mb-2">{currentCategory.name}</h2>
          <p className="text-slate-400 mb-6">Select 1-4 exercises ({selectedExercises.length}/4)</p>

          <div className="space-y-3 mb-8">
            {currentCategory.exercises.map(exercise => (
              <button
                key={exercise}
                onClick={() => toggleExercise(exercise)}
                disabled={!selectedExercises.includes(exercise) && selectedExercises.length >= 4}
                className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                  selectedExercises.includes(exercise)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {exercise}
              </button>
            ))}
          </div>

          {selectedExercises.length > 0 && (
            <button
              onClick={() => setCurrentView('input')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Continue to Input
            </button>
          )}
        </div>
      </div>
    );
  }

  // Input View
  if (currentView === 'input') {
    const allFilled = selectedExercises.every(ex => {
      const data = workoutData[ex];
      if (!data) return false;
      const metricType = data.metricType || 'weight-reps';
      if (metricType === 'weight-reps') {
        return data.weight > 0 && data.reps > 0;
      } else {
        return data.intensity && data.time > 0;
      }
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

                  {/* Input fields based on metric type */}
                  {metricType === 'weight-reps' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Weight (lbs)</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                          value={workoutData[exercise]?.weight || ''}
                          onChange={(e) => updateWorkoutData(exercise, 'weight', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Reps</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                          value={workoutData[exercise]?.reps || ''}
                          onChange={(e) => updateWorkoutData(exercise, 'reps', e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Intensity</label>
                        <select
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                          value={workoutData[exercise]?.intensity || 'low'}
                          onChange={(e) => updateWorkoutData(exercise, 'intensity', e.target.value)}
                        >
                          <option value="low">Low</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Time (min)</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                          value={workoutData[exercise]?.time || ''}
                          onChange={(e) => updateWorkoutData(exercise, 'time', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
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
            <Calendar className="w-6 h-6" />
            Workout History
          </h2>

          {history.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No workouts logged yet!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...history].reverse().map((workout, idx) => {
                const categoryName = categories[workout.dayType]?.name || workout.dayType;
                return (
                  <div key={idx} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{categoryName}</h3>
                      <span className="text-sm text-slate-400">{formatDate(workout.date)}</span>
                    </div>
                    <div className="space-y-2">
                      {workout.exercises.map((ex, i) => {
                        const metricType = ex.metricType || 'weight-reps';
                        const displayText = metricType === 'weight-reps'
                          ? `${ex.weight} lbs × ${ex.reps} reps`
                          : `${ex.intensity} × ${ex.time} min`;
                        
                        return (
                          <div key={i} className="text-sm bg-slate-700 p-2 rounded flex justify-between">
                            <span>{ex.name}</span>
                            <span className="text-slate-400">{displayText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
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
            <Settings className="w-6 h-6" />
            Customize Workout Categories
          </h2>

          {/* Add new category button */}
          {Object.keys(categories).length < 7 && !addingCategory && (
            <button
              onClick={() => setAddingCategory(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6"
            >
              <Plus className="w-5 h-5" />
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
                          <Trash2 className="w-5 h-5" />
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
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add exercise */}
                {editingDay === categoryId ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New exercise name"
                      className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                      value={newExercise}
                      onChange={(e) => setNewExercise(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addExercise(categoryId);
                          setEditingDay(null);
                        }
                      }}
                    />
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
                      }}
                      className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDay(categoryId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
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
      </div>
    );
  }
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WorkoutTracker />);
