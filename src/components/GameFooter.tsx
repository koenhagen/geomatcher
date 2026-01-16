import React from 'react';

interface GameFooterProps {
    totalScore: number;
    slotsFilled: number;
    totalSlots: number;
    round: number;
    maxRounds: number;
    onSubmit: () => void;
    submitted: boolean;
    children?: React.ReactNode;
}

export const GameFooter: React.FC<GameFooterProps> = ({
                                                          slotsFilled,
                                                          totalSlots,
                                                          round,
                                                          maxRounds,
                                                          onSubmit,
                                                          submitted,
                                                          children,
                                                      }) => {
    const isComplete = slotsFilled === totalSlots;
    const isFinalRound = round >= maxRounds;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-background-dark/90 backdrop-blur-xl border-t border-slate-800 p-3 pb-4 space-y-4 z-100 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-1">
                {children}
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
                        {!submitted
                            ? (isComplete
                                ? 'Submit'
                                : `Fill ${totalSlots - slotsFilled} more to submit`)
                            : (isFinalRound ? 'Finish' : 'Next Round')
                        }
                    </span>
                </button>
            </div>
        </div>
    );
};