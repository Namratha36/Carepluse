import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Users, Activity, AlertTriangle, Bell, Plus, Search,
  LogOut, BarChart2, UserPlus, Eye, Building2, TrendingUp, Shield
} from "lucide-react";

const statusConfig = {
  "Stable": { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", label: "Stable", emoji: "🟢" },
  "Needs Monitoring": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", label: "Monitoring", emoji: "🟡" },
  "High Risk": { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", label: "High Risk", emoji: "🔴" }
};

function StatCard({ label, value, icon: Icon, gradient, delay }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300"
      style={{ animation: `fadeUp 0.5s ease ${delay}s both` }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-semibold">{label}</span>
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const session = sessionStorage.getItem("hospital_session");
    if (!session) { navigate(createPageUrl("HospitalLogin")); return; }
    const h = JSON.parse(session);
    setHospital(h);
    loadData(h.id);
  }, []);

  useEffect(() => {
    const unsub = base44.entities.Patient.subscribe((event) => {
      if (event.type === "update" && event.data?.recovery_status === "High Risk") {
        setPopup({
          name: event.data.name,
          message: `Patient ${event.data.name} has been flagged as HIGH RISK based on their latest check-in.`
        });
        setPatients(prev => prev.map(p => p.id === event.id ? { ...p, ...event.data } : p));
      } else if (event.type === "update") {
        setPatients(prev => prev.map(p => p.id === event.id ? { ...p, ...event.data } : p));
      } else if (event.type === "create") {
        setPatients(prev => [...prev, event.data]);
      }
    });
    return unsub;
  }, []);

  const loadData = async (hospitalId) => {
    const [pats, alts] = await Promise.all([
      base44.entities.Patient.filter({ hospital_id: hospitalId }),
      base44.entities.Alert.filter({ hospital_id: hospitalId })
    ]);
    setPatients(pats || []);
    setAlerts(alts || []);
    setLoading(false);
  };

  const filtered = patients.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.surgery_type?.toLowerCase().includes(search.toLowerCase()) ||
      p.treating_doctor_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.recovery_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.recovery_status !== "Stable").length,
    highRisk: patients.filter(p => p.recovery_status === "High Risk").length,
    alertsCount: alerts.filter(a => !a.is_resolved).length
  };

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* High Risk Popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border-2 border-red-400" style={{ animation: "scaleIn 0.3s ease" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest">🚨 High Risk Alert</p>
                <p className="font-extrabold text-slate-800 text-lg">{popup.name}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{popup.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setPopup(null)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
                Acknowledge
              </button>
              <Link to={createPageUrl("HospitalAlerts")} onClick={() => setPopup(null)} className="flex-1">
                <button className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                  View Alerts
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3" style={{ animation: "slideIn 0.4s ease" }}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-sm leading-tight">{hospital.name}</h1>
            <p className="text-xs text-slate-400">Hospital Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("HospitalAnalytics")}>
            <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
              <BarChart2 className="w-4 h-4 text-slate-600" />
            </button>
          </Link>
          <Link to={createPageUrl("HospitalAlerts")}>
            <div className="relative">
              <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-orange-100 transition-colors">
                <Bell className="w-4 h-4 text-slate-600" />
              </button>
              {stats.alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{stats.alertsCount}</span>
              )}
            </div>
          </Link>
          <button onClick={() => { sessionStorage.removeItem("hospital_session"); navigate(createPageUrl("Landing")); }}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto space-y-5">

        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-5 text-white shadow-lg overflow-hidden relative"
          style={{ animation: "fadeUp 0.4s ease" }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-20 w-20 h-20 bg-white/5 rounded-full translate-y-6" />
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-semibold mb-1">Welcome back</p>
            <h2 className="text-xl font-extrabold">{hospital.admin_name || hospital.name}</h2>
            <p className="text-blue-200 text-sm mt-1">{stats.total} patients under care</p>
            <div className="flex gap-3 mt-3">
              <div className="bg-white/15 rounded-xl px-3 py-2">
                <p className="text-xs text-blue-200">High Risk</p>
                <p className="text-lg font-bold">{stats.highRisk}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-3 py-2">
                <p className="text-xs text-blue-200">Active Alerts</p>
                <p className="text-lg font-bold">{stats.alertsCount}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-3 py-2">
                <p className="text-xs text-blue-200">Monitoring</p>
                <p className="text-lg font-bold">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Patients" value={stats.total} icon={Users} gradient="from-blue-500 to-blue-600" delay={0.1} />
          <StatCard label="Need Attention" value={stats.active} icon={Activity} gradient="from-orange-400 to-orange-500" delay={0.15} />
          <StatCard label="High Risk" value={stats.highRisk} icon={AlertTriangle} gradient="from-red-500 to-rose-600" delay={0.2} />
          <StatCard label="Unresolved Alerts" value={stats.alertsCount} icon={Bell} gradient="from-purple-500 to-purple-600" delay={0.25} />
        </div>

        {/* Actions */}
        <div className="flex gap-3" style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>
          <Link to={createPageUrl("AddPatient")} className="flex-1">
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all text-sm">
              <UserPlus className="w-4 h-4" />
              Add New Patient
            </button>
          </Link>
          <Link to={createPageUrl("HospitalAlerts")}>
            <button className="bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-sm shadow-sm">
              <Bell className="w-4 h-4" />
              Alerts
              {stats.alertsCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{stats.alertsCount}</span>}
            </button>
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="space-y-3" style={{ animation: "fadeUp 0.5s ease 0.35s both" }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patients, surgeries, doctors..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "Stable", "Needs Monitoring", "High Risk"].map(s => {
              const sc = statusConfig[s];
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${filterStatus === s ? (s === "all" ? "bg-slate-800 text-white border-slate-800" : sc.color + " border-current") : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s === "all" ? "All Patients" : `${sc?.emoji} ${sc?.label}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" style={{ animation: "fadeUp 0.5s ease 0.4s both" }}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800">Patient List</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-semibold">{filtered.length} patients</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium">Loading patients...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-50 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">No patients found</p>
              <p className="text-xs mt-1">Add your first patient to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((patient, idx) => {
                const sc = statusConfig[patient.recovery_status] || statusConfig["Stable"];
                const score = patient.recovery_score ?? 100;
                return (
                  <div key={patient.id} className="px-5 py-4 hover:bg-slate-50/80 transition-colors"
                    style={{ animation: `fadeUp 0.4s ease ${0.05 * idx}s both` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 relative">
                        <span className="text-sm font-extrabold text-blue-700">{patient.name?.charAt(0)}</span>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${sc.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-800 text-sm">{patient.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${sc.color}`}>{sc.emoji} {sc.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{patient.surgery_type || "No surgery"} {patient.treating_doctor_name ? `• Dr. ${patient.treating_doctor_name}` : ""}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 max-w-[80px] bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-1.5 rounded-full transition-all ${score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{score}%</span>
                        </div>
                      </div>
                      <Link to={createPageUrl(`PatientRecord?id=${patient.id}`)}>
                        <button className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors group">
                          <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </Link>
                    </div>
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
