import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Bot, User, Loader2, Sparkles, FileText } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const GREETINGS = {
  English: (name) => `Hello ${name || ""}! I'm your AI recovery assistant. I've reviewed your recent check-ins. How are you feeling today?`,
  Telugu: (name) => `నమస్కారం ${name || ""}! నేను మీ AI రికవరీ సహాయకుడను. మీ ఇటీవలి చెక్-ఇన్‌లు చూశాను. మీరు ఈరోజు ఎలా అనుభవిస్తున్నారు?`,
  Hindi: (name) => `नमस्ते ${name || ""}! मैं आपका AI रिकवरी सहायक हूँ। मैंने आपके हाल के चेक-इन देखे हैं। आज आप कैसा महसूस कर रहे हैं?`,
};

const AI_LANG_INSTRUCTION = {
  English: "Respond in English.",
  Telugu: "Respond ONLY in Telugu language (తెలుగు). Use simple Telugu words.",
  Hindi: "Respond ONLY in Hindi language (हिंदी). Use simple Hindi words.",
};

const PLACEHOLDER = {
  English: "Ask about your recovery, symptoms...",
  Telugu: "మీ రికవరీ గురించి అడగండి...",
  Hindi: "अपनी रिकवरी के बारे में पूछें...",
};

const PROACTIVE_BTN = {
  English: "Get Recovery Tips",
  Telugu: "రికవరీ సలహాలు పొందండి",
  Hindi: "रिकवरी सुझाव पाएं",
};

const SUMMARY_BTN = {
  English: "Doctor Summary",
  Telugu: "డాక్టర్ సారాంశం",
  Hindi: "डॉक्टर सारांश",
};

export default function AIAssistant({ patient }) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState([
    { role: "assistant", content: (GREETINGS[lang] || GREETINGS["English"])(patient?.name) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentResponses, setRecentResponses] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (patient?.id) loadRecentResponses();
  }, [patient?.id]);

  const loadRecentResponses = async () => {
    const responses = await base44.entities.RecoveryResponse.filter(
      { patient_id: patient.id },
      "-response_date",
      5
    );
    setRecentResponses(responses || []);
  };

  const buildPatientContext = () => {
    const recentSummary = recentResponses.slice(0, 3).map(r =>
      `Date: ${r.response_date}, Pain: ${r.pain_level}/10, Fever: ${r.fever}, Bleeding: ${r.bleeding}, Meds taken: ${r.medication_taken}, Risk score: ${r.risk_score || 0}`
    ).join("\n") || "No recent check-ins.";

    return patient ? `
Patient: ${patient.name}, Age: ${patient.age}, Surgery: ${patient.surgery_type},
Surgery date: ${patient.surgery_date}, Pre-existing: ${patient.pre_existing_conditions || "None"},
Recovery status: ${patient.recovery_status}, Medicines: ${patient.prescribed_medicines || "Not specified"},
After-care: ${patient.aftercare_instructions || "Not specified"},
Recent check-ins (last 3 days):
${recentSummary}` : "";
  };

  const sendMessage = async (overrideMsg) => {
    const userMsg = (overrideMsg || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const history = messages.slice(-6).map(m => `${m.role === "user" ? "Patient" : "AI"}: ${m.content}`).join("\n");
    const langInstr = AI_LANG_INSTRUCTION[lang] || AI_LANG_INSTRUCTION["English"];

    const prompt = `You are a compassionate healthcare AI assistant for post-surgery recovery monitoring.
${buildPatientContext()}

Conversation history:
${history}
Patient asks: ${userMsg}

${langInstr}
Provide a warm, simple, medically accurate response in 2-3 sentences.
If serious symptoms like high fever, severe bleeding, or breathing difficulty are present or mentioned,
always advise to contact the doctor or use the emergency button immediately.
Do not diagnose or prescribe. Keep language simple and reassuring.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const getProactiveTips = async () => {
    if (loading) return;
    setLoading(true);
    const langInstr = AI_LANG_INSTRUCTION[lang] || AI_LANG_INSTRUCTION["English"];
    const prompt = `You are a post-surgery recovery AI.
${buildPatientContext()}

${langInstr}
Based on the patient's recent check-ins and surgery type, provide 3 personalized recovery tips.
Highlight any concerning trends from their check-ins (e.g., recurring pain, missed medicines).
Be warm, specific, and practical. Use bullet points. Keep it concise.`;

    setMessages(prev => [...prev, { role: "user", content: PROACTIVE_BTN[lang] || PROACTIVE_BTN["English"] }]);
    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const getDoctorSummary = async () => {
    if (loading) return;
    setLoading(true);
    const prompt = `You are a clinical AI assistant summarizing patient recovery for a doctor.
${buildPatientContext()}

Generate a concise clinical summary in English for the treating doctor. Include:
1. Overall recovery trend (improving/stable/concerning)
2. Key symptoms reported in recent check-ins
3. Medication compliance
4. Risk flags or alerts
5. Recommendation for follow-up action if needed
Be professional, brief, and clinical. Use bullet points.`;

    setMessages(prev => [...prev, { role: "user", content: SUMMARY_BTN[lang] || SUMMARY_BTN["English"] }]);
    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Action Buttons */}
      <div className="flex gap-2 mb-3">
        <button onClick={getProactiveTips} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50">
          <Sparkles className="w-3.5 h-3.5" />
          {PROACTIVE_BTN[lang] || PROACTIVE_BTN["English"]}
        </button>
        <button onClick={getDoctorSummary} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-50 text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50">
          <FileText className="w-3.5 h-3.5" />
          {SUMMARY_BTN[lang] || SUMMARY_BTN["English"]}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4" style={{ maxHeight: "360px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === "user" ? "bg-green-500" : "bg-blue-600"}`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${msg.role === "user" ? "bg-green-500 text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={PLACEHOLDER[lang] || PLACEHOLDER["English"]}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none text-slate-700 text-xs transition-all"
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
