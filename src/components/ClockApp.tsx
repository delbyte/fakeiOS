import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit3, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';

interface ClockAppProps {
  onClose: () => void;
}

interface WorldClock {
  id: string;
  city: string;
  timezone: string;
  country?: string;
}

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
}

interface LapTime {
  id: string;
  time: number;
  lapTime: number;
}

const ClockApp: React.FC<ClockAppProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'alarm' | 'stopwatch' | 'timer'>('world');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // World Clock State
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([
    { id: '1', city: 'San Francisco', timezone: 'America/Los_Angeles', country: 'Today, -8HRS' },
    { id: '2', city: 'New York', timezone: 'America/New_York', country: 'Today, -5HRS' },
    { id: '3', city: 'London', timezone: 'Europe/London', country: 'Tomorrow, +0HRS' },
    { id: '4', city: 'Paris', timezone: 'Europe/Paris', country: 'Tomorrow, +1HRS' },
    { id: '5', city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Tomorrow, +9HRS' },
    { id: '6', city: 'Beijing', timezone: 'Asia/Shanghai', country: 'Tomorrow, +8HRS' },
    { id: '7', city: 'New Delhi', timezone: 'Asia/Kolkata', country: 'Tomorrow, +5:30HRS' }
  ]);
  const [isEditingWorld, setIsEditingWorld] = useState(false);

  // Alarm State
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: '1', time: '07:00', label: 'Wake up', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { id: '2', time: '22:30', label: 'Sleep', enabled: false, days: ['Every Day'] }
  ]);

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const stopwatchInterval = useRef<NodeJS.Timeout | null>(null);

  // Timer State
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerSet, setIsTimerSet] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Stopwatch logic
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    } else {
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    }

    return () => {
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    };
  }, [isStopwatchRunning]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerTime > 0) {
      timerInterval.current = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 100) {
            setIsTimerRunning(false);
            setIsTimerSet(false);
            // Timer finished - could add notification here
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTimerRunning, timerTime]);

  const getTimeInTimezone = (timezone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatStopwatchTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const centiseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatTimerTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatchStart = () => {
    setIsStopwatchRunning(true);
  };

  const handleStopwatchStop = () => {
    setIsStopwatchRunning(false);
  };

  const handleStopwatchReset = () => {
    setStopwatchTime(0);
    setLapTimes([]);
    setIsStopwatchRunning(false);
  };

  const handleLap = () => {
    const lapTime = stopwatchTime - (lapTimes.length > 0 ? lapTimes[lapTimes.length - 1].time : 0);
    setLapTimes(prev => [...prev, {
      id: Date.now().toString(),
      time: stopwatchTime,
      lapTime: lapTime
    }]);
  };

  const handleTimerStart = () => {
    if (!isTimerSet) {
      const totalTime = (timerMinutes * 60 + timerSeconds) * 1000;
      if (totalTime > 0) {
        setTimerTime(totalTime);
        setIsTimerSet(true);
        setIsTimerRunning(true);
      }
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleTimerReset = () => {
    setTimerTime(0);
    setIsTimerRunning(false);
    setIsTimerSet(false);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteWorldClock = (id: string) => {
    setWorldClocks(prev => prev.filter(clock => clock.id !== id));
  };

  const renderWorldClock = () => (
    <div className="flex-1 bg-black text-white">
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button
          onClick={() => setIsEditingWorld(!isEditingWorld)}
          className="text-orange-500 text-lg"
        >
          {isEditingWorld ? 'Done' : 'Edit'}
        </button>
        <h1 className="text-lg font-semibold">World Clock</h1>
        <button className="text-orange-500 text-lg">
          <Plus size={24} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {worldClocks.map((clock) => (
          <div key={clock.id} className="flex items-center justify-between p-4 border-b border-gray-800">
            {isEditingWorld && (
              <button
                onClick={() => deleteWorldClock(clock.id)}
                className="mr-3"
              >
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-white"></div>
                </div>
              </button>
            )}
            <div className="flex-1">
              <div className="text-sm text-gray-400">{clock.country}</div>
              <div className="text-xl font-light">{clock.city}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-light">
                {getTimeInTimezone(clock.timezone)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlarm = () => (
    <div className="flex-1 bg-black text-white">
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button className="text-orange-500 text-lg">Edit</button>
        <h1 className="text-lg font-semibold">Alarm</h1>
        <button className="text-orange-500 text-lg">
          <Plus size={24} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex-1">
              <div className="text-3xl font-light">{alarm.time}</div>
              <div className="text-sm text-gray-400">{alarm.label}</div>
              <div className="text-sm text-gray-400">{alarm.days.join(', ')}</div>
            </div>
            <button
              onClick={() => toggleAlarm(alarm.id)}
              className={`w-12 h-7 rounded-full ${
                alarm.enabled ? 'bg-green-500' : 'bg-gray-600'
              } relative transition-colors`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                  alarm.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStopwatch = () => (
    <div className="flex-1 bg-black text-white flex flex-col">
      <div className="text-center p-4 border-b border-gray-800">
        <h1 className="text-lg font-semibold">Stopwatch</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl font-light mb-8 font-mono">
          {formatStopwatchTime(stopwatchTime)}
        </div>
        
        <div className="flex space-x-16 mb-8">
          <button
            onClick={isStopwatchRunning ? handleLap : handleStopwatchReset}
            className="w-20 h-20 rounded-full border-2 border-gray-600 bg-gray-800 text-white flex items-center justify-center"
            disabled={stopwatchTime === 0 && !isStopwatchRunning}
          >
            {isStopwatchRunning ? 'Lap' : 'Reset'}
          </button>
          
          <button
            onClick={isStopwatchRunning ? handleStopwatchStop : handleStopwatchStart}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
              isStopwatchRunning 
                ? 'border-red-500 bg-red-900 text-red-500' 
                : 'border-green-500 bg-green-900 text-green-500'
            }`}
          >
            {isStopwatchRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
      
      {lapTimes.length > 0 && (
        <div className="flex-1 border-t border-gray-800">
          <div className="p-4 max-h-48 overflow-y-auto">
            {lapTimes.slice().reverse().map((lap, index) => (
              <div key={lap.id} className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Lap {lapTimes.length - index}</span>
                <span className="font-mono">{formatStopwatchTime(lap.lapTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTimer = () => (
    <div className="flex-1 bg-black text-white flex flex-col">
      <div className="text-center p-4 border-b border-gray-800">
        <h1 className="text-lg font-semibold">Timer</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {!isTimerSet ? (
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-16 h-16 bg-transparent text-4xl text-center border-b border-gray-600 focus:outline-none focus:border-orange-500"
                min="0"
                max="59"
              />
              <span className="text-sm text-gray-400 mt-2">min</span>
            </div>
            <span className="text-4xl">:</span>
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-16 h-16 bg-transparent text-4xl text-center border-b border-gray-600 focus:outline-none focus:border-orange-500"
                min="0"
                max="59"
              />
              <span className="text-sm text-gray-400 mt-2">sec</span>
            </div>
          </div>
        ) : (
          <div className="text-6xl font-light mb-8 font-mono">
            {formatTimerTime(timerTime)}
          </div>
        )}
        
        <div className="flex space-x-16">
          {isTimerSet && (
            <button
              onClick={handleTimerReset}
              className="w-20 h-20 rounded-full border-2 border-gray-600 bg-gray-800 text-white flex items-center justify-center"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={handleTimerStart}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
              isTimerRunning 
                ? 'border-orange-500 bg-orange-900 text-orange-500' 
                : 'border-green-500 bg-green-900 text-green-500'
            }`}
            disabled={!isTimerSet && timerMinutes === 0 && timerSeconds === 0}
          >
            {!isTimerSet ? 'Start' : (isTimerRunning ? 'Pause' : 'Resume')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'world':
        return renderWorldClock();
      case 'alarm':
        return renderAlarm();
      case 'stopwatch':
        return renderStopwatch();
      case 'timer':
        return renderTimer();
      default:
        return renderWorldClock();
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-black z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center z-10"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Content */}
      {renderContent()}

      {/* Bottom Tab Bar */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('world')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'world' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              🌍
            </div>
            <span className="text-xs">World Clock</span>
          </button>
          
          <button
            onClick={() => setActiveTab('alarm')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'alarm' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              ⏰
            </div>
            <span className="text-xs">Alarm</span>
          </button>
          
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'stopwatch' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              ⏱️
            </div>
            <span className="text-xs">Stopwatch</span>
          </button>
          
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'timer' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              ⏲️
            </div>
            <span className="text-xs">Timer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClockApp;