import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";

export default function EmergencyButton({ patient }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const triggerEmergency = async () => {
    setLoading(true);
    await base44.entities.Alert.create({
      patient_id: patient.id,
      hospital_id: patient.hospital_id,
      patient_name: patient.name,
      doctor_email: patient.doctor_email,
      alert_type: "Emergency",
      severity: "Critical",
      message: `EMERGENCY: ${patient.name} has triggered the emergency button. Immediate attention required. Patient info: Age ${patient.age}, Blood group ${patient.blood_group}, Surgery: ${patient.surgery_type} on ${patient.surgery_date}.`,
      is_resolved: false
    });
    await base44.entities.Patient.update(patient.id, { recovery_status: "High Risk" });
    if (patient.doctor_email) {
      try {
        await base44.integrations.Core.SendEmail({
          to: patient.doctor_email,
          subject: `🚨 EMERGENCY ALERT: ${patient.name}`,
          body: `EMERGENCY ALERT!\n\nPatient ${patient.name} has triggered the emergency button.\n\nPatient Details:\n- Age: ${patient.age}\n- Blood Group: ${patient.blood_group}\n- Surgery: ${patient.surgery_type}\n- Surgery Date: ${patient.surgery_date}\n- Mobile: ${patient.mobile_number}\n\nPlease contact the patient immediately.\n\nCarePulse`
        });
      } catch (e) {
        // Email failed silently — alert still created
      }
    }
    setSent(true);
    setLoading(false);
    setShowConfirm(false);
  };

  if (sent) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <p className="text-xs text-green-700 font-medium">Emergency alert sent! Your doctor has been notified.</p>
    </div>
  );

  return (
    <>
      <button onClick={() => setShowConfirm(true)}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform text-sm">
        <Phone className="w-5 h-5" />
        🚨 EMERGENCY
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Confirm Emergency</h3>
              <p className="text-sm text-slate-500 mt-1">This will immediately alert your doctor and flag your case as an emergency.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-2xl text-sm flex items-center justify-center gap-1">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={triggerEmergency} disabled={loading}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-1 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {loading ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
