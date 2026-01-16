import React from 'react';

interface HeaderProps {
    round: number;
    maxRounds: number;
    totalScore: number;
    slotsFilled: number;
    totalSlots: number;
}

export const Header: React.FC<HeaderProps> = ({
                                                  round,
                                                  maxRounds,
                                                  totalScore,
                                                  slotsFilled,
                                                  totalSlots,
                                              }) => {
    const progressPercent = (slotsFilled / totalSlots) * 100;

    return (
        <header className="sticky top-0 z-40 w-full flex flex-col gap-2 bg-background-dark/80 backdrop-blur-md p-4 pb-2 border-b border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
                <div className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">help</span>
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Geomatcher</h2>
                    <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
                        ROUND {round} OF {maxRounds}
                    </span>
                </div>
                <div className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">settings</span>
                </div>
            </div>
            {/* Rails-constrained content */}
            <div className="max-w-7xl mx-auto w-full px-1">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Score</span>
                        <span className="text-xl font-black text-primary drop-shadow-[0_0_10px_rgba(19,127,236,0.3)]">{totalScore}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Slots Filled</span>
                        <span className="text-xl font-black text-white">{slotsFilled} <span className="text-slate-600">/ {totalSlots}</span></span>
                    </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-700/50 mt-2">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-[2px]" />
                    </div>
                </div>
            </div>
        </header>
    );
};