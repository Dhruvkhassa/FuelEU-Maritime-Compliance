import { useState, useEffect, useRef } from 'react';
import RoutesTab from './components/RoutesTab';
import CompareTab from './components/CompareTab';
import BankingTab from './components/BankingTab';
import PoolingTab from './components/PoolingTab';

function App() {
  const [activeTab, setActiveTab] = useState<'routes' | 'compare' | 'banking' | 'pooling'>('routes');
  const [isDark, setIsDark] = useState(false); // Default to light theme
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'routes' as const, label: 'Routes', icon: '🚢' },
    { id: 'compare' as const, label: 'Compare', icon: '📊' },
    { id: 'banking' as const, label: 'Banking', icon: '💰' },
    { id: 'pooling' as const, label: 'Pooling', icon: '🤝' },
  ];

  // Track mouse position for anchor icon
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update anchor 3D rotation to face cursor
  useEffect(() => {
    if (anchorRef.current) {
      const anchor = anchorRef.current;
      const updateRotation = () => {
        const rect = anchor.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = mousePosition.x - centerX;
        const deltaY = mousePosition.y - centerY;
        
        // Calculate rotation angles (in degrees)
        // rotateY: horizontal rotation (left/right)
        const angleY = Math.atan2(deltaX, 200) * (180 / Math.PI);
        // rotateX: vertical rotation (up/down) - negative for natural feel
        const angleX = -Math.atan2(deltaY, 200) * (180 / Math.PI);
        
        // Apply 3D rotation with perspective (reduced multiplier for subtle effect)
        anchor.style.transform = `perspective(1000px) rotateY(${angleY * 0.5}deg) rotateX(${angleX * 0.5}deg)`;
        requestAnimationFrame(updateRotation);
      };
      updateRotation();
    }
  }, [mousePosition]);

  const bgClass = isDark 
    ? 'bg-black' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const cardBgClass = isDark 
    ? 'bg-black/60 backdrop-blur-lg border-gray-800/50' 
    : 'bg-white/80 backdrop-blur-sm border-gray-200';
  const headerBgClass = isDark
    ? 'bg-black/90 backdrop-blur-md border-gray-800/50'
    : 'bg-white/90 backdrop-blur-md border-gray-300/50';

  return (
    <div className={`min-h-screen ${bgClass} relative overflow-hidden`}>
      {/* Background with stackfish image or fixed translucent windows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Try to load stackfish image, fallback to gradient */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        {/* Fallback gradient overlay */}
        <div className={`absolute inset-0 ${isDark ? 'bg-black/40' : 'bg-white/20'}`}></div>
        
        {/* Translucent sliding windows */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-yellow-400 text-gray-900'} shadow-lg hover:scale-110 transition-all duration-300`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Centered Title Header - Single Line */}
      <header className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className={`${headerBgClass} rounded-2xl p-6 md:p-8 border shadow-2xl animate-slideDown`}>
            <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 flex-wrap">
              <div 
                ref={anchorRef}
                className="text-4xl md:text-5xl transition-transform duration-300 ease-out"
                style={{ 
                  willChange: 'transform',
                  transformStyle: 'preserve-3d'
                }}
              >
                ⚓
              </div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold ${textClass} break-words`} style={{
                fontFamily: "'Poppins', 'Inter', sans-serif",
                letterSpacing: '-0.02em',
                textShadow: isDark ? '0 2px 20px rgba(59, 130, 246, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                lineHeight: '1.2'
              }}>
                Fuel EU Maritime Compliance Dashboard
              </h1>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-base md:text-lg mt-2`}>
              Monitor and manage maritime fuel compliance
            </p>
          </div>
        </div>
      </header>

      {/* Navigation with transparent blocks */}
      <nav className="relative z-10 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className={`${cardBgClass} rounded-xl p-2 border shadow-xl`}>
            <div className="flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 px-6 font-semibold text-sm rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? isDark
                        ? 'bg-gray-900 text-white shadow-lg border border-gray-700'
                        : 'bg-blue-600 text-white shadow-lg border border-blue-500'
                      : isDark
                        ? 'bg-black/40 text-gray-300 hover:text-white hover:bg-gray-900/60 border border-gray-800/50'
                        : 'bg-white/60 text-gray-700 hover:text-gray-900 hover:bg-white/80 border border-gray-300/50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {activeTab === tab.id && (
                    <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent ${isDark ? 'via-blue-500' : 'via-blue-600'} to-transparent animate-pulse`}></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with transparent blocks */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className={`${cardBgClass} rounded-2xl p-6 border shadow-2xl animate-fadeIn`}>
          {activeTab === 'routes' && <RoutesTab isDark={isDark} />}
          {activeTab === 'compare' && <CompareTab isDark={isDark} />}
          {activeTab === 'banking' && <BankingTab isDark={isDark} />}
          {activeTab === 'pooling' && <PoolingTab isDark={isDark} />}
        </div>
      </main>
    </div>
  );
}

export default App;

