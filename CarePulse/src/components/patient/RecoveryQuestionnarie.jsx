import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Loader2, ThumbsUp } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const labels = {
  English: {
    title: "Daily Recovery Check-in",
    pain: "Pain Level (0 = No pain, 10 = Severe)",
    mobility: "Mobility Level",
    meds: "Did you take your medication today?",
    notes: "Additional notes for your doctor",
    submit: "Submit Daily Check-in",
    submitting: "Analyzing...",
    yes: "Yes", no: "No",
    mobility_options: ["Normal", "Limited", "Bedridden"],
    success: "Check-in submitted! Stay strong in your recovery."
  },
  Telugu: {
    title: "రోజువారీ రికవరీ చెక్-ఇన్",
    pain: "నొప్పి స్థాయి (0 = నొప్పి లేదు, 10 = తీవ్రమైన నొప్పి)",
    mobility: "చలనశీలత స్థాయి",
    meds: "మీరు నేడు మందులు తీసుకున్నారా?",
    notes: "డాక్టర్ కు అదనపు గమనికలు",
    submit: "చెక్-ఇన్ సమర్పించండి",
    submitting: "విశ్లేషిస్తోంది...",
    yes: "అవును", no: "కాదు",
    mobility_options: ["సాధారణ", "పరిమితం", "పడకపై"],
    success: "చెక్-ఇన్ సమర్పించబడింది! మీ రికవరీలో ముందుకు సాగండి."
  },
  Hindi: {
    title: "दैनिक रिकवरी जाँच",
    pain: "दर्द का स्तर (0 = कोई दर्द नहीं, 10 = गंभीर)",
    mobility: "गतिशीलता का स्तर",
    meds: "क्या आपने आज दवाई ली?",
    notes: "डॉक्टर के लिए अतिरिक्त नोट्स",
    submit: "चेक-इन सबमिट करें",
    submitting: "विश्लेषण हो रहा है...",
    yes: "हाँ", no: "नहीं",
    mobility_options: ["सामान्य", "सीमित", "बिस्तर पर"],
    success: "चेक-इन सबमिट हो गया! अपनी रिकवरी में मजबूत रहें।"
  }
};

// Surgery-specific boolean questions with multilingual labels
const SURGERY_QUESTIONS = {
  cardiac: {
    English: [
      { key: "breathing_issues", label: "Are you experiencing shortness of breath or chest tightness?" },
      { key: "swelling", label: "Any swelling in legs, ankles or feet?" },
      { key: "bleeding", label: "Any bleeding or discharge from the incision site?" },
      { key: "infection_signs", label: "Any redness, warmth or pus at the wound site?" },
      { key: "abnormal_discomfort", label: "Do you feel palpitations or irregular heartbeat?" },
      { key: "fever", label: "Do you have fever (above 100°F / 38°C)?" },
    ],
    Telugu: [
      { key: "breathing_issues", label: "శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా ఛాతీ బిగుతు అనుభవిస్తున్నారా?" },
      { key: "swelling", label: "కాళ్ళు, చీలమండలు లేదా పాదాలలో వాపు ఉందా?" },
      { key: "bleeding", label: "కోత స్థానంలో రక్తస్రావం లేదా స్రావం ఉందా?" },
      { key: "infection_signs", label: "గాయం స్థలంలో ఎరుపు, వేడి లేదా పూయడం ఉందా?" },
      { key: "abnormal_discomfort", label: "గుండె దడ లేదా అసమాన గుండె చప్పుడు అనుభవిస్తున్నారా?" },
      { key: "fever", label: "జ్వరం ఉందా (100°F / 38°C పైన)?" },
    ],
    Hindi: [
      { key: "breathing_issues", label: "क्या सांस लेने में तकलीफ या सीने में जकड़न है?" },
      { key: "swelling", label: "पैरों, टखनों या पैरों में सूजन है?" },
      { key: "bleeding", label: "चीरे की जगह से कोई खून या स्राव है?" },
      { key: "infection_signs", label: "घाव की जगह पर लालिमा, गर्मी या मवाद है?" },
      { key: "abnormal_discomfort", label: "क्या आप धड़कन या अनियमित दिल की धड़कन महसूस कर रहे हैं?" },
      { key: "fever", label: "क्या बुखार है (100°F / 38°C से ऊपर)?" },
    ]
  },
  orthopedic: {
    English: [
      { key: "swelling", label: "Is there swelling or stiffness around the surgery area?" },
      { key: "bleeding", label: "Any bleeding or unusual discharge from the wound?" },
      { key: "infection_signs", label: "Any redness, warmth or pus near the incision?" },
      { key: "abnormal_discomfort", label: "Do you feel increased pain or joint instability?" },
 
