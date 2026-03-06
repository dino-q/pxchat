
import React from 'react';
import { SplitType } from '../App';

interface SplitOptionsProps {
  selected: SplitType;
  onChange: (value: SplitType) => void;
}

const SplitOptions: React.FC<SplitOptionsProps> = ({ selected, onChange }) => {
  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">2. Choose Split Method</h2>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onChange('day')}
          className={`w-full py-3 px-2 rounded-md text-center font-medium transition-all duration-300 ${
            selected === 'day' 
            ? 'bg-brand-secondary text-white shadow-md' 
            : 'bg-brand-primary text-brand-text hover:bg-opacity-80'
          }`}
        >
          按天 (By Day)
        </button>
        <button
          onClick={() => onChange('week')}
          className={`w-full py-3 px-2 rounded-md text-center font-medium transition-all duration-300 ${
            selected === 'week' 
            ? 'bg-brand-secondary text-white shadow-md' 
            : 'bg-brand-primary text-brand-text hover:bg-opacity-80'
          }`}
        >
          按週 (By Week)
        </button>
        <button
          onClick={() => onChange('month')}
          className={`w-full py-3 px-2 rounded-md text-center font-medium transition-all duration-300 ${
            selected === 'month' 
            ? 'bg-brand-secondary text-white shadow-md' 
            : 'bg-brand-primary text-brand-text hover:bg-opacity-80'
          }`}
        >
          按月 (By Month)
        </button>
      </div>
    </div>
  );
};

export default SplitOptions;