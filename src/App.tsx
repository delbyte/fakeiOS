import React, { useState } from 'react';
import StatusBar from './components/StatusBar';
import AppIcon from './components/AppIcon';
import SearchBar from './components/SearchBar';
import Dock from './components/Dock';
import CameraApp from './components/CameraApp';
import PhotosApp from './components/PhotosApp';
import ClockApp from './components/ClockApp';
import NotesApp from './components/NotesApp';
import HealthApp from './components/HealthApp';
import MapsApp from './components/MapsApp';
import CalendarApp from './components/CalendarApp';
import ComingSoonApp from './components/ComingSoonApp';
import {
  Video,
  Calendar,
  Camera,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  Tv,
  Mic,
  Smartphone,
  Map,
  Heart,
  CreditCard,
  Settings,
  MessageCircle,
  Image
} from 'lucide-react';

function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    // Row 1
    [
      { icon: Video, name: "FaceTime", bgColor: "bg-green-500", iconColor: "white" },
      { 
        icon: Calendar, 
        name: "Calendar", 
        bgColor: "bg-white", 
        iconColor: "black",
        customContent: (
          <div className="text-center">
            <div className="text-red-500 text-[8px] font-bold mb-0.5">THU</div>
            <div className="text-black text-[20px] font-light leading-none">13</div>
          </div>
        )
      },
      { 
        icon: Image, 
        name: "Photos", 
        bgColor: "bg-white", 
        customContent: (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-2 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-red-400 to-purple-500 opacity-80"></div>
              <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-4 h-3 bg-green-400 rounded-sm"></div>
            </div>
          </div>
        )
      },
      { icon: Camera, name: "Camera", bgColor: "bg-black", iconColor: "white" }
    ],
    // Row 2
    [
      { icon: Mail, name: "Mail", bgColor: "bg-blue-500", iconColor: "white" },
      { 
        icon: FileText, 
        name: "Notes", 
        bgColor: "bg-yellow-400", 
        iconColor: "orange",
        customContent: (
          <div className="w-full h-full p-2 flex flex-col justify-center">
            <div className="space-y-1">
              <div className="h-0.5 bg-orange-400 rounded w-3/4"></div>
              <div className="h-0.5 bg-orange-400 rounded w-full"></div>
              <div className="h-0.5 bg-orange-400 rounded w-2/3"></div>
            </div>
          </div>
        )
      },
      { 
        icon: CheckCircle2, 
        name: "Reminders", 
        bgColor: "bg-white",
        customContent: (
          <div className="w-full h-full p-2 flex flex-col justify-center space-y-1">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <div className="h-0.5 bg-gray-400 rounded flex-1"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <div className="h-0.5 bg-gray-400 rounded flex-1"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <div className="h-0.5 bg-gray-400 rounded flex-1"></div>
            </div>
          </div>
        )
      },
      { 
        icon: Clock, 
        name: "Clock", 
        bgColor: "bg-black",
        customContent: (
          <div className="relative w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
            <div className="absolute w-0.5 h-3 bg-white transform -translate-y-1 origin-bottom rotate-90"></div>
            <div className="absolute w-0.5 h-2 bg-white transform -translate-y-0.5 origin-bottom rotate-45"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        )
      }
    ],
    // Row 3
    [
      { 
        icon: Tv, 
        name: "TV", 
        bgColor: "bg-black",
        customContent: (
          <div className="text-white text-[20px] font-light">tv</div>
        )
      },
      { 
        icon: Mic, 
        name: "Podcasts", 
        bgColor: "bg-purple-600",
        customContent: (
          <div className="relative">
            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-white"></div>
          </div>
        )
      },
      { 
        icon: Smartphone, 
        name: "App Store", 
        bgColor: "bg-blue-500",
        customContent: (
          <div className="text-white text-[24px] font-light">A</div>
        )
      },
      { 
        icon: Map, 
        name: "Maps", 
        bgColor: "bg-white",
        customContent: (
          <div className="w-full h-full relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-400"></div>
            <div className="absolute top-2 left-2 w-3 h-4 bg-blue-600 rounded-sm"></div>
            <div className="absolute bottom-1 right-1 w-4 h-2 bg-white/50 rounded"></div>
          </div>
        )
      }
    ],
    // Row 4
    [
      { 
        icon: Heart, 
        name: "Health", 
        bgColor: "bg-white",
        customContent: (
          <Heart size={28} className="text-red-500 fill-red-500" />
        )
      },
      { 
        icon: CreditCard, 
        name: "Wallet", 
        bgColor: "bg-black",
        customContent: (
          <div className="relative">
            <div className="w-6 h-4 bg-blue-500 rounded-sm"></div>
            <div className="absolute top-1 w-6 h-4 bg-red-500 rounded-sm"></div>
            <div className="absolute top-2 w-6 h-4 bg-green-500 rounded-sm"></div>
          </div>
        )
      },
      { 
        icon: Settings, 
        name: "Settings", 
        bgColor: "bg-gray-500",
        customContent: (
          <Settings size={28} className="text-white" />
        )
      },
      { icon: MessageCircle, name: "Messages", bgColor: "bg-green-500", iconColor: "white" }
    ]
  ];

  const handleAppClick = (appName: string) => {
    console.log(`Opening ${appName}...`);
    setActiveApp(appName);
  };

  const handlePhotoTaken = (photoData: string) => {
    console.log('Photo taken and saved to localStorage');
  };

  const closeApp = () => {
    setActiveApp(null);
  };

  const openPhotos = () => {
    setActiveApp("Photos");
  };

  const getComingSoonProps = (appName: string) => {
    switch (appName) {
      case "FaceTime":
        return {
          appIcon: <Video size={48} className="text-white" />,
          primaryColor: "#10B981",
          secondaryColor: "#059669",
          description: "Connect with friends and family through high-quality video calls",
          features: [
            "HD Video Calling",
            "Group FaceTime",
            "Screen Sharing",
            "Spatial Audio"
          ]
        };
      case "Mail":
        return {
          appIcon: <Mail size={48} className="text-white" />,
          primaryColor: "#3B82F6",
          secondaryColor: "#2563EB",
          description: "Manage your email with intelligent organization and powerful search",
          features: [
            "Smart Inbox",
            "Email Threading",
            "Advanced Search",
            "Multiple Accounts"
          ]
        };
      case "Reminders":
        return {
          appIcon: <CheckCircle2 size={48} className="text-white" />,
          primaryColor: "#F59E0B",
          secondaryColor: "#D97706",
          description: "Keep track of your tasks and get things done with smart reminders",
          features: [
            "Smart Lists",
            "Location Reminders",
            "Time-based Alerts",
            "Shared Lists"
          ]
        };
      case "TV":
        return {
          appIcon: <Tv size={48} className="text-white" />,
          primaryColor: "#1F2937",
          secondaryColor: "#374151",
          description: "Stream your favorite shows and movies in stunning quality",
          features: [
            "4K HDR Streaming",
            "Personalized Recommendations",
            "Offline Downloads",
            "Family Sharing"
          ]
        };
      case "Podcasts":
        return {
          appIcon: <Mic size={48} className="text-white" />,
          primaryColor: "#7C3AED",
          secondaryColor: "#6D28D9",
          description: "Discover and listen to millions of podcasts from around the world",
          features: [
            "Smart Recommendations",
            "Offline Listening",
            "Playback Speed Control",
            "Episode Bookmarks"
          ]
        };
      case "App Store":
        return {
          appIcon: <Smartphone size={48} className="text-white" />,
          primaryColor: "#3B82F6",
          secondaryColor: "#1D4ED8",
          description: "Discover amazing apps and games tailored just for you",
          features: [
            "Curated Collections",
            "App Reviews",
            "Secure Downloads",
            "Family Sharing"
          ]
        };
      case "Wallet":
        return {
          appIcon: <CreditCard size={48} className="text-white" />,
          primaryColor: "#1F2937",
          secondaryColor: "#374151",
          description: "Store your cards, tickets, and passes securely in one place",
          features: [
            "Contactless Payments",
            "Digital Tickets",
            "Loyalty Cards",
            "Secure Authentication"
          ]
        };
      case "Settings":
        return {
          appIcon: <Settings size={48} className="text-white" />,
          primaryColor: "#6B7280",
          secondaryColor: "#4B5563",
          description: "Customize your device and manage all your preferences",
          features: [
            "Privacy Controls",
            "System Preferences",
            "App Permissions",
            "Device Management"
          ]
        };
      case "Messages":
        return {
          appIcon: <MessageCircle size={48} className="text-white" />,
          primaryColor: "#10B981",
          secondaryColor: "#059669",
          description: "Stay connected with rich messaging and seamless communication",
          features: [
            "Rich Media Sharing",
            "Group Conversations",
            "Message Effects",
            "End-to-End Encryption"
          ]
        };
      default:
        return {
          appIcon: <Smartphone size={48} className="text-white" />,
          primaryColor: "#6B7280",
          secondaryColor: "#4B5563",
          description: "This amazing app is coming soon with exciting features",
          features: [
            "Innovative Features",
            "Beautiful Design",
            "Seamless Experience",
            "Regular Updates"
          ]
        };
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* iPhone Container */}
      <div 
        className="relative bg-gradient-to-br from-orange-200 via-orange-300 to-blue-600 overflow-hidden shadow-2xl"
        style={{
          width: '375px',
          height: '812px',
          borderRadius: '40px'
        }}
      >
        {/* Status Bar */}
        <StatusBar />
        
        {/* App Grid */}
        <div className="px-6 pt-8 pb-4 flex-1">
          <div className="grid grid-cols-4 gap-6">
            {apps.flat().map((app, index) => (
              <AppIcon
                key={index}
                icon={app.icon}
                name={app.name}
                bgColor={app.bgColor}
                iconColor={app.iconColor}
                customContent={app.customContent}
                onClick={() => handleAppClick(app.name)}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          <SearchBar />
          <Dock />
        </div>

        {/* App Overlays */}
        {activeApp === "Camera" && (
          <CameraApp 
            onClose={closeApp}
            onPhotoTaken={handlePhotoTaken}
            onOpenPhotos={openPhotos}
          />
        )}
        
        {activeApp === "Photos" && (
          <PhotosApp onClose={closeApp} />
        )}

        {activeApp === "Clock" && (
          <ClockApp onClose={closeApp} />
        )}

        {activeApp === "Notes" && (
          <NotesApp onClose={closeApp} />
        )}

        {activeApp === "Health" && (
          <HealthApp onClose={closeApp} />
        )}

        {activeApp === "Maps" && (
          <MapsApp onClose={closeApp} />
        )}

        {activeApp === "Calendar" && (
          <CalendarApp onClose={closeApp} />
        )}

        {/* Coming Soon Apps */}
        {activeApp && !["Camera", "Photos", "Clock", "Notes", "Health", "Maps", "Calendar"].includes(activeApp) && (
          <ComingSoonApp
            onClose={closeApp}
            appName={activeApp}
            {...getComingSoonProps(activeApp)}
          />
        )}
      </div>
    </div>
  );
}

export default App;