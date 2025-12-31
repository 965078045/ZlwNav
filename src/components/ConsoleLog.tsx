import React, { useState, useEffect } from "react";

const LOG_MESSAGES = [
  "// 正在初始化个人导航系统...",
  "// 正在连接 Cloudflare 边缘网络...",
  "// 状态检查: D1 数据库连接正常 [OK]",
  "// 正在同步用户偏好设置...",
  "// 检测到地理位置: 访问响应速度 24ms",
  "// 正在加载毛玻璃材质引擎...",
  "// 动态主题提取: 已根据壁纸自动适配颜色",
  "// 正在加载侧边栏分类数据...",
  "// 系统内核版本: v2.4.0-stable",
  "// 站点安全性检查: SSL 证书有效",
  "// 正在监听用户输入状态...",
  "// ------------------------------------",
  "// 系统状态: 运行平稳，所有组件已就绪。",
  "// ------------------------------------"
];

export const ConsoleLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        // 将新日志添加到末尾
        const newLogs = [...prev, LOG_MESSAGES[i]];
        // 保持只显示最近的 6 行，营造向上滚动的效果
        if (newLogs.length > 6) return newLogs.slice(1);
        return newLogs;
      });
      
      i = (i + 1) % LOG_MESSAGES.length; 
    }, 1800); // 1.8秒更新一次，节奏更像系统日志

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="font-mono text-[10px] leading-relaxed tracking-tighter opacity-50 select-none"
      style={{ color: 'var(--theme-primary)' }}
    >
      <div className="flex flex-col">
        {logs.map((log, idx) => (
          <div key={idx} className="animate-fade-in flex items-start gap-2">
            <span className="opacity-60">{">"}</span>
            <span className="whitespace-nowrap">{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
