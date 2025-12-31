import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Link as LinkIcon,
  Globe,
  FolderOpen,
  ChevronDown,
  Sun,
  Moon,
  Loader2,
  Github,
} from "lucide-react";
import { SmartIcon } from "./components/SmartIcon";
import { ConsoleLog } from "./components/ConsoleLog"; // 这里现在显示名言
import { SearchBar } from "./components/SearchBar";
import { GlassCard } from "./components/GlassCard";
import { LinkManagerModal } from "./components/LinkManagerModal";
import { ToastContainer } from "./components/Toast";
import { SyncIndicator } from "./components/SyncIndicator";
import { storageService, DEFAULT_BACKGROUND } from "./services/storage";
import { getDominantColor } from "./utils/color";
import { Category, ThemeMode } from "./types";
import { useLanguage } from "./contexts/LanguageContext";

// 辅助函数：将 Hex 颜色转换为 RGB 数组字符串 (例如: "98, 128, 163")
const hexToRgb = (hex: string) => {
  let s = hex.startsWith('#') ? hex : '#' + hex;
  if (s.length === 4) {
    s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  }
  const r = parseInt(s.slice(1, 3), 16);
  const g = parseInt(s.slice(3, 5), 16);
  const b = parseInt(s.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const App: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);
  const [cardOpacity, setCardOpacity] = useState<number>(0.1);
  const [themeColor, setThemeColor] = useState<string>("#6280a3");
  const [themeColorAuto, setThemeColorAuto] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.Dark);
  const [isDefaultCode, setIsDefaultCode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>("");

  const { t, language, setLanguage } = useLanguage();

  // --- Refs ---
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const navTrackRef = useRef<HTMLDivElement>(null);
  const [navPillStyle, setNavPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // --- Initial Data Fetch ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const data = await storageService.fetchAllData();
        setCategories(data.categories);
        setBackground(data.background);
        setCardOpacity(data.prefs.cardOpacity);
        setThemeMode(data.prefs.themeMode);
        setIsDefaultCode(data.isDefaultCode);
        setThemeColorAuto(data.prefs.themeColorAuto ?? true);

        let finalColor = data.prefs.themeColor || "#6280a3";
        if ((data.prefs.themeColorAuto ?? true) && data.background.startsWith("http")) {
          finalColor = await getDominantColor(data.background);
        }
        setThemeColor(finalColor);

        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      } catch (e) {
        console.error("Failed to load app data", e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- 核心修复：确保 CSS 变量同步 (主色 + RGB 分量) ---
  useEffect(() => {
    const rgbValue = hexToRgb(themeColor);
    document.documentElement.style.setProperty("--theme-primary", themeColor);
    document.documentElement.style.setProperty("--theme-primary-rgb", rgbValue); // 修复发光
    document.documentElement.style.setProperty(
      "--theme-hover",
      `color-mix(in srgb, ${themeColor}, black 10%)`
    );
  }, [themeColor]);

  // --- Navigation UI Logic ---
  useEffect(() => {
    const updatePill = () => {
      const activeTab = tabsRef.current[activeCategory];
      if (activeTab && navTrackRef.current) {
        const trackRect = navTrackRef.current.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        setNavPillStyle({
          left: tabRect.left - trackRect.left,
          width: tabRect.width,
          opacity: 1,
        });
      }
    };
    const timer = setTimeout(updatePill, 50);
    window.addEventListener("resize", updatePill);
    return () => {
      window.removeEventListener("resize", updatePill);
      clearTimeout(timer);
    };
  }, [activeCategory, categories, loading]);

  // --- Theme/Background Handlers ---
  const handleUpdateAppearance = async (url: string, opacity: number, color?: string) => {
    const updatedColor = color || themeColor;
    setBackground(url);
    setCardOpacity(opacity);
    setThemeColor(updatedColor);
    if (color) setThemeColorAuto(false);

    try {
      await storageService.setBackground(url);
      await storageService.savePreferences({
        cardOpacity: opacity,
        themeColor: updatedColor,
        themeMode,
        themeColorAuto: color ? false : themeColorAuto,
      }, true);
    } catch (err) { console.error(err); }
  };

  const handleUpdateThemeColor = (color: string, auto: boolean) => {
    setThemeColor(color);
    setThemeColorAuto(auto);
    storageService.savePreferences({ cardOpacity, themeColor: color, themeMode, themeColorAuto: auto });
  };

  const toggleTheme = () => {
    const newTheme = themeMode === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
    setThemeMode(newTheme);
    storageService.savePreferences({ cardOpacity, themeColor, themeMode: newTheme, themeColorAuto });
  };

  const isDark = themeMode === ThemeMode.Dark;
  const isBackgroundUrl = background.startsWith("http") || background.startsWith("data:");
  const adaptiveGlassBlur = isDark ? 50 : 30;

  // --- Render Helpers ---
  const visibleCategory = categories.find((c) => c.id === activeCategory);
  const visibleSubCategory = visibleCategory?.subCategories.find((s) => s.id === activeSubCategoryId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-white/40" size={40} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-[var(--theme-primary)] selection:text-white flex flex-col ${isDark ? "text-slate-100" : "text-slate-800"}`}>
      <ToastContainer />
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {isBackgroundUrl ? (
          <img key={background} src={background} alt="bg" className="w-full h-full object-cover transition-opacity duration-700" style={{ opacity: isDark ? 0.8 : 1 }} />
        ) : (
          <div className="w-full h-full" style={{ background, opacity: isDark ? 1 : 0.9 }} />
        )}
        <div className={`absolute inset-0 ${isDark ? "bg-slate-900/30" : "bg-white/10"}`} />
      </div>

      {/* Nav Island */}
      <nav className="flex justify-center items-center py-6 px-4 relative z-[100] text-sm">
        <div className={`relative flex items-center p-1.5 rounded-full border transition-all duration-500 shadow-xl ${isDark ? "bg-slate-900/60 border-white/10" : "bg-white/60 border-white/40"}`} 
             style={{ backdropFilter: `blur(${adaptiveGlassBlur}px) saturate(180%)`, WebkitBackdropFilter: `blur(${adaptiveGlassBlur}px) saturate(180%)` }}>
          
          <div className="relative flex items-center" ref={navTrackRef}>
            <div className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 pointer-events-none ${isDark ? "bg-white/10 border-white/5" : "bg-white border-black/5 shadow-sm"}`} 
                 style={{ left: navPillStyle.left, width: navPillStyle.width, opacity: navPillStyle.opacity }} />
            
            {categories.map((cat) => (
              <button key={cat.id} ref={(el) => { tabsRef.current[cat.id] = el; }} onClick={() => setActiveCategory(cat.id)}
                className={`relative z-10 px-4 py-2 rounded-full transition-colors ${activeCategory === cat.id ? (isDark ? "text-white" : "text-slate-900") : "text-white/50 hover:text-white/80"}`}>
                {cat.title}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-5 mx-2 bg-white/10" />
          
          <div className="flex gap-1">
            <button onClick={() => setLanguage(language === "en" ? "zh" : "en")} className="p-2 rounded-full hover:bg-white/10 text-white/60"><Globe size={18} /></button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 text-white/60">{isDark ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-white/60"><Settings size={18} /></button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 flex-1 flex flex-col items-center pt-8 max-w-[900px] relative z-[10]">
        
        {/* Quote / Famous Saying Area */}
        <div className="w-full flex flex-col items-center mb-10">
          <ConsoleLog />
          <div className="w-16 h-[2px] mt-4 opacity-30 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
        </div>

        <section className="w-full mb-14">
          <SearchBar themeMode={themeMode} />
        </section>

        <main className="w-full pb-20 space-y-8">
          {visibleSubCategory && (
            <div key={visibleSubCategory.id}>
              <div className="flex items-center gap-4 mb-6 opacity-60">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-current" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  {visibleSubCategory.title === "Default" ? visibleCategory?.title : visibleSubCategory.title}
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-current" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleSubCategory.items.map((link, index) => (
                  <GlassCard
                    key={link.id}
                    hoverEffect={true}
                    opacity={cardOpacity}
                    themeMode={themeMode}
                    onClick={() => window.open(link.url, "_blank")}
                    className="h-20 flex flex-row items-center px-5 gap-5 group animate-card-enter"
                    style={{ 
                      animationDelay: `${index * 0.05}s`, 
                      animationFillMode: 'backwards' 
                    }}
                  >
                    <div className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center h-9 w-9 ${isDark ? "text-white/90" : "text-slate-700"}`}>
                      <SmartIcon icon={link.icon} size={36} imgClassName="w-9 h-9 object-contain drop-shadow-md rounded-lg" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className={`text-[16px] font-bold truncate w-full transition-colors ${isDark ? "text-white group-hover:text-[var(--theme-primary)]" : "text-slate-800"}`}>
                        {link.title}
                      </span>
                      {link.description && <span className="text-[11px] truncate opacity-50">{link.description}</span>}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <SyncIndicator />
      <LinkManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} categories={categories} setCategories={setCategories} background={background} prefs={{ cardOpacity, themeColor, themeMode, themeColorAuto }} onUpdateAppearance={handleUpdateAppearance} onUpdateTheme={handleUpdateThemeColor} isDefaultCode={isDefaultCode} />
    </div>
  );
};

export default App;
