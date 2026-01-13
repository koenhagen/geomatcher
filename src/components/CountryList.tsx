// src/components/CountryList.tsx
import React, { useState, useRef } from 'react';
import { Country, Bucket } from '../types';

interface CountryListProps {
  countries: Country[];
  buckets: Bucket[];
  onDragStart: (id: string) => void;
}

export const CountryList: React.FC<CountryListProps> = ({ countries, buckets, onDragStart }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const assignedIds = buckets.map(b => b.assignedCountryId).filter(id => id !== null);
  const dragCountry = countries.find(c => c.id === draggedId);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, countryId: string) => {
    if (assignedIds.includes(countryId)) return;
    setDraggedId(countryId);
    setDragPos({ x: e.clientX, y: e.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    onDragStart(countryId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    setDragPos({ x: e.clientX, y: e.clientY });
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (e.clientX - rect.left < 40) {
        containerRef.current.scrollLeft -= 20;
      } else if (rect.right - e.clientX < 40) {
        containerRef.current.scrollLeft += 20;
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedId(null);
    setDragPos(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
      <div ref={containerRef} className="flex gap-3 overflow-x-auto px-4 pb-4 custom-scrollbar snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch', position: 'relative' }}>
        {countries.map((country) => {
          const isAssigned = assignedIds.includes(country.id);
          const isDragging = draggedId === country.id;
          return (
              <div
                  key={country.id}
                  onMouseDown={e => handleMouseDown(e, country.id)}
                  style={isDragging ? { visibility: 'hidden' } : undefined}
                  className={`shrink-0 w-28 aspect-3/4 rounded-2xl border-2 shadow-xl p-4 flex flex-col items-center justify-center gap-2 snap-start transition-all
              ${isAssigned
                      ? 'bg-slate-900/20 border-slate-800 opacity-30 grayscale cursor-not-allowed'
                      : 'bg-slate-800 border-slate-700 cursor-grab active:cursor-grabbing hover:scale-105 hover:border-primary/50 border-b-4 border-b-primary/40'
                  }`}
              >
                <span className="text-3xl">{country.emoji}</span>
                <p className="text-white text-xs font-extrabold text-center uppercase tracking-wide">{country.name}</p>
              </div>
          );
        })}
        {dragCountry && dragPos && (
            <div
                style={{
                  position: 'fixed',
                  left: dragPos.x - 56,
                  top: dragPos.y - 80,
                  width: '7rem',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
                className="aspect-3/4 rounded-2xl border-2 shadow-xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-800 border-slate-700"
            >
              <span className="text-3xl">{dragCountry.emoji}</span>
              <p className="text-white text-xs font-extrabold text-center uppercase tracking-wide">{dragCountry.name}</p>
            </div>
        )}
      </div>
  );
};