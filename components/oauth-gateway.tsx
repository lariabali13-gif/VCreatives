"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, X, User, ArrowRight, CornerDownRight } from "lucide-react";

interface OAuthGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  provider: "google" | "github";
  onSelectUser: (user: {
    fullName: string;
    username: string;
    email: string;
    authMethod: string;
  }) => void;
}

export default function OAuthGateway({ isOpen, onClose, provider, onSelectUser }: OAuthGatewayProps) {
  const isGoogle = provider === "google";
  
  // Get active configurations to display in pop-up
  const clientId = typeof window !== "undefined" 
    ? (localStorage.getItem(isGoogle ? "vC_google_client_id" : "vC_github_client_id") || "NOT_CONFIGURED_MOCK_ACTIVE") 
    : "LOADING...";

  const clientsList = [
    {
      fullName: "Client One (Arsalan Khan)",
      username: "client_one",
      email: "client1@example.com",
      avatarBg: "from-teal-400 to-indigo-500",
      letter: "C1"
    },
    {
      fullName: "Client Two (Bilal Ahmed)",
      username: "client_two",
      email: "client2@example.com",
      avatarBg: "from-amber-400 to-rose-500",
      letter: "C2"
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" id="oauth-gateway-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0b0f19] border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl"
          id="oauth-gateway-box"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg border border-slate-900 text-slate-500 hover:text-white transition-colors cursor-pointer"
            id="close-oauth-button"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Secure Badge */}
          <div className="flex justify-center mb-5">
            <div className={`p-3 rounded-2xl flex items-center justify-center ${
              isGoogle ? "bg-teal-500/10 text-teal-400 border border-teal-500/10" : "bg-indigo-500/10 text-indigo-450 border border-indigo-500/10"
            }`}>
              {isGoogle ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.28.614 4.54 1.73l2.42-2.42C17.14 1.445 14.82 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.96 0 9.92-4.18 9.92-10.02 0-.68-.06-1.34-.18-1.97H12.24z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5 mb-6">
            <h4 className="font-display font-medium text-white text-base">
              Secure {isGoogle ? "Google Sign-In Gateway" : "GitHub OAuth Server"}
            </h4>
            <p className="text-slate-500 text-xs px-2">
              Chahiye gaye credential client ID ke zariye safe validation dynamic simulation activate kiye ja rahe hain.
            </p>
          </div>

          {/* Config Detail Box */}
          <div className="bg-[#050811] rounded-2xl border border-slate-900 px-4 py-3 space-y-1.5 mb-6 text-[11px] font-mono">
            <div className="flex justify-between items-center text-slate-500">
              <span>Client Application</span>
              <span className="text-white font-sans">vCreative.</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Authorized ID
              </span>
              <span className="text-teal-400 truncate max-w-[200px]" title={clientId}>{clientId}</span>
            </div>
          </div>

          {/* Selector List */}
          <div className="space-y-3 mb-6" id="client-selectors-list">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block pl-1">Authenticate as user:</span>
            
            {clientsList.map((client, idx) => (
              <button
                key={idx}
                onClick={() => onSelectUser({
                  fullName: client.fullName,
                  username: client.username,
                  email: client.email,
                  authMethod: isGoogle ? "Google SSO" : "GitHub OAuth"
                })}
                className="w-full text-left p-3.5 rounded-xl border border-slate-900 bg-[#0d1323] hover:bg-[#131b31] hover:border-slate-800 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${client.avatarBg} p-[1px]`}>
                    <div className="w-full h-full bg-[#0d1323] rounded-[7px] flex items-center justify-center font-mono font-black text-[10px] text-white">
                      {client.letter}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{client.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{client.email}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <div className="text-center" id="security-assurance">
            <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
              Direct Mongo Atlas sync schema active.
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
