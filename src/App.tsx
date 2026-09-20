import React, { useState, useEffect, useMemo } from 'react';
import {
  MainNavView,
  ExerciseNavbar,
} from './components/exercise/ExerciseNavbar';
import { HomeExploreView } from './components/exercise/HomeExploreView';
import { CategoryPageView } from './components/exercise/CategoryPageView';
import { ExerciseDetailStudio } from './components/exercise/ExerciseDetailStudio';
import { WorkoutCircuitsView } from './components/exercise/WorkoutCircuitsView';
import { ExerciseStatsModal } from './components/exercise/ExerciseStatsModal';
import { ActivityTrackerView } from './components/exercise/ActivityTrackerView';
import { CategoryQuickNav } from './components/exercise/CategoryQuickNav';
import {
  EXERCISE_CATALOG,
  WORKOUT_CIRCUITS,
  ExerciseGuide,
  WorkoutCircuit,
  DemographicCategory,
  CATEGORY_DEFINITIONS,
} from './data/exerciseCatalogData';
import { Sparkles, Dumbbell, Flame, CheckCircle2, ChevronUp, Database, Search, Box, ChevronRight, X, ArrowLeft } from 'lucide-react';

interface CompletedLog {
  exerciseId: string;
  timestamp: number;
}

interface NavHistoryItem {
  view: MainNavView;
  category?: DemographicCategory;
  exerciseId?: string;
  label: string;
}

