import React, { useState, useEffect } from 'react';
import { Wifi, Battery, BatteryLow, Zap } from 'lucide-react';

const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [batterySupported, setBatterySupported] = useState<boolean>(false);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check for battery API support and get battery info
    const getBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatterySupported(true);
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          // Listen for battery changes
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });

          battery.addEventListener('chargingchange', () => {
            setIsCharging(battery.charging);
          });
        } catch (error) {
          console.log('Battery API not supported or failed:', error);
          setBatterySupported(false);
        }
      } else {
        setBatterySupported(false);
      }
    };

    getBatteryInfo();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  const getBatteryIcon = () => {
    if (!batterySupported || batteryLevel === null) {
      return <Battery size={24} className="fill-white" />;
    }

    if (isCharging) {
      return <Zap size={20} className="text-green-400 fill-green-400" />;
    }

    if (batteryLevel <= 20) {
      return <BatteryLow size={24} className="fill-red-400 text-red-400" />;
    }

    return <Battery size={24} className="fill-white" />;
  };

  const getBatteryColor = () => {
    if (!batterySupported || batteryLevel === null) return 'text-white';
    if (isCharging) return 'text-green-400';
    if (batteryLevel <= 20) return 'text-red-400';
    return 'text-white';
  };

  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-2 text-white text-sm font-medium">
      <div className="text-[17px] font-semibold">
        {formatTime(currentTime)}
      </div>
      <div className="flex items-center space-x-1">
        {/* Signal bars */}
        <div className="flex items-end space-x-0.5">
          <div className="w-1 h-1.5 bg-white rounded-full"></div>
          <div className="w-1 h-2 bg-white rounded-full"></div>
          <div className="w-1 h-2.5 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
        <Wifi size={15} className="ml-1" />
        
        {/* Battery with level indicator */}
        <div className="flex items-center space-x-1">
          {getBatteryIcon()}
          {batterySupported && batteryLevel !== null && (
            <span className={`text-xs ${getBatteryColor()}`}>
              {batteryLevel}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;