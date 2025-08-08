import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('exercises');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [newExercise, setNewExercise] = useState('');
  const [showNewExerciseInput, setShowNewExerciseInput] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [reps, setReps] = useState('');
  const [lb, setLb] = useState('');
  const [mergeMode, setMergeMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedExercise || !reps) return;

    const entry = {
      id: Date.now(),
      exercise: selectedExercise,
      reps: parseInt(reps),
      lb: lb ? parseFloat(lb) : null,
      date: new Date().toDateString(),
      timestamp: Date.now()
    };

    setEntries([...entries, entry]);
    setSelectedExercise('');
    setReps('');
    setLb('');
    setShowNewExerciseInput(false);
    setNewExercise('');
    setShowForm(false);
  };

  const handleAddExercise = () => {
    if (!newExercise.trim()) return;
    setExercises([...exercises, newExercise.trim()]);
    setSelectedExercise(newExercise.trim());
    setNewExercise('');
    setShowNewExerciseInput(false);
  };

  const getGroupedEntries = () => {
    const grouped = {};
    
    entries.forEach(entry => {
      const key = mergeMode ? `${entry.date}-${entry.exercise}` : `${entry.date}-${entry.exercise}-${entry.reps}-${entry.lb || 0}`;
      if (!grouped[key]) {
        grouped[key] = {
          exercise: entry.exercise,
          date: entry.date,
          sets: 0,
          entries: [],
          repGroups: {},
          setCombinations: {}
        };
      }
      grouped[key].sets++;
      grouped[key].entries.push(entry);
      
      if (mergeMode) {
        const comboKey = `${entry.reps}-${entry.lb || 'bodyweight'}`;
        if (!grouped[key].repGroups[entry.reps]) {
          grouped[key].repGroups[entry.reps] = 0;
        }
        grouped[key].repGroups[entry.reps]++;
        
        if (!grouped[key].setCombinations[comboKey]) {
          grouped[key].setCombinations[comboKey] = {
            reps: entry.reps,
            lb: entry.lb,
            sets: 0
          };
        }
        grouped[key].setCombinations[comboKey].sets++;
      }
    });

    return Object.values(grouped).sort((a, b) => b.entries[0].timestamp - a.entries[0].timestamp);
  };

  const groupedEntries = getGroupedEntries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sets Tracker</h1>
          <p className="text-gray-600">Track your gym sets and reps</p>
          <button
            onClick={() => setMergeMode(!mergeMode)}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mergeMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {mergeMode ? '🔀 Merge Mode ON' : '🔀 Merge Mode OFF'}
          </button>
        </header>

        <div className="grid gap-4 mb-20">
          {groupedEntries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No entries yet</h3>
              <p className="text-gray-500">Start tracking your workouts by adding your first set</p>
            </div>
          ) : (
            groupedEntries.map((group, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{group.exercise}</h3>
                  <span className="text-sm text-gray-500">{group.date}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                      <span className="text-2xl font-bold">{group.sets}</span>
                      <span className="text-sm ml-1">sets</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {mergeMode ? 'merged' : 'per set'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    {mergeMode ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">Set breakdown:</div>
                        {Object.values(group.setCombinations)
                          .sort((a, b) => a.reps - b.reps || (a.lb || 0) - (b.lb || 0))
                          .map((combo, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                              <span className="font-medium text-gray-800">
                                {combo.sets}x{combo.reps} reps
                              </span>
                              <span className="text-sm text-gray-600">
                                {combo.lb ? `@ ${combo.lb}lb` : '@ bodyweight'}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{group.entries[0].reps}</div>
                            <div className="text-sm text-gray-600">reps</div>
                          </div>
                          {group.entries[0].lb !== null && group.entries[0].lb !== undefined && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-800">{group.entries[0].lb}</div>
                              <div className="text-sm text-gray-600">lb</div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {group.entries[0].lb ? `${group.entries[0].reps} @ ${group.entries[0].lb}lb` : `${group.entries[0].reps} reps`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Set</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exercise</label>
                  {showNewExerciseInput ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={newExercise}
                        onChange={(e) => setNewExercise(e.target.value)}
                        placeholder="New exercise name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddExercise}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex-shrink-0"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewExerciseInput(false);
                          setNewExercise('');
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={selectedExercise}
                        onChange={(e) => {
                          if (e.target.value === 'new') {
                            setShowNewExerciseInput(true);
                          } else {
                            setSelectedExercise(e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select exercise</option>
                        {exercises.map((exercise, index) => (
                          <option key={index} value={exercise}>{exercise}</option>
                        ))}
                        <option value="new">+ Add new exercise...</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reps</label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="Number of reps"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LB (Weight)</label>
                  <input
                    type="number"
                    value={lb}
                    onChange={(e) => setLb(e.target.value)}
                    placeholder="Weight in lbs"
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedExercise || !reps}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Set
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setShowNewExerciseInput(false);
                      setNewExercise('');
                      setSelectedExercise('');
                      setReps('');
                      setLb('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);