// src/components/BucketGrid.tsx
import React, { useRef, useEffect } from 'react';
import { Country, Bucket } from '../types';

interface BucketGridProps {
    buckets: Bucket[];
    countries: Country[];
    onDrop: (bucketId: string) => void;
    countryId?: string | null;
    mousePos?: { x: number; y: number } | null;
    submitted?: boolean;
}

function getBucketColor(rank: number, min: number, max: number): string {
    if (max === min) return '#22c55e';
    const percent = (rank - min) / (max - min);
    if (percent <= 0.5) {
        const r = 34 + percent * 2 * (234 - 34);
        const g = 197 + percent * 2 * (171 - 197);
        const b = 94 + percent * 2 * (8 - 94);
        return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
    } else {
        const r = 234 + (percent - 0.5) * 2 * (239 - 234);
        const g = 171 - (percent - 0.5) * 2 * (171 - 68);
        const b = 8 + (percent - 0.5) * 2 * (68 - 8);
        return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
    }
}

export const BucketGrid: React.FC<BucketGridProps> = ({
                                                          buckets,
                                                          countries,
                                                          onDrop,
                                                          countryId,
                                                          mousePos,
                                                          submitted = false
                                                      }) => {
    const bucketRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!countryId || !mousePos) return;
        const handleMouseUp = () => {
            bucketRefs.current.forEach((ref, idx) => {
                const bucket = buckets[idx];
                if (!ref || !bucket) return;
                const rect = ref.getBoundingClientRect();
                if (
                    mousePos.x >= rect.left &&
                    mousePos.x <= rect.right &&
                    mousePos.y >= rect.top &&
                    mousePos.y <= rect.bottom
                ) {
                    onDrop(bucket.id);
                }
            });
        };
        window.addEventListener('mouseup', handleMouseUp, { once: true });
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [countryId, mousePos, buckets, onDrop]);

    return (
        <div className="grid grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2 gap-3 p-4">
            {buckets.map((bucket, idx) => {
                const assignedCountry = countries.find(c => c.id === bucket.assignedCountryId);
                const ranks = countries.map(c => c.ranks[bucket.id]).filter((r): r is number => r !== undefined);
                const minRank = ranks.length ? Math.min(...ranks) : 0;
                const maxRank = ranks.length ? Math.max(...ranks) : 0;
                const assignedRank = assignedCountry?.ranks[bucket.id];
                const scoreColor = assignedCountry && typeof assignedRank === 'number'
                    ? getBucketColor(assignedRank, minRank, maxRank)
                    : '';

                // Only show colored border and glow after submit
                const borderStyle =
                    assignedCountry && submitted
                        ? {
                            borderColor: scoreColor,
                            boxShadow: `0 0 20px ${scoreColor}33, inset 0 0 30px ${scoreColor}11`
                        }
                        : assignedCountry && !submitted
                            ? { borderColor: '#1e293b' } // Tailwind's slate-800
                            : undefined;

                return (
                    <div
                        key={bucket.id}
                        ref={el => { bucketRefs.current[idx] = el; }}
                        className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all min-h-20 overflow-hidden
                            ${assignedCountry
                            ? 'border-2 bg-slate-900/60'
                            : 'border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-solid hover:border-primary/60'
                        }`}
                        style={borderStyle}
                    >
                        {/* Background glow effect only after submit */}
                        {assignedCountry && submitted && (
                            <div
                                className="absolute inset-0 opacity-20 blur-xl"
                                style={{ background: `radial-gradient(circle at center, ${scoreColor}, transparent 70%)` }}
                            />
                        )}

                        <div className={`relative z-10 flex flex-row items-center gap-2 justify-start w-full
                            ${assignedCountry ? 'text-white' : 'text-slate-500'}
                        `}>
                            <span className="text-2xl">{bucket.emoji}</span>
                            <p className="text-[10px] font-black uppercase tracking-widest px-1">
                                {bucket.label}
                            </p>
                        </div>

                        {assignedCountry ? (
                            <div className="relative z-10 w-full flex flex-col gap-2">
                                <div className="w-full flex items-center p-2.5 rounded-xl bg-slate-800/80 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 overflow-hidden justify-between w-full">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-lg">{assignedCountry.emoji}</span>
                                            <span className="text-[11px] font-bold text-white truncate uppercase tracking-tight">
                        {assignedCountry.name}
                    </span>
                                        </div>
                                        {submitted && (
                                            <span
                                                className="text-lg font-black"
                                                style={{ color: scoreColor }}
                                            >
                        #{assignedRank}
                    </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center w-full">
                                <div
                                    className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-slate-800/40 px-3 py-2 rounded-full border border-slate-700/50">
                                    <span className="material-symbols-outlined text-xs">add</span> Drop here
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};