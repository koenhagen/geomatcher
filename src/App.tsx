import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { InstructionCard } from './components/InstructionCard';
import { CountryList } from './components/CountryList';
import { BucketGrid } from './components/BucketGrid';
import { GameFooter } from './components/GameFooter';

type Country = {
    id: string;
    name: string;
    abbreviation: string;
    ranks: Record<string, number>;
};

type Bucket = {
    id: string;
    label: string;
    assignedCountryId: string | null;
};

const MAX_ROUNDS = 5;

const App: React.FC = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [showInstructions, setShowInstructions] = useState(true);
    const [draggedCountryId, setDraggedCountryId] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [round, setRound] = useState(1);

    useEffect(() => {
        fetch('/ranks.csv')
            .then(res => res.text())
            .then(text => {
                const [header, ...rows] = text.trim().split('\n');
                if (!header) return;
                const columns = header.split(',');
                const statColumns = columns.filter(col => col !== 'Abbreviation' && col !== 'Country');
                const parsed = rows.map(row => {
                    const values = row.split(',');
                    const obj: Record<string, string> = {};
                    columns.forEach((col, i) => (obj[col] = values[i] ?? ''));
                    return obj;
                });

                const shuffledCountries = parsed.sort(() => Math.random() - 0.5).slice(0, 10); // 10 countries
                const shuffledStats = statColumns.sort(() => Math.random() - 0.5).slice(0, 9); // 9 buckets

                setCountries(
                    shuffledCountries.map((c, idx) => ({
                        id: c.Abbreviation || c.Country || String(idx),
                        name: c.Country || '',
                        abbreviation: c.Abbreviation || '',
                        ranks: Object.fromEntries(shuffledStats.map(stat => [stat, Number(c[stat]) || 0]))
                    }))
                );

                setBuckets(
                    shuffledStats.map(stat => ({
                        id: stat,
                        label: stat,
                        assignedCountryId: null
                    }))
                );
            });
    }, [round]);

    const handleDismissInstructions = useCallback(() => {
        setShowInstructions(false);
    }, []);

    const handleDragStart = useCallback((countryId: string) => {
        setDraggedCountryId(countryId);
    }, []);

    const handleDrop = useCallback((bucketId: string) => {
        if (!draggedCountryId) return;
        setBuckets(prev =>
            prev.map(b =>
                b.id === bucketId && b.assignedCountryId === null
                    ? { ...b, assignedCountryId: draggedCountryId }
                    : b
            )
        );
        setDraggedCountryId(null);
    }, [draggedCountryId]);

    const slotsFilled = useMemo(
        () => buckets.filter(b => b.assignedCountryId !== null).length,
        [buckets]
    );

    const totalScore = useMemo(() => {
        return buckets.reduce((acc, bucket) => {
            if (!bucket.assignedCountryId) return acc;
            const country = countries.find(c => c.id === bucket.assignedCountryId);
            return acc + (country?.ranks[bucket.id] || 0);
        }, 0);
    }, [buckets, countries]);

    const handleSubmit = useCallback(() => {
        if (slotsFilled < buckets.length) return;
        setIsFinished(true);
        alert(`Round ${round} Complete!\nYour Total Rank Score: ${totalScore}\n(Lower is better)`);
        // Optionally: setRound(round + 1) and reset for next round
    }, [slotsFilled, buckets.length, round, totalScore]);

    if (!countries.length || !buckets.length) return <div>Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto bg-background-dark font-display">
            <Header round={round} maxRounds={MAX_ROUNDS} />

            <main className="flex-1 overflow-y-auto pb-48 custom-scrollbar">
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
                />

                <div className="px-4 pt-4 pb-2">
                    <h3 className="text-white text-lg font-bold leading-tight tracking-tight">Statistic Buckets</h3>
                </div>

                <BucketGrid
                    buckets={buckets}
                    countries={countries}
                    onDrop={handleDrop}
                />
            </main>

            <GameFooter
                totalScore={totalScore}
                slotsFilled={slotsFilled}
                totalSlots={buckets.length}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default App;
