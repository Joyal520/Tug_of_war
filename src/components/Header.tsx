import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { Play, Pause, RotateCcw, Clock, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    gameState,
    difficulty,
    maxTime,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setDifficulty,
    setMatchTime,
  } = useGameStore();

  const handleTimerChange = (seconds: number) => {
    soundManager.playClick();
    setMatchTime(seconds);
  };

  const handleDifficultyChange = (tier: 1 | 2 | 3) => {
    soundManager.playClick();
    setDifficulty(tier);
  };

  const handleStart = () => {
    soundManager.playClick();
    startGame();
  };

  const handlePause = () => {
    soundManager.playClick();
    pauseGame();
  };

  const handleResume = () => {
    soundManager.playClick();
    resumeGame();
  };

  const handleReset = () => {
    soundManager.playClick();
    resetGame();
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2">
      <div className="glass-neutral rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Left Side: Game Branding Title */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs uppercase font-outfit tracking-widest font-extrabold text-blue-600">
            Math Classroom Tournament
          </span>
        </div>
 
        {/* Right Side: Game Controls, Difficulty & Timer Config */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          {/* Timer Selector */}
          <div className="relative">
            <select
              value={maxTime}
              disabled={gameState === 'playing' || gameState === 'paused'}
              onChange={(e) => handleTimerChange(Number(e.target.value))}
              className="appearance-none font-outfit text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl bg-white/90 border border-slate-200 text-slate-800 outline-none focus:border-blue-500/40 shadow-sm transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50/80"
            >
              <option value={30}>30 Secs</option>
              <option value={60}>60 Secs (1 Min)</option>
              <option value={120}>120 Secs (2 Min)</option>
              <option value={180}>180 Secs (3 Min)</option>
              <option value={300}>300 Secs (5 Min)</option>
              <option value={600}>600 Secs (10 Min)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
 
          {/* Difficulty Dropdown */}
          <div className="relative">
            <select
              value={difficulty}
              disabled={gameState === 'playing' || gameState === 'paused'}
              onChange={(e) => handleDifficultyChange(Number(e.target.value) as 1 | 2 | 3)}
              className="appearance-none font-outfit text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl bg-white/90 border border-slate-200 text-slate-800 outline-none focus:border-blue-500/40 shadow-sm transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50/80"
            >
              <option value={1}>Tier 1: Easy</option>
              <option value={2}>Tier 2: Intermediate</option>
              <option value={3}>Tier 3: Advanced</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-2">
            {gameState === 'idle' && (
              <button
                onClick={handleStart}
                className="neu-btn-blue px-4 py-2.5 rounded-xl text-xs font-outfit font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <div className="neu-btn-border-wrap">
                  <div className="neu-btn-glow-spin bg-[conic-gradient(from_0deg,#2563eb_30%,#dbeafe_60%,transparent_60%)]" />
                  <div className="neu-btn-border-inner" />
                </div>
                <span className="relative z-10 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Match
                </span>
              </button>
            )}

            {gameState === 'playing' && (
              <button
                onClick={handlePause}
                className="neu-btn-neutral px-4 py-2.5 rounded-xl text-xs font-outfit font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <div className="neu-btn-border-wrap">
                  <div className="neu-btn-glow-spin bg-[conic-gradient(from_0deg,#64748b_30%,#e2e8f0_60%,transparent_60%)]" />
                  <div className="neu-btn-border-inner" />
                </div>
                <span className="relative z-10 flex items-center gap-1.5">
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Pause
                </span>
              </button>
            )}

            {gameState === 'paused' && (
              <button
                onClick={handleResume}
                className="neu-btn-blue px-4 py-2.5 rounded-xl text-xs font-outfit font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <div className="neu-btn-border-wrap">
                  <div className="neu-btn-glow-spin bg-[conic-gradient(from_0deg,#2563eb_30%,#dbeafe_60%,transparent_60%)]" />
                  <div className="neu-btn-border-inner" />
                </div>
                <span className="relative z-10 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Resume
                </span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="neu-btn-red px-3 py-2.5 rounded-xl text-xs font-outfit font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Reset Match"
            >
              <div className="neu-btn-border-wrap">
                <div className="neu-btn-glow-spin bg-[conic-gradient(from_0deg,#ea580c_30%,#ffedd5_60%,transparent_60%)]" />
                <div className="neu-btn-border-inner" />
              </div>
              <span className="relative z-10 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
