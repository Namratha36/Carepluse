import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle, Loader2, MapPin, Navigation } from "lucide-react";
import { useLanguage, UI_TEXT } from "./LanguageContext";

export default function AmbulanceBooking({ patient, onClose }) {
  const { lang } = useLanguage();
  const T = UI_TEXT[lang] || UI_TEXT["English"];
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | fetching | got | denied
  const [locationData, setLocationData] = useState(null);

  const getLocation = () => {
    setLocationStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationData({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setLocationStatus("got");
      },
      () => setLocationStatus("denied")
    );
  };

  const confirmBooking = async () => {
    setLoading(true);
    const locationMsg = locationData
      ? `📍 LIVE LOCATION: https://maps.google.com/?q=${locationData.lat},${locationData.lng} (Accuracy: ~${locationData.accuracy}m)`
      : `📞 Contact: ${patient.mobile_number}`;

    await base44.entities.Alert.create({
      patient_id: patient.id,
      hospital_id: patient.hospital_id,
      patient_name: patient.name,
      doctor_email: patient.doctor_email,
      alert_type: "Emergency",
      severity: "Critical",
      message: `🚑 AMBULANCE REQUEST: ${patient.name} needs emergency help. Surgery: ${patient.surgery_type}. ${locationMsg}`,
      is_resolved: false
    });
    setSent(true);
    setLoading(false);
  };

  const locationLabel = {
    idle: lang === "Telugu" ? "📍 నా స్థానాన్ని పంచుకో" : lang === "Hindi" ? "📍 लाइव लोकेशन शेयर करें" : "📍 Share My Live Location",
    fetching: lang === "Telugu" ? "స్థానం పొందుతోంది..." : lang === "Hindi" ? "लोकेशन प्राप्त हो रही है..." : "Getting location...",
    got: lang === "Telugu" ? `✅ స్థానం పొందబడింది (${locationData?.lat}, ${locationData?.lng})` : lang === "Hindi" ? `✅ लोकेशन मिली (${locationData?.lat}, ${locationData?.lng})` : `✅ Location captured (${locationData?.lat}, ${locationData?.lng})`,
    denied: lang === "Telugu" ? "❌ స్థానం యాక్సెస్ నిరాకరించబడింది" : lang === "Hindi" ? "❌ लोकेशन अनुमति नहीं मिली" : "❌ Location access denied"
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" style={{ animation: "scaleIn 0.25s ease forwards" }}>
        <style>{`@keyframes scaleIn { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }`}</style>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl">🚑</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{T.bookAmbulance}</h3>
              <p className="text-xs text-slate-400">{lang === "Telugu" ? "அவசர సహాయం" : lang === "Hindi" ? "आपातकालीन सहायता" : "Emergency Help"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3" style={{ animation: "scaleIn 0.3s ease" }}>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">{T.ambulanceSent}</p>
            {locationData && (
              <a href={`https://maps.google.com/?q=${locationData.lat},${locationData.lng}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium mt-1">
                <MapPin className="w-3 h-3" />
                {lang === "Telugu" ? "మ్యాప్‌లో చూడండి" : lang === "Hindi" ? "मानचित्र पर देखें" : "View on Map"}
              </a>
            )}
            <button onClick={onClose} className="mt-4 block mx-auto text-slate-400 text-xs">Close</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{T.ambulanceConfirmMsg}</p>

            {/* Live Location Card */}
            <div className={`rounded-2xl border p-3 mb-4 ${locationStatus === "got" ? "border-green-200 bg-green-50" : locationStatus === "denied" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${locationStatus === "got" ? "bg-green-100" : locationStatus === "denied" ? "bg-red-100" : "bg-blue-100"}`}>
                  {locationStatus === "fetching"
                    ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    : locationStatus === "got"
                    ? <Navigation className="w-4 h-4 text-green-600" />
                    : <MapPin className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-700 mb-0.5">
                    {lang === "Telugu" ? "లైవ్ లొకేషన్" : lang === "Hindi" ? "लाइव लोकेशन" : "Live Location"}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {locationStatus === "got"
                      ? `${locationData.lat}, ${locationData.lng}`
                      : locationStatus === "denied"
                      ? (lang === "Telugu" ? "స్థానం అనుమతి నిరాకరించబడింది" : lang === "Hindi" ? "अनुमति नहीं मिली" : "Permission denied")
                      : (lang === "Telugu" ? "హాస్పిటల్ మీ ఖచ్చితమైన స్థానాన్ని తెలుసుకుంటుంది" : lang === "Hindi" ? "अस्पताल आपकी सटीक लोकेशन जानेगा" : "Hospital will know your exact location")}
                  </p>
                </div>
                {locationStatus === "idle" && (
                  <button onClick={getLocation} className="text-xs bg-blue-500 text-white px-2.5 py-1.5 rounded-xl font-semibold flex-shrink-0">
                    {lang === "Telugu" ? "పంచుకో" : lang === "Hindi" ? "शेयर" : "Share"}
                  </button>
                )}
                {locationStatus === "denied" && (
                  <button onClick={getLocation} className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl font-semibold flex-shrink-0">
                    {lang === "Telugu" ? "మళ్ళీ ప్రయత్నించు" : lang === "Hindi" ? "पुनः प्रयास" : "Retry"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-2xl text-sm hover:bg-slate-50 transition-colors">
                {T.ambulanceCancel}
              </button>
              <button onClick={confirmBooking} disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-md hover:opacity-90 transition-opacity">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{T.ambulanceSending}</> : `🚑 ${T.ambulanceConfirm}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
