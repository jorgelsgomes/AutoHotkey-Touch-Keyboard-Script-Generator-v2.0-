import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScriptConfig } from '../types';
import { 
  Monitor, 
  Terminal, 
  Chrome, 
  FileText, 
  HelpCircle, 
  Check, 
  X, 
  Keyboard, 
  Play, 
  Tablet, 
  Clock, 
  Maximize2, 
  Minimize2,
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SimulatorProps {
  config: ScriptConfig;
}

export default function Simulator({ config }: SimulatorProps) {
  const [activeWindow, setActiveWindow] = useState<'notepad' | 'chrome' | 'cmd' | 'none'>('notepad');
  const [activeField, setActiveField] = useState<'notepad-text' | 'chrome-input' | 'none'>('notepad-text');
  
  const [notepadText, setNotepadText] = useState('Digite algo aqui usando o teclado virtual...');
  const [chromeText, setChromeText] = useState('pesquisa google');
  
  const [simTabletMode, setSimTabletMode] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [currentTime, setCurrentTime] = useState('');
  const [keyboardTimer, setKeyboardTimer] = useState<NodeJS.Timeout | null>(null);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync keyboard visibility based on config changes and active field
  useEffect(() => {
    evaluateFocus(activeWindow, activeField, simTabletMode);
  }, [activeWindow, activeField, simTabletMode, config]);

  // Scroll logs to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const playClickSound = () => {
    if (!config.soundOnTrigger) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High frequency tick
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Browser audio context blocked or unsupported
    }
  };

  const evaluateFocus = (
    win: 'notepad' | 'chrome' | 'cmd' | 'none',
    field: 'notepad-text' | 'chrome-input' | 'none',
    tabletMode: boolean
  ) => {
    // Clear any pending close timers
    if (keyboardTimer) {
      clearTimeout(keyboardTimer);
      setKeyboardTimer(null);
    }

    if (win === 'none') {
      addLog(`Foco perdido de todas as janelas. Área de trabalho focada.`);
      triggerClose();
      return;
    }

    let processName = '';
    let className = '';

    if (win === 'notepad') {
      processName = 'notepad.exe';
      className = field === 'notepad-text' ? 'Edit' : 'NotepadWindowClass';
    } else if (win === 'chrome') {
      processName = 'chrome.exe';
      className = field === 'chrome-input' ? 'Chrome_RenderWidgetHostHWND' : 'Chrome_WidgetWin_1';
    } else if (win === 'cmd') {
      processName = 'cmd.exe';
      className = 'ConsoleWindowClass';
    }

    addLog(`Foco detectado em: ${processName} | Classe: ${className}`);

    // 1. Blacklist check
    const isBlacklisted = config.blacklist.some(b => b.toLowerCase() === processName.toLowerCase());
    if (isBlacklisted) {
      addLog(`Processo na Blacklist: ${processName}. Impedindo teclado.`);
      triggerClose();
      return;
    }

    // 2. Whitelist check
    if (config.whitelist.length > 0) {
      const isWhitelisted = config.whitelist.some(w => w.toLowerCase() === processName.toLowerCase());
      if (!isWhitelisted) {
        addLog(`Processo fora da Whitelist: ${processName}. Impedindo teclado.`);
        triggerClose();
        return;
      }
    }

    // 3. Tablet mode check
    if (config.onlyInTabletMode && !tabletMode) {
      addLog(`Modo Tablet desativado no Windows. Ação ignorada.`);
      triggerClose();
      return;
    }

    // 4. Check editability
    let isEditable = false;
    if (win === 'notepad' && field === 'notepad-text') {
      isEditable = true;
      addLog(`Detectado por Classe de Controle compatível: ${className}`);
    } else if (win === 'chrome' && field === 'chrome-input') {
      if (config.useAdvancedUIA) {
        isEditable = true;
        addLog(`UIA: Identificado como Edit (50004) ou Document (50030)`);
      } else {
        addLog(`UIA: Detecção Avançada desativada. Chrome_RenderWidgetHostHWND ignorado.`);
      }
    }

    if (isEditable) {
      addLog(`>>> Entrada de texto ativa. Solicitando abertura do teclado virtual.`);
      triggerOpen();
    } else {
      addLog(`>>> Controle não editável. Solicitando fechamento.`);
      triggerClose();
    }
  };

  const triggerOpen = () => {
    playClickSound();
    setIsKeyboardVisible(true);
  };

  const triggerClose = () => {
    if (!config.autoClose) {
      addLog(`AutoClose desativado. Teclado permanece aberto.`);
      return;
    }
    
    if (config.delayMs > 0) {
      addLog(`Timer de fechamento agendado para: ${config.delayMs}ms.`);
      const timer = setTimeout(() => {
        setIsKeyboardVisible(false);
        addLog(`Teclado virtual ocultado após delay.`);
      }, config.delayMs);
      setKeyboardTimer(timer);
    } else {
      setIsKeyboardVisible(false);
      addLog(`Teclado virtual ocultado imediatamente.`);
    }
  };

  // Keyboard key press helper
  const handleKeyPress = (key: string) => {
    playClickSound();
    if (key === '⌫') {
      if (activeField === 'notepad-text') {
        setNotepadText(prev => prev.slice(0, -1));
      } else if (activeField === 'chrome-input') {
        setChromeText(prev => prev.slice(0, -1));
      }
    } else if (key === 'Space') {
      if (activeField === 'notepad-text') {
        setNotepadText(prev => prev + ' ');
      } else if (activeField === 'chrome-input') {
        setChromeText(prev => prev + ' ');
      }
    } else if (key === 'Enter') {
      addLog(`Tecla Enter pressionada no teclado virtual.`);
      // Unfocus field to simulate submission
      setActiveField('none');
    } else if (key === 'Close') {
      setIsKeyboardVisible(false);
      addLog(`Teclado fechado manualmente pelo usuário.`);
    } else {
      if (activeField === 'notepad-text') {
        setNotepadText(prev => prev + key);
      } else if (activeField === 'chrome-input') {
        setChromeText(prev => prev + key);
      }
    }
  };

  const handleFocusWindow = (win: 'notepad' | 'chrome' | 'cmd' | 'none', field: 'notepad-text' | 'chrome-input' | 'none') => {
    setActiveWindow(win);
    setActiveField(field);
  };

  return (
    <div className="flex flex-col gap-4 w-full" id="simulator-container">
      {/* Header and Controller bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Simulador de Foco (Windows)</h3>
            <p className="text-xs text-slate-400">Teste o comportamento do seu script gerado em tempo real.</p>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-300">
            <Tablet className={`w-4 h-4 ${simTabletMode ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Simular Modo Tablet:</span>
          </div>
          <button
            onClick={() => {
              setSimTabletMode(!simTabletMode);
              addLog(`Simulador: Estado do Modo Tablet alterado para: ${!simTabletMode ? 'ATIVO' : 'INATIVO'}`);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              simTabletMode 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700'
            }`}
            id="btn-simulate-tablet"
          >
            {simTabletMode ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      {/* Main Desktop Space */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl group/desktop">
        
        {/* Grid Overlay for Modern Aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none"></div>

        {/* Ambient background accent */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Click outside desktop handler */}
        <div className="absolute inset-0 z-0" onClick={() => handleFocusWindow('none', 'none')}></div>

        {/* Desktop Icons / Apps Stage */}
        <div className="relative z-10 flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start content-start pointer-events-none">
          
          {/* WINDOW 1: Notepad (notepad.exe) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleFocusWindow('notepad', 'notepad-text');
            }}
            className={`col-span-1 bg-slate-900 border rounded-xl overflow-hidden shadow-xl transition-all pointer-events-auto cursor-default flex flex-col h-44 ${
              activeWindow === 'notepad' 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.01]' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
            id="win-notepad"
          >
            {/* Notepad Window Header */}
            <div className={`px-3 py-2 flex items-center justify-between text-xs border-b transition-colors ${
              activeWindow === 'notepad' ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-slate-950 border-slate-800/80'
            }`}>
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>bloco_de_notas.txt - Bloco de Notas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
            </div>
            {/* Notepad Menu bar */}
            <div className="px-3 py-1 flex gap-3 text-[10px] text-slate-400 bg-slate-900/50 border-b border-slate-800/30">
              <span>Arquivo</span>
              <span>Editar</span>
              <span>Formatar</span>
              <span>Exibir</span>
            </div>
            {/* Notepad Content TextArea */}
            <textarea
              value={notepadText}
              onChange={(e) => setNotepadText(e.target.value)}
              onFocus={() => handleFocusWindow('notepad', 'notepad-text')}
              className="flex-1 w-full bg-slate-950 p-3 font-mono text-xs text-slate-300 resize-none focus:outline-none placeholder-slate-600 border-0"
              placeholder="Clique aqui para testar..."
              id="notepad-textarea"
            />
          </div>

          {/* WINDOW 2: Chrome Browser (chrome.exe) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleFocusWindow('chrome', 'chrome-input');
            }}
            className={`col-span-1 bg-slate-900 border rounded-xl overflow-hidden shadow-xl transition-all pointer-events-auto cursor-default flex flex-col h-44 ${
              activeWindow === 'chrome' 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.01]' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
            id="win-chrome"
          >
            {/* Chrome Window Header */}
            <div className={`px-3 py-2 flex items-center justify-between text-xs border-b transition-colors ${
              activeWindow === 'chrome' ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-slate-950 border-slate-800/80'
            }`}>
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <Chrome className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Chrome - Pesquisa</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
            </div>
            {/* Browser Address Bar Area */}
            <div className="px-3 py-1.5 flex items-center gap-2 bg-slate-900 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-500">
                <div className="w-3 h-3 rounded-full border border-slate-700 flex items-center justify-center text-[8px]">←</div>
                <div className="w-3 h-3 rounded-full border border-slate-700 flex items-center justify-center text-[8px]">→</div>
              </div>
              <div className="flex-1 flex items-center gap-1 bg-slate-950 rounded-md border border-slate-800 px-2.5 py-0.5 text-[10px] text-slate-400">
                <span className="text-emerald-500">🔒</span>
                <span className="text-slate-500">https://</span>
                <span>google.com.br</span>
              </div>
            </div>
            {/* Browser Content */}
            <div className="flex-1 bg-slate-950 p-4 flex flex-col items-center justify-center gap-3">
              <div className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-1">
                <span className="text-blue-400">G</span>
                <span className="text-rose-400">o</span>
                <span className="text-amber-400">o</span>
                <span className="text-blue-400">g</span>
                <span className="text-emerald-400">l</span>
                <span className="text-rose-400">e</span>
              </div>
              <div className="w-full max-w-[200px] flex items-center gap-1 bg-slate-900 rounded-full border border-slate-800 px-3 py-1 text-xs">
                <input
                  type="text"
                  value={chromeText}
                  onChange={(e) => setChromeText(e.target.value)}
                  onFocus={() => handleFocusWindow('chrome', 'chrome-input')}
                  className="bg-transparent flex-1 focus:outline-none text-slate-200 placeholder-slate-600 text-center"
                  placeholder="Pesquisar..."
                  id="chrome-search-input"
                />
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); addLog('Chrome: Clique no botão Pesquisa Google (não editável).'); handleFocusWindow('chrome', 'none'); }} 
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 font-medium"
                >
                  Pesquisar
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); addLog('Chrome: Clique no botão Estou com Sorte (não editável).'); handleFocusWindow('chrome', 'none'); }} 
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 font-medium"
                >
                  Sorte
                </button>
              </div>
            </div>
          </div>

          {/* WINDOW 3: Terminal (cmd.exe) -> BLACKLISTED by default */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleFocusWindow('cmd', 'none');
            }}
            className={`col-span-1 bg-black border rounded-xl overflow-hidden shadow-xl transition-all pointer-events-auto cursor-default flex flex-col h-44 ${
              activeWindow === 'cmd' 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.01]' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
            id="win-cmd"
          >
            {/* CMD Window Header */}
            <div className={`px-3 py-2 flex items-center justify-between text-xs border-b transition-colors ${
              activeWindow === 'cmd' ? 'bg-slate-900 border-slate-800' : 'bg-slate-950 border-slate-900'
            }`}>
              <div className="flex items-center gap-1.5 font-medium text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Prompt de Comando (cmd.exe)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
              </div>
            </div>
            {/* Terminal Content */}
            <div className="flex-1 p-3 font-mono text-[10px] text-slate-300 flex flex-col gap-1.5 select-none bg-black">
              <span className="text-slate-500">Microsoft Windows [Versão 10.0.22631.3527]</span>
              <span className="text-slate-500">(c) Microsoft Corporation. Todos os direitos reservados.</span>
              <div className="mt-1">
                <span>C:\Users\Admin&gt; </span>
                <span className="border-r-2 border-slate-400 pr-1 animate-pulse">ahk_virtual_kb.ahk</span>
              </div>
              <div className="mt-1.5 p-1 bg-rose-500/10 rounded border border-rose-500/20 text-rose-300 flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Este processo está na Blacklist! O teclado nunca abrirá aqui para evitar interferências.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Floating AHK Logger Console (Simulating AHK Console Window on Desktop) */}
        {config.debugMode && (
          <div className="absolute right-4 bottom-14 w-[320px] max-h-[160px] bg-slate-900/90 border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl z-20 pointer-events-auto flex flex-col backdrop-blur-sm">
            <div className="bg-slate-950 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold font-sans text-emerald-400 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-emerald-400 animate-pulse" />
                Console de Foco - Teclado Virtual
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
                <span className="text-[8px] text-emerald-500/70 font-mono">LIVE</span>
              </div>
            </div>
            <div className="p-2.5 overflow-y-auto font-mono text-[9px] text-emerald-300 flex flex-col gap-1 flex-1 min-h-[100px] max-h-[120px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <span className="text-emerald-500/40 italic">Aguardando alteração de foco...</span>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-tight break-all border-b border-emerald-500/5 pb-1">
                    {log}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        )}

        {/* SIMULATED WINDOWS TASKBAR */}
        <div className="relative z-20 h-10 bg-slate-950/90 border-t border-slate-850 px-4 flex items-center justify-between select-none text-slate-300 text-xs backdrop-blur-md">
          {/* Start and Quick Launches */}
          <div className="flex items-center gap-3">
            {/* Win Icon */}
            <button 
              onClick={() => { addLog('Menu Iniciar aberto (não editável).'); handleFocusWindow('none', 'none'); }}
              className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-[11px] text-indigo-400 font-bold"
              id="taskbar-start"
            >
              ⊞
            </button>
            
            {/* Quick Apps shortcut */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
              <button 
                onClick={() => handleFocusWindow('notepad', 'notepad-text')}
                className={`p-1 w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-slate-800 ${activeWindow === 'notepad' ? 'bg-slate-800/80 border border-indigo-500/30' : ''}`}
                title="Bloco de Notas"
                id="taskbar-notepad"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
              </button>
              <button 
                onClick={() => handleFocusWindow('chrome', 'chrome-input')}
                className={`p-1 w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-slate-800 ${activeWindow === 'chrome' ? 'bg-slate-800/80 border border-indigo-500/30' : ''}`}
                title="Google Chrome"
                id="taskbar-chrome"
              >
                <Chrome className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button 
                onClick={() => handleFocusWindow('cmd', 'none')}
                className={`p-1 w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-slate-800 ${activeWindow === 'cmd' ? 'bg-slate-800/80 border border-indigo-500/30' : ''}`}
                title="Prompt de Comando"
                id="taskbar-cmd"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Active status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-slate-900/60 border border-slate-850 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>AutoHotkey Ativo: </span>
            <span className="text-indigo-300 font-mono font-bold">Monitorando Foco</span>
          </div>

          {/* Taskbar Right area (Systray & Clock) */}
          <div className="flex items-center gap-3">
            {/* Virtual Keyboard launch icon */}
            <button 
              onClick={() => {
                setIsKeyboardVisible(!isKeyboardVisible);
                addLog(`Simulador: Teclado virtual alternado manualmente pelo ícone da barra de tarefas.`);
              }}
              className={`p-1 w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-slate-800 ${isKeyboardVisible ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`}
              title="Teclado Virtual de Toque"
              id="taskbar-keyboard"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Time / System State */}
            <div className="flex flex-col items-end leading-none font-sans border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-200 font-medium">{currentTime || '00:00'}</span>
              <span className="text-[8px] text-slate-500 mt-0.5">14/07/2026</span>
            </div>
          </div>
        </div>

        {/* SIMULATED WINDOWS 11 TOUCH KEYBOARD PANEL */}
        <AnimatePresence>
          {isKeyboardVisible && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="absolute bottom-10 left-0 right-0 h-48 bg-slate-900/95 border-t border-slate-800 z-30 flex flex-col p-1.5 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-auto select-none"
              id="virtual-keyboard-panel"
            >
              {/* Keyboard Top bar / Drag Handle */}
              <div className="flex items-center justify-between px-3 pb-1 text-[10px] text-slate-400 border-b border-slate-800/40">
                <span className="font-semibold text-slate-300 tracking-wide flex items-center gap-1">
                  <Keyboard className="w-3 h-3 text-indigo-400" />
                  Teclado Virtual de Toque (Windows)
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleKeyPress('Close')} 
                    className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    id="btn-close-sim-keyboard"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Keyboard Grid Keys */}
              <div className="flex-1 grid grid-rows-4 gap-1 mt-1.5 p-0.5 font-sans font-medium text-xs">
                {/* Row 1 */}
                <div className="flex gap-1 w-full justify-between">
                  {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '⌫'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700/85 active:bg-indigo-600 active:text-white border border-slate-750 hover:border-slate-650 transition-all flex items-center justify-center text-slate-200 text-[11px] shadow-sm font-semibold`}
                      id={`key-${k === '⌫' ? 'backspace' : k.toLowerCase()}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Row 2 */}
                <div className="flex gap-1 w-full justify-between pl-2">
                  {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700/85 active:bg-indigo-600 active:text-white border border-slate-750 hover:border-slate-650 transition-all flex items-center justify-center text-slate-200 text-[11px] shadow-sm font-semibold"
                      id={`key-${k.toLowerCase()}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Row 3 */}
                <div className="flex gap-1 w-full justify-between pl-4">
                  {['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', 'Enter'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`py-1 rounded border shadow-sm transition-all flex items-center justify-center font-semibold ${
                        k === 'Enter'
                          ? 'flex-[1.5] bg-indigo-600 hover:bg-indigo-500 border-indigo-500/40 text-white'
                          : 'flex-1 bg-slate-800/80 hover:bg-slate-700/85 active:bg-indigo-600 active:text-white border-slate-750 hover:border-slate-650 text-slate-200 text-[11px]'
                      }`}
                      id={`key-${k.toLowerCase()}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Row 4 */}
                <div className="flex gap-1 w-full">
                  <button onClick={() => handleKeyPress('123')} className="flex-[1.5] py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-[10px] shadow-sm font-semibold">
                    &amp;123
                  </button>
                  <button onClick={() => handleKeyPress('🌐')} className="flex-1 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs shadow-sm">
                    🌐
                  </button>
                  <button onClick={() => handleKeyPress('Space')} className="flex-[6] py-1 rounded bg-slate-800/80 hover:bg-slate-700/85 active:bg-indigo-600 active:text-white border border-slate-750 text-slate-300 text-xs shadow-sm font-semibold" id="key-space">
                    Espaço
                  </button>
                  <button onClick={() => handleKeyPress('😊')} className="flex-1 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs shadow-sm">
                    😊
                  </button>
                  <button onClick={() => handleKeyPress('Close')} className="flex-[1.5] py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs shadow-sm flex items-center justify-center" id="key-keyboard-hide">
                    ⌨️ ↓
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simulator Quick Tips */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-400 shadow-lg">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300 block mb-1">Como interagir com a demonstração:</span>
          <ul className="list-disc pl-4 space-y-1">
            <li>Dê foco clicando no campo de texto dentro do <strong className="text-slate-300">Bloco de Notas</strong> ou do <strong className="text-slate-300">Google Chrome</strong> para fazer o teclado virtual deslizar para cima automaticamente.</li>
            <li>Use as teclas do teclado virtual simulado para digitar nesses campos de entrada de texto!</li>
            <li>Altere os valores de <strong className="text-indigo-400">Delay de Fechamento</strong> no painel esquerdo e clique fora dos aplicativos para observar a contagem regressiva de encerramento do teclado.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
