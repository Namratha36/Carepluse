import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, User, Stethoscope, AlertTriangle, FileText,
  Calendar, Clock, Activity, Edit2, Save, X, Bell
} from "lucide-react";

const statusConfig = {
  "Stable": { color: "bg-green-100 text-green-700", label: "🟢 Stable" },
  "Needs Monitoring": { color: "bg-yellow-100 text-yellow-700", label: "🟡 Monitoring" },
  "High Risk": { color: "bg-red-100 text-red-700", label: "🔴 High Risk" }
};

export default function PatientRecord() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [statusEdit, setStatusEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { navigate(createPageUrl("HospitalDashboard")); return; }
    loadPatient(id);
  }, []);

  const loadPatient = async (id) => {
    const [p, a, r] = await Promise.all([
      base44.entities.Patient.filter({ id }),
      base44.entities.Alert.filter({ patient_id: id }),
      base44.entities.RecoveryResponse.filter({ patient_id: id })
    ]);
    if (p && p.length > 0) {
      setPatient(p[0]);
      setNotes(p[0].doctor_notes || "");
    }
    setAlerts(a || []);
    setResponses(r || []);
    setLoading(false);
  };

  const saveNotes = async () => {
    await base44.entities.Patient.update(patient.id, { doctor_notes: notes });
    setPatient(p => ({ ...p, doctor_notes: notes }));
    setEditNotes(false);
  };

  const updateStatus = async (status) => {
    await base44.entities.Patient.update(patient.id, { recovery_status: status });
    setPatient(p => ({ ...p, recovery_status: status }));
    setStatusEdit(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
    </div>
  );

  if (!patient) return null;

  const sc = statusConfig[patient.recovery_status] || statusConfig["Stable"];
  const recoveryDays = patient.surgery_date ? Math.floor((new Date() - new Date(patient.surgery_date)) / (1000 * 60 * 60 * 24)) : 0;

  const tabs = ["overview", "medical", "alerts", "responses"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link to={createPageUrl("HospitalDashboard")}>
            <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-slate-800 text-sm">{patient.name}</h1>
            <p className="text-xs text-slate-400">{patient.surgery_type}</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{patient.name?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-blue-200 text-sm">{patient.age}y • {patient.gender} • {patient.blood_group}</p>
              <p className="text-blue-200 text-xs mt-0.5">{patient.mobile_number}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Recovery Days", value: recoveryDays, suffix: "days" },
              { label: "Recovery Score", value: patient.recovery_score || 100, suffix: "%" },
              { label: "Alerts", value: alerts.length, suffix: "" },
            ].map(({ label, value, suffix }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-3 text-center">
                <p className="text-xl font-bold">{value}<span className="text-xs">{suffix}</span></p>
                <p className="text-blue-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Controls */}
        <div className="px-4 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Recovery Status</span>
            {!statusEdit ? (
              <button onClick={() => setStatusEdit(true)} className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                <Edit2 className="w-3.5 h-3.5" /> Update
              </button>
            ) : (
              <div className="flex gap-2">
                {["Stable", "Needs Monitoring", "High Risk"].map(s => (
                  <button key={s} onClick={() => updateStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${patient.recovery_status === s ? statusConfig[s].color + " border-transparent" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-100 px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-xs font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                {tab}
                {tab === "alerts" && alerts.length > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 rounded-full">{alerts.length}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Stethoscope className="w-4 h-4 text-blue-500" /> Surgery Details</h3>
                <InfoRow label="Surgery Type" value={patient.surgery_type} />
                <InfoRow label="Surgery Date" value={patient.surgery_date} />
                <InfoRow label="Reason" value={patient.reason_for_surgery} />
                <InfoRow label="Doctor" value={`Dr. ${patient.treating_doctor_name}`} />
                <InfoRow label="Doctor Email" value={patient.doctor_email} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Edit2 className="w-4 h-4 text-blue-500" /> Doctor Notes</h3>
                  {!editNotes ? (
                    <button onClick={() => setEditNotes(true)} className="text-blue-600 text-xs font-medium">Edit</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={saveNotes} className="text-green-600 text-xs font-medium flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Save</button>
                      <button onClick={() => setEditNotes(false)} className="text-red-500 text-xs font-medium flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</button>
                    </div>
                  )}
                </div>
                {editNotes ? (
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none text-slate-700 text-sm resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{patient.doctor_notes || "No notes added yet."}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Next Appointment</h3>
                {patient.next_appointment_date ? (
                  <>
                    <InfoRow label="Date" value={patient.next_appointment_date} />
                    <InfoRow label="Time" value={patient.next_appointment_time} />
                    <InfoRow label="Department" value={patient.next_appointment_department} />
                    <InfoRow label="Doctor" value={patient.treating_doctor_name} />
                  </>
                ) : <p className="text-sm text-slate-400">No appointment scheduled.</p>}
              </div>
            </>
          )}

          {/* MEDICAL */}
          {activeTab === "medical" && (
            <>
              <InfoCard title="Pre-existing Conditions" value={patient.pre_existing_conditions} icon={AlertTriangle} color="text-orange-500" />
              <InfoCard title="Medical History" value={patient.medical_history} icon={FileText} color="text-blue-500" />
              <InfoCard title="Prescribed Medicines" value={patient.prescribed_medicines} icon={Activity} color="text-green-500" />
              <InfoCard title="After-care Instructions" value={patient.aftercare_instructions} icon={FileText} color="text-purple-500" />
              <InfoCard title="Dos and Don'ts" value={patient.dos_and_donts} icon={FileText} color="text-blue-500" />
              <InfoCard title="Precautions" value={patient.precautions} icon={AlertTriangle} color="text-red-500" />
            </>
          )}

          {/* ALERTS */}
          {activeTab === "alerts" && (
            <>
              {alerts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No alerts for this patient</p>
                </div>
              ) : alerts.map(alert => (
                <div key={alert.id} className={`bg-white rounded-2xl border p-4 ${alert.severity === "Critical" ? "border-red-300" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">{alert.alert_type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${alert.severity === "Critical" ? "bg-red-100 text-red-700" : alert.severity === "High" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>{alert.severity}</span>
                  </div>
                  <p className="text-xs text-slate-500">{alert.message}</p>
                  {alert.is_resolved && <span className="text-xs text-green-600 font-medium mt-1 block">✓ Resolved</span>}
                </div>
              ))}
            </>
          )}

          {/* RESPONSES */}
          {activeTab === "responses" && (
            <>
              {responses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recovery responses yet</p>
                </div>
              ) : responses.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-800">{r.response_date}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.risk_score > 70 ? "bg-red-100 text-red-700" : r.risk_score > 40 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      Risk: {r.risk_score || 0}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1"><span className="text-slate-400">Pain:</span><span className="font-medium text-slate-700">{r.pain_level}/10</span></div>
                    <div className="flex items-center gap-1"><span className="text-slate-400">Fever:</span><span className={`font-medium ${r.fever ? "text-red-600" : "text-green-600"}`}>{r.fever ? "Yes" : "No"}</span></div>
                    <div className="flex items-center gap-1"><span className="text-slate-400">Mobility:</span><span className="font-medium text-slate-700">{r.mobility_level}</span></div>
                    <div className="flex items-center gap-1"><span className="text-slate-400">Meds taken:</span><span className={`font-medium ${r.medication_taken ? "text-green-600" : "text-red-600"}`}>{r.medication_taken ? "Yes" : "No"}</span></div>
                  </div>
                  {r.ai_risk_assessment && <p className="text-xs text-slate-500 mt-2 bg-blue-50 p-2 rounded-lg">{r.ai_risk_assessment}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-xs text-slate-400 font-medium flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-700 text-right">{value || "—"}</span>
    </div>
  );
}

function InfoCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className={`font-bold text-slate-800 text-sm flex items-center gap-2 mb-3`}><Icon className={`w-4 h-4 ${color}`} /> {title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{value || "Not specified"}</p>
    </div>
  );
}
