"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Share2, 
  ChevronRight, 
  ChevronDown, 
  Globe, 
  LogOut, 
  Code, 
  Play, 
  Database, 
  Terminal as TerminalIcon, 
  Files, 
  PlayCircle,
  FileCode,
  FolderOpen,
  ArrowLeft,
  Sparkles,
  GitBranch,
  Github,
  Upload,
  Image as ImageIcon,
  Mic,
  Activity,
  Trash2,
  ExternalLink,
  BookOpen,
  X,
  Laptop,
  Moon,
  Sun
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
}

interface FileDescriptor {
  path: string;
  content: string;
}

const defaultFiles: FileDescriptor[] = [
  {
    path: "app/page.tsx",
    content: `"use client";\n\nimport React from "react";\nimport { Sparkles } from "lucide-react";\n\nexport default function Home() {\n  return (\n    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center">\n      <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">vCreative Live</h1>\n      <p className="text-slate-400 mt-2">Ready to edit live code parameters</p>\n    </main>\n  );\n}`
  },
  {
    path: "styles/globals.css",
    content: `@import "tailwindcss";\n@import "tw-animate-css";`
  },
  {
    path: "schema/user-profile.json",
    content: "{\n  \"currentUser\": \"Lareb Ali\",\n  \"role\": \"Lead Engineer\",\n  \"containerPort\": 3000\n}"
  }
];

