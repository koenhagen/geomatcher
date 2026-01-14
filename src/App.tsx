// src/App.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { InstructionCard } from './components/InstructionCard';
import { CountryList } from './components/CountryList';
import { BucketGrid } from './components/BucketGrid';
import { GameFooter } from './components/GameFooter';
import { Country, Bucket } from './types';


type RoundResult = {
    round: number;
    score: number;
};

const MAX_ROUNDS = 3;

const App: React.FC = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [showInstructions, setShowInstructions] = useState(true);
    const [countryId, setCountryId] = useState<string | null>(null);

    const [round, setRound] = useState(1);
    const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
    const [gameComplete, setGameComplete] = useState(false);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (gameComplete) return;
        fetch(`/geomatcher/ranks.csv`)
            .then(res => res.text())
            .then(text => {
                const lines = text.trim().split('\n');
                if (lines.length < 3) return;

                const header = lines[0];
                const emojiRow = lines[1]; // Second row contains stat emojis
                const dataRows = lines.slice(2); // Skip header and emoji row

                if (!header || !emojiRow) return;
                const columns = header.split(',');
                const emojiValues = emojiRow.split(',');

                // Create stat emoji map (column name -> emoji)
                const statEmojiMap: Record<string, string> = {};
                columns.forEach((col, i) => {
                    statEmojiMap[col] = emojiValues[i] || '';
                });

                // Filter out non-stat columns
                const statColumns = columns.filter(col =>
                    col !== 'Abbreviation' && col !== 'Country' && col !== 'Emoji'
                );

                const parsed = dataRows.map(row => {
                    const values = row.split(',');
                    const obj: Record<string, string> = {};
                    columns.forEach((col, i) => (obj[col] = values[i] ?? ''));
                    return obj;
                });

                const shuffledCountries = parsed.sort(() => Math.random() - 0.5).slice(0, 6);
                const shuffledStats = statColumns.sort(() => Math.random() - 0.5).slice(0, 6);

                setCountries(
                    shuffledCountries.map((c, idx) => ({
                        id: c.Abbreviation || c.Country || String(idx),
                        name: c.Country || '',
                        abbreviation: c.Abbreviation || '',
                        emoji: c.Emoji || '',
                        ranks: Object.fromEntries(shuffledStats.map(stat => [stat, Number(c[stat]) || 0]))
                    }))
                );

                setBuckets(
                    shuffledStats.map(stat => ({
                        id: stat,
                        label: stat,
                        emoji: statEmojiMap[stat] || '',
                        assignedCountryId: null
                    }))
                );
            });
    }, [round, gameComplete]);

    // ... rest of the component remains the same
    const handleDismissInstructions = useCallback(() => {
        setShowInstructions(false);
    }, []);

    const handleDragStart = useCallback((id: string) => {
        setCountryId(id);
    }, []);

    const handleDrop = useCallback((bucketId: string) => {
        if (!countryId) return;
        setBuckets(prev =>
            prev.map(b =>
                b.id === bucketId && b.assignedCountryId === null
                    ? { ...b, assignedCountryId: countryId }
                    : b
            )
        );
        setCountryId(null);
    }, [countryId]);


    const slotsFilled = useMemo(
        () => buckets.filter(b => b.assignedCountryId !== null).length,
        [buckets]
    );

    const roundScore = useMemo(() => {
        return buckets.reduce((acc, bucket) => {
            if (!bucket.assignedCountryId) return acc;
            const country = countries.find(c => c.id === bucket.assignedCountryId);
            return acc + (country?.ranks[bucket.id] || 0);
        }, 0);
    }, [buckets, countries]);

    const totalScore = useMemo(() => {
        return roundResults.reduce((acc, r) => acc + r.score, 0) + (gameComplete ? 0 : roundScore);
    }, [roundResults, roundScore, gameComplete]);

    const handleSubmit = useCallback(() => {
        if (slotsFilled < buckets.length) return;

        const newResult: RoundResult = { round, score: roundScore };
        const updatedResults = [...roundResults, newResult];
        setRoundResults(updatedResults);

        if (round >= MAX_ROUNDS) {
            setGameComplete(true);
        } else {
            setRound(round + 1);
        }
    }, [slotsFilled, buckets.length, round, roundScore, roundResults]);

    const handlePlayAgain = useCallback(() => {
        setRound(1);
        setRoundResults([]);
        setGameComplete(false);
        setShowInstructions(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        if (countryId) {
            window.addEventListener('mousemove', handleMouseMove);
        } else {
            setMousePos(null);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [countryId]);

    if (gameComplete) {
        const finalTotal = roundResults.reduce((acc, r) => acc + r.score, 0);
        return (
            <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto bg-background-dark font-display">
                <Header round={MAX_ROUNDS} maxRounds={MAX_ROUNDS} />
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
                        onClick={handlePlayAgain}
                        className="w-full max-w-md h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-wider shadow-[0_8px_20px_rgba(19,127,236,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Play Again
                    </button>
                </main>
            </div>
        );
    }

    if (!countries.length || !buckets.length) return <div>Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto bg-background-dark font-display">
            <Header round={round} maxRounds={MAX_ROUNDS} />

            <main className="flex-1 overflow-y-auto pb-80 custom-scrollbar">
                {showInstructions && (
                    <div className="px-4 pt-4">
                        <InstructionCard onDismiss={handleDismissInstructions} />
                    </div>
                )}

                <div className="px-4 pt-6 pb-2">
                    <h3 className="text-white text-lg font-bold leading-tight tracking-tight flex items-center gap-2">
                        Available Countries
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 uppercase font-semibold tracking-wider">
                            {countries.length - slotsFilled} LEFT
                        </span>
                    </h3>
                </div>

                <CountryList
                    countries={countries}
                    buckets={buckets}
                    onDragStart={handleDragStart}
                    countryId={countryId}
                    setCountryId={setCountryId}
                />

                <div className="px-4 pt-4">
                    <h3 className="text-white text-lg font-bold leading-tight tracking-tight">Statistics</h3>
                </div>

                <BucketGrid
                    buckets={buckets}
                    countries={countries}
                    onDrop={handleDrop}
                    countryId={countryId}
                    mousePos={mousePos}
                />
            </main>

            <GameFooter
                totalScore={totalScore}
                slotsFilled={slotsFilled}
                totalSlots={buckets.length}
                round={round}
                maxRounds={MAX_ROUNDS}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default App;