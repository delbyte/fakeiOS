import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="px-4 mb-6">
      <div className={`bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 flex items-center transition-all duration-200 ${isActive ? 'bg-white/30' : ''}`}>
        <Search size={16} className="text-white/70 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent text-white placeholder-white/70 text-[16px] w-full outline-none"
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
        />
      </div>
    </div>
  );
};

export default SearchBar;