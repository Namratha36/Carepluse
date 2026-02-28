import { useState } from "react";
import { Bell, CheckCircle, X, BellOff } from "lucide-react";
import { useLanguage, UI_TEXT } from "./LanguageContext";

export default function RemindersPanel({ onClose }) {
  const { lang } = useLanguage();
  const T = UI_TEXT[lang];
  const [status, setStatus] = useState("idle"); // idle | granted | denied

  const enableReminders = async () => {
    if (!("Notification" in window)) {
      setStatus("denied");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setStatus("granted");
      // Schedule a daily morning reminder (once now as demo, real app would use service worker)
      new Notification("💊 CarePulse Reminder", {
        body: lang === "Telugu"
          ? "మీ రోజువారీ చెక్-ఇన్ మర్చిపోవద్దు మరియు మీ మందులు తీసుకోండి!"
          : lang === "Hindi"
          ? "अपना दैनिक चेक-इन न भूलें और अपनी दवाइयाँ लें!"
          : "Don't forget your daily check-in and take your medicines!",
        icon: "/favicon.ico"
      });
    } else {
      setStatus("denied");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-bold text-slate-800">{T.remindersTitle}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {[
            { icon: "📋", text: lang === "Telugu" ? "రోజువారీ చెక్-ఇన్ రిమైండర్" : lang === "Hindi" ? "दैनिक चेक-इन अनुस्मारक" : "Daily check-in reminder" },
            { icon: "💊", text: lang === "Telugu" ? "మందుల సమయ హెచ్చరిక" : lang === "Hindi" ? "दवाई समय अनुस्मारक" : "Medicine time alert" },
            { icon: "📅", text: lang === "Telugu" ? "అపాయింట్‌మెంట్ నోటిఫికేషన్" : lang === "Hindi" ? "अपॉइंटमेंट सूचना" : "Appointment notification" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl">
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium text-slate-700">{text}</span>
            </div>
          ))}
        </div>

        {status === "granted" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-2xl mb-4">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {T.remindersGranted}
          </div>
        )}
        {status === "denied" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-2xl mb-4">
            <BellOff className="w-4 h-4 flex-shrink-0" />
            {T.remindersDenied}
          </div>
        )}

        {status === "idle" && (
          <button onClick={enableReminders}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md hover:opacity-90 transition-opacity">
            🔔 {T.remindersSend}
          </button>
        )}
      </div>
    </div>
  );
}
