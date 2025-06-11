import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface AppIconProps {
  icon: LucideIcon;
  name: string;
  bgColor: string;
  iconColor?: string;
  customContent?: React.ReactNode;
  onClick?: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  icon: Icon, 
  name, 
  bgColor, 
  iconColor = "white", 
  customContent,
  onClick 
}) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer transform transition-all duration-150 active:scale-95"
      onClick={onClick}
    >
      <div className={`w-[60px] h-[60px] ${bgColor} rounded-[13px] flex items-center justify-center shadow-lg mb-1 relative overflow-hidden`}>
        {customContent || <Icon size={32} color={iconColor} strokeWidth={1.5} />}
        {/* iOS-style inner shadow */}
        <div className="absolute inset-0 rounded-[13px] shadow-inner opacity-20"></div>
      </div>
      <span className="text-white text-[11px] font-normal text-center leading-tight drop-shadow-sm max-w-[70px] truncate">
        {name}
      </span>
    </div>
  );
};

export default AppIcon;