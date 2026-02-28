import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Building2, User, Shield, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-12 pb-6 px-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Care Pulse</h1>
            <p className="text-sm text-blue-600 font-medium">Smart Recovery Monitor</p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md w-full text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            AI-Powered Post-Surgery Care
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
            Your Recovery,<br />
            <span className="text-blue-600">Monitored Smartly</span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Connecting hospitals and patients for intelligent post-surgery monitoring, early complication detection, and continuous care.
          </p>
        </div>

        {/* Login Cards */}
        <div className="w-full max-w-md space-y-4">
          <Link to={createPageUrl("HospitalLogin")}>
            <div className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">Hospital Login</h3>
                  <p className="text-slate-500 text-sm">Doctor & Admin Dashboard</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {["Patient Monitoring", "Alerts", "Analytics"].map(tag => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("PatientLogin")}>
            <div className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-green-200 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">Patient Login</h3>
                  <p className="text-slate-500 text-sm">Recovery & Health Tracking</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {["Check-ins", "AI Assistant", "Reminders"].map(tag => (
                  <span key={tag} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex items-center gap-6 text-slate-400">
          {[
            { icon: Shield, label: "Secure" },
            { icon: Heart, label: "Trusted" },
            { icon: Activity, label: "Real-time" }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
