import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Heart, Activity, Droplets, Zap, Moon, Pill, Clock, User } from 'lucide-react';

interface HealthAppProps {
  onClose: () => void;
}

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
  waterIntake: number;
  weight: number;
  height: number;
}

interface HealthRecord {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: number;
}

const HealthApp: React.FC<HealthAppProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'category'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 8547,
    heartRate: 72,
    sleepHours: 7.5,
    waterIntake: 6,
    weight: 70,
    height: 175
  });
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = () => {
    const stored = localStorage.getItem('health_app_data');
    if (stored) {
      const data = JSON.parse(stored);
      setHealthData(data.healthData || healthData);
      setHealthRecords(data.records || []);
    }
  };

  const saveHealthData = (data: HealthData, records: HealthRecord[]) => {
    localStorage.setItem('health_app_data', JSON.stringify({
      healthData: data,
      records: records
    }));
  };

  const addHealthRecord = (type: string, value: number, unit: string) => {
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      type,
      value,
      unit,
      timestamp: Date.now()
    };
    
    const updatedRecords = [...healthRecords, newRecord];
    setHealthRecords(updatedRecords);
    
    // Update current health data
    const updatedHealthData = { ...healthData };
    switch (type) {
      case 'steps':
        updatedHealthData.steps = value;
        break;
      case 'heartRate':
        updatedHealthData.heartRate = value;
        break;
      case 'sleep':
        updatedHealthData.sleepHours = value;
        break;
      case 'water':
        updatedHealthData.waterIntake = value;
        break;
      case 'weight':
        updatedHealthData.weight = value;
        break;
    }
    
    setHealthData(updatedHealthData);
    saveHealthData(updatedHealthData, updatedRecords);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const categories = [
    {
      id: 'blood-oxygen',
      name: 'Blood Oxygen',
      icon: '🫁',
      color: 'bg-red-500',
      comingSoon: true
    },
    {
      id: 'clock',
      name: 'Clock',
      icon: '🕐',
      color: 'bg-black',
      comingSoon: false
    },
    {
      id: 'fitness',
      name: 'Fitness',
      icon: '💪',
      color: 'bg-green-500',
      comingSoon: false
    },
    {
      id: 'health',
      name: 'Health',
      icon: '❤️',
      color: 'bg-red-500',
      comingSoon: false
    },
    {
      id: 'medications',
      name: 'Medications',
      icon: '💊',
      color: 'bg-blue-500',
      comingSoon: true
    },
    {
      id: 'siri',
      name: 'Siri',
      icon: '🎤',
      color: 'bg-purple-500',
      comingSoon: true
    },
    {
      id: 'sleep',
      name: 'Sleep',
      icon: '😴',
      color: 'bg-indigo-500',
      comingSoon: false
    }
  ];

  const renderComingSoon = (categoryName: string) => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <div className="text-4xl">🚧</div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{categoryName}</h2>
        <p className="text-gray-600 mb-2">Feature Coming Soon</p>
        <p className="text-sm text-gray-500">
          This advanced health feature requires specialized sensors and medical integration.
        </p>
      </div>
    </div>
  );

  const renderFitnessView = () => (
    <div className="flex-1 p-4">
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 mb-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Today's Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold">{healthData.steps.toLocaleString()}</div>
            <div className="text-sm opacity-80">Steps</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{Math.round(healthData.steps * 0.0005 * 100) / 100}</div>
            <div className="text-sm opacity-80">Miles</div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${Math.min((healthData.steps / 10000) * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs mt-2 opacity-80">Goal: 10,000 steps</div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Heart size={20} className="text-red-500" />
              </div>
              <div>
                <div className="font-semibold">Heart Rate</div>
                <div className="text-sm text-gray-600">{healthData.heartRate} BPM</div>
              </div>
            </div>
            <button 
              onClick={() => {
                const newRate = Math.floor(Math.random() * 40) + 60; // 60-100 BPM
                addHealthRecord('heartRate', newRate, 'BPM');
              }}
              className="text-blue-500 text-sm"
            >
              Measure
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Droplets size={20} className="text-blue-500" />
              </div>
              <div>
                <div className="font-semibold">Water Intake</div>
                <div className="text-sm text-gray-600">{healthData.waterIntake} glasses</div>
              </div>
            </div>
            <button 
              onClick={() => {
                const newIntake = healthData.waterIntake + 1;
                addHealthRecord('water', newIntake, 'glasses');
              }}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHealthView = () => (
    <div className="flex-1 p-4">
      <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-6 mb-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Health Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{healthData.weight} kg</div>
            <div className="text-sm opacity-80">Weight</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{healthData.height} cm</div>
            <div className="text-sm opacity-80">Height</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm opacity-80">BMI</div>
          <div className="text-xl font-semibold">
            {Math.round((healthData.weight / Math.pow(healthData.height / 100, 2)) * 10) / 10}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Recent Records</h4>
        {healthRecords.slice(-5).reverse().map((record) => (
          <div key={record.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium capitalize">{record.type.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-sm text-gray-600">{formatDate(record.timestamp)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{record.value} {record.unit}</div>
              </div>
            </div>
          </div>
        ))}
        
        {healthRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No health records yet</p>
            <p className="text-sm">Start tracking your health data</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSleepView = () => (
    <div className="flex-1 p-4">
      <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-6 mb-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Last Night's Sleep</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{healthData.sleepHours}h</div>
            <div className="text-sm opacity-80">Total Sleep</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-80">Bedtime</div>
            <div className="font-semibold">10:30 PM</div>
          </div>
          <div>
            <div className="opacity-80">Wake Up</div>
            <div className="font-semibold">6:00 AM</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Sleep Goal</h4>
            <span className="text-sm text-gray-600">8h 0m</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${(healthData.sleepHours / 8) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {healthData.sleepHours >= 8 ? 'Goal achieved!' : `${8 - healthData.sleepHours}h remaining`}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold mb-3">Sleep Quality</h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Overall Rating</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-lg">
                  {star <= 4 ? '⭐' : '☆'}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            const newSleep = Math.round((Math.random() * 3 + 6) * 10) / 10; // 6-9 hours
            addHealthRecord('sleep', newSleep, 'hours');
          }}
          className="w-full bg-indigo-500 text-white rounded-xl p-4 font-semibold"
        >
          Log Sleep Manually
        </button>
      </div>
    </div>
  );

  const renderClockView = () => (
    <div className="flex-1 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 mb-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Health Reminders</h3>
        <div className="text-center">
          <div className="text-3xl mb-2">⏰</div>
          <div className="text-sm opacity-80">Set reminders for medications, workouts, and health checks</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Activity size={20} className="text-green-500" />
              </div>
              <div>
                <div className="font-semibold">Daily Workout</div>
                <div className="text-sm text-gray-600">6:00 PM</div>
              </div>
            </div>
            <div className="w-12 h-7 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Droplets size={20} className="text-blue-500" />
              </div>
              <div>
                <div className="font-semibold">Drink Water</div>
                <div className="text-sm text-gray-600">Every 2 hours</div>
              </div>
            </div>
            <div className="w-12 h-7 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Moon size={20} className="text-purple-500" />
              </div>
              <div>
                <div className="font-semibold">Bedtime</div>
                <div className="text-sm text-gray-600">10:30 PM</div>
              </div>
            </div>
            <div className="w-12 h-7 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-1 left-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoryView = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    if (category.comingSoon) {
      return renderComingSoon(category.name);
    }

    switch (selectedCategory) {
      case 'fitness':
        return renderFitnessView();
      case 'health':
        return renderHealthView();
      case 'sleep':
        return renderSleepView();
      case 'clock':
        return renderClockView();
      default:
        return renderComingSoon(category.name);
    }
  };

  if (currentView === 'category') {
    return (
      <div 
        className="absolute inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden"
        style={{ borderRadius: '40px' }}
      >
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView('main')}
              className="flex items-center text-blue-500 text-lg"
            >
              <ChevronLeft size={24} />
              <span className="ml-1">Apps</span>
            </button>
            <h1 className="text-lg font-semibold">
              {categories.find(cat => cat.id === selectedCategory)?.name}
            </h1>
            <div className="w-16"></div>
          </div>
        </div>

        {renderCategoryView()}
      </div>
    );
  }

  // Main Health Apps view
  return (
    <div 
      className="absolute inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center text-blue-500 text-lg"
          >
            <ChevronLeft size={24} />
            <span className="ml-1">Profile</span>
          </button>
          <h1 className="text-lg font-semibold">Apps</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Apps List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentView('category');
              }}
              className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{category.name}</div>
                  {category.comingSoon && (
                    <div className="text-xs text-orange-500 font-medium">Coming Soon</div>
                  )}
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>

        <div className="px-4 pb-4">
          <button className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="text-left">
              <div className="font-semibold text-gray-900">Uninstalled Apps</div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-4 pb-8">
          <p className="text-sm text-gray-500 text-center">
            As apps request permission to update your Health data, they will be added to the list.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthApp;