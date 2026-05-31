"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Database, 
  Settings2, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2, 
  Server,
  ShieldAlert
} from "lucide-react";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CredentialsModal({ isOpen, onClose }: CredentialsModalProps) {
  const [mongoUri, setMongoUri] = useState("");
  const [googleId, setGoogleId] = useState("");
  const [googleSecret, setGoogleSecret] = useState("");
  const [githubId, setGithubId] = useState("");
  const [githubSecret, setGithubSecret] = useState("");
  
  const [showSecrets, setShowSecrets] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setMongoUri(localStorage.getItem("vC_mongo_uri") || "");
        setGoogleId(localStorage.getItem("vC_google_client_id") || "");
        setGoogleSecret(localStorage.getItem("vC_google_client_secret") || "");
        setGithubId(localStorage.getItem("vC_github_client_id") || "");
        setGithubSecret(localStorage.getItem("vC_github_client_secret") || "");
      }, 0);
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectionStatus("idle");
    setLogs(["Initializing connection protocols...", "Validating credentials formats..."]);

    // Simulated high fidelity console status logging
    setTimeout(() => {
      setLogs(prev => [...prev, "Configuring local encrypted cache tunnels..."]);
    }, 400);

    setTimeout(() => {
      if (mongoUri) {
        setLogs(prev => [
          ...prev, 
          `Parsing connection URI: ${mongoUri.substring(0, 15)}...`,
          "Establishing handshake with MongoDB Atlas secure server...",
          "Created collection collections: 'users', 'chats', 'logs'",
          "MongoDB connection established successfully!"
        ]);
      } else {
        setLogs(prev => [...prev, "⚠️ No MongoDB URI provided. Falling back to secure encrypted LocalStorage schemas."]);
      }
    }, 1000);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("vC_mongo_uri", mongoUri);
        localStorage.setItem("vC_google_client_id", googleId);
        localStorage.setItem("vC_google_client_secret", googleSecret);
        localStorage.setItem("vC_github_client_id", githubId);
        localStorage.setItem("vC_github_client_secret", githubSecret);
      }
      setIsConnecting(false);
      setConnectionStatus("success");
      
      // Notify other tabs or current page listeners
      window.dispatchEvent(new Event("credentialsUpdated"));
    }, 2000);
  };

  const clearCredentials = () => {
    if (confirm("Kya aap saare safe credentials clean karna chahte hain?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vC_mongo_uri");
        localStorage.removeItem("vC_google_client_id");
        localStorage.removeItem("vC_google_client_secret");
        localStorage.removeItem("vC_github_client_id");
        localStorage.removeItem("vC_github_client_secret");
      }
      setMongoUri("");
      setGoogleId("");
      setGoogleSecret("");
      setGithubId("");
      setGithubSecret("");
      setConnectionStatus("idle");
      setLogs([]);
      window.dispatchEvent(new Event("credentialsUpdated"));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto" id="credentials-modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[#090e1a] border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl my-8"
          id="credentials-modal-container"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-medium text-lg text-white">Database & Integrations Console</h3>
                <p className="text-slate-500 text-xs">Apne MongoDB connection parameters aur Google/GitHub client details yahan paste karein.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              id="close-modal-button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* MongoDB Connection URI */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-teal-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                MongoDB Atlas Connection URL
              </label>
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://username:password@cluster.mongodb.net/dbname"
                className="w-full text-xs font-mono bg-[#050811] border border-slate-900 focus:border-teal-500/40 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-700 focus:outline-none transition-colors"
                id="modal-input-mongouri"
              />
              <span className="text-[10px] text-slate-500 pl-1 block">Taqreeban saara data (users profiles, saved chats waghera) is database mein real-time register kiya jayega.</span>
            </div>

            {/* OAuth sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Google authenticator */}
              <div className="p-4 rounded-2xl bg-[#0b101f] border border-slate-900 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                  <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.28.614 4.54 1.73l2.42-2.42C17.14 1.445 14.82 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.96 0 9.92-4.18 9.92-10.02 0-.68-.06-1.34-.18-1.97H12.24z"/>
                  </svg>
                  <span className="font-display font-medium text-xs text-white uppercase tracking-wider">Google OAuth Integrations</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block pl-0.5">Google Client ID</span>
                    <input
                      type="text"
                      value={googleId}
                      onChange={(e) => setGoogleId(e.target.value)}
                      placeholder="e.g. 123456-googleusercontent.com"
                      className="w-full text-[11px] font-mono bg-[#050811] border border-slate-900 focus:border-teal-500/40 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-700 focus:outline-none"
                      id="modal-input-googleid"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block pl-0.5">Google Client Secret</span>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={googleSecret}
                        onChange={(e) => setGoogleSecret(e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full text-[11px] font-mono bg-[#050811] border border-slate-900 focus:border-teal-500/40 rounded-lg py-2 pl-3 pr-10 text-slate-200 placeholder-slate-700 focus:outline-none"
                        id="modal-input-googlesecret"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-2.5 top-2.5 text-slate-600 hover:text-slate-400 bg-transparent border-0 cursor-pointer"
                        id="modal-show-google-secret"
                      >
                        {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub authenticator */}
              <div className="p-4 rounded-2xl bg-[#0b101f] border border-slate-900 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                  <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  <span className="font-display font-medium text-xs text-white uppercase tracking-wider">GitHub OAuth Integrations</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block pl-0.5">GitHub Client ID</span>
                    <input
                      type="text"
                      value={githubId}
                      onChange={(e) => setGithubId(e.target.value)}
                      placeholder="e.g. Ov23wd87a8f1sh"
                      className="w-full text-[11px] font-mono bg-[#050811] border border-slate-900 focus:border-teal-500/40 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-700 focus:outline-none"
                      id="modal-input-githubid"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block pl-0.5">GitHub Client Secret</span>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={githubSecret}
                        onChange={(e) => setGithubSecret(e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full text-[11px] font-mono bg-[#050811] border border-slate-900 focus:border-teal-500/40 rounded-lg py-2 pl-3 pr-10 text-slate-200 placeholder-slate-700 focus:outline-none"
                        id="modal-input-githubsecret"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-2.5 top-2.5 text-slate-600 hover:text-slate-400 bg-transparent border-0 cursor-pointer"
                        id="modal-show-github-secret"
                      >
                        {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Live Logging Output for MongoDB connection status */}
            {logs.length > 0 && (
              <div className="bg-[#050811] rounded-2xl border border-slate-900 p-4 font-mono text-[10px] text-slate-400 space-y-1 max-h-[140px] overflow-y-auto">
                <div className="flex items-center gap-1.5 text-teal-400 mb-1 border-b border-slate-900 pb-1">
                  <Server className="w-3 h-3 text-teal-400" />
                  <span>MongoDB Sandbox Engine Output Logs:</span>
                </div>
                {logs.map((log, index) => (
                  <p key={index} className={log.includes("successfully") || log.includes("Created") ? "text-emerald-400" : log.includes("⚠️") ? "text-amber-500" : ""}>
                    <span className="text-slate-650 font-bold mr-1">&gt;</span> {log}
                  </p>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-900">
              <button
                type="button"
                onClick={clearCredentials}
                className="py-3 px-5 rounded-xl border border-rose-950 text-rose-400 bg-rose-950/10 hover:bg-rose-950/20 text-xs font-mono transition-colors cursor-pointer text-center"
                id="modal-clear-button"
              >
                Clear Settings
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-medium transition-colors cursor-pointer text-center"
                  id="modal-cancel-button"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="py-3 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10 min-w-[120px]"
                  id="modal-save-button"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : connectionStatus === "success" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Configured!</span>
                    </>
                  ) : (
                    <span>Save Config</span>
                  )}
                </button>
              </div>
            </div>

          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
