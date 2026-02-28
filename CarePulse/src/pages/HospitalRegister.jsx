import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Building2, ArrowLeft, Eye, EyeOff, Hash, Lock, Phone, Mail, MapPin, User, CheckCircle, AlertCircle } from "lucide-react";

const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all";

export default function HospitalRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", hospital_code: "", password: "", confirmPassword: "",
    email: "", phone: "", address: "", admin_name: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    // Check if code already exists
    const existing = await base44.entities.Hospital.filter({ hospital_code: form.hospital_code });
    if (existing && existing.length > 0) {
      setError("Hospital code already taken. Please choose a different one.");
      setLoading(false);
      return;
    }
    await base44.entities.Hospital.create({
      name: form.name,
      hospital_code: form.hospital_code,
      password_hash: form.password,
      email: form.email,
      phone: form.phone,
      address: form.address,
      admin_name: form.admin_name
    });
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate(createPageUrl("HospitalLogin")), 3000);
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Hospital Registered!</h2>
        <p className="text-slate-500 text-sm">Your hospital account has been created. Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      <div className="px-6 pt-8">
        <Link to={createPageUrl("HospitalLogin")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Register Hospital</h1>
            <p className="text-slate-500 text-sm mt-1">Create your CarePulse hospital account</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full hospital name" className={inputClass} />
                </div>
              </div>
              {/* Hospital Code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Code * <span className="text-xs font-normal text-slate-400">(unique ID for login)</span></label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={form.hospital_code} onChange={e => set("hospital_code", e.target.value.toUpperCase())} placeholder="e.g. HOSP001" className={inputClass} />
                </div>
              </div>
              {/* Admin Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={form.admin_name} onChange={e => set("admin_name", e.target.value)} placeholder="Administrator's name" className={inputClass} />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@hospital.com" className={inputClass} />
                </div>
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                </div>
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea rows={2} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Hospital address" className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all resize-none" />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPass ? "text" : "password"} required value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 characters" className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Re-enter password" className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm shadow-md mt-2">
                {loading ? "Creating account..." : "Register Hospital"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Already registered? <Link to={createPageUrl("HospitalLogin")} className="text-blue-600 font-medium">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
