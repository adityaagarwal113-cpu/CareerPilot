import React from "react";

interface AIAvatarProps {
  isSpeaking: boolean;
  isRecording: boolean;
  interviewerId: string;
  name: string;
}

export default function AIAvatar({ isSpeaking, isRecording, interviewerId, name }: AIAvatarProps) {
  // Let's customize colors/styles based on interviewerId
  let hairColor = "#334155"; // Slate hair
  let skinColor = "#fbcfe8"; // Default pink-ish skin
  let suitColor = "#1e293b"; // Dark slate suit
  let tieColor = "#e11d48"; // Rose red tie
  let shirtColor = "#ffffff"; // White shirt
  let eyeColor = "#1e293b"; // Dark blue eyes
  let gender: "male" | "female" = "male";
  let hasGlasses = false;

  // Set distinct styles for the 7 standard profiles
  if (interviewerId.includes("friendly") || interviewerId === "friendly_coach" || name.toLowerCase().includes("friendly")) {
    skinColor = "#fed7aa"; // Peach
    hairColor = "#b45309"; // Light brown / amber
    suitColor = "#3730a3"; // Indigo suit
    tieColor = "#fb7185"; // Rose
    gender = "female";
  } else if (interviewerId.includes("strict") || interviewerId === "strict_evaluator" || name.toLowerCase().includes("strict")) {
    skinColor = "#fde047"; // Yellowish olive
    hairColor = "#1e293b"; // Midnight black
    suitColor = "#0f172a"; // Deep corporate charcoal
    tieColor = "#dc2626"; // Crimson red
    gender = "male";
  } else if (interviewerId.includes("hr") || name.toLowerCase().includes("hr") || name.toLowerCase().includes("recruiter")) {
    skinColor = "#fbcfe8"; // Soft rose
    hairColor = "#78350f"; // Rich brown
    suitColor = "#047857"; // Emerald green corporate
    tieColor = "#f59e0b"; // Gold amber
    gender = "female";
  } else if (interviewerId.includes("tech") || name.toLowerCase().includes("tech") || name.toLowerCase().includes("engineer")) {
    skinColor = "#ffedd5"; // Pale peach
    hairColor = "#475569"; // Slate hair
    suitColor = "#334155"; // Tech slate blazer
    shirtColor = "#cbd5e1"; // Light gray shirt
    tieColor = "#06b6d4"; // Cyan tie
    hasGlasses = true;
    gender = "male";
  } else if (interviewerId.includes("hiring") || name.toLowerCase().includes("hiring") || name.toLowerCase().includes("manager")) {
    skinColor = "#fed7aa";
    hairColor = "#1e3a8a"; // Deep blue/black hair
    suitColor = "#1e40af"; // Cobalt blue suit
    tieColor = "#a855f7"; // Violet tie
    gender = "male";
  } else if (interviewerId.includes("partner") || name.toLowerCase().includes("partner")) {
    skinColor = "#fef08a"; // Sunny peach
    hairColor = "#64748b"; // Distinguished gray hair
    suitColor = "#020617"; // Royal black blazer
    tieColor = "#3b82f6"; // Royal blue tie
    gender = "male";
  } else if (interviewerId.includes("actuary") || name.toLowerCase().includes("chief") || name.toLowerCase().includes("actuary")) {
    skinColor = "#ffedd5";
    hairColor = "#1e293b"; // Sharp jet black
    suitColor = "#451a03"; // Rich mahogany blazer
    tieColor = "#10b981"; // Emerald green tie
    hasGlasses = true;
    gender = "female";
  }

  return (
    <div className="relative w-32 h-32 flex items-center justify-center select-none">
      {/* Dynamic Keyframes injected into the component */}
      <style>{`
        @keyframes avatar-breath {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-1.5px) scale(1.005); }
        }
        @keyframes avatar-nod {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(2px) rotate(0.8deg); }
          70% { transform: translateY(-0.5px) rotate(-0.4deg); }
        }
        @keyframes avatar-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes avatar-talk-cycle {
          0%, 100% { transform: scaleY(0.25) translateY(0px); }
          20% { transform: scaleY(1.1) translateY(-0.5px); }
          40% { transform: scaleY(0.4) translateY(0px); }
          60% { transform: scaleY(1.3) translateY(-1px); }
          80% { transform: scaleY(0.6) translateY(0px); }
        }
        @keyframes avatar-hair-drift {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(0.5deg) translateX(0.5px); }
        }
        .animate-avatar-breath {
          animation: avatar-breath 4s ease-in-out infinite;
        }
        .animate-avatar-nod {
          animation: avatar-nod 2.5s ease-in-out infinite;
        }
        .animate-avatar-blink {
          animation: avatar-blink 4.5s ease-in-out infinite;
          transform-origin: center 42px;
        }
        .animate-avatar-talk {
          animation: avatar-talk-cycle 0.35s ease-in-out infinite;
          transform-origin: center 54px;
        }
        .animate-hair {
          animation: avatar-hair-drift 6s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      {/* Main Avatar Wrapper with Conditional Breathing vs Nodding (when user speaks and interviewer listens) */}
      <div className={`w-full h-full transition-transform duration-500 ${
        isRecording ? "animate-avatar-nod" : "animate-avatar-breath"
      }`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
          {/* Subtle Ambient Behind-Head Glow */}
          <circle cx="50" cy="50" r="38" fill="url(#avatarGlow)" opacity={isSpeaking ? "0.35" : "0.15"} className="transition-opacity duration-300" />
          
          <defs>
            <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isSpeaking ? "#6366f1" : "#475569"} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            
            {/* Soft shadow */}
            <filter id="avatarShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. SHOULDERS & SUIT */}
          <g filter="url(#avatarShadow)">
            {/* Suit shoulders */}
            <path d="M15 88 C18 70, 32 68, 50 68 C68 68, 82 70, 85 88 Z" fill={suitColor} />
            
            {/* Inner White Shirt */}
            <path d="M40 68 L50 82 L60 68 Z" fill={shirtColor} />
            
            {/* Tie / Bow */}
            <path d="M47 70 L53 70 L55 84 L50 90 L45 84 Z" fill={tieColor} />
            <polygon points="45,69 50,74 55,69 50,67" fill={tieColor} opacity="0.9" />

            {/* Lapels of Suit */}
            <path d="M15 88 L34 76 L39 88 Z" fill={suitColor} brightness="0.8" opacity="0.9" />
            <path d="M85 88 L66 76 L61 88 Z" fill={suitColor} brightness="0.8" opacity="0.9" />
          </g>

          {/* 2. NECK */}
          <rect x="44" y="56" width="12" height="15" rx="3" fill={skinColor} opacity="0.95" />
          {/* Neck Shadow under chin */}
          <path d="M44 59 C47 62, 53 62, 56 59 L56 61 C53 64, 47 64, 44 61 Z" fill="#000000" opacity="0.15" />

          {/* 3. HEAD & FACE */}
          <g filter="url(#avatarShadow)">
            {/* Face base */}
            <circle cx="50" cy="45" r="18" fill={skinColor} />
            <path d="M32 45 C32 58, 68 58, 68 45 Z" fill={skinColor} /> {/* Extra chin fill */}

            {/* Nose */}
            <path d="M49 42 C49 42, 50 46, 51 46 C52 46, 51 42, 51 42" stroke="#000000" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.18" />

            {/* EARS */}
            <circle cx="31" cy="45" r="3.5" fill={skinColor} />
            <circle cx="69" cy="45" r="3.5" fill={skinColor} />
            <circle cx="31" cy="45" r="1.5" fill="#000000" opacity="0.1" />
            <circle cx="69" cy="45" r="1.5" fill="#000000" opacity="0.1" />

            {/* 4. EYES (With Blinking Animation) */}
            <g className="animate-avatar-blink">
              {/* Left Eye */}
              <circle cx="43" cy="41" r="2.2" fill="#ffffff" />
              <circle cx="43" cy="41" r="1.1" fill={eyeColor} />
              <circle cx="42.5" cy="40.5" r="0.4" fill="#ffffff" /> {/* Pupil shine */}

              {/* Right Eye */}
              <circle cx="57" cy="41" r="2.2" fill="#ffffff" />
              <circle cx="57" cy="41" r="1.1" fill={eyeColor} />
              <circle cx="56.5" cy="40.5" r="0.4" fill="#ffffff" />
            </g>

            {/* Eyebrows (Elevate slightly when talking) */}
            <path 
              d="M39 37 Q43 36, 46 38" 
              stroke={hairColor} 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              fill="none" 
              className="transition-transform duration-300"
              style={{ transform: isSpeaking ? "translateY(-1px)" : "translateY(0)" }}
            />
            <path 
              d="M61 37 Q57 36, 54 38" 
              stroke={hairColor} 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              fill="none" 
              className="transition-transform duration-300"
              style={{ transform: isSpeaking ? "translateY(-1px)" : "translateY(0)" }}
            />

            {/* 5. GLASSES (If enabled) */}
            {hasGlasses && (
              <g stroke="#334155" strokeWidth="1" fill="none" opacity="0.9">
                {/* Left Frame */}
                <circle cx="43" cy="41" r="3.8" />
                {/* Right Frame */}
                <circle cx="57" cy="41" r="3.8" />
                {/* Bridge */}
                <path d="M47 41 L53 41" />
                {/* Temples */}
                <path d="M39 41 L33 39" />
                <path d="M61 41 L67 39" />
              </g>
            )}

            {/* 6. MOUTH (With Talking Animation when isSpeaking is true) */}
            <g>
              {isSpeaking ? (
                // Active speech mouth
                <ellipse 
                  cx="50" 
                  cy="51" 
                  rx="3.5" 
                  ry="2.5" 
                  fill="#451a03" 
                  className="animate-avatar-talk" 
                />
              ) : (
                // Static closed mouth - happy/neutral smile
                <path 
                  d="M46 51 Q50 54, 54 51" 
                  stroke="#451a03" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  fill="none" 
                />
              )}
            </g>

            {/* 7. HAIR (Different styles based on Gender) */}
            <g className="animate-hair" fill={hairColor}>
              {gender === "female" ? (
                // Elegant styled bob hair framing the face
                <>
                  <path d="M31 35 C33 24, 67 24, 69 35 C72 42, 73 50, 71 55 C69 50, 68 46, 68 40 C62 31, 38 31, 32 40 C32 46, 31 50, 29 55 C27 50, 28 42, 31 35 Z" />
                  {/* Fringe/Bang details */}
                  <path d="M35 32 C45 28, 50 31, 53 33 C45 31, 38 33, 35 32 Z" opacity="0.85" />
                </>
              ) : (
                // Smart professional short crop hair
                <>
                  <path d="M31 36 C32 23, 68 23, 69 36 C70 33, 67 28, 50 28 C33 28, 30 33, 31 36 Z" />
                  {/* Sideburns */}
                  <path d="M31 36 L33 42 L35 39 Z" />
                  <path d="M69 36 L67 42 L65 39 Z" />
                </>
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* Voice Level Pulse Aura */}
      {isSpeaking && (
        <span className="absolute inset-0 rounded-full border border-indigo-400/35 animate-ping opacity-60 pointer-events-none scale-105" />
      )}
    </div>
  );
}
