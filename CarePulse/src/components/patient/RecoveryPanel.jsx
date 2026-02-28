import { useState, useEffect } from "react";
import { Calendar, Clock, ShieldAlert, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useLanguage, UI_TEXT } from "./LanguageContext";
import { base44 } from "@/api/base44Client";

const translationCache = {};

function useTranslation(text, lang) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheKey = `${lang}:${text}`;

  useEffect(() => {
    if (!text || lang === "English") { setTranslated(null); return; }
    if (translationCache[cacheKey]) { setTranslated(translationCache[cacheKey]); return; }
    setLoading(true);
    const langName = lang === "Telugu" ? "Telugu" : "Hindi";
    base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following medical instruction to ${langName}. Keep medical terms accurate. Return only the translated text:\n\n${text}`
    }).then(res => {
      const result = typeof res === "string" ? res : text;
      translationCache[cacheKey] = result;
      setTranslated(result);
    }).finally(() => setLoading(false));
  }, [text, lang]);

  if (lang === "English") return { text, loading: false };
  return { text: translated || text, loading };
}

function TranslatedPoint({ text, lang }) {
  const { text: translated, loading } = useTranslation(text, lang);
  if (loading) return (
    <span className="inline-flex items-center gap-1 text-slate-400">
      <Loader2 className="w-3 h-3 animate-spin" />{text}
    </span>
  );
  return <span>{translated}</span>;
}

function SectionCard({ title, icon, colorScheme, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-300 ${colorScheme.wrapper}`}
      style={{ animation: "fadeSlideIn 0.4s ease forwards" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 ${colorScheme.header} transition-colors`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <span className={`text-xs font-bold tracking-wide ${colorScheme.titleText}`}>{title}</span>
        </div>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${colorScheme.chevronBg}`}>
          {open
            ? <ChevronUp className={`w-3 h-3 ${colorScheme.titleText}`} />
            : <ChevronDown className={`w-3 h-3 ${colorScheme.titleText}`} />}
        </div>
      </button>
      {open && (
        <div className={`px-3 pb-3 pt-1 ${colorScheme.body} space-y-2`}>
          {children}
        </div>
      )}
    </div>
  );
}

function AftercareItem({ text, index, lang }) {
  return (
    <div className="flex items-start gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-blue-100 shadow-sm"
      style={{ animation: `fadeSlideIn 0.3s ease ${index * 0.05}s both` }}>
      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        {index + 1}
      </div>
      <p className="text-xs text-blue-900 leading-relaxed font-medium">
        <TranslatedPoint text={text} lang={lang} />
      </p>
 
