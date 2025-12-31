import React from "react";

export type ThemeMode = "light" | "dark";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  opacity?: number;
  themeMode?: ThemeMode;
  variant?: "grid" | "row"; // ⭐ 新增
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hoverEffect = true,
  opacity = 0.25,
  themeMode = "light",
  variant = "grid",
  className = "",
  ...props
}) => {
  const isDark = themeMode === "dark";
  const isRow = variant === "row";

  const backgroundColor = isDark
    ? `rgba(30, 41, 59, ${opacity})`
    : `rgba(255, 255, 255, ${opacity})`;

  const borderColor = isDark
    ? "border-white/10"
    : "border-slate-200/70";

  const shadowClass = isDark
    ? "shadow-lg shadow-black/20"
    : "shadow-md shadow-slate-300/40";

  return (
    <div
      {...props}
      className={`
        relative overflow-hidden border
        transition-all duration-300 ease-out
        group cursor-pointer
        ${isRow ? "rounded-xl px-4 py-3" : "rounded-2xl"}
        ${borderColor}
        ${shadowClass}
        ${hoverEffect ? "hover:-translate-y-0.5 hover:shadow-xl" : ""}
        ${className}
      `}
      style={{
        backgroundColor,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {/* hover 光效 */}
      {hoverEffect && (
        <div
          className="
            pointer-events-none absolute inset-0
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          "
          style={{
            background: isDark
              ? "radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 60%)"
              : "radial-gradient(circle at top left, rgba(255,255,255,0.7), transparent 60%)",
          }}
        />
      )}

      {/* 内容 */}
      <div
        className={`
          relative z-10 w-full h-full pointer-events-none
          ${isRow
            ? "flex flex-row items-center gap-4 justify-start"
            : "flex flex-col items-center justify-center"}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
