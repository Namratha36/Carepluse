import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Eye, Clock, Send } from "lucide-react";

const severityConfig = {
  "Critical": { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  "High": { color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  "Medium": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  "Low": { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-400" }
};

export default function HospitalAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const session = sessionStorage.getItem("hospital_session");
    if (!session) { navigate(createPageUrl("HospitalLogin")); return; }
    const h = JSON.parse(session);
    loadAlerts(h.id);
  }, []);

  const loadAlerts = async (hospitalId) => {
    const a = await base44.entities.Alert.filter({ hospital_id: hospitalId });
    setAlerts(a || []);
    setLoading(false);
  };

  const resolveAlert = async (alert) => {
    await base44.entities.Alert.update(alert.id, { is_resolved: true, doctor_response: response });
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, is_resolved: true, doctor_response: response } : a));
    setSelected(null);
    setResponse("");
  };

  const filtered = filter === "all" ? alerts : filter === "unresolved" ? alerts.filter(a => !a.is_resolved) : alerts.filter(a => a.is_resolved);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link to={createPageUrl("HospitalDashboard")}>
          <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800 text-sm">Alerts & Notifications</h1>
          <p className="text-xs text-slate-400">{alerts.filter(a => !a.is_resolved).length} unresolved</p>
        </div>
        <Bell className="w-5 h-5 text-slate-400" />
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Filter */}
        <div className="flex gap-2">
          {[["all", "All"], ["unresolved", "Unresolved"], ["resolved", "Resolved"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === key ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading alerts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-300" />
            <p className="font-medium text-sm">All clear!</p>
            <p className="text-xs mt-1">No alerts to show</p>
          </div>
        ) : filtered.map(alert => {
          const sc = severityConfig[alert.severity] || severityConfig["Low"];
          return (
            <div key={alert.id} className={`bg-white rounded-2xl border ${sc.color} shadow-sm overflow-hidden`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sc.dot} ${!alert.is_resolved ? "animate-pulse" : ""}`} />
                    <span className="text-sm font-bold text-slate-800">{alert.patient_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color} border`}>{alert.severity}</span>
                    {alert.is_resolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-1">{alert.alert_type}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{alert.message}</p>
                {alert.doctor_response && (
                  <div className="mt-2 bg-green-50 rounded-xl p-2">
                    <p className="text-xs text-green-700 font-medium">Doctor Response: {alert.doctor_response}</p>
                  </div>
                )}
              </div>
              {!alert.is_resolved && (
                <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-2">
                  {selected?.id === alert.id ? (
                    <>
                      <input value={response} onChange={e => setResponse(e.target.value)} placeholder="Add doctor response..." className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-400 outline-none" />
                      <button onClick={() => resolveAlert(alert)} className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-xl">
                        <Send className="w-3 h-3" /> Resolve
                      </button>
                      <button onClick={() => setSelected(null)} className="text-slate-400 text-xs px-2 py-2 rounded-xl hover:bg-slate-100">Cancel</button>
                    </>
                  ) : (
                    <>
                      <Link to={createPageUrl(`PatientRecord?id=${alert.patient_id}`)} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1 text-blue-600 text-xs font-medium py-1.5">
                          <Eye className="w-3.5 h-3.5" /> View Patient
                        </button>
                      </Link>
                      <button onClick={() => setSelected(alert)} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Respond
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
