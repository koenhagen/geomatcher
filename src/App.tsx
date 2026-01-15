// src/App.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { InstructionCard } from './components/InstructionCard';
import { CountryList } from './components/CountryList';
import { BucketGrid } from './components/BucketGrid';
import { GameFooter } from './components/GameFooter';
import {FinalPage} from "./components/FinalPage";
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

    const [submitted, setSubmitted] = useState(false);

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
        return roundResults.reduce((acc, r) => acc + r.score, 0) + (submitted ? roundScore : 0);
    }, [roundResults, roundScore, submitted]);

    const handleSubmit = useCallback(() => {
        if (!submitted) {
            setSubmitted(true);
            return;
        }
        // Only advance round if already submitted
        if (slotsFilled < buckets.length) return;
        const newResult: RoundResult = { round, score: roundScore };
        const updatedResults = [...roundResults, newResult];
        setRoundResults(updatedResults);

        if (round >= MAX_ROUNDS) {
            setGameComplete(true);
        } else {
            setRound(round + 1);
            setSubmitted(false); // Reset for next round
        }
    }, [submitted, slotsFilled, buckets.length, round, roundScore, roundResults]);

    useEffect(() => {
        setSubmitted(false);
    }, [round]);

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
        return (
            <FinalPage
                roundResults={roundResults}
                onPlayAgain={handlePlayAgain}
                maxRounds={MAX_ROUNDS}
            />
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
                    <h3 className="text-white text-lg font-bold leading-tight tracking-tight">Today's Categories</h3>
                </div>

                <BucketGrid
                    buckets={buckets}
                    countries={countries}
                    onDrop={handleDrop}
                    countryId={countryId}
                    mousePos={mousePos}
                    submitted={submitted}
                />
            </main>

            <GameFooter
                totalScore={totalScore}
                slotsFilled={slotsFilled}
                totalSlots={buckets.length}
                round={round}
                maxRounds={MAX_ROUNDS}
                onSubmit={handleSubmit}
                submitted={submitted}
            />
        </div>
    );
};

export default App;