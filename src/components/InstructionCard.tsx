
import React from 'react';

interface InstructionCardProps {
  onDismiss: () => void;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ onDismiss }) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-inner">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <p className="text-white text-base font-bold leading-tight">How to Play</p>
        </div>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          Drag countries to match their statistics. Aim for the <strong className="text-white font-bold">lowest total rank</strong> score to win!
        </p>
      </div>
        <button
            onClick={onDismiss}
            className="flex w-full items-center justify-center rounded-xl h-10 px-4 bg-primary/20 text-primary text-sm font-bold hover:bg-primary/80 hover:text-white transition-all border border-primary cursor-pointer"
        >
            <span className="truncate">Dismiss Instructions</span>
        </button>
    </div>
  );
};
