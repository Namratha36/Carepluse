import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { User, Phone, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const patients = await base44.entities.Patient.filter({ mobile_number: mobile });
    if (!patients || patients.length === 0) {
      setError("No patient found with this mobile number. Please contact your hospital.");
      setLoading(false);
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await base44.entities.Patient.update(patients[0].id, { otp, otp_expiry: expiry });
    // In production: send via SMS. For demo, show OTP.
    setStep("otp");
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const patients = await base44.entities.Patient.filter({ mobile_number: mobile });
    const patient = patients[0];
    if (patient.otp !== otp) {
      setError("Incorrect OTP. Please try again.");
      setLoading(false);
      return;
    }
    if (new Date() > new Date(patient.otp_expiry)) {
      setError("OTP has expired. Please request a new one.");
      setLoading(false);
      return;
    }
    sessionStorage.setItem("patient_session", JSON.stringify({ id: patient.id, name: patient.name, mobile: patient.mobile_number }));
    navigate(createPageUrl("PatientHome"));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 flex flex-col">
      <div className="px-6 pt-8">
        <Link to={createPageUrl("Landing")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Patient Login</h1>
            <p className="text-slate-500 text-sm mt-1">Verify your mobile number to continue</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none text-slate-700 text-sm transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm shadow-md"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center mb-4">
                  <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">OTP sent to <strong>{mobile}</strong></p>
                  {generatedOtp && (
                    <p className="text-xs text-green-600 mt-1 font-mono bg-green-50 px-3 py-1 rounded-full inline-block">
                      Demo OTP: {generatedOtp}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full text-center tracking-widest text-xl py-4 rounded-2xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none text-slate-700 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm shadow-md"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button type="button" onClick={() => { setStep("phone"); setError(""); }} className="w-full text-slate-500 text-sm py-2">
                  ← Change mobile number
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Not registered? Your hospital will add you to the system.
          </p>
        </div>
      </div>
    </div>
  );
}
