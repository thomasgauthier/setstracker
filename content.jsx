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
  const [sets, setSets] = useState('1');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSets, setEditingSets] = useState([]);
  const [editingCombo, setEditingCombo] = useState(null);
  const [exerciseSearchOpen, setExerciseSearchOpen] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedExercise || !reps || !sets) return;

    const setsCount = parseInt(sets);
    const newEntries = [];
    
    for (let i = 0; i < setsCount; i++) {
      const entry = {
        id: Date.now() + i,
        exercise: selectedExercise,
        reps: parseInt(reps),
        lb: lb ? parseFloat(lb) : null,
        date: new Date().toDateString(),
        timestamp: Date.now() + i
      };
      newEntries.push(entry);
    }

    setEntries([...entries, ...newEntries]);
    setSelectedExercise('');
    setReps('');
    setLb('');
    setSets('1');
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

  // Searchable exercise dropdown
  const exerciseDropdownRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (exerciseDropdownRef.current && !exerciseDropdownRef.current.contains(e.target)) {
        setExerciseSearchOpen(false);
        setExerciseSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredExercises = exercises
    .filter(ex => ex.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
    .sort();

  const ExercisePicker = ({ value, onValueChange }) => (
    <div ref={exerciseDropdownRef} className="relative">
      {/* Selected value display */}
      <button
        type="button"
        onClick={() => {
          if (!showNewExerciseInput) {
            setExerciseSearchOpen(!exerciseSearchOpen);
            setExerciseSearchQuery(value ? exercises.find(e => e === value)?.toLowerCase() || '' : '');
          }
        }}
        disabled={showNewExerciseInput}
        className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between gap-2 ${
          exerciseSearchOpen && !showNewExerciseInput
            ? 'border-blue-500 ring-2 ring-blue-500 focus:border-transparent'
            : 'border-gray-300'
        } ${showNewExerciseInput ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'} ${
          showNewExerciseInput ? 'bg-white' : 'bg-white'
        }`}
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {value || 'Select exercise'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${exerciseSearchOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {exerciseSearchOpen && !showNewExerciseInput && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={exerciseSearchQuery}
                onChange={(e) => setExerciseSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {exerciseSearchQuery && (
                <button
                  onClick={() => setExerciseSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Exercise list */}
          <div className="max-h-44 overflow-y-auto">
            {filteredExercises.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-400 text-center">
                No exercises found
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => {
                    onValueChange(exercise);
                    setExerciseSearchOpen(false);
                    setExerciseSearchQuery('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors ${
                    exercise === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {exercise === value && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className={exercise === value ? '' : 'ml-6'}>{exercise}</span>
                </button>
              ))
            )}
          </div>

          {/* Add new exercise link */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                onValueChange('new');
                setExerciseSearchOpen(false);
                setShowNewExerciseInput(true);
              }}
              className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new exercise...
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const handleEditSubmit = () => {
    if (!selectedExercise || editingSets.length === 0 || editingSets.some(set => !set.reps)) return;

    const updatedEntries = editingSets.map(set => ({
      ...set,
      exercise: selectedExercise
    }));

    setEntries(entries.map(entry => {
      const updatedEntry = updatedEntries.find(updated => updated.id === entry.id);
      return updatedEntry || entry;
    }));
    
    setEditingSets([]);
    setEditingCombo(null);
    setSelectedExercise('');
    setReps('');
    setLb('');
    setShowEditModal(false);
  };

  const handleDeleteSet = (group, combo) => {
    const entriesToDelete = group.entries.filter(entry => 
      entry.reps === combo.reps && 
      (entry.lb || null) === (combo.lb || null)
    );
    
    if (entriesToDelete.length === 0) return;
    
    const entryToDelete = entriesToDelete[0];
    const updatedEntries = entries.filter(entry => entry.id !== entryToDelete.id);
    
    setEntries(updatedEntries);
  };

  const handleAddSet = (group, combo) => {
    const newEntry = {
      id: Date.now(),
      exercise: group.exercise,
      reps: combo.reps,
      lb: combo.lb,
      date: group.date,
      timestamp: Date.now()
    };
    
    setEntries([...entries, newEntry]);
  };

  const getGroupedEntries = () => {
    const grouped = {};
    
    entries.forEach(entry => {
      const key = `${entry.date}-${entry.exercise}`;
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
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    {true ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">Set breakdown:</div>
                        {Object.values(group.setCombinations)
                          .sort((a, b) => a.reps - b.reps || (a.lb || 0) - (b.lb || 0))
                          .map((combo, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                              <span className="font-medium text-gray-800">
                                {combo.sets}x{combo.reps} reps
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {combo.lb ? `@ ${combo.lb}lb` : '@ bodyweight'}
                                </span>
                                <button
                                  onClick={() => {
                                    const allEntriesWithCombo = group.entries.filter(entry => 
                                      entry.reps === combo.reps && 
                                      (entry.lb || null) === (combo.lb || null)
                                    );
                                    if (allEntriesWithCombo.length > 0) {
                                      setEditingSets(allEntriesWithCombo);
                                      setEditingCombo(combo);
                                      setSelectedExercise(allEntriesWithCombo[0].exercise);
                                      setReps(allEntriesWithCombo[0].reps.toString());
                                      setLb(allEntriesWithCombo[0].lb ? allEntriesWithCombo[0].lb.toString() : '');
                                      setShowEditModal(true);
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit set"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <div className="flex rounded-full border border-gray-300 overflow-hidden">
                                  <button
                                    onClick={() => handleDeleteSet(group, combo)}
                                    className={`px-2 py-1 transition-colors ${
                                      combo.sets <= 1 
                                        ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                    title={combo.sets <= 1 ? "Delete entry" : "Remove set"}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleAddSet(group, combo)}
                                    className="px-2 py-1 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors border-l border-gray-300"
                                    title="Add set"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
) : null && (                      <div className="flex items-center justify-between">
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
                    <ExercisePicker value={selectedExercise} onValueChange={(v) => v === 'new' ? setShowNewExerciseInput(true) : setSelectedExercise(v)} />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sets</label>
                  <input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder="Number of sets"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedExercise || !reps || !sets}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add {sets} Set{sets !== '1' ? 's' : ''}
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
                      setSets('1');
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

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Edit {editingSets.length} Set{editingSets.length !== 1 ? 's' : ''}
              </h2>
              
              <div className="space-y-6">
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
                    <ExercisePicker value={selectedExercise} onValueChange={(v) => v === 'new' ? setShowNewExerciseInput(true) : setSelectedExercise(v)} />
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Individual Sets:</h3>
                  {editingSets.map((set, index) => (
                    <div key={set.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Set {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Reps</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const updatedSets = [...editingSets];
                              updatedSets[index] = { ...set, reps: parseInt(e.target.value) || 0 };
                              setEditingSets(updatedSets);
                            }}
                            placeholder="Number of reps"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">LB (Weight)</label>
                          <input
                            type="number"
                            value={set.lb || ''}
                            onChange={(e) => {
                              const updatedSets = [...editingSets];
                              updatedSets[index] = { ...set, lb: e.target.value ? parseFloat(e.target.value) : null };
                              setEditingSets(updatedSets);
                            }}
                            placeholder="Weight in lbs"
                            step="0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEditSubmit}
                    disabled={!selectedExercise || editingSets.some(set => !set.reps)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Update All Sets
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowNewExerciseInput(false);
                      setNewExercise('');
                      setEditingSets([]);
                      setEditingCombo(null);
                      setSelectedExercise('');
                      setReps('');
                      setLb('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);