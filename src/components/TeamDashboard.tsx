import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { Delete, Check } from 'lucide-react';

interface TeamDashboardProps {
  teamId: 'team1' | 'team2';
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ teamId }) => {
  const {
    gameState,
    team1,
    team2,
    inputDigit,
    clearInput,
    submitAnswer,
  } = useGameStore();

  const isTeam1 = teamId === 'team1';
  const teamState = isTeam1 ? team1 : team2;
  const { currentQuiz, inputBuffer, isShaking } = teamState;

  // Keypad button list
  const buttons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    'C', '0', 'Enter'
  ];

  // Handler for touch & mouse clicks with zero latency
  const handleKeypadPress = (e: React.TouchEvent | React.MouseEvent, val: string) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    soundManager.playClick();

    if (val === 'C') {
      clearInput(teamId);
    } else if (val === 'Enter') {
      submitAnswer(teamId);
    } else {
      inputDigit(teamId, val);
    }
  };

  // Styles
  const containerClass = isTeam1 
    ? 'glass-blue glow-blue rounded-3xl p-6 shadow-2xl transition-all duration-300' 
    : 'glass-red glow-red rounded-3xl p-6 shadow-2xl transition-all duration-300';

  const themeLabelColor = isTeam1 ? 'text-blue-600' : 'text-orange-600';
  
  // Active input display indicator
  const isEmpty = inputBuffer === '';

  // Shortcuts helper text
  const shortcutsHelp = isTeam1
    ? 'Desktop controls: Keys 1-0 | Clear: Q | Enter: E'
    : 'Desktop: yui/hjk/nm,/. | Clear: O | Enter: P';

  return (
    <div className={`${containerClass} flex flex-col gap-5 w-full relative`}>
      {/* Team Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className={`font-outfit font-extrabold text-lg uppercase tracking-wider ${themeLabelColor}`}>
          {isTeam1 ? 'Team 1 (Left)' : 'Team 2 (Right)'}
        </span>
        <span className="text-[10px] bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-full font-inter text-slate-500 font-medium">
          Multi-Touch Active
        </span>
      </div>

      {/* Quiz Card */}
      <div className="flex flex-col items-center justify-center bg-white/70 rounded-2xl border border-slate-200 py-6 px-4 relative overflow-hidden shadow-sm">
        {/* Glow effect in card background */}
        <div className={`absolute w-32 h-32 rounded-full blur-[45px] pointer-events-none opacity-10 -top-8 -right-8 ${isTeam1 ? 'bg-blue-500' : 'bg-red-500'}`} />
        <div className={`absolute w-32 h-32 rounded-full blur-[45px] pointer-events-none opacity-10 -bottom-8 -left-8 ${isTeam1 ? 'bg-blue-500' : 'bg-red-500'}`} />

        <span className="text-xs uppercase tracking-widest font-outfit text-slate-400 font-bold mb-1.5">
          Solve the Equation
        </span>
        <div className="text-5xl font-black font-outfit text-slate-800 tracking-wide select-none">
          {gameState === 'playing' ? currentQuiz.expression : '???'}
        </div>
      </div>

      {/* Active Input Container */}
      <div 
        className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center font-outfit text-3xl font-black min-h-[72px] transition-all select-none ${
          isShaking 
            ? 'animate-shake border-red-500 bg-red-100 text-red-900' 
            : isTeam1 
              ? 'bg-blue-50/90 border border-blue-200/80 text-blue-900 shadow-[inset_2px_2px_5px_rgba(37,99,235,0.06)]' 
              : 'bg-red-50/90 border border-red-200/80 text-red-900 shadow-[inset_2px_2px_5px_rgba(239,68,68,0.06)]'
        }`}
      >
        {gameState === 'playing' ? (
          isEmpty ? (
            <span className="text-slate-400 font-medium text-lg tracking-wider animate-pulse font-inter">
              Type your answer...
            </span>
          ) : (
            <span>
              {inputBuffer}
            </span>
          )
        ) : (
          <span className="text-slate-400 font-medium text-lg tracking-wider font-inter">
            Match not started
          </span>
        )}
      </div>

      {/* Interactive Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {buttons.map((btn) => {
          let btnClass = '';
          let glowGradient = '';

          if (btn === 'C') {
            btnClass = 'neu-btn-clear';
            glowGradient = 'bg-[conic-gradient(from_0deg,#ef4444_30%,#fee2e2_60%,transparent_60%)]';
          } else if (btn === 'Enter') {
            btnClass = 'neu-btn-enter';
            glowGradient = 'bg-[conic-gradient(from_0deg,#22c55e_30%,#dcfce7_60%,transparent_60%)]';
          } else {
            btnClass = isTeam1 ? 'neu-btn-blue text-slate-700' : 'neu-btn-red text-slate-700';
            glowGradient = isTeam1
              ? 'bg-[conic-gradient(from_0deg,#2563eb_30%,#dbeafe_60%,transparent_60%)]'
              : 'bg-[conic-gradient(from_0deg,#ea580c_30%,#ffedd5_60%,transparent_60%)]';
          }

          return (
            <button
              key={`${teamId}-key-${btn}`}
              disabled={gameState !== 'playing'}
              onTouchStart={(e) => handleKeypadPress(e, btn)}
              onMouseDown={(e) => handleKeypadPress(e, btn)}
              className={`py-4 rounded-xl font-outfit font-black text-xl flex items-center justify-center select-none cursor-pointer transition-all duration-150 ${btnClass} disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {/* Snake Glow Border Wrapper */}
              <div className="neu-btn-border-wrap">
                <div className={`neu-btn-glow-spin ${glowGradient}`} />
                <div className="neu-btn-border-inner" />
              </div>

              {/* Text/Icon Label */}
              <span className="relative z-10 flex items-center justify-center">
                {btn === 'C' ? (
                  <Delete className="w-5.5 h-5.5" />
                ) : btn === 'Enter' ? (
                  <Check className="w-5.5 h-5.5 stroke-[3]" />
                ) : (
                  btn
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shortcuts Help Panel */}
      <div className="text-[10px] text-center font-inter text-slate-500 font-medium mt-1 bg-white/50 py-2 px-3 rounded-lg border border-slate-200 shadow-sm">
        {shortcutsHelp}
      </div>
    </div>
  );
};
