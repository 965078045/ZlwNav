import GlassCard from "./components/GlassCard";
import { SmartIcon } from "./components/SmartIcon";


const App = () => {
  const themeMode: "light" | "dark" = "dark";
  const cardOpacity = 0.3;
  const isDark = themeMode === "dark";

  return (
    <div className="min-h-screen px-4 py-6">
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        {links.map((link) => (
          <GlassCard
            key={link.title}
            variant="row"
            hoverEffect
            opacity={cardOpacity}
            themeMode={themeMode}
            onClick={() => window.open(link.url, "_blank")}
            className="min-h-[64px]"
          >
            {/* 左侧图标（+50%） */}
            <div className="flex-shrink-0">
              <SmartIcon
                icon={link.icon}
                size={36} // ⭐ 原 24 → 36
                imgClassName="w-9 h-9 object-contain rounded-md"
              />
            </div>

            {/* 右侧文字 */}
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[15px] font-semibold truncate ${
                  isDark ? "text-white/90" : "text-slate-800"
                }`}
              >
                {link.title}
              </span>

              <span
                className={`text-[11px] truncate ${
                  isDark ? "text-white/40" : "text-slate-400"
                }`}
              >
                {link.description || link.url}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default App;
