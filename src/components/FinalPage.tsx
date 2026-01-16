import React from 'react';
import { RoundResult } from '../utils/types';
import { getScoreForRank, rankToColor } from '../utils/score';

interface FinalPageProps {
    roundResults: RoundResult[];
    maxRounds: number;
}

export const FinalPage: React.FC<FinalPageProps> = ({ roundResults, maxRounds }) => {
    const finalTotal = roundResults.reduce((acc, r) => acc + r.score, 0);

    const handleShare = async () => {
        const lines = [
            `Geomatcher ${new Date().toLocaleDateString()}`,
            '',
            ...roundResults.map(r =>
                `Round ${r.round}: ${r.bucketRanks.map(rank => rankToColor(rank, r.bucketRanks.length)).join(' ')}`
            ),
            '',
            `Final Score: ${finalTotal}`,
            'https://koenhagen.github.io/geomatcher/'
        ];
        const text = lines.join('\n');
        await navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
    };

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

                <div className="w-full max-w-xl bg-slate-900/80 rounded-2xl p-6 mb-8 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Round Breakdown</h2>
                    <table className="w-full text-left text-white text-sm">
                        <thead>
                        <tr>
                            <th className="py-1 px-2">Round</th>
                            <th className="py-1 px-2">Score</th>
                            <th className="py-1 px-2">Bucket Ranks</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roundResults.map(r => (
                            <tr key={r.round} className="border-t border-slate-800">
                                <td className="py-1 px-2 font-bold">#{r.round}</td>
                                <td className="py-1 px-2">{r.score}</td>
                                <td className="py-1 px-2">
                                    {r.bucketRanks.map((rank, i) => (
                                        <span
                                            key={i}
                                            className="inline-block text-xl align-middle mr-1"
                                            title={`Rank: ${rank}, Score: ${getScoreForRank(rank, r.bucketRanks.length)}`}
                                        >
                                            {rankToColor(rank, r.bucketRanks.length)}
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-center space-y-1 p-6 bg-slate-800/40 rounded-2xl border border-slate-700 w-full max-w-md">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Final Total Score
                    </span>
                    <p className="text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(19,127,236,0.4)]">
                        {finalTotal}
                    </p>
                </div>

                <button
                    onClick={handleShare}
                    className="w-full max-w-md h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-wider shadow-[0_8px_20px_rgba(19,127,236,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Share Score
                </button>
            </main>
        </div>
    );
};