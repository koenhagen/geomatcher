import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Country, Bucket } from '../utils/types';

interface CountryListProps {
  countries: Country[];
  buckets: Bucket[];
  onDragStart: (id: string) => void;
  countryId: string | null;
  setCountryId: (id: string | null) => void;
}

export const CountryList: React.FC<CountryListProps> = ({
                                                          countries,
                                                          buckets,
                                                          onDragStart,
                                                          countryId,
                                                          setCountryId,
                                                        }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = useState<{ width: number; height: number }>({ width: 104, height: 88 });

  const startPos = useRef<{ x: number, y: number } | null>(null);
  const pendingCountryId = useRef<string | null>(null);

  const assignedIds = buckets.map(b => b.assignedCountryId).filter(id => id !== null);
  const dragCountry = countries.find(c => c.id === draggedId);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (assignedIds.includes(id)) return;
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardSize({ width: rect.width, height: rect.height });
    }
    startPos.current = { x: e.clientX, y: e.clientY };
    pendingCountryId.current = id;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!startPos.current || !pendingCountryId.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5 && !draggedId) {
      setDraggedId(pendingCountryId.current);
      onDragStart(pendingCountryId.current);
    }
    if (draggedId || distance > 5) {
      setDragPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (!draggedId && pendingCountryId.current) {
      setCountryId(pendingCountryId.current);
    }
    setDraggedId(null);
    setDragPos(null);
    startPos.current = null;
    pendingCountryId.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Render drag preview as a portal to body
  const dragPreview = dragCountry && dragPos
      ? ReactDOM.createPortal(
          <div
              style={{
                position: 'fixed',
                left: dragPos.x - cardSize.width / 2,
                top: dragPos.y - cardSize.height / 2,
                width: cardSize.width,
                zIndex: 1000,
                pointerEvents: 'none',
              }}
              className="rounded-xl border-2 shadow-lg p-1 flex flex-col items-center justify-center gap-0.5 bg-slate-800 border-slate-700"
          >
            <span className="text-lg select-none">{dragCountry.emoji}</span>
            <p className="text-white text-[10px] font-extrabold text-center uppercase tracking-wide select-none">
              {dragCountry.name}
            </p>
          </div>,
          document.body
      )
      : null;

  return (
      <>
        <div
            className="grid grid-rows-2 grid-flow-col auto-cols-fr gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-6 gap-y-1.5 w-full px-4
    sm:grid-rows-1 sm:grid-cols-6"
            style={{ position: 'relative', minHeight: '5.5rem' }}
        >
          {countries.map((country, idx) => {
            const isAssigned = assignedIds.includes(country.id);
            const isDragging = draggedId === country.id;
            const isSelected = countryId === country.id;

            return (
                <div
                    key={country.id}
                    ref={idx === 0 ? cardRef : undefined}
                    onMouseDown={e => handleMouseDown(e, country.id)}
                    style={isDragging ? { visibility: 'hidden' } : undefined}
                    className={`rounded-xl border-2 shadow-lg p-1 flex flex-col items-center justify-center gap-0.5 transition-all
                ${isAssigned
                        ? 'bg-slate-900/20 border-slate-800 opacity-30 grayscale cursor-not-allowed'
                        : isSelected
                            ? 'bg-slate-900 border-primary cursor-pointer scale-105 border-b-4 border-b-primary/40'
                            : 'bg-slate-800 border-slate-700 cursor-grab active:cursor-grabbing hover:scale-105 hover:border-primary/50 border-b-4 border-b-primary/40'
                    }`}
                >
                  <span className="text-lg select-none">{country.emoji}</span>
                  <p className={`text-[10px] font-extrabold text-center uppercase tracking-wide select-none ${isSelected ? 'text-primary' : 'text-white'}`}>
                    {country.name}
                  </p>
                </div>
            );
          })}
        </div>
        {dragPreview}
      </>
  );
};