export default function EditorPage() {
  const router = useRouter();

  // Auth and general state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasMongo, setHasMongo] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "white">("dark");
  const [greetingLang, setGreetingLang] = useState<"urdu" | "english">("english");
  
  // Collapse structure - collapsible vertical menu on the right side, collapsed by default
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  
  // Active actions inputs
  const [ideaPrompt, setIdeaPrompt] = useState<string>("");
  const [activeFilePath, setActiveFilePath] = useState<string>("app/page.tsx");
  const [editorContent, setEditorContent] = useState<string>("");
  const [localFiles, setLocalFiles] = useState<FileDescriptor[]>(defaultFiles);
  
  // Terminal logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "vCreative Dynamic Sandbox Compiler initialized.",
    "Database Sync state mapped correctly.",
    "Status: READY."
  ]);
  const [cliInput, setCliInput] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [voiceRecording, setVoiceRecording] = useState<boolean>(false);
  
  // Modals inside editor
  const [activeModal, setActiveModal] = useState<
    null | "import-github" | "upload-computer" | "upload-screenshot" | "build-success"
  >(null);

  // Inputs for modal operations
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [computerFileName, setComputerFileName] = useState<string>("");
  const [screenshotLabel, setScreenshotLabel] = useState<string>("whiteboard-schema.png");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      const savedMongo = localStorage.getItem("vC_mongo_uri");
      const savedTheme = localStorage.getItem("vC_theme") as "dark" | "light" | "white" | null;
      
      let parsedUser: UserProfile | null = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("currentUser");
        }
      } else {
        // Redirect if not signed in
        router.push("/login");
      }

      const initialPrompt = localStorage.getItem("vC_initial_prompt");
      if (initialPrompt) {
        localStorage.removeItem("vC_initial_prompt");
      }

      const init = defaultFiles.find(f => f.path === "app/page.tsx");
      const initContent = init ? init.content : "";

      setTimeout(() => {
        if (savedTheme) {
          setCurrentTheme(savedTheme);
        }
        setHasMongo(!!savedMongo || !!process.env.NEXT_PUBLIC_MONGODB_URI);
        setCurrentUser(parsedUser);
        if (initialPrompt) {
          setIdeaPrompt(initialPrompt);
        }
        if (initContent) {
          setEditorContent(initContent);
        }
      }, 0);
    }
  }, [router]);

  const selectFile = (path: string) => {
    setActiveFilePath(path);
    const target = localFiles.find(f => f.path === path);
    if (target) {
      setEditorContent(target.content);
    }
  };

  const syncFileEdit = () => {
    const updated = localFiles.map(f => {
      if (f.path === activeFilePath) {
        return { ...f, content: editorContent };
      }
      return f;
    });
    setLocalFiles(updated);
    setTerminalLogs(prev => [...prev, `✓ Written changes safely to ${activeFilePath}.`]);
  };

  const triggerCompileFlow = (customPrompt?: string) => {
    setIsCompiling(true);
    const textDesc = customPrompt || ideaPrompt || "Standard Workspace configuration";
    
    setTerminalLogs(prev => [
      ...prev,
      `> npm run build --target="${textDesc}"`,
      "Verifying client compilation parameters...",
      "Assembling component elements... injecting responsive presets..."
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        "✓ Static layouts bundled successfully in /dist/.",
        "✓ Server status: ONLINE."
      ]);
      setIsCompiling(false);
      setIdeaPrompt("");
      setActiveModal("build-success");
    }, 1300);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      const event = new Event("credentialsUpdated");
      window.dispatchEvent(event);
      router.push("/");
    }
  };

  const executeCliCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    let res = "";

    if (cmd === "help") {
      res = "Available: 'help', 'npm run build', 'clear', 'git push', 'database status'.";
    } else if (cmd === "clear") {
      setTerminalLogs([]);
      setCliInput("");
      return;
    } else if (cmd === "database status") {
      res = hasMongo ? "MongoDB database active and synced." : "Local indexing cache running.";
    } else if (cmd === "npm run build" || cmd === "build") {
      triggerCompileFlow();
      setCliInput("");
      return;
    } else if (cmd === "git push") {
      res = "Branch pushed to origin/main successfully! Live host refreshed.";
    } else {
      res = `Command '${cmd}' not found. Type 'help' for instructions.`;
    }

    setTerminalLogs(prev => [...prev, `> ${cliInput}`, res]);
    setCliInput("");
  };

  const handleGitHubImport = () => {
    if (!githubUrl) return;
    setTerminalLogs(prev => [
      ...prev,
      `> git checkout branch origin/main from ${githubUrl}`,
      "✓ Synchronized 3 files dynamically."
    ]);
    
    const gitFile: FileDescriptor = {
      path: `imported/github/${activeFilePath.split("/").pop()}`,
      content: `// Dynamic import from ${githubUrl}\nexport default function ImportedComponent() {\n  return <div>Component synced!</div>;\n}`
    };
    
    setLocalFiles([gitFile, ...localFiles]);
    setActiveFilePath(gitFile.path);
    setEditorContent(gitFile.content);
    setGithubUrl("");
    setActiveModal(null);
  };

  const handleComputerUpload = () => {
    if (!computerFileName) return;
    setTerminalLogs(prev => [
      ...prev,
      `> upload bundle asset: ${computerFileName}`,
      "✓ Assets parsed successfully."
    ]);
    
    const newFile: FileDescriptor = {
      path: `uploaded/${computerFileName}`,
      content: `// Uploaded file assets\n// Filename: ${computerFileName}\nexport const rawBundle = { theme: "vCreative-dark" };`
    };

    setLocalFiles([newFile, ...localFiles]);
    setActiveFilePath(newFile.path);
    setEditorContent(newFile.content);
    setComputerFileName("");
    setActiveModal(null);
  };

  const handleScreenshotUpload = () => {
    setTerminalLogs(prev => [
      ...prev,
      `> processing vision screenshot: ${screenshotLabel}`,
      "✓ Layout boundaries resolved successfully."
    ]);
    
    const parsedFile: FileDescriptor = {
      path: "compiled/screenshot-layout.tsx",
      content: `// Assembled using Visual Layout Recognition\n// Source: ${screenshotLabel}\nimport React from 'react';\n\nexport default function Board() {\n  return <div className="layout-grid">Grid items compiled from screenshots</div>;\n}`
    };

    setLocalFiles([parsedFile, ...localFiles]);
    setActiveFilePath(parsedFile.path);
    setEditorContent(parsedFile.content);
    setActiveModal(null);
  };

  const toggleVoiceRecording = () => {
    if (voiceRecording) {
      setVoiceRecording(false);
      setIdeaPrompt("High fidelity instrument deck containing sine-wave controls and voice feedback analytics module.");
      setTerminalLogs(prev => [...prev, "✓ Voice commands transcript generated successfully."]);
    } else {
      setVoiceRecording(true);
    }
  };

  // Theme support
  const themeClasses = {
    dark: {
      body: "bg-[#050811] text-slate-100",
      toolbar: "bg-[#070a14] border-white/[0.03]",
      editorPanel: "bg-[#050811] text-slate-300",
      terminal: "bg-[#03050a] text-emerald-400",
      sidepanel: "bg-[#070a14] border-slate-900"
    },
    light: {
      body: "bg-[#f8fafc] text-slate-800",
      toolbar: "bg-slate-100 border-slate-200",
      editorPanel: "bg-white text-slate-800",
      terminal: "bg-slate-900 text-teal-350",
      sidepanel: "bg-slate-50 border-slate-205"
    },
    white: {
      body: "bg-white text-slate-900",
      toolbar: "bg-white border-slate-300",
      editorPanel: "bg-white text-slate-950",
      terminal: "bg-slate-950 text-white",
      sidepanel: "bg-slate-50 border-slate-350"
    }
  };

  const tc = themeClasses[currentTheme];

  return (
    <div className={`min-h-full h-screen flex flex-col relative transition-colors duration-200 ${tc.body}`} id="editor-page-root">
      
      {/* ========================================================
         MODALS POP-UPS
         ======================================================== */}
      <AnimatePresence>
        
        {/* GitHub Dialog */}
        {activeModal === "import-github" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0a0f1d] border border-teal-500/20 max-w-sm w-full rounded-2xl p-6 relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Import from GitHub</h4>
              <p className="text-[11px] text-slate-500 mb-4">Provide repository URL address metadata.</p>
              <input
                type="text"
                placeholder="e.g. https://github.com/user/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#050811] border border-slate-900 p-2 rounded-lg text-xs font-mono text-white mb-4"
              />
              <button onClick={handleGitHubImport} className="w-full bg-teal-400 text-slate-950 text-xs font-bold py-2 rounded-lg">
                Link GitHub & Sync
              </button>
            </motion.div>
          </div>
        )}

        {/* Upload from computer dialog */}
        {activeModal === "upload-computer" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0a0f1d] border border-indigo-500/20 max-w-sm w-full rounded-2xl p-6 relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Upload File Bundle</h4>
              <input
                type="text"
                placeholder="Asset filename (e.g. template-schema.json)"
                value={computerFileName}
                onChange={(e) => setComputerFileName(e.target.value)}
                className="w-full bg-[#050811] border border-slate-905 p-2 rounded-lg text-xs font-mono text-white mb-4"
              />
              <button onClick={handleComputerUpload} className="w-full bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg">
                Upload & Process Assets
              </button>
            </motion.div>
          </div>
        )}

        {/* Vision screenshot dialog */}
        {activeModal === "upload-screenshot" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0a0f1d] border border-cyan-500/20 max-w-sm w-full rounded-2xl p-6 relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Process Vision Layout Screenshot</h4>
              <input
                type="text"
                value={screenshotLabel}
                placeholder="Whiteboard wireframe labels..."
                onChange={(e) => setScreenshotLabel(e.target.value)}
                className="w-full bg-[#050811] border border-slate-900 p-2 rounded-lg text-xs font-mono text-white mb-4"
              />
              <button onClick={handleScreenshotUpload} className="w-full bg-cyan-400 text-slate-950 text-xs font-bold py-2 rounded-lg">
                Assemble UI Wireframe
              </button>
            </motion.div>
          </div>
        )}

        {/* Compile build success alert */}
        {activeModal === "build-success" && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0a0f1d] border border-teal-500/30 max-w-sm w-full rounded-2xl p-6 text-center space-y-4">
              <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 mx-auto">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white">Compilation Process Accomplished!</h3>
              <p className="text-[11px] text-slate-400">Static assets bundled cleanly into the target directory maps. Build logs updated below.</p>
              <button onClick={() => setActiveModal(null)} className="bg-teal-400 text-slate-950 text-xs font-bold px-6 py-2 rounded-xl">
                Continue Editing
              </button>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* ========================================================
         TOP NAVIGATION HEADER
         ======================================================== */}
      <header className={`sticky top-0 z-40 w-full px-4 py-2.5 border-b flex items-center justify-between transition-colors ${tc.toolbar}`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push("/")}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Console Board</span>
          </button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <div className="flex items-center space-x-2 text-xs">
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-450">Sandbox Editor</span>
            <span className="text-slate-650">/</span>
            <span className="font-mono text-teal-400">{activeFilePath}</span>
          </div>
        </div>

        {/* Sync buttons or details */}
        <div className="flex items-center space-x-3 text-xs">
          {currentUser && (
            <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">
              Core Developer: {currentUser.fullName}
            </span>
          )}
          
          <button 
            onClick={syncFileEdit}
            className="bg-indigo-505 bg-indigo-500 hover:bg-indigo-650 text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            Save File
          </button>
        </div>
      </header>

      {/* ========================================================
         MAIN CONTENT AREA
         ======================================================== */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Left Navigator - File Tree */}
        <div className="w-56 bg-[#070a14] border-r border-[#121824]/60 flex flex-col h-full shrink-0">
          <div className="p-3 border-b border-white/[0.02] flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            <Files className="w-3.5 h-3.5" />
            <span>Workspace Elements</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {localFiles.map(f => (
              <button
                key={f.path}
                onClick={() => selectFile(f.path)}
                className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-mono text-left cursor-pointer transition-all ${
                  activeFilePath === f.path 
                    ? "bg-slate-900 border border-slate-800 text-teal-400"
                    : "text-slate-450 hover:text-white hover:bg-slate-900/30 border border-transparent"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{f.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Editor & Input elements as described! */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Main layout parameters - Textbox tagline compiler */}
          <div className="p-4 bg-[#0a0f1d]/90 border-b border-[#121824]/60 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-slate-950 border border-slate-900 text-slate-450 px-2.5 py-1 rounded">
                Compiler Controls Area
              </span>
              
              {/* Theme Selector for editor */}
              <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-900 text-[9px] font-mono">
                {["dark", "light", "white"].map(t => (
                  <button
                    key={t}
                    onClick={() => setCurrentTheme(t as "dark" | "light" | "white")}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${currentTheme === t ? "bg-teal-400 text-slate-950 font-bold" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Input prompt tagline */}
            <div className="bg-[#050811] border border-slate-900 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block">Describe prompt preset style:</label>
                <input
                  type="text"
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  placeholder="e.g. Synthesizer matrix component with audio controller..."
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Voice Input Controls Microphone inside editor */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`p-2.5 rounded-lg cursor-pointer ${voiceRecording ? "bg-red-500/20 text-red-400" : "bg-slate-900 hover:bg-slate-800 text-slate-400"}`}
                  title="Voice Command"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* "Start build project" button */}
                <button
                  onClick={() => triggerCompileFlow()}
                  disabled={isCompiling}
                  className="bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 text-center shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Build Project</span>
                </button>
              </div>
            </div>

            {/* 3 uploading criteria inside the main content area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* GitHub */}
              <button
                onClick={() => setActiveModal("import-github")}
                className="p-3 bg-[#050811] border border-slate-900/60 hover:border-teal-500/20 rounded-xl text-left cursor-pointer flex items-center justify-between gap-1 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white flex items-center gap-1">
                    <Github className="w-3.5 h-3.5 text-teal-400" />
                    Import from GitHub
                  </p>
                  <p className="text-[9px] text-slate-500">Sync remote repository branches.</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Upload Computer */}
              <button
                onClick={() => setActiveModal("upload-computer")}
                className="p-3 bg-[#050811] border border-slate-900/60 hover:border-indigo-500/20 rounded-xl text-left cursor-pointer flex items-center justify-between gap-1 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    Upload from computer
                  </p>
                  <p className="text-[9px] text-slate-500">Add local client assets.</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Screenshot Vision */}
              <button
                onClick={() => setActiveModal("upload-screenshot")}
                className="p-3 bg-[#050811] border border-slate-900/60 hover:border-cyan-500/20 rounded-xl text-left cursor-pointer flex items-center justify-between gap-1 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Upload screenshot
                  </p>
                  <p className="text-[9px] text-slate-500">Assemble wireframes instantly.</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

            </div>

          </div>

          {/* Interactive Editor Window */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-[#050811] flex leading-relaxed">
            <div className="text-slate-600 select-none text-right pr-4 border-r border-[#1e293b]/30 mr-4 w-8 text-[11px]">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="flex-1 bg-transparent text-slate-300 resize-none font-mono focus:outline-none focus:ring-0 whitespace-pre h-full min-h-[160px]"
              spellCheck={false}
            />
          </div>

          {/* Live Terminal */}
          <div className="h-44 bg-[#03050a] border-t border-slate-900 flex flex-col shrink-0 font-mono text-xs">
            <div className="bg-[#070a14] px-4 py-1.5 flex items-center justify-between border-b border-slate-905">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Terminal core logs output</span>
              <button onClick={() => setTerminalLogs(["Logs reset."])} className="text-[9px] text-slate-600 hover:text-slate-400">
                Clear Output
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 text-emerald-400 bg-black/40 space-y-1">
              {terminalLogs.map((lg, i) => (
                <p key={i} className="leading-snug">{lg}</p>
              ))}
            </div>

            <form onSubmit={executeCliCommand} className="border-t border-slate-950 flex bg-[#03050a]">
              <span className="py-1 px-3 bg-[#03050a] select-none text-teal-400 font-bold">{`vC_compiler>`}</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Type 'help' and press Enter..."
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-200 pl-1 py-1 font-bold"
              />
            </form>
          </div>

        </div>

        {/* Collapsible side navigation bar on the right side, collapsed by default, as requested */}
        <AnimatePresence>
          <motion.aside 
            animate={{ width: isRightSidebarExpanded ? 240 : 64 }}
            className={`h-full border-l flex flex-col justify-between shrink-0 transition-colors ${tc.sidepanel}`}
            id="editor-collapsible-right-sidebar"
          >
            <div className="p-3.5 space-y-4">
              
              {/* Toggle to expand Right Sidebar layout */}
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                {isRightSidebarExpanded && (
                  <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                    Developer presets
                  </span>
                )}
                <button
                  onClick={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer hover:border-slate-705 ml-auto transition-transform duration-200"
                  title={isRightSidebarExpanded ? "Collapse Right Sidebar" : "Expand Right Sidebar"}
                >
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRightSidebarExpanded ? "" : "rotate-180"}`} />
                </button>
              </div>

              {/* Action shortcuts */}
              <div className="space-y-1 pb-4">
                
                {/* Save code state click */}
                <button 
                  onClick={syncFileEdit}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 text-xs font-semibold"
                >
                  <Code className="w-4 h-4 text-indigo-400" />
                  {isRightSidebarExpanded && <span>Commit Actions</span>}
                </button>

                {/* Compile trigger */}
                <button 
                  onClick={() => triggerCompileFlow()}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/15 text-xs font-semibold"
                >
                  <PlayCircle className="w-4 h-4 text-teal-400" />
                  {isRightSidebarExpanded && <span>Bundle Output</span>}
                </button>

              </div>

              {/* Dynamic instruction manual overlay when expanded */}
              {isRightSidebarExpanded && (
                <div className="p-3 bg-[#0d1323] border border-slate-900 rounded-xl space-y-2 text-[10px] text-slate-450 leading-relaxed font-sans">
                  <p className="font-bold text-teal-300">Quick Manual Info</p>
                  <p>1. Type variables or describe layouts into the controls.</p>
                  <p>2. Select files on the left menu directory tree.</p>
                  <p>3. Run Build output to bundle static representations.</p>
                </div>
              )}

            </div>

            {/* Bottom Avatar and personal config with Language toggles */}
            <div className="p-3 border-t border-white/[0.03]">
              <div className="relative">
                
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-full flex items-center space-x-2 p-1.5 rounded-lg bg-slate-900/30 hover:bg-slate-900/70 text-left transition-all"
                >
                  <div className="w-7 h-7 rounded bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-slate-950 uppercase shrink-0">
                    {currentUser?.username ? currentUser.username.substring(0, 2) : "C"}
                  </div>
                  {isRightSidebarExpanded && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{currentUser?.fullName}</p>
                      <p className="text-[9px] text-slate-500 truncate">Lead Developer</p>
                    </div>
                  )}
                </button>

                {/* Profile settings modal */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute bottom-12 right-0 w-60 bg-[#090e1b] border border-slate-900 rounded-2xl p-4 shadow-xl z-50 text-left space-y-3"
                    >
                      <div className="border-b border-white/[0.04] pb-2 text-[11px] text-slate-400">
                        <p className="font-bold text-white font-sans">{currentUser?.fullName}</p>
                        <p className="font-mono text-[9px]">{currentUser?.email}</p>
                      </div>

                      {/* Language Selection preference toggle inside sidebar */}
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-slate-500 uppercase">Language toggle</span>
                        <div className="grid grid-cols-2 bg-slate-955 bg-[#050811] rounded p-0.5 border border-slate-900 text-[10px]">
                          <button 
                            onClick={() => setGreetingLang("urdu")}
                            className={`py-1 rounded text-center font-semibold cursor-pointer ${greetingLang === "urdu" ? "bg-teal-400 text-slate-950" : "text-slate-400"}`}
                          >
                            Urdu
                          </button>
                          <button 
                            onClick={() => setGreetingLang("english")}
                            className={`py-1 rounded text-center font-semibold cursor-pointer ${greetingLang === "english" ? "bg-teal-400 text-slate-950" : "text-slate-400"}`}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900/60 space-y-1">
                        <button 
                          onClick={() => router.push("/")}
                          className="w-full text-left font-sans text-slate-400 hover:text-white text-[11px] py-1"
                        >
                          Workspace Home
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left font-sans text-rose-400 hover:text-rose-300 text-[11px] font-bold py-1"
                        >
                          Sign Out Session
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </motion.aside>
        </AnimatePresence>

      </div>

    </div>
  );
}
