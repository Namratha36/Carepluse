import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, TrendingUp, Users, AlertTriangle, Activity, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function HospitalAnalytics() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem("hospital_session");
    if (!session) { navigate(createPageUrl("HospitalLogin")); return; }
    const h = JSON.parse(session);
    loadData(h.id);
  }, []);

  const loadData = async (hospitalId) => {
    const [p, a, r] = await Promise.all([
      base44.entities.Patient.filter({ hospital_id: hospitalId }),
      base44.entities.Alert.filter({ hospital_id: hospitalId }),
      base44.entities.RecoveryResponse.filter({ hospital_id: hospitalId })
    ]);
    setPatients(p || []);
    setAlerts(a || []);
    setResponses(r || []);
    setLoading(false);
  };

  const statusData = [
    { name: "Stable", value: patients.filter(p => p.recovery_status === "Stable").length, color: "#22c55e" },
    { name: "Monitoring", value: patients.filter(p => p.recovery_status === "Needs Monitoring").length, color: "#eab308" },
    { name: "High Risk", value: patients.filter(p => p.recovery_status === "High Risk").length, color: "#ef4444" }
  ];

  const surgeryTypes = patients.reduce((acc, p) => {
    if (p.surgery_type) {
      acc[p.surgery_type] = (acc[p.surgery_type] || 0) + 1;
    }
    return acc;
  }, {});
  const surgeryData = Object.entries(surgeryTypes).map(([name, count]) => ({ name: name.slice(0, 12), count }));

  const alertTypeData = alerts.reduce((acc, a) => {
    acc[a.alert_type] = (acc[a.alert_type] || 0) + 1;
    return acc;
  }, {});
  const alertData = Object.entries(alertTypeData).map(([name, count]) => ({ name: name.slice(0, 14), count }));

  const avgRecovery = patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.recovery_score || 100), 0) / patients.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link to={createPageUrl("HospitalDashboard")}>
          <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="font-bold text-slate-800 text-sm">Hospital Analytics</h1>
          <p className="text-xs text-slate-400">Recovery & Alert Insights</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Patients", value: patients.length, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "High Risk", value: patients.filter(p => p.recovery_status === "High Risk").length, icon: AlertTriangle, color: "from-red-500 to-red-600" },
            { label: "Avg Recovery", value: `${avgRecovery}%`, icon: TrendingUp, color: "from-green-500 to-green-600" },
            { label: "Total Alerts", value: alerts.length, icon: Activity, color: "from-purple-500 to-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{label}</span>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Patient Status Pie */}
        {patients.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Patient Recovery Status</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-600">{s.name}: <strong>{s.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Surgery Types */}
        {surgeryData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Surgery Types</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={surgeryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Alert Types */}
        {alertData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Alert Frequency by Type</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {patients.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
            <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No data yet</p>
            <p className="text-xs mt-1">Add patients to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
