import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, ClipboardList, MessageSquare, AlertTriangle, ChevronDown, X, Mic } from "lucide-react";
import PatientSidebar from "@/components/patient/PatientSidebar";
import RecoveryPanel from "@/components/patient/RecoveryPanel";
import RecoveryQuestionnaire from "@/components/patient/RecoveryQuestionnaire";
import AIAssistant from "@/components/patient/AIAssistant";
import VoiceAssistant from "@/components/patient/VoiceAssistant";
import AlertZone from "@/components/patient/AlertZone";
import EmergencyButton from "@/components/patient/EmergencyButton";
import { LanguageContext, UI_TEXT, useLanguage } from "@/components/patient/LanguageContext";

function PatientHomeInner() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("checkin");
  const [showRecoveryPanel, setShowRecoveryPanel] = useState(false);
  const T = UI_TEXT[lang] || UI_TEXT["English"];

  useEffect(() => {
    const session = sessionStorage.getItem("patient_session");
    if (!session) { navigate(createPageUrl("PatientLogin")); return; }
    const s = JSON.parse(session);
    loadPatient(s.id);
  }, []);

  const loadPatient = async (id) => {
    const patients = await base44.entities.Patient.filter({ id });
    if (patients && patients.length > 0) setPatient(patients[0]);
    setLoading(false);
  };

  const refreshPatient = async () => {
    if (!patient?.id) return;
    const patients = await base44.entities.Patient.filter({ id: patient.id });
    if (patients && patients.length > 0) setPatient(patients[0]);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm text-slate-500">{T.loading}</p>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-slate-600 font-medium">{T.patientNotFound}</p>
        <button onClick={() => navigate(createPageUrl("PatientLogin"))} className="mt-3 text-blue-600 text-sm font-medium">{T.backToLogin}</button>
      </div>
    </div>
  );

  const statusColor = patient.recovery_status === "High Risk" ? "bg-red-500" : patient.recovery_status === "Needs Monitoring" ? "bg-yellow-500" : "bg-green-500";

  const tabs = [
    { id: "checkin", label: T.tabs.checkin, icon: ClipboardList },
    { id: "ai", label: T.tabs.ai, icon: MessageSquare },
    { id: "voice", label: T.tabs.voice, icon: Mic },
    { id: "concern", label: T.tabs.concern, icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-slate-100 flex flex-col">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .live-dot { animation: pulse-dot 1.5s ease infinite; }
      `}</style>

      {sidebarOpen && (
        <PatientSidebar
          patient={patient}
          onClose={() => setSidebarOpen(false)}
          onGoToCheckin={() => { setActiveTab("checkin"); setSidebarOpen(false); }}
        />
      )}

      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3" style={{ animation: "slideRight 0.4s ease" }}>
          <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="font-extrabold text-slate-800 text-sm">{patient.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full live-dot ${statusColor}`} />
              <p className="text-xs text-slate-500 font-medium">{patient.recovery_status}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRecoveryPanel(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-xl hover:from-green-100 hover:to-blue-100 transition-all">
            {T.recoveryInfo}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showRecoveryPanel && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowRecoveryPanel(false)}>
          <div className="bg-slate-50 rounded-t-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h2 className="font-bold text-slate-800">{T.recoveryInformation}</h2>
              <button onClick={() => setShowRecoveryPanel(false)} className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="px-5 py-4">
              <RecoveryPanel patient={patient} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4">
            <div className="flex gap-0.5 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === id ? "border-green-500 text-green-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            {activeTab === "checkin" && <RecoveryQuestionnaire patient={patient} onSubmitSuccess={refreshPatient} />}
            {activeTab === "ai" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 h-full flex flex-col" style={{ minHeight: "500px" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{T.aiTitle}</h3>
                    <p className="text-xs text-slate-400">{T.aiSubtitle}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <AIAssistant patient={patient} lang={lang} />
                </div>
              </div>
            )}
            {activeTab === "voice" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <VoiceAssistant patient={patient} />
              </div>
            )}
            {activeTab === "concern" && (
              <div className="space-y-4">
                <AlertZone patient={patient} />
              </div>
            )}

            <div className="mt-6">
              <EmergencyButton patient={patient} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-80 border-l border-slate-200 bg-white overflow-y-auto">
          <div className="px-5 py-5">
            <h2 className="font-bold text-slate-800 text-sm mb-4">{T.recoveryInformation}</h2>
            <RecoveryPanel patient={patient} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientHome() {
  const [lang, setLang] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("patient_lang") || '"English"'); } catch { return "English"; }
  });
  const setLangAndSave = (l) => { setLang(l); sessionStorage.setItem("patient_lang", JSON.stringify(l)); };
  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangAndSave }}>
      <PatientHomeInner />
    </LanguageContext.Provider>
  );
}
