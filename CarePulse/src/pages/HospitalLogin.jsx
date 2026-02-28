import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Building2, Eye, EyeOff, ArrowLeft, Lock, Hash, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function HospitalLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ hospitalName: "", hospitalCode: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const hospitals = await base44.entities.Hospital.filter({ hospital_code: form.hospitalCode });
    if (!hospitals || hospitals.length === 0) {
      setError("Invalid hospital code. Please check and try again.");
      setLoading(false);
      return;
    }
    const hospital = hospitals[0];
    if (hospital.name.toLowerCase() !== form.hospitalName.toLowerCase()) {
      setError("Hospital name does not match.");
      setLoading(false);
      return;
    }
    if (hospital.password_hash !== form.password) {
      setError("Incorrect password.");
      setLoading(false);
      return;
    }
    sessionStorage.setItem("hospital_session", JSON.stringify({ id: hospital.id, name: hospital.name, code: hospital.hospital_code }));
    navigate(createPageUrl("HospitalDashboard"));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      <div className="px-6 pt-8">
        <Link to={createPageUrl("Landing")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Hospital Login</h1>
            <p className="text-slate-500 text-sm mt-1">Access your medical dashboard</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.hospitalName}
                    onChange={e => setForm({ ...form, hospitalName: e.target.value })}
                    placeholder="Enter hospital name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Code</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.hospitalCode}
                    onChange={e => setForm({ ...form, hospitalCode: e.target.value })}
                    placeholder="Unique hospital code"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm shadow-md"
              >
                {loading ? "Signing in..." : "Sign In to Dashboard"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            New hospital?{" "}
            <Link to={createPageUrl("HospitalRegister")} className="text-blue-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
