
import React from 'react';

interface HeaderProps {
  round: number;
  maxRounds: number;
}

export const Header: React.FC<HeaderProps> = ({ round, maxRounds }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-800">
      <div className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
        <span className="material-symbols-outlined">help</span>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Geomatcher</h2>
        <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">ROUND {round} OF {maxRounds}</span>
      </div>
      <div className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
        <span className="material-symbols-outlined">settings</span>
      </div>
    </header>
  );
};
