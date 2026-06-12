import { create } from 'zustand';
import { soundManager } from '../audio/soundManager';

export interface Quiz {
  id: number;
  tier: number;
  expression: string;
  answer: number;
}

export interface TeamState {
  score: number;
  currentQuiz: Quiz;
  inputBuffer: string;
  isShaking: boolean;
  quizQueue: Quiz[];
}

export interface VisualEvent {
  id: string;
  type: 'pull' | 'shake' | 'win_confetti' | 'timer_low';
  team?: 'team1' | 'team2';
  timestamp: number;
}

interface GameState {
  ropeX: number;          // Authoritative position (-100 to 100)
  ropeXVisual: number;    // Smoothed visual position for 30Hz render
  timeLeft: number;       // Global countdown timer (180s)
  maxTime: number;        // Configurable max match time
  gameState: 'idle' | 'playing' | 'paused' | 'victory';
  difficulty: 1 | 2 | 3;  // Tier 1 (Easy), Tier 2 (Int), Tier 3 (Adv)
  winner: 'team1' | 'team2' | 'draw' | null;
  team1: TeamState;
  team2: TeamState;
  visualEvents: VisualEvent[];
  timerAccumulator: number;

  // Actions
  setDifficulty: (tier: 1 | 2 | 3) => void;
  setMatchTime: (seconds: number) => void;
  initGame: (diff?: 1 | 2 | 3) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  
  inputDigit: (teamId: 'team1' | 'team2', digit: string) => void;
  clearInput: (teamId: 'team1' | 'team2') => void;
  submitAnswer: (teamId: 'team1' | 'team2') => void;
  
  tickSim: (deltaMs: number) => void;
  clearShake: (teamId: 'team1' | 'team2') => void;
  addVisualEvent: (type: VisualEvent['type'], team?: VisualEvent['team']) => void;
  clearVisualEvents: () => void;
}

