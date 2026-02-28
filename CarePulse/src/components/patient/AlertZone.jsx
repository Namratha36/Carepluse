import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Send, CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";

export default function AlertZone({ patient }) {
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setLoading(true);

    let imageUrl = null;
    if (imageFile) {
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      imageUrl = result.file_url;
    }

    await base44.entities.Alert.create({
      patient_id: patient.id,
      hospital_id: patient.hospital_id,
      patient_name: patient.name,
      doctor_email: patient.doctor_email,
      alert_type: "Patient Concern",
      severity: "High",
      message: description,
      image_url: imageUrl,
      is_resolved: false,
      email_sent: false
    });

    // Notify doctor via email
    if (patient.doctor_email) {
      await base44.integrations.Core.SendEmail({
        to: patient.doctor_email,
        subject: `⚠️ Patient Concern: ${patient.name} - Doctor Review Required`,
        body: `Dear Dr. ${patient.treating_doctor_name},\n\nPatient ${patient.name} has submitted a concern that requires your review.\n\nMessage: ${description}\n\nPlease log in to the Smart Surgical Recovery Monitor dashboard to review and respond.\n\nThis is an automated alert from the Smart Surgical Recovery Monitor.`
      });
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <p className="font-bold text-slate-800 text-sm mb-1">Concern Submitted!</p>
      <p className="text-xs text-slate-500">Your doctor has been notified and will respond shortly.</p>
      <button onClick={() => { setSubmitted(false); setDescription(""); setImageFile(null); setImagePreview(null); }} className="mt-4 text-blue-600 text-xs font-medium">Submit another concern</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <p className="text-xs font-bold text-orange-700">Alert Your Doctor</p>
        </div>
        <p className="text-xs text-orange-600">Submit a concern if you feel unsafe, notice unusual symptoms, or need medical attention.</p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Image (Optional)</label>
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-slate-200" />
            <button onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl py-6 cursor-pointer hover:border-orange-400 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 font-medium">Tap to upload photo</p>
            <p className="text-xs text-slate-400">Wound, swelling, rash, etc.</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Describe Your Concern *</label>
        <textarea
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what you're experiencing... (e.g., 'I have severe pain at the surgery site and noticed redness since morning')"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-slate-700 text-xs resize-none transition-all"
        />
      </div>

      <button onClick={handleSubmit} disabled={loading || !description.trim()}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending to Doctor...</> : <><Send className="w-4 h-4" /> Send to Doctor</>}
      </button>

      <p className="text-xs text-slate-400 text-center">Tagged as "Doctor Review Required" — your doctor will respond soon.</p>
    </div>
  );
}
