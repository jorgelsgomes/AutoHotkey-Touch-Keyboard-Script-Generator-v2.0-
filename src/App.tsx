import React, { useState } from 'react';
import { ScriptConfig } from './types';
import Configurator from './components/Configurator';
import Simulator from './components/Simulator';
import CodePanel from './components/CodePanel';
import Guide from './components/Guide';
import { 
  Keyboard, 
  Monitor, 
  FileCode, 
  HelpCircle, 
  Code2, 
  Heart,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // Initial state with sensible default configurations
  const [config, setConfig] = useState<ScriptConfig>({
    delayMs: 300,
    autoClose: true,
    onlyInTabletMode: false,
    useAdvancedUIA: true,
    debugMode: true,
    soundOnTrigger: false,
    tabtipPath: 'C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe',
    whitelist: [],
    blacklist: ['cmd.exe', 'powershell.exe', 'bash.exe', 'wsl.exe', 'taskmgr.exe']
  });

  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');
  const [realTestInput, setRealTestInput] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Decorative Top Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"></div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-8 flex-1">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-950/40 relative">
              <Keyboard className="w-8 h-8" id="header-kb-icon" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-100" id="header-title">
                  AutoHotkey Touch Keyboard Script Generator
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 font-mono">
                  v2.0 COMPATIBLE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Configure e gere scripts personalizados em <strong className="text-slate-300">AutoHotkey v2</strong> com detecção inteligente de foco (UIA/MSAA) para abrir e fechar o teclado virtual do Windows automaticamente ao clicar em campos editáveis.
              </p>
            </div>
          </div>

          {/* Quick Help Link */}
          <div className="flex items-center gap-3">
            <a 
              href="https://www.autohotkey.com/docs/v2/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition-all shadow-sm"
              id="btn-ahk-docs"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>Doc AHK v2</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Configurator Panel */}
          <section className="lg:col-span-5 xl:col-span-4 h-[640px] lg:h-[750px] flex flex-col">
            <Configurator config={config} onChange={setConfig} />
          </section>

          {/* Right Column: Multi-tab Workspace (Simulator, Code, Guide) */}
          <main className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            
            {/* Visual Workspace Nav tabs */}
            <div className="flex border-b border-slate-800 p-1 bg-slate-900/50 rounded-2xl border">
              
              {/* Tab 1: Simulator */}
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all relative ${
                  activeTab === 'simulator' 
                    ? 'text-indigo-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-simulator"
              >
                {activeTab === 'simulator' && (
                  <motion.div 
                    layoutId="active-tab-indicator" 
                    className="absolute inset-0 bg-slate-950 border border-slate-800 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Simulador de Foco</span>
                </span>
              </button>

              {/* Tab 2: Code Panel */}
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all relative ${
                  activeTab === 'code' 
                    ? 'text-indigo-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-code"
              >
                {activeTab === 'code' && (
                  <motion.div 
                    layoutId="active-tab-indicator" 
                    className="absolute inset-0 bg-slate-950 border border-slate-800 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  <span>Código AutoHotkey</span>
                </span>
              </button>

              {/* Tab 3: Guide */}
              <button
                onClick={() => setActiveTab('guide')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all relative ${
                  activeTab === 'guide' 
                    ? 'text-indigo-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-guide"
              >
                {activeTab === 'guide' && (
                  <motion.div 
                    layoutId="active-tab-indicator" 
                    className="absolute inset-0 bg-slate-950 border border-slate-800 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Instruções &amp; Guia</span>
                </span>
              </button>

            </div>

            {/* Active Workspace View */}
            <div className="bg-slate-900/10 rounded-2xl min-h-[420px]">
              {activeTab === 'simulator' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Simulator config={config} />
                </motion.div>
              )}

              {activeTab === 'code' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CodePanel config={config} />
                </motion.div>
              )}

              {activeTab === 'guide' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Guide />
                </motion.div>
              )}
            </div>

            {/* Real Hardware Touch Input Sandbox */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950/20 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div className="flex gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 self-start mt-0.5">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Sandbox de Toque Real (Hardware)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5 max-w-lg">
                    Se você já instalou o script em seu tablet Windows, pode testar o acionamento <strong className="text-slate-300">focando no input ao lado</strong>. Seu teclado virtual nativo deve subir instantaneamente!
                  </p>
                </div>
              </div>
              <div className="w-full md:w-auto md:min-w-[200px] flex items-center gap-2">
                <input
                  type="text"
                  value={realTestInput}
                  onChange={(e) => setRealTestInput(e.target.value)}
                  placeholder="Toque aqui para testar o script real..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-200 placeholder-slate-600 font-medium"
                  id="hardware-test-input"
                />
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-sans flex flex-col sm:flex-row items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-1">
          <span>Feito para a comunidade de telas de toque no Windows</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
        </div>
        <div className="flex gap-4">
          <span className="text-[11px]">AutoHotkey v2.0+ Exigido</span>
          <span className="text-[11px] border-l border-slate-800 pl-4">UIA Native COM Engine</span>
        </div>
      </footer>
    </div>
  );
}
