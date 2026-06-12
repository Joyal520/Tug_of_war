import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Header } from './components/Header';
import { Arena } from './components/Arena';
import { TeamDashboard } from './components/TeamDashboard';
import { VictoryModal } from './components/VictoryModal';
import { Keyboard } from 'lucide-react';

const App: React.FC = () => {
  const { initGame } = useGameStore();

  // Initialize the game state when the app mounts
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Global Keyboard event handler for desktop play testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useGameStore.getState();
      if (state.gameState !== 'playing') return;

      const key = e.key.toLowerCase();

      // ==========================================
      // TEAM 1 (BLUE - LEFT) KEYBOARD BINDINGS
      // ==========================================
      // Numbers: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key) && !e.code.startsWith('Numpad')) {
        state.inputDigit('team1', key);
      }
      // Clear: q
      else if (key === 'q') {
        state.clearInput('team1');
      }
      // Submit: e
      else if (key === 'e') {
        state.submitAnswer('team1');
      }

      // ==========================================
      // TEAM 2 (RED - RIGHT) KEYBOARD BINDINGS
      // ==========================================
      // Numpad Numbers (0-9)
      else if (
        e.code.startsWith('Numpad') && 
        e.code.length === 7 && 
        ['0','1','2','3','4','5','6','7','8','9'].includes(e.code.charAt(6))
      ) {
        state.inputDigit('team2', e.code.charAt(6));
      }
      // Numpad Clear: NumpadDivide (/) or NumpadDecimal (.)
      else if (e.code === 'NumpadDivide') {
        state.clearInput('team2');
      }
      // Numpad Submit: NumpadEnter
      else if (e.code === 'NumpadEnter') {
        state.submitAnswer('team2');
      }
      
      // Standard QWERTY keymap fallback for Team 2 (on laptops without physical Numpad)
      else if (key === 'y') state.inputDigit('team2', '7');
      else if (key === 'u') state.inputDigit('team2', '8');
      else if (key === 'i') state.inputDigit('team2', '9');
      else if (key === 'h') state.inputDigit('team2', '4');
      else if (key === 'j') state.inputDigit('team2', '5');
      else if (key === 'k') state.inputDigit('team2', '6');
      else if (key === 'n') state.inputDigit('team2', '1');
      else if (key === 'm') state.inputDigit('team2', '2');
      else if (key === ',') state.inputDigit('team2', '3');
      else if (key === '.') state.inputDigit('team2', '0');
      // Clear: o
      else if (key === 'o') {
        state.clearInput('team2');
      }
      // Submit: p
      else if (key === 'p') {
        state.submitAnswer('team2');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-inter bg-transparent text-slate-800 select-none pb-8 relative overflow-hidden">
      {/* Ambient background blur orbs */}
      <div className="ambient-orb orb-blue" />
      <div className="ambient-orb orb-pink" />
      <div className="ambient-orb orb-amber" />

      {/* Top Navigation / Status Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 flex flex-col gap-6 max-w-7xl w-full mx-auto px-4 mt-2">
        {/* Arena Component */}
        <Arena />

        {/* Dashboards Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TeamDashboard teamId="team1" />
          <TeamDashboard teamId="team2" />
        </div>

        {/* Global Keyboard / Touch Guide Footer */}
        <footer className="glass-neutral rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 shadow-sm mt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 font-outfit">
            <Keyboard className="w-4 h-4 text-blue-500" />
            <span>LOCAL DESKTOP CO-OP BINDINGS ACTIVE</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-[10px] text-slate-500 font-medium font-inter">
            <div>
              <span className="text-blue-600 font-bold">Team 1:</span> Keys <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">1-0</code> to type, <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">Q</code> to Clear, <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">E</code> to Submit.
            </div>
            <div>
              <span className="text-orange-600 font-bold">Team 2:</span> Keys <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">YUI/HJK/NM,/.</code> (or Numpad) to type, <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">O</code> to Clear, <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">P</code> to Submit.
            </div>
          </div>
        </footer>
      </main>

      {/* Victory Overlay Modal */}
      <VictoryModal />
    </div>
  );
};

export default App;
