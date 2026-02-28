import { useEffect } from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen">
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        input, textarea, select { font-size: 16px !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }
        .accent-green-500 { accent-color: #22c55e; }
      `}</style>
      {children}
    </div>
  );
}
