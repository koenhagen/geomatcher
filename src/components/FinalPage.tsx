// src/components/FinalPage.tsx
import React from 'react';

type RoundResult = {
    round: number;
    score: number;
};

interface FinalPageProps {
    roundResults: RoundResult[];
    onPlayAgain: () => void;
    maxRounds: number;
}

export const FinalPage: React.FC<FinalPageProps> = ({ roundResults, onPlayAgain, maxRounds }) => {
    const finalTotal = roundResults.reduce((acc, r) => acc + r.score, 0);

    return (
        <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto bg-background-dark font-display">
            <header className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-800">
                <div className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">help</span>
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Geomatcher</h2>
                    <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
                        ROUND {maxRounds} OF {maxRounds}
                    </span>
                </div>
                <div className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">settings</span>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                <div className="text-center space-y-2">
                    <span className="material-symbols-outlined text-6xl text-primary">emoji_events</span>
                    <h1 className="text-3xl font-black text-white">Game Complete!</h1>
                    <p className="text-slate-400 text-sm">Here's how you did across all rounds</p>
                </div>

                <div className="w-full max-w-md space-y-3">
                    {roundResults.map((result) => (
                        <div
                            key={result.round}
                            className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700"
                        >
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                Round {result.round}
                            </span>
                            <span className="text-xl font-black text-white">{result.score}</span>
                        </div>
                    ))}
                </div>

                <div className="text-center space-y-1 p-6 bg-slate-800/40 rounded-2xl border border-slate-700 w-full max-w-md">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Final Total Score
                    </span>
                    <p className="text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(19,127,236,0.4)]">
                        {finalTotal}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Lower is better!</p>
                </div>

                <button
                    onClick={onPlayAgain}
                    className="w-full max-w-md h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-wider shadow-[0_8px_20px_rgba(19,127,236,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Play Again
                </button>
            </main>
        </div>
    );
};