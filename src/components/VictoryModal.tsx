import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw } from 'lucide-react';

export const VictoryModal: React.FC = () => {
  const { gameState, winner, team1, team2, resetGame } = useGameStore();

  useEffect(() => {
    if (gameState === 'victory') {
      const duration = 6 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 45 * (timeLeft / duration);
        
        // Shoot confetti from the bottom-left and bottom-right corners
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: 0.8 } 
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: 0.8 } 
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  if (gameState !== 'victory') return null;

  const isT1Win = winner === 'team1';
  const isT2Win = winner === 'team2';
  const isDraw = winner === 'draw';

  // UI styling depending on who won
  let modalBorder = 'border-slate-200/60';
  let glowColor = 'bg-slate-400/5';
  let title = 'It\'s a Tie!';
  let titleColor = 'text-slate-800';

  if (isT1Win) {
    modalBorder = 'border-blue-500/30';
    glowColor = 'bg-blue-600/10';
    title = 'Team 1 (Blue) Wins!';
    titleColor = 'text-blue-700';
  } else if (isT2Win) {
    modalBorder = 'border-red-500/30';
    glowColor = 'bg-red-600/10';
    title = 'Team 2 (Red) Wins!';
    titleColor = 'text-red-600';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/15 backdrop-blur-md transition-all duration-300">
      {/* Background glow mesh */}
      <div className={`absolute w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none ${glowColor} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />

      <div className={`bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full text-center relative border shadow-2xl scale-in-bounce ${modalBorder}`}>
        
        {/* Trophy icon */}
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 mb-6 relative shadow-md">
          <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${isT1Win ? 'bg-blue-500' : isT2Win ? 'bg-red-500' : 'bg-yellow-500'}`} />
          <Trophy className={`w-10 h-10 relative z-10 ${isT1Win ? 'text-blue-600' : isT2Win ? 'text-red-500' : 'text-yellow-600'}`} />
        </div>

        {/* Title */}
        <h2 className={`text-4xl font-black font-outfit ${titleColor} tracking-wide mb-2 select-none`}>
          {title}
        </h2>
        
        {/* Subtitle description */}
        <p className="text-slate-600 font-inter text-sm mb-8 px-4">
          {isDraw 
            ? "What a match! The time ran out and both teams were deadlocked in the center of the arena." 
            : `Victory goes to the mathematicians of ${isT1Win ? 'Team 1 (Blue)' : 'Team 2 (Red)'} for pulling the rope completely into their safety zone!`
          }
        </p>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50/90 border border-blue-200/60 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-outfit text-blue-700 font-bold tracking-widest block mb-1">
              Team 1 (Blue)
            </span>
            <span className="text-2xl font-black font-outfit text-blue-900">
              {team1.score} <span className="text-xs text-blue-600 font-medium">correct</span>
            </span>
          </div>

          <div className="bg-red-50/90 border border-red-200/60 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-outfit text-red-700 font-bold tracking-widest block mb-1">
              Team 2 (Red)
            </span>
            <span className="text-2xl font-black font-outfit text-red-900">
              {team2.score} <span className="text-xs text-red-600 font-medium">correct</span>
            </span>
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={() => {
            soundManager.playClick();
            resetGame();
          }}
          className="w-full py-4 px-6 rounded-2xl neu-btn-primary hover:shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg"
        >
          {/* Snake Glow Border Wrapper */}
          <div className="neu-btn-border-wrap">
            <div className="neu-btn-glow-spin bg-[conic-gradient(from_0deg,#6366f1_30%,#e0e7ff_60%,transparent_60%)]" />
            <div className="neu-btn-border-inner" />
          </div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin-hover" />
            Play Again
          </span>
        </button>
      </div>
    </div>
  );
};