// 100 Sample Quizzes Seed
const QUIZ_SEED: Quiz[] = [
  {"id": 1, "tier": 1, "expression": "12 + 5", "answer": 17},
  {"id": 2, "tier": 1, "expression": "18 - 6", "answer": 12},
  {"id": 3, "tier": 1, "expression": "9 + 7", "answer": 16},
  {"id": 4, "tier": 1, "expression": "15 - 9", "answer": 6},
  {"id": 5, "tier": 1, "expression": "20 + 4", "answer": 24},
  {"id": 6, "tier": 1, "expression": "14 - 7", "answer": 7},
  {"id": 7, "tier": 1, "expression": "8 + 11", "answer": 19},
  {"id": 8, "tier": 1, "expression": "17 - 5", "answer": 12},
  {"id": 9, "tier": 1, "expression": "6 + 13", "answer": 19},
  {"id": 10, "tier": 1, "expression": "19 - 8", "answer": 11},
  {"id": 11, "tier": 1, "expression": "22 + 3", "answer": 25},
  {"id": 12, "tier": 1, "expression": "13 - 6", "answer": 7},
  {"id": 13, "tier": 1, "expression": "7 + 15", "answer": 22},
  {"id": 14, "tier": 1, "expression": "16 - 4", "answer": 12},
  {"id": 15, "tier": 1, "expression": "25 + 5", "answer": 30},
  {"id": 16, "tier": 1, "expression": "11 - 5", "answer": 6},
  {"id": 17, "tier": 1, "expression": "9 + 14", "answer": 23},
  {"id": 18, "tier": 1, "expression": "18 - 12", "answer": 6},
  {"id": 19, "tier": 1, "expression": "5 + 17", "answer": 22},
  {"id": 20, "tier": 1, "expression": "21 - 7", "answer": 14},
  {"id": 21, "tier": 1, "expression": "10 + 16", "answer": 26},
  {"id": 22, "tier": 1, "expression": "14 - 9", "answer": 5},
  {"id": 23, "tier": 1, "expression": "8 + 13", "answer": 21},
  {"id": 24, "tier": 1, "expression": "20 - 11", "answer": 9},
  {"id": 25, "tier": 1, "expression": "6 + 18", "answer": 24},
  {"id": 26, "tier": 1, "expression": "17 - 9", "answer": 8},
  {"id": 27, "tier": 1, "expression": "12 + 12", "answer": 24},
  {"id": 28, "tier": 1, "expression": "23 - 6", "answer": 17},
  {"id": 29, "tier": 1, "expression": "15 + 8", "answer": 23},
  {"id": 30, "tier": 1, "expression": "19 - 13", "answer": 6},
  {"id": 31, "tier": 1, "expression": "4 + 22", "answer": 26},
  {"id": 32, "tier": 1, "expression": "16 - 7", "answer": 9},
  {"id": 33, "tier": 1, "expression": "11 + 11", "answer": 22},
  {"id": 34, "tier": 1, "expression": "24 - 8", "answer": 16},
  {"id": 35, "tier": 1, "expression": "13 + 9", "answer": 22},

  {"id": 36, "tier": 2, "expression": "35 - 11", "answer": 24},
  {"id": 37, "tier": 2, "expression": "14 + 23", "answer": 37},
  {"id": 38, "tier": 2, "expression": "42 - 15", "answer": 27},
  {"id": 39, "tier": 2, "expression": "27 + 16", "answer": 43},
  {"id": 40, "tier": 2, "expression": "50 - 22", "answer": 28},
  {"id": 41, "tier": 2, "expression": "19 + 25", "answer": 44},
  {"id": 42, "tier": 2, "expression": "33 - 14", "answer": 19},
  {"id": 43, "tier": 2, "expression": "28 + 24", "answer": 52},
  {"id": 44, "tier": 2, "expression": "61 - 18", "answer": 43},
  {"id": 45, "tier": 2, "expression": "36 + 17", "answer": 53},
  {"id": 46, "tier": 2, "expression": "45 - 27", "answer": 18},
  {"id": 47, "tier": 2, "expression": "29 + 33", "answer": 62},
  {"id": 48, "tier": 2, "expression": "55 - 19", "answer": 36},
  {"id": 49, "tier": 2, "expression": "18 + 44", "answer": 62},
  {"id": 50, "tier": 2, "expression": "72 - 35", "answer": 37},
  {"id": 51, "tier": 2, "expression": "38 + 26", "answer": 64},
  {"id": 52, "tier": 2, "expression": "63 - 29", "answer": 34},
  {"id": 53, "tier": 2, "expression": "47 + 15", "answer": 62},
  {"id": 54, "tier": 2, "expression": "80 - 43", "answer": 37},
  {"id": 55, "tier": 2, "expression": "22 + 49", "answer": 71},
  {"id": 56, "tier": 2, "expression": "67 - 28", "answer": 39},
  {"id": 57, "tier": 2, "expression": "54 + 18", "answer": 72},
  {"id": 58, "tier": 2, "expression": "91 - 34", "answer": 57},
  {"id": 59, "tier": 2, "expression": "39 + 39", "answer": 78},
  {"id": 60, "tier": 2, "expression": "75 - 46", "answer": 29},
  {"id": 61, "tier": 2, "expression": "43 + 28", "answer": 71},
  {"id": 62, "tier": 2, "expression": "83 - 37", "answer": 46},
  {"id": 63, "tier": 2, "expression": "56 + 19", "answer": 75},
  {"id": 64, "tier": 2, "expression": "62 - 25", "answer": 37},
  {"id": 65, "tier": 2, "expression": "27 + 48", "answer": 75},
  {"id": 66, "tier": 2, "expression": "95 - 57", "answer": 38},
  {"id": 67, "tier": 2, "expression": "49 + 36", "answer": 85},
  {"id": 68, "tier": 2, "expression": "81 - 44", "answer": 37},
  {"id": 69, "tier": 2, "expression": "53 + 29", "answer": 82},
  {"id": 70, "tier": 2, "expression": "70 - 32", "answer": 38},

  {"id": 71, "tier": 3, "expression": "12 * 4", "answer": 48},
  {"id": 72, "tier": 3, "expression": "15 * 3", "answer": 45},
  {"id": 73, "tier": 3, "expression": "84 / 4", "answer": 21},
  {"id": 74, "tier": 3, "expression": "96 / 6", "answer": 16},
  {"id": 75, "tier": 3, "expression": "13 * 5", "answer": 65},
  {"id": 76, "tier": 3, "expression": "14 * 6", "answer": 84},
  {"id": 77, "tier": 3, "expression": "108 / 9", "answer": 12},
  {"id": 78, "tier": 3, "expression": "120 / 8", "answer": 15},
  {"id": 79, "tier": 3, "expression": "16 * 4", "answer": 64},
  {"id": 80, "tier": 3, "expression": "25 * 3", "answer": 75},
  {"id": 81, "tier": 3, "expression": "144 / 12", "answer": 12},
  {"id": 82, "tier": 3, "expression": "135 / 5", "answer": 27},
  {"id": 83, "tier": 3, "expression": "18 * 5", "answer": 90},
  {"id": 84, "tier": 3, "expression": "22 * 4", "answer": 88},
  {"id": 85, "tier": 3, "expression": "175 / 7", "answer": 25},
  {"id": 86, "tier": 3, "expression": "156 / 12", "answer": 13},
  {"id": 87, "tier": 3, "expression": "19 * 3", "answer": 57},
  {"id": 88, "tier": 3, "expression": "15 * 6", "answer": 90},
  {"id": 89, "tier": 3, "expression": "198 / 9", "answer": 22},
  {"id": 90, "tier": 3, "expression": "225 / 15", "answer": 15},
  {"id": 91, "tier": 3, "expression": "24 * 3", "answer": 72},
  {"id": 92, "tier": 3, "expression": "13 * 7", "answer": 91},
  {"id": 93, "tier": 3, "expression": "256 / 8", "answer": 32},
  {"id": 94, "tier": 3, "expression": "288 / 12", "answer": 24},
  {"id": 95, "tier": 3, "expression": "17 * 4", "answer": 68},
  {"id": 96, "tier": 3, "expression": "21 * 5", "answer": 105},
  {"id": 97, "tier": 3, "expression": "324 / 9", "answer": 36},
  {"id": 98, "tier": 3, "expression": "400 / 16", "answer": 25},
  {"id": 99, "tier": 3, "expression": "26 * 4", "answer": 104},
  {"id": 100, "tier": 3, "expression": "15 * 8", "answer": 120}
];

