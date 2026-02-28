import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Utensils, CheckCircle, XCircle, Droplets, Loader2 } from "lucide-react";

export default function PatientFood() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem("patient_session");
    if (!session) { navigate(createPageUrl("PatientLogin")); return; }
    const s = JSON.parse(session);
    loadData(s.id);
  }, []);

  const loadData = async (id) => {
    const patients = await base44.entities.Patient.filter({ id });
    if (!patients || patients.length === 0) return;
    const p = patients[0];
    setPatient(p);
    await generateFoodRecs(p);
  };

  const generateFoodRecs = async (p) => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate post-surgery nutrition guidance for a patient who had ${p.surgery_type} surgery. Pre-existing conditions: ${p.pre_existing_conditions || "None"}. Surgery date: ${p.surgery_date}. Provide concise lists.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended: { type: "array", items: { type: "string" } },
          avoid: { type: "array", items: { type: "string" } },
          hydration: { type: "array", items: { type: "string" } },
          healing_tips: { type: "array", items: { type: "string" } }
        }
      }
    });
    setFoodData(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link to={createPageUrl("PatientHome")}>
          <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="font-bold text-slate-800 text-sm">Food Recommendations</h1>
          <p className="text-xs text-slate-400">{patient?.surgery_type}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-xl mx-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Generating personalized nutrition guide...</p>
          </div>
        ) : foodData ? (
          <>
            {foodData.recommended?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Recommended Foods
                </h3>
                <div className="space-y-2">
                  {foodData.recommended.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <p className="text-xs text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {foodData.avoid?.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
                  <XCircle className="w-4 h-4 text-red-500" /> Foods to Avoid
                </h3>
                <div className="space-y-2">
                  {foodData.avoid.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <XCircle className="w-3 h-3 text-red-600" />
                      </div>
                      <p className="text-xs text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {foodData.hydration?.length > 0 && (
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 shadow-sm">
                <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2 mb-4">
                  <Droplets className="w-4 h-4 text-blue-500" /> Hydration Guide
                </h3>
                <div className="space-y-2">
                  {foodData.hydration.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {foodData.healing_tips?.length > 0 && (
              <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5 shadow-sm">
                <h3 className="font-bold text-purple-800 text-sm flex items-center gap-2 mb-4">
                  <Utensils className="w-4 h-4 text-purple-500" /> Healing Diet Tips
                </h3>
                <div className="space-y-2">
                  {foodData.healing_tips.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold text-sm flex-shrink-0">•</span>
                      <p className="text-xs text-purple-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
