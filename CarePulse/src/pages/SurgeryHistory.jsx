import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Calendar, Stethoscope, FileText, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { LanguageContext, UI_TEXT, useLanguage } from "@/components/patient/LanguageContext";

function SurgeryHistoryInner() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const T = UI_TEXT[lang] || UI_TEXT["English"];
  const [patient, setPatient] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponse, setExpandedResponse] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem("patient_session");
    if (!session) { navigate(createPageUrl("PatientLogin")); return; }
    const s = JSON.parse(session);
    loadData(s.id);
  }, []);

  const loadData = async (id) => {
    const [patients, resps] = await Promise.all([
      base44.entities.Patient.filter({ id }),
      base44.entities.RecoveryResponse.filter({ patient_id: id })
    ]);
    if (patients?.length > 0) setPatient(patients[0]);
    setResponses((resps || []).sort((a, b) => new Date(b.response_date) - new Date(a.response_date)));
    setLoading(false);
  };

  const labels = {
    English: { title: "Surgery History", surgery: "Surgery", date: "Date", doctor: "Doctor", status: "Status", score: "Recovery Score", checkIns: "Check-in History", noHistory: "No check-in history yet.", pain: "Pain", fever: "Fever", mobility: "Mobility", meds: "Meds taken", risk: "Risk", yes: "Yes", no: "No" },
    Telugu: { title: "శస్త్రచికిత్స చరిత్ర", surgery: "శస్త్రచికిత్స", date: "తేదీ", doctor: "డాక్టర్", status: "స్థితి", score: "రికవరీ స్కోర్", checkIns: "చెక్-ఇన్ చరిత్ర", noHistory: "ఇంకా చెక్-ఇన్ చరిత్ర లేదు.", pain: "నొప్పి", fever: "జ్వరం", mobility: "చలనం", meds: "మందులు తీసుకున్నారు", risk: "ప్రమాదం", yes: "అవును", no: "కాదు" },
    Hindi: { title: "सर्जरी इतिहास", surgery: "सर्जरी", date: "तारीख", doctor: "डॉक्टर", status: "स्थिति", score: "रिकवरी स्कोर", checkIns: "चेक-इन इतिहास", noHistory: "अभी तक कोई चेक-इन इतिहास नहीं।", pain: "दर्द", fever: "बुखार", mobility: "गतिशीलता", meds: "दवाई ली", risk: "जोखिम", yes: "हाँ", no: "नहीं" },
  };
  const L = labels[lang] || labels["English"];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Activity className="w-8 h-8 text-green-500 animate-pulse" />
    </div>
  );

  const score = patient?.recovery_score ?? 100;
  const scoreColor = score >= 75 ? "from-green-400 to-emerald-500" : score >= 50 ? "from-yellow-400 to-amber-500" : "from-red-400 to-rose-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="font-extrabold text-slate-800 text-sm">{L.title}</h1>
          {patient && <p className="text-xs text-slate-400">{patient.name}</p>}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-xl mx-auto">
        {/* Current Surgery Card */}
        {patient && (
          <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg"
            style={{ animation: "fadeUp 0.4s ease" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-green-200 text-xs font-semibold">{L.surgery}</p>
                <p className="font-extrabold text-lg leading-tight">{patient.surgery_type || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: L.date, value: patient.surgery_date || "—" },
                { label: L.doctor, value: patient.treating_doctor_name ? `Dr. ${patient.treating_doctor_name}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 rounded-2xl p-3">
                  <p className="text-green-200 text-xs">{label}</p>
                  <p className="text-white font-bold text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-green-200 text-xs mb-1.5">{L.score}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full bg-gradient-to-r ${scoreColor}`} style={{ width: `${score}%` }} />
                </div>
                <span className="text-white font-extrabold text-sm">{score}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Check-in History */}
        <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
          <h2 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            {L.checkIns}
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">{responses.length}</span>
          </h2>

          {responses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">{L.noHistory}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((r, idx) => {
                const isOpen = expandedResponse === r.id;
                const riskColor = r.risk_score > 70 ? "bg-red-100 text-red-700 border-red-200"
                  : r.risk_score > 40 ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-green-100 text-green-700 border-green-200";
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    style={{ animation: `fadeUp 0.4s ease ${0.05 * idx}s both` }}>
                    <button onClick={() => setExpandedResponse(isOpen ? null : r.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">{r.response_date}</p>
                          <p className="text-xs text-slate-400">{L.pain}: {r.pain_level}/10</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${riskColor}`}>
                          {L.risk}: {r.risk_score || 0}%
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 space-y-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2 pt-3">
                          {[
                            { label: L.fever, val: r.fever ? L.yes : L.no, bad: r.fever },
                            { label: L.mobility, val: r.mobility_level },
                            { label: L.meds, val: r.medication_taken ? L.yes : L.no, bad: !r.medication_taken },
                            { label: "Infection", val: r.infection_signs ? L.yes : L.no, bad: r.infection_signs },
                          ].map(({ label, val, bad }) => (
                            <div key={label} className="bg-slate-50 rounded-xl px-3 py-2">
                              <p className="text-xs text-slate-400">{label}</p>
                              <p className={`text-xs font-bold mt-0.5 ${bad ? "text-red-600" : "text-green-600"}`}>{val}</p>
                            </div>
                          ))}
                        </div>
                        {r.ai_risk_assessment && (
                          <div className="bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
                            <p className="text-xs text-blue-500 font-semibold mb-1">AI Assessment</p>
                            <p className="text-xs text-blue-800 leading-relaxed">{r.ai_risk_assessment}</p>
                          </div>
                        )}
                        {r.additional_notes && (
                          <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                            <p className="text-xs text-slate-500 font-semibold mb-1">Notes</p>
                            <p className="text-xs text-slate-700">{r.additional_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SurgeryHistory() {
  const [lang, setLang] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("patient_lang") || '"English"'); } catch { return "English"; }
  });
  const setLangAndSave = (l) => { setLang(l); sessionStorage.setItem("patient_lang", JSON.stringify(l)); };
  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangAndSave }}>
      <SurgeryHistoryInner />
    </LanguageContext.Provider>
  );
}
