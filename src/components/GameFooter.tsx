import React from 'react';

interface GameFooterProps {
    totalScore: number;
    slotsFilled: number;
    totalSlots: number;
    round: number;
    maxRounds: number;
    onSubmit: () => void;
}

export const GameFooter: React.FC<GameFooterProps> = ({
                                                          totalScore,
                                                          slotsFilled,
                                                          totalSlots,
                                                          round,
                                                          maxRounds,
                                                          onSubmit,
                                                      }) => {
    const isComplete = slotsFilled === totalSlots;
    const progressPercent = (slotsFilled / totalSlots) * 100;
    const isFinalRound = round >= maxRounds;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-background-dark/90 backdrop-blur-xl border-t border-slate-800 p-3 pb-4 space-y-4 z-100 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-end justify-between px-1 max-w-7xl mx-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Score</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-primary drop-shadow-[0_0_10px_rgba(19,127,236,0.3)]">{totalScore}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Slots Filled</span>
                    <span className="text-xl font-black text-white">{slotsFilled} <span className="text-slate-600">/ {totalSlots}</span></span>
                </div>
            </div>

            <div className="px-1 max-w-7xl mx-auto">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-700/50">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-[2px]" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-1">
                <button
                    disabled={!isComplete}
                    onClick={onSubmit}
                    className={`flex w-full items-center justify-center overflow-hidden rounded-2xl h-12 px-4 text-base font-black uppercase tracking-widest transition-all
                        ${isComplete
                        ? 'bg-primary text-white shadow-[0_8px_20px_rgba(19,127,236,0.3)] hover:scale-[1.02] active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                >
                    <span className="truncate">
                        {isComplete
                            ? (isFinalRound ? 'Finish' : 'Next Round')
                            : `Fill ${totalSlots - slotsFilled} more to submit`}
                    </span>
                </button>
            </div>
        </div>
    );
};