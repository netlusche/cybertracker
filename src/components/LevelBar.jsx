import React from 'react';

const LevelBar = ({ level, currentXP, totalXPForLevel, isLevelUp }) => {
    // Simple calculation: progress = (currentXP % 100) assuming fixed 100XP per level or passed totalXP
    // For this simplified version: let's assume levels are every 100 XP.
    const progress = (currentXP % 100);

    return (
        <div className={`w-full mb-6 p-4 rounded-lg bg-cyber-dark border transition-all duration-500 ${isLevelUp ? 'border-cyber-neonPink shadow-[0_0_30px_#ff00ff] scale-105' : 'border-cyber-neonPink shadow-[0_0_15px_rgba(255,0,255,0.3)]'}`}>
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-xs text-gray-300 uppercase tracking-widest">Operator Level</span>
                    <div className="text-3xl font-bold text-white font-mono leading-none animate-pulse">
                        {isLevelUp ? 'LEVEL UP!' : `LVL ${level}`}
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-cyber-neonPink font-bold text-xl">{currentXP}</span>
                    <span className="text-gray-300 text-sm"> XP Total</span>
                </div>
            </div>

            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-neonPink to-purple-600 transition-all duration-1000 ease-out shadow-[0_0_10px_#ff00ff]"
                    style={{ width: `${progress}%` }}
                ></div>
                {/* Striped overlay for cyberpunk effect */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
            </div>
            <div className="text-right text-[10px] text-gray-500 mt-1 font-mono">
                NEXT RANK: {100 - progress} XP REQUIRED
            </div>
        </div>
    );
};

export default LevelBar;
