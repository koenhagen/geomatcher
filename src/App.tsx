import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Header} from './components/Header';
import {InstructionCard} from './components/InstructionCard';
import {CountryList} from './components/CountryList';
import {BucketGrid} from './components/BucketGrid';
import {GameFooter} from './components/GameFooter';
import {FinalPage} from './components/FinalPage';
import {Bucket, Country, RoundResult} from './utils/types';
import {getScoreForRank} from './utils/score';

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
                const emojiRow = lines[1];
                const dataRows = lines.slice(2);

                if (!header || !emojiRow) return;
                const columns = header.split(',');
                const emojiValues = emojiRow.split(',');

                const statEmojiMap: Record<string, string> = {};
                columns.forEach((col, i) => {
                    statEmojiMap[col] = emojiValues[i] || '';
                });

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

    // Calculate per-bucket ranks for the current round
    const bucketRanks = useMemo(() => {
        return buckets.map(bucket => {
            if (!bucket.assignedCountryId) return 0;
            const country = countries.find(c => c.id === bucket.assignedCountryId);
            if (!country) return 0;
            const allRanks = countries.map(c => c.ranks[bucket.id]).filter((v): v is number => v !== undefined);
            const sortedRanks = [...allRanks].sort((a, b) => a - b);
            const assignedRankValue = country.ranks[bucket.id];
            return assignedRankValue !== undefined
                ? sortedRanks.indexOf(assignedRankValue) + 1
                : 0;
        });
    }, [buckets, countries]);

    // Calculate scores from ranks
    const bucketScores = useMemo(() => {
        const totalCountries = countries.length;
        return bucketRanks.map(rank => getScoreForRank(rank, totalCountries));
    }, [bucketRanks, countries.length]);

    const roundScore = useMemo(() => {
        return bucketScores.reduce((acc, score) => acc + score, 0);
    }, [bucketScores]);

    const totalScore = useMemo(() => {
        return roundResults.reduce((acc, r) => acc + r.score, 0) + (submitted ? roundScore : 0);
    }, [roundResults, roundScore, submitted]);

    const handleSubmit = useCallback(() => {
        if (!submitted) {
            setSubmitted(true);
            return;
        }
        if (slotsFilled < buckets.length) return;
        const newResult: RoundResult = { round, score: roundScore, bucketRanks };
        const updatedResults = [...roundResults, newResult];
        setRoundResults(updatedResults);

        if (round >= MAX_ROUNDS) {
            setGameComplete(true);
        } else {
            setRound(round + 1);
            setSubmitted(false);
        }
    }, [submitted, slotsFilled, buckets.length, round, roundScore, bucketRanks, roundResults]);

    useEffect(() => {
        setSubmitted(false);
    }, [round]);

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