export default function App() {
  // Page / View Routing State
  const [currentView, setCurrentView] = useState<MainNavView>('home');
  const [activeCategory, setActiveCategory] = useState<DemographicCategory>('kids');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('kids_star_jumps');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);

  // Navigation History Stack for robust Back Navigation
  const [navHistory, setNavHistory] = useState<NavHistoryItem[]>([]);

  // Completed History stored in localStorage and backend database
  const [completedHistory, setCompletedHistory] = useState<CompletedLog[]>(() => {
    try {
      const saved = localStorage.getItem('kinetic_completed_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Fetch initial history from backend database on mount
  useEffect(() => {
    fetch('/api/exercise/logs')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logs && data.logs.length > 0) {
          const formatted = data.logs.map((l: any) => ({
            exerciseId: l.exerciseId,
            timestamp: new Date(l.timestamp).getTime(),
          }));
          setCompletedHistory((prev) => {
            const combined = [...formatted, ...prev];
            const unique = Array.from(new Set(combined.map((a) => a.exerciseId + a.timestamp))).map((key) =>
              combined.find((a) => a.exerciseId + a.timestamp === key)!
            );
            return unique;
          });
        }
      })
      .catch((err) => console.warn('Database logs offline:', err));
  }, []);

  // Sync completed history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kinetic_completed_history', JSON.stringify(completedHistory));
    } catch {}
  }, [completedHistory]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Category counts for navbar badges
  const categoryCounts = useMemo(() => {
    return {
      all: EXERCISE_CATALOG.length,
      kids: EXERCISE_CATALOG.filter((e) => e.category === 'kids').length,
      seniors: EXERCISE_CATALOG.filter((e) => e.category === 'seniors').length,
      general_health: EXERCISE_CATALOG.filter((e) => e.category === 'general_health').length,
      cardio: EXERCISE_CATALOG.filter((e) => e.category === 'cardio').length,
      strength: EXERCISE_CATALOG.filter((e) => e.category === 'strength').length,
      core: EXERCISE_CATALOG.filter((e) => e.category === 'core').length,
      mobility: EXERCISE_CATALOG.filter((e) => e.category === 'mobility').length,
      creative: EXERCISE_CATALOG.filter((e) => e.category === 'creative').length,
      circuits: WORKOUT_CIRCUITS.length,
    };
  }, []);

  // Selected Active Exercise object
  const activeExercise = useMemo(() => {
    return EXERCISE_CATALOG.find((e) => e.id === selectedExerciseId) || EXERCISE_CATALOG[0];
  }, [selectedExerciseId]);

  // Exercises for active category
  const activeCategoryExercises = useMemo(() => {
    return EXERCISE_CATALOG.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  // Global search results across all exercises
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return EXERCISE_CATALOG.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.summary.toLowerCase().includes(q) ||
        ex.whatItIsDoing.toLowerCase().includes(q) ||
        ex.whoItsFor.toLowerCase().includes(q) ||
        ex.primaryMuscles.some((m) => m.toLowerCase().includes(q)) ||
        ex.benefits.some((b) => b.toLowerCase().includes(q)) ||
        ex.equipment.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Check if today is completed for the active exercise
  const isCompletedToday = useMemo(() => {
    const today = new Date().toDateString();
    return completedHistory.some(
      (log) => log.exerciseId === selectedExerciseId && new Date(log.timestamp).toDateString() === today
    );
  }, [completedHistory, selectedExerciseId]);

  const completedIds = useMemo(() => {
    return completedHistory.map((c) => c.exerciseId);
  }, [completedHistory]);

  // Push current state to navigation history stack before transitioning
  const pushToNavHistory = (label: string) => {
    setNavHistory((prev) => [
      ...prev,
      {
        view: currentView,
        category: activeCategory,
        exerciseId: selectedExerciseId,
        label,
      },
    ]);
  };

  // Universal Back Handler: Pops from history or defaults to home
  const handleGoBack = () => {
    if (navHistory.length > 0) {
      const prevItem = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setCurrentView(prevItem.view);
      if (prevItem.category) setActiveCategory(prevItem.category);
      if (prevItem.exerciseId) setSelectedExerciseId(prevItem.exerciseId);
    } else {
      if (currentView === 'exercise-studio') {
        setCurrentView('category');
      } else {
        setCurrentView('home');
      }
    }
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation Handlers with automatic history tracking
  const handleNavigateHome = () => {
    if (currentView !== 'home') {
      pushToNavHistory(currentView === 'category' ? `${CATEGORY_DEFINITIONS[activeCategory]?.shortLabel || 'Category'}` : currentView);
    }
    setCurrentView('home');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: DemographicCategory) => {
    pushToNavHistory(currentView === 'home' ? 'Home' : currentView === 'category' ? `${CATEGORY_DEFINITIONS[activeCategory]?.shortLabel || 'Category'}` : 'Studio');
    setActiveCategory(category);
    setCurrentView('category');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExercise = (exercise: ExerciseGuide) => {
    pushToNavHistory(currentView === 'category' ? `${CATEGORY_DEFINITIONS[activeCategory]?.shortLabel || 'Category'}` : 'Home');
    setSelectedExerciseId(exercise.id);
    setActiveCategory(exercise.category);
    setCurrentView('exercise-studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCircuits = () => {
    pushToNavHistory(currentView === 'home' ? 'Home' : currentView);
    setCurrentView('circuits');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateActivityTracker = () => {
    pushToNavHistory(currentView === 'home' ? 'Home' : currentView);
    setCurrentView('activity-tracker');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomExercise = () => {
    pushToNavHistory(currentView === 'home' ? 'Home' : currentView);
    const randomItem = EXERCISE_CATALOG[Math.floor(Math.random() * EXERCISE_CATALOG.length)] || EXERCISE_CATALOG[0];
    setSelectedExerciseId(randomItem.id);
    setActiveCategory(randomItem.category);
    setCurrentView('exercise-studio');
    showToast(`Loaded: ${randomItem.name}`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete & Log Exercise to Database
  const handleCompleteExercise = async (exercise: ExerciseGuide, reps?: number, duration?: number) => {
    const timestamp = Date.now();
    setCompletedHistory((prev) => [{ exerciseId: exercise.id, timestamp }, ...prev]);

    try {
      await fetch('/api/exercise/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          category: exercise.category,
          repsCompleted: reps || exercise.targetReps,
          durationSeconds: duration || exercise.targetSeconds || 30,
          caloriesBurned: 15,
        }),
      });
    } catch (err) {
      console.warn('Backend log sync error:', err);
    }

    showToast(`Logged to database: ${exercise.name} completed!`, 'success');
  };

  // Complete Circuit
  const handleCircuitFinished = async (circuit: WorkoutCircuit) => {
    const timestamp = Date.now();
    setCompletedHistory((prev) => [
      ...circuit.exerciseIds.map((id) => ({ exerciseId: id, timestamp })),
      ...prev,
    ]);

    for (const exId of circuit.exerciseIds) {
      const exObj = EXERCISE_CATALOG.find((e) => e.id === exId);
      try {
        await fetch('/api/exercise/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: exId,
            exerciseName: exObj?.name || exId,
            category: exObj?.category || 'general_health',
            durationSeconds: 45,
            caloriesBurned: 20,
          }),
        });
      } catch {}
    }

    showToast(`Circuit Complete: ${circuit.name}! Burned ${circuit.estimatedCalories}.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-[#d4d4d8] flex flex-col selection:bg-[#c5a059] selection:text-black">
      {/* Top Navbar */}
      <ExerciseNavbar
        currentView={currentView}
        activeCategory={activeCategory}
        onNavigateHome={handleNavigateHome}
        onSelectCategory={handleSelectCategory}
        onNavigateCircuits={handleNavigateCircuits}
        onNavigateActivityTracker={handleNavigateActivityTracker}
        onOpenStats={() => setIsStatsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onRandomExercise={handleRandomExercise}
        completedCount={completedHistory.length}
        categoryCounts={categoryCounts}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Global Search Results Overlay/View if search query is present */}
        {searchQuery.trim() ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#101017] border border-[#222230] p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#c5a059]" />
                <span className="text-sm font-mono text-white">
                  Search Results for <span className="text-[#c5a059]">"{searchQuery}"</span> ({searchResults.length} found)
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-[#888] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Search</span>
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-12 text-center bg-[#111118] border border-[#22222e] rounded-md space-y-2 font-mono">
                <p className="text-white text-sm">No exercises found matching "{searchQuery}".</p>
                <p className="text-xs text-[#777]">Try searching for "kids", "seniors", "skipping", "squat", or "back pain".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => handleSelectExercise(exercise)}
                    className="cursor-pointer group bg-[#111118] border border-[#242436] hover:border-[#c5a059] rounded-lg p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-xs bg-[#1a1a28] text-[#c5a059] border border-[#2a2a3e] uppercase">
                          {exercise.category}
                        </span>
                        <span className="text-[#888]">{exercise.difficulty}</span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors">
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-[#999] font-sans line-clamp-2">
                        {exercise.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1c1c28] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#38bdf8] flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        3D Simulation
                      </span>
                      <span className="text-[#c5a059] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Practice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* VIEW 1: HOME / EXPLORE HUB */}
            {currentView === 'home' && (
              <HomeExploreView
                onSelectCategory={handleSelectCategory}
                onSelectExercise={handleSelectExercise}
                onNavigateCircuits={handleNavigateCircuits}
                onRandomExercise={handleRandomExercise}
                completedExerciseIds={completedIds}
              />
            )}

            {/* VIEW 2: DEDICATED CATEGORY PAGE */}
            {currentView === 'category' && (
              <CategoryPageView
                category={activeCategory}
                exercises={activeCategoryExercises}
                onBackToHome={handleGoBack}
                onSelectExercise={handleSelectExercise}
                onQuickComplete={handleCompleteExercise}
                completedExerciseIds={completedIds}
                onSelectOtherCategory={handleSelectCategory}
              />
            )}

            {/* VIEW 3: DEDICATED 3D PRACTICE STUDIO */}
            {currentView === 'exercise-studio' && (
              <ExerciseDetailStudio
                exercise={activeExercise}
                isAudioEnabled={isAudioEnabled}
                onCompleteExercise={handleCompleteExercise}
                isCompletedToday={isCompletedToday}
                onBack={handleGoBack}
                onSelectCategory={handleSelectCategory}
                onSelectExercise={handleSelectExercise}
              />
            )}

            {/* VIEW 4: GUIDED WORKOUT CIRCUITS */}
            {currentView === 'circuits' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleGoBack}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#13131c] hover:bg-[#1c1c28] border border-[#262638] text-xs font-mono text-[#ccc] hover:text-white transition-all shadow-sm group cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#c5a059] group-hover:-translate-x-1 transition-transform" />
                    <span>← Back to Previous Page</span>
                  </button>
                  <div className="text-xs font-mono text-[#777] hidden sm:block">
                    <span>Home</span> &gt; <span className="text-white font-semibold">Workout Circuits</span>
                  </div>
                </div>

                <CategoryQuickNav
                  onSelectCategory={handleSelectCategory}
                  title="Direct Portals to Categories"
                  variant="compact"
                />

                <WorkoutCircuitsView
                  isAudioEnabled={isAudioEnabled}
                  onCircuitFinished={handleCircuitFinished}
                  onSelectSingleExercise={handleSelectExercise}
                />
              </div>
            )}

            {/* VIEW 5: DAILY & WEEKLY ACTIVITY TRACKER */}
            {currentView === 'activity-tracker' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleGoBack}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#13131c] hover:bg-[#1c1c28] border border-[#262638] text-xs font-mono text-[#ccc] hover:text-white transition-all shadow-sm group cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#c5a059] group-hover:-translate-x-1 transition-transform" />
                    <span>← Back to Previous Page</span>
                  </button>
                  <div className="text-xs font-mono text-[#777] hidden sm:block">
                    <span>Home</span> &gt; <span className="text-white font-semibold">Activity & History Tracker</span>
                  </div>
                </div>

                <CategoryQuickNav
                  onSelectCategory={handleSelectCategory}
                  title="Direct Portals to Categories"
                  variant="compact"
                />

                <ActivityTrackerView
                  completedHistory={completedHistory}
                  onSelectExercise={handleSelectExercise}
                  onManualLogSuccess={() => {
                    // Refetch logs
                    fetch('/api/exercise/logs')
                      .then((res) => res.json())
                      .then((data) => {
                        if (data && data.logs) {
                          const formatted = data.logs.map((l: any) => ({
                            exerciseId: l.exerciseId,
                            timestamp: new Date(l.timestamp).getTime(),
                          }));
                          setCompletedHistory(formatted);
                        }
                      })
                      .catch(() => {});
                    showToast('Activity logged successfully!', 'success');
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#181824] bg-[#0a0a10] py-6 text-center text-xs font-mono text-[#777]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#aaa]">
            <Flame className="w-4 h-4 text-[#c5a059]" />
            <span className="text-white font-serif font-semibold">Kinetic Movement Academy</span>
            <span>•</span>
            <span>Interactive 3D Fitness Hub</span>
          </div>
          <div className="text-[#666] flex items-center gap-2">
            <span>Kids • Seniors • General Health • Cardio • Strength • Mobility</span>
          </div>
        </div>
      </footer>

      {/* Stats & Database Logs Modal */}
      <ExerciseStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        completedHistory={completedHistory}
        onClearHistory={() => {
          setCompletedHistory([]);
          showToast('Completed workout history cleared', 'info');
        }}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-[#111118] border border-[#c5a059]/60 text-white px-4 py-2.5 rounded-md shadow-2xl flex items-center gap-2.5 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
