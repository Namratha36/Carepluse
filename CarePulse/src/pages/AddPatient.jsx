import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Upload, CheckCircle, User, Stethoscope, FileText, Calendar, Sparkles, Loader2 } from "lucide-react";

const inputClass = "w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 text-sm transition-all bg-white";
const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

export default function AddPatient() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", gender: "", blood_group: "", mobile_number: "",
    pre_existing_conditions: "", medical_history: "",
    surgery_type: "", reason_for_surgery: "", surgery_date: "",
    treating_doctor_name: "", doctor_email: "",
    prescribed_medicines: "", aftercare_instructions: "",
    dos_and_donts: "", precautions: "",
    next_appointment_date: "", next_appointment_time: "", next_appointment_department: ""
  });

  useEffect(() => {
    const session = sessionStorage.getItem("hospital_session");
    if (!session) { navigate(createPageUrl("HospitalLogin")); return; }
    setHospital(JSON.parse(session));
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const generateAICareplan = async () => {
    if (!form.surgery_type) return;
    setAiLoading(true);
    const prompt = `You are a medical expert. Generate a detailed post-surgery care plan for a patient who just had: "${form.surgery_type}". 
Reason: ${form.reason_for_surgery || "Not specified"}.
Pre-existing conditions: ${form.pre_existing_conditions || "None"}.

Return a JSON object with exactly these keys:
- aftercare_instructions: string where EACH instruction is on its OWN LINE using \\n as separator. Number each point like "1. Rest for the first 48 hours\\n2. Change dressings daily\\n3. ...". Minimum 5 points.
- dos_and_donts: string where EACH point is on its OWN LINE using \\n as separator. Dos start with "✓ ", don'ts start with "✗ ". Example: "✓ Walk slowly for 10 mins\\n✗ Avoid lifting heavy objects\\n✓ ...". Minimum 4 dos and 4 don'ts.
- precautions: string where EACH precaution is on its OWN LINE using \\n as separator. Number each like "1. Watch for signs of infection\\n2. ...". Minimum 4 points.

CRITICAL: Use actual newline \\n between EVERY single point. Never put multiple points on the same line. Be specific, practical, medically accurate.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          aftercare_instructions: { type: "string" },
          dos_and_donts: { type: "string" },
          precautions: { type: "string" }
        }
      }
    });
    setForm(f => ({
      ...f,
      aftercare_instructions: result.aftercare_instructions || f.aftercare_instructions,
      dos_and_donts: result.dos_and_donts || f.dos_and_donts,
      precautions: result.precautions || f.precautions
    }));
    setAiLoading(false);
  };

  const generateAIMedicines = async () => {
    if (!form.surgery_type) return;
    setAiLoading(true);
    const prompt = `You are a medical expert. Suggest common post-surgery prescribed medications for a patient who had: "${form.surgery_type}".
Pre-existing conditions: ${form.pre_existing_conditions || "None"}.

Return a JSON object with key:
- prescribed_medicines: string (list each medicine with name, typical dosage, frequency, and duration, one per line)

Be practical and medically accurate. Note this is a suggestion for the doctor to review and modify.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          prescribed_medicines: { type: "string" }
        }
      }
    });
    setForm(f => ({ ...f, prescribed_medicines: result.prescribed_medicines || f.prescribed_medicines }));
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await base44.entities.Patient.create({
      ...form,
      age: parseInt(form.age),
      hospital_id: hospital.id,
      recovery_status: "Stable",
      recovery_score: 100,
      risk_level: "Low"
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => navigate(createPageUrl("HospitalDashboard")), 2000);
  };

  if (saved) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Patient Added!</h2>
        <p className="text-slate-500 text-sm">Recovery profile created successfully</p>
      </div>
    </div>
  );

  const steps = [
    { label: "Personal", icon: User },
    { label: "Medical", icon: Stethoscope },
    { label: "Surgery", icon: FileText },
    { label: "Care Plan", icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link to={createPageUrl("HospitalDashboard")}>
          <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="font-bold text-slate-800 text-sm">Add New Patient</h1>
          <p className="text-xs text-slate-400">Step {step} of 4</p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${done ? "bg-blue-600" : active ? "bg-blue-100 ring-2 ring-blue-400" : "bg-slate-100"}`}>
                  <Icon className={`w-4 h-4 ${done || active ? "text-blue-600" : "text-slate-400"} ${done ? "text-white" : ""}`} />
                </div>
                <span className={`text-xs font-medium ${active ? "text-blue-600" : "text-slate-400"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="space-y-4">
            <div><label className={labelClass}>Full Name *</label><input className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Patient's full name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Age *</label><input type="number" className={inputClass} value={form.age} onChange={e => set("age", e.target.value)} placeholder="Years" /></div>
              <div><label className={labelClass}>Gender *</label>
                <select className={inputClass} value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Blood Group</label>
              <select className={inputClass} value={form.blood_group} onChange={e => set("blood_group", e.target.value)}>
                <option value="">Select</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Mobile Number *</label><input type="tel" className={inputClass} value={form.mobile_number} onChange={e => set("mobile_number", e.target.value)} placeholder="+91 98765 43210" /></div>
          </div>
        )}

        {/* Step 2: Medical */}
        {step === 2 && (
          <div className="space-y-4">
            <div><label className={labelClass}>Pre-existing Medical Conditions</label><textarea rows={3} className={inputClass} value={form.pre_existing_conditions} onChange={e => set("pre_existing_conditions", e.target.value)} placeholder="Diabetes, hypertension, etc." /></div>
            <div><label className={labelClass}>Medical History</label><textarea rows={3} className={inputClass} value={form.medical_history} onChange={e => set("medical_history", e.target.value)} placeholder="Previous surgeries, allergies, medications..." /></div>
          </div>
        )}

        {/* Step 3: Surgery */}
        {step === 3 && (
          <div className="space-y-4">
            <div><label className={labelClass}>Surgery Type *</label><input className={inputClass} value={form.surgery_type} onChange={e => set("surgery_type", e.target.value)} placeholder="e.g. Appendectomy, Knee Replacement" /></div>
            <div><label className={labelClass}>Reason for Surgery</label><textarea rows={2} className={inputClass} value={form.reason_for_surgery} onChange={e => set("reason_for_surgery", e.target.value)} placeholder="Clinical reason..." /></div>
            <div><label className={labelClass}>Surgery Date *</label><input type="date" className={inputClass} value={form.surgery_date} onChange={e => set("surgery_date", e.target.value)} /></div>
            <div><label className={labelClass}>Treating Doctor Name *</label><input className={inputClass} value={form.treating_doctor_name} onChange={e => set("treating_doctor_name", e.target.value)} placeholder="Dr. Full Name" /></div>
            <div><label className={labelClass}>Doctor Email</label><input type="email" className={inputClass} value={form.doctor_email} onChange={e => set("doctor_email", e.target.value)} placeholder="doctor@hospital.com" /></div>
            <div className="bg-slate-100 rounded-2xl p-4 border-2 border-dashed border-slate-300 flex items-center justify-center gap-3 cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Upload Surgery Documents</span>
            </div>
          </div>
        )}

        {/* Step 4: Care Plan */}
        {step === 4 && (
          <div className="space-y-4">
            {/* AI Generate Button */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
              <p className="text-xs text-purple-700 font-semibold mb-1">AI Care Plan Generator</p>
              <p className="text-xs text-slate-500 mb-3">Auto-generate aftercare, dos & don'ts, and precautions based on surgery type: <span className="font-semibold text-slate-700">{form.surgery_type || "Not specified"}</span></p>
              <button onClick={generateAICareplan} disabled={aiLoading || !form.surgery_type}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                {aiLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</> : <><Sparkles className="w-3.5 h-3.5" />Generate with AI</>}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass} style={{marginBottom:0}}>Prescribed Medicines</label>
                <button type="button" onClick={generateAIMedicines} disabled={aiLoading || !form.surgery_type}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50">
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Suggest
                </button>
              </div>
              <textarea rows={4} className={inputClass} value={form.prescribed_medicines} onChange={e => set("prescribed_medicines", e.target.value)} placeholder="Medicine names, dosage, timing..." />
            </div>
            <div><label className={labelClass}>After-care Instructions</label><textarea rows={4} className={inputClass} value={form.aftercare_instructions} onChange={e => set("aftercare_instructions", e.target.value)} placeholder="Post-surgery care details..." /></div>
            <div><label className={labelClass}>Dos and Don'ts</label><textarea rows={4} className={inputClass} value={form.dos_and_donts} onChange={e => set("dos_and_donts", e.target.value)} placeholder="✓ Walk slowly&#10;✗ Avoid heavy lifting" /></div>
            <div><label className={labelClass}>Precautions</label><textarea rows={3} className={inputClass} value={form.precautions} onChange={e => set("precautions", e.target.value)} placeholder="Safety guidelines..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Next Appointment</label><input type="date" className={inputClass} value={form.next_appointment_date} onChange={e => set("next_appointment_date", e.target.value)} /></div>
              <div><label className={labelClass}>Time</label><input type="time" className={inputClass} value={form.next_appointment_time} onChange={e => set("next_appointment_time", e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Department</label><input className={inputClass} value={form.next_appointment_department} onChange={e => set("next_appointment_department", e.target.value)} placeholder="e.g. Orthopedics" /></div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl text-sm hover:bg-slate-50 transition-colors">
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 rounded-2xl text-sm shadow-md hover:opacity-90 transition-opacity">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3.5 rounded-2xl text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? "Saving..." : "Create Patient Profile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
