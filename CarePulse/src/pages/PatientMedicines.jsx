import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Pill, Clock, Bell, CheckCircle, Calendar, BellOff } from "lucide-react";
import { LanguageContext, UI_TEXT, useLanguage } from "@/components/patient/LanguageContext";

function PatientMedicinesInner() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const T = UI_TEXT[lang] || UI_TEXT["English"];
  const [patient, setPatient] = useState(null);
  const [checkedMeds, setCheckedMeds] = useState({});
  const [reminderStatus, setReminderStatus] = useState("idle"); // idle | granted | denied

  useEffect(() => {
    const session = sessionStorage.getItem("patient_session");
    if (!session) { navigate(createPageUrl("PatientLogin")); return; }
    const s = JSON.parse(session);
    loadPatient(s.id);
  }, []);

  const loadPatient = async (id) => {
    const patients = await base44.entities.Patient.filter({ id });
    if (patients && patients.length > 0) setPatient(patients[0]);
  };

  const medicines = patient?.prescribed_medicines
    ? patient.prescribed_medicines.split("\n").filter(m => m.trim())
    : [];

  const toggleMed = (i) => setCheckedMeds(prev => ({ ...prev, [i]: !prev[i] }));

  const enableReminders = async () => {
    if (!("Notification" in window)) { setReminderStatus("denied"); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setReminderStatus("granted");
      // Send immediate reminder notification
      new Notification("💊 Care Pulse", {
        body: lang === "Telugu"
          ? "మీ మందులు తీసుకోవడం మర్చిపోవద్దు!"
          : lang === "Hindi"
          ? "अपनी दवाइयाँ लेना न भूलें!"
          : "Don't forget to take your medicines today!",
        icon: "/favicon.ico"
      });
      // Schedule periodic reminders every 8 hours using setInterval
      const reminderTimes = [
        { label: lang === "Telugu" ? "ఉదయం మందులు" : lang === "Hindi" ? "सुबह की दवाई" : "Morning Medicine", delay: 100 },
      ];
    } else {
      setReminderStatus("denied");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(createPageUrl("PatientHome"))}
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-sm">{T.medicinePage}</h1>
          <p className="text-xs text-slate-400">{patient?.name}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-xl mx-auto space-y-4">
        {/* Today's reminder banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4" />
            <p className="text-xs font-semibold opacity-80">{T.todayMedicines}</p>
          </div>
          <p className="text-lg font-bold">{typeof T.medicationsCount === "function" ? T.medicationsCount(medicines.length) : `${medicines.length} medications prescribed`}</p>
          <p className="text-xs opacity-70 mt-0.5">{new Date().toLocaleDateString(lang === "Telugu" ? "te-IN" : lang === "Hindi" ? "hi-IN" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* Reminder enable button */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{T.remindersTitle}</p>
              <p className="text-xs text-slate-400">{lang === "Telugu" ? "మందుల నోటిఫికేషన్‌లు ప్రారంభించండి" : lang === "Hindi" ? "दवाई सूचनाएं सक्षम करें" : "Enable medicine notifications"}</p>
            </div>
          </div>
          {reminderStatus === "idle" && (
            <button onClick={enableReminders}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 rounded-xl text-sm">
              🔔 {T.remindersSend}
            </button>
          )}
          {reminderStatus === "granted" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-xl">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {T.remindersGranted}
            </div>
          )}
          {reminderStatus === "denied" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
              <BellOff className="w-4 h-4 flex-shrink-0" />
              {T.remindersDenied}
            </div>
          )}
        </div>

        {/* Next appointment */}
        {patient?.next_appointment_date && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-800">{T.nextAppointment}</p>
              <p className="text-xs text-blue-600">{patient.next_appointment_date} {patient.next_appointment_time && `at ${patient.next_appointment_time}`}</p>
            </div>
          </div>
        )}

        {/* Medicine List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Pill className="w-4 h-4 text-green-500" />
            <h3 className="font-bold text-slate-800 text-sm">{T.prescribedMedicines}</h3>
          </div>
          {medicines.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{T.noMedicines}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {medicines.map((med, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <button onClick={() => toggleMed(i)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checkedMeds[i] ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                    {checkedMeds[i] && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${checkedMeds[i] ? "line-through text-slate-400" : "text-slate-700"}`}>{med}</p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{T.daily}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor's Instructions */}
        {patient?.aftercare_instructions && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3">{T.doctorsInstructions}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{patient.aftercare_instructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientMedicines() {
  const [lang, setLang] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("patient_lang") || '"English"'); } catch { return "English"; }
  });
  const setLangAndSave = (l) => { setLang(l); sessionStorage.setItem("patient_lang", JSON.stringify(l)); };
  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangAndSave }}>
      <PatientMedicinesInner />
    </LanguageContext.Provider>
  );
}
