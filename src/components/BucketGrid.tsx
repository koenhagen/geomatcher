import React from 'react';

// Types matching your App.tsx
type Country = {
  id: string;
  name: string;
  abbreviation: string;
  ranks: Record<string, number>;
  flagUrl?: string; // Optional, if you add flags
};

type Bucket = {
  id: string;
  label: string;
  assignedCountryId: string | null;
};

interface BucketGridProps {
  buckets: Bucket[];
  countries: Country[];
  onDrop: (bucketId: string) => void;
}

export const BucketGrid: React.FC<BucketGridProps> = ({ buckets, countries, onDrop }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {buckets.map((bucket) => {
          const assignedCountry = countries.find(c => c.id === bucket.assignedCountryId);

          return (
              <div
                  key={bucket.id}
                  onDragOver={handleDragOver}
                  onDrop={() => onDrop(bucket.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-h-[110px]
              ${assignedCountry
                      ? 'border-primary bg-primary/10 scale-100 shadow-[0_0_15px_rgba(19,127,236,0.1)]'
                      : 'border-dashed border-slate-700 bg-slate-900/40'
                  }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest text-center px-1
              ${assignedCountry ? 'text-primary' : 'text-slate-500'}
            `}>
                  {bucket.label}
                </p>

                {assignedCountry ? (
                    <div
                        className="w-full flex items-center justify-between bg-slate-800 p-2.5 rounded-xl shadow-lg border border-primary/30 relative"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                            className="size-5 flex-shrink-0 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${assignedCountry.flagUrl ?? ''}")` }}
                        />
                        <span className="text-[11px] font-bold text-white truncate uppercase tracking-tighter">
        {assignedCountry.name}
      </span>
                      </div>
                      <span className="text-primary text-base font-bold">
      {assignedCountry.ranks[bucket.id]}
    </span>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center w-full">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-slate-800/20 px-3 py-1.5 rounded-full border border-slate-800">
                        <span className="material-symbols-outlined text-xs">add</span> Drop
                      </div>
                    </div>
                )}
              </div>
          );
        })}
      </div>
  );
};
