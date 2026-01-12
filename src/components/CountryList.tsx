import React, { useState } from 'react';

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

interface CountryListProps {
  countries: Country[];
  buckets: Bucket[];
  onDragStart: (id: string) => void;
}

export const CountryList: React.FC<CountryListProps> = ({ countries, buckets, onDragStart }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const assignedIds = buckets.map(b => b.assignedCountryId).filter(id => id !== null);

  return (
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 custom-scrollbar snap-x snap-mandatory">
        {countries.map((country) => {
          const isAssigned = assignedIds.includes(country.id);
          const isDragging = draggedId === country.id;

          return (
              <div
                  key={country.id}
                  draggable={!isAssigned}
                  onDragStart={() => {
                    setDraggedId(country.id);
                    onDragStart(country.id);
                  }}
                  onDragEnd={() => setDraggedId(null)}
                  className={`flex-shrink-0 w-28 aspect-[3/4] rounded-2xl border-2 shadow-xl p-4 flex flex-col items-center justify-center gap-3 snap-start transition-all
              ${isAssigned
                      ? 'bg-slate-900/20 border-slate-800 opacity-30 grayscale cursor-not-allowed'
                      : `bg-slate-800 border-slate-700 cursor-grab active:cursor-grabbing hover:scale-105 hover:border-primary/50 border-b-4 border-b-primary/40 ${
                          isDragging ? 'z-50' : ''
                      }`
                  }`}
                  style={isDragging ? { opacity: 1, filter: 'none' } : undefined}
              >
                <p className="text-white text-xs font-extrabold text-center uppercase tracking-wide">{country.name}</p>
              </div>
          );
        })}
      </div>
  );
};