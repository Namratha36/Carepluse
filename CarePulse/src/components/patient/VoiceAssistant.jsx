import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, MicOff, Volume2, Loader2, Bot, StopCircle } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const LANGUAGES = [
  { code: "en-US", label: "English", flag: "🇬🇧", speechLang: "en-US", aiInstruction: "Respond in English." },
  { code: "te-IN", label: "Telugu", flag: "🇮🇳", speechLang: "te-IN", aiInstruction: "Respond in Telugu language (తెలుగు). Use simple Telugu words." },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳", speechLang: "hi-IN", aiInstruction: "Respond in Hindi language (हिंदी). Use simple Hindi words." },
];

const LANG_TO_CODE = { English: "en-US", Telugu: "te-IN", Hindi: "hi-IN" };

const QUICK_PROMPTS = {
  "en-US": ["How should I clean my wound?", "Is my pain level normal?", "What food should I eat?", "When can I walk normally?"],
  "te-IN": ["నా గాయాన్ని ఎలా శుభ్రం చేయాలి?", "నా నొప్పి సాధారణమా?", "నేను ఏమి తినాలి?", "నేను ఎప్పుడు నడవగలను?"],
  "hi-IN": ["मेरे घाव को कैसे साफ करें?", "क्या मेरा दर्द सामान्य है?", "मुझे क्या खाना चाहिए?", "मैं कब सामान्य रूप से चल सकता हूँ?"],
};

export default function VoiceAssistant({ patient }) {
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage();
  const [lang, setLang] = useState(() => LANGUAGES.find(l => l.code === LANG_TO_CODE[globalLang]) || LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      synthRef.current.cancel();
    };
  }, []);

  const startListening = () => {
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang.speechLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      handleAIResponse(text);
    };
    recognition.onerror = (e) => {
      setIsListening(false);
      setError("Could not hear you. Please try again.");
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const speak = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang.speechLang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };
