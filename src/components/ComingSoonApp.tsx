import React from 'react';
import { X, Sparkles, Zap, Clock, Smartphone } from 'lucide-react';

interface ComingSoonAppProps {
  onClose: () => void;
  appName: string;
  appIcon: React.ReactNode;
  primaryColor: string;
  secondaryColor?: string;
  description: string;
  features: string[];
}

const ComingSoonApp: React.FC<ComingSoonAppProps> = ({ 
  onClose, 
  appName, 
  appIcon, 
  primaryColor, 
  secondaryColor = primaryColor,
  description,
  features 
}) => {
  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ 
        borderRadius: '40px',
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center">
        {/* App Icon */}
        <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
          <div className="text-6xl">
            {appIcon}
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
          <Sparkles size={20} className="mr-2" />
          <span className="font-semibold text-lg">Coming Soon</span>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold mb-4">{appName}</h1>

        {/* Description */}
        <p className="text-xl opacity-90 mb-8 max-w-sm leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <Zap size={16} />
              </div>
              <span className="text-lg">{feature}</span>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center text-white/80">
          <Clock size={16} className="mr-2" />
          <span className="text-sm">Expected in future updates</span>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default ComingSoonApp;