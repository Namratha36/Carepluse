import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  X, User, Pill, Utensils, FileText, History, Bell, AlertTriangle, LogOut, ChevronRight
} from "lucide-react";
import RemindersPanel from "./RemindersPanel";
import AmbulanceBooking from "./AmbulanceBooking";
import WarningsPanel from "./WarningsPanel";
import { useLanguage, UI_TEXT } from "./LanguageContext";

const LANGS = ["English", "Telugu", "Hindi"];

export default function PatientSidebar({ patient, onClose, onGoToCheckin }) {
  const { lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [showReminders, setShowReminders] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const T = UI_TEXT[lang] || UI_TEXT["English"];

  const handleLogout = () => {
    sessionStorage.removeItem("patient_session");
    navigate(createPageUrl("Landing"));
  };

  const menuItems = [
    { icon: History, label: T.surgeryHistory, page: "SurgeryHistory" },
    { icon: Pill, label: T.medicineReminder, page: "PatientMedicines" },
    { icon: Utensils, label: T.foodRecommendations, page: "PatientFood" },
    { icon: FileText, label: T.doctorInstructions, page: "PatientHome" },
  ];

  return (
    <>
      {showReminders && <RemindersPanel onClose={() => setShowReminders(false)} />}
      {showAmbulance && <AmbulanceBooking patient={patient} onClose={() => setShowAmbulance(false)} />}
      {showWarnings && (
        <WarningsPanel
          patient={patient}
          onClose={() => setShowWarnings(false)}
          onGoToCheckin={() => { onGoToCheckin && onGoToCheckin(); onClose(); }}
        />
      )}

      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 px-5 py-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <h2 className="text-lg font-bold">{patient?.name}</h2>
            <p className="text-green-100 text-sm">{patient?.mobile_number}</p>
          </div>

          {/* Language Switcher */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold mb-2">{T.language}</p>
            <div className="flex gap-1.5">
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${lang === l ? "bg-green-500 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
                  {l === "English" ? "🇬🇧 EN" : l === "Telugu" ? "🇮🇳 TE" : "🇮🇳 HI"}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Details */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <div className="space-y-1.5">
 
