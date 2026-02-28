import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, AlertTriangle, CheckCircle, Bell, Pill, ClipboardList, Calendar } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const TEXT = {
  English: {
    title: "Health Warnings",
    subtitle: "Active alerts for your recovery",
    noWarnings: "All good! No warnings at this time.",
    missedCheckin: "You haven't done your daily check-in today. Please complete it to help monitor your recovery.",
    missedMeds: "Reminder: Take your prescribed medicines on time.",
    upcomingAppt: "You have an upcoming appointment",
    highRisk: "Your last check-in showed high risk symptoms. Please contact your doctor.",
    checkinBtn: "Do Check-in Now",
    close: "Close",
    loading: "Checking your status...",
  },
  Telugu: {
    title: "ఆరోగ్య హెచ్చరికలు",
    subtitle: "మీ రికవరీ కోసం యాక్టివ్ హెచ్చరికలు",
    noWarnings: "అన్నీ బాగున్నాయి! ప్రస్తుతం హెచ్చరికలు లేవు.",
    missedCheckin: "మీరు ఈరోజు రోజువారీ చెక్-ఇన్ చేయలేదు. మీ రికవరీని పర్యవేక్షించడానికి దయచేసి పూర్తి చేయండి.",
    missedMeds: "రిమైండర్: మీ నిర్ణీత మందులు సమయానికి తీసుకోండి.",
    upcomingAppt: "మీకు రాబోయే అపాయింట్‌మెంట్ ఉంది",
    highRisk: "మీ చివరి చెక్-ఇన్ అధిక ప్రమాద లక్షణాలు చూపించింది. దయచేసి మీ డాక్టర్‌ను సంప్రదించండి.",
    checkinBtn: "ఇప్పుడే చెక్-ఇన్ చేయండి",
    close: "మూసివేయి",
    loading: "మీ స్థితి తనిఖీ చేస్తోంది...",
  },
  Hindi: {
    title: "स्वास्थ्य चेतावनियाँ",
    subtitle: "आपकी रिकवरी के लिए सक्रिय अलर्ट",
    noWarnings: "सब ठीक है! अभी कोई चेतावनी नहीं।",
    missedCheckin: "आपने आज अपना दैनिक चेक-इन नहीं किया। अपनी रिकवरी की निगरानी के लिए कृपया इसे पूरा करें।",
    missedMeds: "याद दिलाना: अपनी निर्धारित दवाइयाँ समय पर लें।",
    upcomingAppt: "आपका एक आगामी अपॉइंटमेंट है",
    highRisk: "आपके अंतिम चेक-इन में उच्च जोखिम के लक्षण दिखे। कृपया अपने डॉक्टर से संपर्क करें।",
    checkinBtn: "अभी चेक-इन करें",
    close: "बंद करें",
    loading: "आपकी स्थिति जाँच रहे हैं...",
  },
};

export default function WarningsPanel({ patient, onClose, onGoToCheckin }) {
  const { lang } = useLanguage();
  const T = TEXT[lang] || TEXT["English"];
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient?.id) checkWarnings();
  }, [patient?.id, lang]);

  const checkWarnings = async () => {
    setLoading(true);
    const w = [];
    const today = new Date().toISOString().split("T")[0];

    // Check if checked in today
    const todayResponses = await base44.entities.RecoveryResponse.filter({
      patient_id: patient.id,
      response_date: today,
    });
    if (!todayResponses || todayResponses.length === 0) {
      w.push({ type: "checkin", icon: ClipboardList, color: "orange", message: T.missedCheckin });
    }

    // Check if last check-in had missed meds
    const recent = await base44.entities.RecoveryResponse.filter(
      { patient_id: patient.id },
      "-response_date",
      1
    );
    if (recent && recent.length > 0 && recent[0].medication_taken === false) {
      w.push({ type: "meds", icon: Pill, color: "red", message: T.missedMeds });
    }

    // Check high risk status
    if (patient.recovery_status === "High Risk") {
      w.push({ type: "highrisk", icon: AlertTriangle, color: "red", message: T.highRisk });