// Shuffle Helper
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate a shuffled queue of questions for a specific tier
function generateQueueForTier(tier: number): Quiz[] {
  const pool = QUIZ_SEED.filter(q => q.tier === tier);
  return shuffleArray(pool);
}

// Fallback dummy quiz in case queue fails
const DUMMY_QUIZ: Quiz = { id: 0, tier: 1, expression: "1 + 1", answer: 2 };

// 30Hz Simulation interval pointer (kept module-scoped to avoid React resets)
let simInterval: any = null;

export const useGameStore = create<GameState>((set, get) => ({
  ropeX: 0,
  ropeXVisual: 0,
  timeLeft: 180,
  maxTime: 180,
  gameState: 'idle',
  difficulty: 1,
  winner: null,
  timerAccumulator: 0,
  visualEvents: [],
  
  team1: {
    score: 0,
    currentQuiz: DUMMY_QUIZ,
    inputBuffer: '',
    isShaking: false,
    quizQueue: []
  },
  
  team2: {
    score: 0,
    currentQuiz: DUMMY_QUIZ,
    inputBuffer: '',
    isShaking: false,
    quizQueue: []
  },

  setDifficulty: (tier) => {
    set({ difficulty: tier });
    get().initGame(tier);
  },

  setMatchTime: (seconds) => {
    set({ maxTime: seconds, timeLeft: seconds });
  },

  initGame: (diff) => {
    // Clear simulation interval if it exists
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }

    const currentDiff = diff || get().difficulty;
    const matchDuration = get().maxTime;
    
    // Generate fresh shuffles for each team
    const queue1 = generateQueueForTier(currentDiff);
    const queue2 = generateQueueForTier(currentDiff);
    
    const firstQuiz1 = queue1.pop() || DUMMY_QUIZ;
    const firstQuiz2 = queue2.pop() || DUMMY_QUIZ;

    set({
      ropeX: 0,
      ropeXVisual: 0,
      timeLeft: matchDuration,
      gameState: 'idle',
      winner: null,
      timerAccumulator: 0,
      visualEvents: [],
      team1: {
        score: 0,
        currentQuiz: firstQuiz1,
        inputBuffer: '',
        isShaking: false,
        quizQueue: queue1
      },
      team2: {
        score: 0,
        currentQuiz: firstQuiz2,
        inputBuffer: '',
        isShaking: false,
        quizQueue: queue2
      }
    });
  },

  startGame: () => {
    if (get().gameState !== 'idle') return;

    soundManager.playStart();
    
    set({ gameState: 'playing' });
    
    // Establish the 30Hz (33.3ms) simulation loop
    let lastTime = Date.now();
    
    if (simInterval) clearInterval(simInterval);
    
    simInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;
      get().tickSim(delta);
    }, 33.3);
  },

  pauseGame: () => {
    if (get().gameState !== 'playing') return;
    
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
    
    set({ gameState: 'paused' });
  },

  resumeGame: () => {
    if (get().gameState !== 'paused') return;
    
    set({ gameState: 'playing' });
    
    let lastTime = Date.now();
    if (simInterval) clearInterval(simInterval);
    
    simInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;
      get().tickSim(delta);
    }, 33.3);
  },

  resetGame: () => {
    get().initGame();
  },

  inputDigit: (teamId, digit) => {
    if (get().gameState !== 'playing') return;

    set((state) => {
      const team = state[teamId];
      // Limit to 5 characters to prevent input overflow
      if (team.inputBuffer.length >= 5) return {};
      
      return {
        [teamId]: {
          ...team,
          inputBuffer: team.inputBuffer + digit
        }
      };
    });
  },

  clearInput: (teamId) => {
    set((state) => {
      const team = state[teamId];
      return {
        [teamId]: {
          ...team,
          inputBuffer: ''
        }
      };
    });
  },

  submitAnswer: (teamId) => {
    const state = get();
    if (state.gameState !== 'playing') return;

    const team = state[teamId];
    if (team.inputBuffer === '') return;

    const submittedVal = parseInt(team.inputBuffer, 10);
    const isCorrect = submittedVal === team.currentQuiz.answer;

    if (isCorrect) {
      // SUCCESS logic
      soundManager.playCorrect();
      
      // Add success visual event
      get().addVisualEvent('pull', teamId);
      
      // Modify ropeX position (Team 1 pulls Left (-15), Team 2 pulls Right (+15))
      const delta = teamId === 'team1' ? -15 : 15;
      const nextRopeX = Math.max(-100, Math.min(100, state.ropeX + delta));
      
      // Determine next quiz
      let nextQueue = [...team.quizQueue];
      if (nextQueue.length === 0) {
        nextQueue = generateQueueForTier(state.difficulty);
      }
      const nextQuiz = nextQueue.pop() || DUMMY_QUIZ;

      set((s) => ({
        ropeX: nextRopeX,
        [teamId]: {
          ...s[teamId],
          score: s[teamId].score + 1,
          inputBuffer: '',
          currentQuiz: nextQuiz,
          quizQueue: nextQueue
        }
      }));

      // Check if win triggered immediately
      if (nextRopeX <= -100 || nextRopeX >= 100) {
        get().addVisualEvent('win_confetti', teamId);
        soundManager.playWin();
        if (simInterval) {
          clearInterval(simInterval);
          simInterval = null;
        }
        set({
          gameState: 'victory',
          winner: nextRopeX <= -100 ? 'team1' : 'team2'
        });
      }
    } else {
      // PENALTY / FAIL logic
      soundManager.playIncorrect();
      
      // Shake local answer container
      set((s) => ({
        [teamId]: {
          ...s[teamId],
          isShaking: true,
          inputBuffer: ''
        }
      }));
      
      // Set timer to clear the shaking state
      setTimeout(() => {
        get().clearShake(teamId);
      }, 400);

      // Penalize by shifting rope 5 points to the opposing team
      // (If Team 1 fails, rope shifts Right (+5); if Team 2 fails, rope shifts Left (-5))
      const delta = teamId === 'team1' ? 5 : -5;
      const nextRopeX = Math.max(-100, Math.min(100, state.ropeX + delta));

      set({ ropeX: nextRopeX });

      // Check win condition
      if (nextRopeX <= -100 || nextRopeX >= 100) {
        get().addVisualEvent('win_confetti', nextRopeX <= -100 ? 'team1' : 'team2');
        soundManager.playWin();
        if (simInterval) {
          clearInterval(simInterval);
          simInterval = null;
        }
        set({
          gameState: 'victory',
          winner: nextRopeX <= -100 ? 'team1' : 'team2'
        });
      }
    }
  },

  clearShake: (teamId) => {
    set((state) => ({
      [teamId]: {
        ...state[teamId],
        isShaking: false
      }
    }));
  },

  tickSim: (deltaMs) => {
    const state = get();
    if (state.gameState !== 'playing') return;

    // 1. Lerp visual rope representation towards actual authoritative position
    // (runs at 30Hz, interpolates smoothly for the canvas/SVG)
    const currentRopeX = state.ropeX;
    const currentRopeXVisual = state.ropeXVisual;
    const difference = currentRopeX - currentRopeXVisual;
    let nextRopeXVisual = currentRopeXVisual;

    if (Math.abs(difference) < 0.05) {
      nextRopeXVisual = currentRopeX;
    } else {
      nextRopeXVisual = currentRopeXVisual + difference * 0.12; // Lerping factor 0.12
    }

    // 2. Accumulate delta time for countdown timer
    let nextTimeLeft = state.timeLeft;
    let nextTimerAccumulator = state.timerAccumulator + deltaMs;
    
    if (nextTimerAccumulator >= 1000) {
      const ticks = Math.floor(nextTimerAccumulator / 1000);
      nextTimerAccumulator = nextTimerAccumulator % 1000;
      nextTimeLeft = Math.max(0, nextTimeLeft - ticks);
      
      // Play low-time clicks
      if (nextTimeLeft <= 10 && nextTimeLeft > 0) {
        soundManager.playTick();
        get().addVisualEvent('timer_low');
      }

      // Check timer expiration win condition
      if (nextTimeLeft <= 0) {
        if (simInterval) {
          clearInterval(simInterval);
          simInterval = null;
        }
        
        soundManager.playWin();
        
        let gameWinner: 'team1' | 'team2' | 'draw' = 'draw';
        if (state.ropeX < 0) {
          gameWinner = 'team1';
        } else if (state.ropeX > 0) {
          gameWinner = 'team2';
        } else {
          // Tiebreaker on score if rope is exactly centered
          const scoreDiff = state.team1.score - state.team2.score;
          if (scoreDiff > 0) gameWinner = 'team1';
          else if (scoreDiff < 0) gameWinner = 'team2';
        }

        set({
          gameState: 'victory',
          timeLeft: 0,
          winner: gameWinner
        });
        get().addVisualEvent('win_confetti', gameWinner !== 'draw' ? gameWinner : undefined);
      }
    }

    set({
      ropeXVisual: nextRopeXVisual,
      timeLeft: nextTimeLeft,
      timerAccumulator: nextTimerAccumulator
    });
  },

  addVisualEvent: (type, team) => {
    const newEvent: VisualEvent = {
      id: Math.random().toString(),
      type,
      team,
      timestamp: Date.now()
    };
    set((state) => ({
      visualEvents: [...state.visualEvents, newEvent]
    }));
  },

  clearVisualEvents: () => {
    set({ visualEvents: [] });
  }
}));
