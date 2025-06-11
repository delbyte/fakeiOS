import React from 'react';
import { Mail } from 'lucide-react';

const Dock: React.FC = () => {
  return (
    <div className="px-4 pb-8">
      <div className="bg-white/20 backdrop-blur-xl rounded-[28px] px-4 py-2 flex justify-center">
        <div className="flex flex-col items-center cursor-pointer transform transition-all duration-150 active:scale-95">
          <div className="w-[60px] h-[60px] bg-blue-500 rounded-[13px] flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="w-8 h-6 bg-white rounded-sm flex items-center justify-center">
              <div className="text-blue-500 text-xs font-bold">O</div>
            </div>
            <div className="absolute inset-0 rounded-[13px] shadow-inner opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dock;