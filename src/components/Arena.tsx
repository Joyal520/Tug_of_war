import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { Clock } from 'lucide-react';

export const Arena: React.FC = () => {
  const { 
    ropeX, 
    ropeXVisual, 
    gameState, 
    winner, 
    visualEvents, 
    timeLeft, 
    team1, 
    team2 
  } = useGameStore();

  // Determine current poses for both teams
  const { team1Pose, team2Pose } = useMemo(() => {
    if (gameState === 'victory') {
      if (winner === 'team1') return { team1Pose: 'CHEERING', team2Pose: 'FALLEN' };
      if (winner === 'team2') return { team1Pose: 'FALLEN', team2Pose: 'CHEERING' };
      return { team1Pose: 'FALLEN', team2Pose: 'FALLEN' };
    }

    if (gameState === 'playing') {
      const diff = ropeX - ropeXVisual;
      // If ropeX is moving Left (T1 pulling)
      if (diff < -0.2) {
        return { team1Pose: 'PULLING', team2Pose: 'SLIPPING' };
      }
      // If ropeX is moving Right (T2 pulling)
      if (diff > 0.2) {
        return { team1Pose: 'SLIPPING', team2Pose: 'PULLING' };
      }
    }

    return { team1Pose: 'READY', team2Pose: 'READY' };
  }, [ropeX, ropeXVisual, gameState, winner]);

  // SVG dimensions
  const width = 1000;
  const height = 230;
  
  // Height configurations optimized for 1.7x scaling around groundY
  const groundY = 190;
  const ropeYGlobal = 135.5; // rope height running across chests/waists, below shoulders
  const ropeYLocal = 158;    // local coordinate inside character definition (190 - (190 - 158) * 1.7 = 135.6)

  // Flag X coordinate
  const flagX = 500 + ropeXVisual * 3;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to extract character joint coordinates
  const getCharacterJoints = (pose: string, cx: number, cy: number) => {
    // Default READY pose joints
    let joints = {
      head: { x: cx - 6, y: cy - 54 },
      hips: { x: cx - 8, y: cy - 24 },
      backKnee: { x: cx - 16, y: cy - 12 },
      backFoot: { x: cx - 20, y: cy },
      frontKnee: { x: cx - 2, y: cy - 12 },
      frontFoot: { x: cx + 2, y: cy },
      shoulder: { x: cx - 3, y: cy - 42 },
      hand: { x: cx + 18, y: ropeYLocal }
    };

    if (pose === 'PULLING') {
      joints.head = { x: cx - 18, y: cy - 46 };
      joints.hips = { x: cx - 18, y: cy - 20 };
      joints.backKnee = { x: cx - 28, y: cy - 10 };
      joints.backFoot = { x: cx - 32, y: cy };
      joints.frontKnee = { x: cx - 8, y: cy - 10 };
      joints.frontFoot = { x: cx - 4, y: cy };
      joints.shoulder = { x: cx - 13, y: cy - 36 };
      joints.hand = { x: cx + 8, y: ropeYLocal };
    } else if (pose === 'SLIPPING') {
      joints.head = { x: cx + 10, y: cy - 48 };
      joints.hips = { x: cx - 4, y: cy - 24 };
      joints.backKnee = { x: cx - 14, y: cy - 12 };
      joints.backFoot = { x: cx - 18, y: cy };
      joints.frontKnee = { x: cx + 4, y: cy - 12 };
      joints.frontFoot = { x: cx + 8, y: cy };
      joints.shoulder = { x: cx + 5, y: cy - 38 };
      joints.hand = { x: cx + 24, y: ropeYLocal };
    } else if (pose === 'FALLEN') {
      joints.head = { x: cx - 28, y: cy - 16 };
      joints.hips = { x: cx - 6, y: cy - 10 };
      joints.backKnee = { x: cx + 4, y: cy - 6 };
      joints.backFoot = { x: cx + 12, y: cy };
      joints.frontKnee = { x: cx + 10, y: cy - 5 };
      joints.frontFoot = { x: cx + 18, y: cy };
      joints.shoulder = { x: cx - 18, y: cy - 14 };
      joints.hand = { x: cx - 14, y: cy - 32 };
    } else if (pose === 'CHEERING') {
      const bounce = Math.sin(Date.now() / 150) * 8;
      joints.head = { x: cx, y: cy - 64 + bounce };
      joints.hips = { x: cx, y: cy - 32 + bounce };
      joints.backKnee = { x: cx - 8, y: cy - 16 + bounce };
      joints.backFoot = { x: cx - 12, y: cy };
      joints.frontKnee = { x: cx + 8, y: cy - 16 + bounce };
      joints.frontFoot = { x: cx + 12, y: cy };
      joints.shoulder = { x: cx, y: cy - 50 + bounce };
      joints.hand = { x: cx - 12, y: cy - 70 + bounce };
    }

    return joints;
  };

  // Render character Body details (Pass 1 of layered render)
  const renderCharacterBody = (team: 'team1' | 'team2', pose: string, cx: number, cy: number) => {
    const isTeam2 = team === 'team2';
    const skinColor = '#fed7aa'; 
    const pantsColor = '#1e293b'; 
    const shirtColor = isTeam2 ? '#ea580c' : '#1d4ed8'; 
    const stripeColor = '#ffffff';

    const joints = getCharacterJoints(pose, cx, cy);

    // Scaling & Mirror transform
    const transform = isTeam2 
      ? `translate(${cx}, ${cy}) scale(-1.7, 1.7) translate(${-cx}, ${-cy})` 
      : `translate(${cx}, ${cy}) scale(1.7) translate(${-cx}, ${-cy})`;

    const dx = joints.shoulder.x - joints.hips.x;
    const dy = joints.shoulder.y - joints.hips.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    return (
      <g key={`${team}-body-${cx}`} transform={transform} className="transition-all duration-300 ease-out">
        {/* Foot shadows */}
        <ellipse cx={joints.backFoot.x} cy={joints.backFoot.y + 1} rx="9" ry="2.5" fill="rgba(0, 0, 0, 0.12)" />
        <ellipse cx={joints.frontFoot.x} cy={joints.frontFoot.y + 1} rx="9" ry="2.5" fill="rgba(0, 0, 0, 0.12)" />

        {/* Legs / Trousers */}
        <path
          d={`M ${joints.hips.x} ${joints.hips.y} L ${joints.backKnee.x} ${joints.backKnee.y} L ${joints.backFoot.x} ${joints.backFoot.y}`}
          stroke={pantsColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={`M ${joints.hips.x} ${joints.hips.y} L ${joints.frontKnee.x} ${joints.frontKnee.y} L ${joints.frontFoot.x} ${joints.frontFoot.y}`}
          stroke={pantsColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Shoes */}
        <path
          d={`M ${joints.backFoot.x - 5} ${joints.backFoot.y} L ${joints.backFoot.x + 6} ${joints.backFoot.y} L ${joints.backFoot.x + 4} ${joints.backFoot.y - 4} L ${joints.backFoot.x - 3} ${joints.backFoot.y - 4} Z`}
          fill="#ffffff"
          stroke={shirtColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d={`M ${joints.frontFoot.x - 5} ${joints.frontFoot.y} L ${joints.frontFoot.x + 6} ${joints.frontFoot.y} L ${joints.frontFoot.x + 4} ${joints.frontFoot.y - 4} L ${joints.frontFoot.x - 3} ${joints.frontFoot.y - 4} Z`}
          fill="#ffffff"
          stroke={shirtColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Torso / Shirt */}
        <line
          x1={joints.hips.x}
          y1={joints.hips.y}
          x2={joints.shoulder.x}
          y2={joints.shoulder.y}
          stroke={shirtColor}
          strokeWidth="17"
          strokeLinecap="round"
        />
        {/* Stripe overlays */}
        <line
          x1={joints.hips.x - nx * 3.5}
          y1={joints.hips.y - ny * 3.5}
          x2={joints.shoulder.x - nx * 3.5}
          y2={joints.shoulder.y - ny * 3.5}
          stroke={stripeColor}
          strokeWidth="1.8"
          opacity="0.75"
        />
        <line
          x1={joints.hips.x}
          y1={joints.hips.y}
          x2={joints.shoulder.x}
          y2={joints.shoulder.y}
          stroke={stripeColor}
          strokeWidth="1.8"
          opacity="0.75"
        />
        <line
          x1={joints.hips.x + nx * 3.5}
          y1={joints.hips.y + ny * 3.5}
          x2={joints.shoulder.x + nx * 3.5}
          y2={joints.shoulder.y + ny * 3.5}
          stroke={stripeColor}
          strokeWidth="1.8"
          opacity="0.75"
        />

        {/* Head */}
        <circle cx={joints.head.x} cy={joints.head.y} r="7.5" fill={skinColor} />

        {/* Black Hair */}
        <path
          d={`M ${joints.head.x - 7.5} ${joints.head.y - 2} Q ${joints.head.x - 6.5} ${joints.head.y + 4} ${joints.head.x - 2} ${joints.head.y + 7.5} L ${joints.head.x - 7.5} ${joints.head.y + 3.5} Z`}
          fill="#111827"
        />

        {/* Striped Cap */}
        <path
          d={`M ${joints.head.x - 8} ${joints.head.y - 1} Q ${joints.head.x - 6.5} ${joints.head.y - 9.5} ${joints.head.x} ${joints.head.y - 9.5} Q ${joints.head.x + 6.5} ${joints.head.y - 9.5} ${joints.head.x + 8} ${joints.head.y - 1} Z`}
          fill="#1e293b"
        />
        <line
          x1={joints.head.x - 3.5}
          y1={joints.head.y - 9.5}
          x2={joints.head.x - 5}
          y2={joints.head.y - 1.5}
          stroke={isTeam2 ? '#fdba74' : '#93c5fd'}
          strokeWidth="1.5"
        />
        <line
          x1={joints.head.x}
          y1={joints.head.y - 10}
          x2={joints.head.x}
          y2={joints.head.y - 1.5}
          stroke={isTeam2 ? '#fdba74' : '#93c5fd'}
          strokeWidth="1.5"
        />
        <line
          x1={joints.head.x + 3.5}
          y1={joints.head.y - 9.5}
          x2={joints.head.x + 5}
          y2={joints.head.y - 1.5}
          stroke={isTeam2 ? '#fdba74' : '#93c5fd'}
          strokeWidth="1.5"
        />
      </g>
    );
  };

  // Render character Arms & Hands on top of the rope (Pass 2 of layered render)
  const renderCharacterArms = (team: 'team1' | 'team2', pose: string, cx: number, cy: number) => {
    const isTeam2 = team === 'team2';
    const skinColor = '#fed7aa'; 
    const shirtColor = isTeam2 ? '#ea580c' : '#1d4ed8'; 

    const joints = getCharacterJoints(pose, cx, cy);

    // Apply the exact same transform coordinates
    const transform = isTeam2 
      ? `translate(${cx}, ${cy}) scale(-1.7, 1.7) translate(${-cx}, ${-cy})` 
      : `translate(${cx}, ${cy}) scale(1.7) translate(${-cx}, ${-cy})`;

    return (
      <g key={`${team}-arms-${cx}`} transform={transform} className="transition-all duration-300 ease-out">
        {pose === 'CHEERING' ? (
          <>
            {/* Cheering arms */}
            <path
              d={`M ${joints.shoulder.x - 2} ${joints.shoulder.y} L ${joints.shoulder.x - 12} ${cy - 70}`}
              stroke={shirtColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${joints.shoulder.x + 2} ${joints.shoulder.y} L ${joints.shoulder.x + 12} ${cy - 70}`}
              stroke={shirtColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={joints.shoulder.x - 12} cy={cy - 72} r="2.8" fill={skinColor} />
            <circle cx={joints.shoulder.x + 12} cy={cy - 72} r="2.8" fill={skinColor} />
          </>
        ) : pose === 'FALLEN' ? (
          <>
            {/* Fallen arms */}
            <path
              d={`M ${joints.shoulder.x - 2} ${joints.shoulder.y} L ${joints.hand.x} ${joints.hand.y}`}
              stroke={shirtColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={joints.hand.x} cy={joints.hand.y} r="2.8" fill={skinColor} />
          </>
        ) : (
          <>
            {/* Double arms wrapping around and holding the rope in front */}
            <path
              d={`M ${joints.shoulder.x - 2.5} ${joints.shoulder.y} Q ${joints.shoulder.x + 6} ${joints.shoulder.y + 6} ${joints.hand.x - 4} ${joints.hand.y}`}
              stroke={shirtColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${joints.shoulder.x + 2.5} ${joints.shoulder.y} Q ${joints.shoulder.x + 10} ${joints.shoulder.y + 6} ${joints.hand.x} ${joints.hand.y}`}
              stroke={shirtColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Skin tone hands overlap on top of the rope */}
            <circle cx={joints.hand.x - 4} cy={joints.hand.y} r="2.8" fill={skinColor} />
            <circle cx={joints.hand.x} cy={joints.hand.y} r="2.8" fill={skinColor} />
          </>
        )}
      </g>
    );
  };

  // Check if active pulls are shaking the arena
  const isTense = useMemo(() => {
    return visualEvents.some(
      e => e.type === 'pull' && Date.now() - e.timestamp < 350
    );
  }, [visualEvents]);

  const timerLow = timeLeft <= 10;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      {/* Light Board Card resembling Reference Image Blackboard/Whiteboard */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        
        {/* Board Title Header */}
        <h1 className="text-2xl md:text-3xl font-black font-outfit text-blue-800 uppercase tracking-widest text-center select-none mb-6">
          Tug of War: Mathematics
        </h1>

        {/* Board Scores and Timers Panel */}
        <div className="w-full flex items-center justify-between max-w-xl mb-6 select-none">
          {/* Team 1 Score (Left) */}
          <div className="text-center">
            <span className="text-xs uppercase font-outfit font-bold tracking-wider text-slate-500 block mb-0.5">
              Team 1
            </span>
            <span className="text-5xl font-black font-outfit text-blue-600 transition-all">
              {team1.score}
            </span>
          </div>

          {/* Global Timer Pill (Center) */}
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-outfit font-bold text-sm border shadow-sm transition-all duration-300 ${
            timerLow
              ? 'bg-red-50 border-red-200 text-red-600 animate-pulse scale-105'
              : 'bg-blue-50 border-blue-100 text-blue-600'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Team 2 Score (Right) */}
          <div className="text-center">
            <span className="text-xs uppercase font-outfit font-bold tracking-wider text-slate-500 block mb-0.5">
              Team 2
            </span>
            <span className="text-5xl font-black font-outfit text-orange-600 transition-all">
              {team2.score}
            </span>
          </div>
        </div>

        {/* Playing Field SVG */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`w-full h-auto overflow-visible select-none bg-slate-50/50 border border-slate-100 rounded-2xl ${
            isTense ? 'animate-shake' : ''
          }`}
        >
          {/* Subtle Grid backdrop */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="rounded-2xl" />

          {/* Dashed Center Target Line */}
          <line
            x1="500"
            y1="10"
            x2="500"
            y2={groundY}
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="6,6"
            className="opacity-70"
          />

          {/* Ground platform line */}
          <line
            x1="180"
            y1={groundY}
            x2="820"
            y2={groundY}
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* LAYER 1: Render character Bodies (Lying underneath the rope Y=135.5) */}
          {renderCharacterBody('team1', team1Pose, flagX - 70, groundY)}
          {renderCharacterBody('team1', team1Pose, flagX - 165, groundY)}
          {renderCharacterBody('team2', team2Pose, flagX + 70, groundY)}
          {renderCharacterBody('team2', team2Pose, flagX + 165, groundY)}

          {/* LAYER 2: The Rope (Passes in front of the kids' shirts) */}
          <line
            x1="260"
            y1={ropeYGlobal}
            x2="740"
            y2={ropeYGlobal}
            stroke="#475569"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Hanging tails detail for shorter rope ends */}
          <path
            d={`M 260 ${ropeYGlobal} Q 235 ${ropeYGlobal + 5} 220 ${ropeYGlobal + 25}`}
            fill="none"
            stroke="#475569"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d={`M 740 ${ropeYGlobal} Q 765 ${ropeYGlobal + 5} 780 ${ropeYGlobal + 25}`}
            fill="none"
            stroke="#475569"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* LAYER 3: Render character Arms and Hands (Drawn on top of the rope for perfect grip) */}
          {renderCharacterArms('team1', team1Pose, flagX - 70, groundY)}
          {renderCharacterArms('team1', team1Pose, flagX - 165, groundY)}
          {renderCharacterArms('team2', team2Pose, flagX + 70, groundY)}
          {renderCharacterArms('team2', team2Pose, flagX + 165, groundY)}

          {/* Red Triangle Flag Pointer (Pointing up, touching rope at center flagX) */}
          <g transform={`translate(${flagX}, ${ropeYGlobal})`}>
            {/* flag shape */}
            <polygon
              points="0,2 7,16 -7,16"
              fill="#ef4444"
              stroke="#fff"
              strokeWidth="1.2"
              className="drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]"
            />
          </g>
        </svg>

        {/* Victory zone meter */}
        <div className="w-full max-w-xl mt-4 flex items-center justify-between gap-4">
          <span className="text-[10px] text-blue-500 font-outfit uppercase font-bold tracking-wider">
            Team 1 Zone
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-slate-200 border border-slate-300 relative overflow-hidden">
            {/* Center tick */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-400 z-10" />
            <div
              className={`absolute top-0 bottom-0 transition-all duration-300 ease-out rounded-full ${
                ropeXVisual < 0 ? 'bg-blue-600 right-1/2' : 'bg-orange-600 left-1/2'
              }`}
              style={{
                left: ropeXVisual < 0 ? `${50 + ropeXVisual / 2}%` : '50%',
                right: ropeXVisual < 0 ? '50%' : `${50 - ropeXVisual / 2}%`
              }}
            />
          </div>
          <span className="text-[10px] text-orange-600 font-outfit uppercase font-bold tracking-wider">
            Team 2 Zone
          </span>
        </div>
      </div>
    </div>
  );
};
