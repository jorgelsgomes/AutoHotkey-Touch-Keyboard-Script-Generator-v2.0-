import React, { useState } from 'react';
import { ScriptConfig } from '../types';
import { 
  Settings, 
  Clock, 
  HelpCircle, 
  Plus, 
  X, 
  Info, 
  Sliders, 
  Monitor, 
  Volume2, 
  Cpu, 
  Terminal, 
  ToggleLeft, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface ConfiguratorProps {
  config: ScriptConfig;
  onChange: (newConfig: ScriptConfig) => void;
}

const PRESET_PROFILES = [
  {
    id: 'standard',
    name: 'Padrão Recomendado',
    desc: 'Compatível com quase tudo, bloqueia CMD/PowerShell.',
    config: {
      delayMs: 300,
      autoClose: true,
      onlyInTabletMode: false,
      useAdvancedUIA: true,
      debugMode: true,
      soundOnTrigger: false,
      tabtipPath: 'C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe',
      whitelist: [],
      blacklist: ['cmd.exe', 'powershell.exe', 'bash.exe', 'wsl.exe', 'taskmgr.exe']
    }
  },
  {
    id: 'tablet_only',
    name: 'Apenas Modo Tablet',
    desc: 'Só ativa quando o Windows estiver em modo tablet.',
    config: {
      delayMs: 250,
      autoClose: true,
      onlyInTabletMode: true,
      useAdvancedUIA: true,
      debugMode: true,
      soundOnTrigger: false,
      tabtipPath: 'C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe',
      whitelist: [],
      blacklist: ['cmd.exe', 'powershell.exe']
    }
  },
  {
    id: 'browsers_office',
    name: 'Foco Produtividade',
    desc: 'Ativa apenas no Chrome, Edge, Firefox, Word e Bloco de Notas.',
    config: {
      delayMs: 300,
      autoClose: true,
      onlyInTabletMode: false,
      useAdvancedUIA: true,
      debugMode: true,
      soundOnTrigger: true,
      tabtipPath: 'C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe',
      whitelist: ['chrome.exe', 'msedge.exe', 'firefox.exe', 'winword.exe', 'notepad.exe'],
      blacklist: []
    }
  }
];

export default function Configurator({ config, onChange }: ConfiguratorProps) {
  const [newWhiteItem, setNewWhiteItem] = useState('');
  const [newBlackItem, setNewBlackItem] = useState('');

  const updateField = <K extends keyof ScriptConfig>(key: K, value: ScriptConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newWhiteItem.trim().toLowerCase();
    if (clean && !config.whitelist.includes(clean)) {
      updateField('whitelist', [...config.whitelist, clean]);
      setNewWhiteItem('');
    }
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newBlackItem.trim().toLowerCase();
    if (clean && !config.blacklist.includes(clean)) {
      updateField('blacklist', [...config.blacklist, clean]);
      setNewBlackItem('');
    }
  };

  const removeWhitelist = (item: string) => {
    updateField('whitelist', config.whitelist.filter(i => i !== item));
  };

  const removeBlacklist = (item: string) => {
    updateField('blacklist', config.blacklist.filter(i => i !== item));
  };

  const loadPreset = (presetConfig: typeof config) => {
    onChange({ ...presetConfig });
  };

  return (
    <div id="config-panel" className="flex flex-col gap-6 h-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl overflow-y-auto">
      {/* Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Settings className="w-5 h-5 text-indigo-400" id="icon-settings" />
        <h2 className="text-lg font-semibold font-sans tracking-tight">Painel de Configuração</h2>
      </div>

      {/* Profiles / Presets */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Perfis Pré-configurados</span>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-1">
          {PRESET_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => loadPreset(profile.config)}
              className="flex flex-col items-start text-left p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
              id={`preset-${profile.id}`}
            >
              <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                {profile.name}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 line-clamp-1">{profile.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2"></div>

      {/* Behavior */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Comportamento Geral</span>
        </div>

        {/* DelayMs */}
        <div className="flex flex-col gap-2 p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              Delay de Fechamento (Debounce)
            </span>
            <span className="text-indigo-400 font-mono font-semibold">{config.delayMs}ms</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tempo para aguardar antes de fechar o teclado após perder o foco. Evita que o teclado pisque ao alternar de campo.
          </p>
          <input
            type="range"
            min="0"
            max="1500"
            step="50"
            value={config.delayMs}
            onChange={(e) => updateField('delayMs', parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
            id="delay-slider"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 gap-3">
          {/* Auto Close */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-300">Fechamento Automático</span>
              <span className="text-xs text-slate-400">Fecha o teclado virtual quando focar fora de um campo editável.</span>
            </div>
            <input
              type="checkbox"
              checked={config.autoClose}
              onChange={(e) => updateField('autoClose', e.target.checked)}
              className="sr-only peer"
              id="checkbox-autoclose"
            />
            <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>

          {/* Only In Tablet Mode */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-300">Verificar Modo Tablet</span>
              <span className="text-xs text-slate-400">Verifica o registro do Windows e só ativa se o dispositivo estiver em modo tablet.</span>
            </div>
            <input
              type="checkbox"
              checked={config.onlyInTabletMode}
              onChange={(e) => updateField('onlyInTabletMode', e.target.checked)}
              className="sr-only peer"
              id="checkbox-tablet"
            />
            <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>

          {/* Sound On Trigger */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                Som de Clique ao Abrir
              </span>
              <span className="text-xs text-slate-400">Emite um aviso sonoro rápido (som padrão de notificação) ao levantar o teclado.</span>
            </div>
            <input
              type="checkbox"
              checked={config.soundOnTrigger}
              onChange={(e) => updateField('soundOnTrigger', e.target.checked)}
              className="sr-only peer"
              id="checkbox-sound"
            />
            <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2"></div>

      {/* Advanced Automation */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Automação e Compatibilidade</span>
        </div>

        {/* Use Advanced UIA */}
        <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-300">UI Automation Avançado</span>
            <span className="text-xs text-slate-400">Usa chamadas COM nativas do Windows para consultar Chrome, Edge, Firefox, Word sem bibliotecas extras.</span>
          </div>
          <input
            type="checkbox"
            checked={config.useAdvancedUIA}
            onChange={(e) => updateField('useAdvancedUIA', e.target.checked)}
            className="sr-only peer"
            id="checkbox-uia"
          />
          <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>

        {/* DebugMode */}
        <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Console de Debug Visual
            </span>
            <span className="text-xs text-slate-400">Abre uma janela flutuante nativa do Windows ao iniciar o script, exibindo o histórico de foco em tempo real.</span>
          </div>
          <input
            type="checkbox"
            checked={config.debugMode}
            onChange={(e) => updateField('debugMode', e.target.checked)}
            className="sr-only peer"
            id="checkbox-debug"
          />
          <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>

        {/* TabTipPath */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-400">Caminho do Teclado (TabTip.exe)</span>
          <input
            type="text"
            value={config.tabtipPath}
            onChange={(e) => updateField('tabtipPath', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            id="input-path"
          />
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2"></div>

      {/* Whitelist / Blacklist */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filtros de Aplicativos (Executáveis)</span>
        </div>

        {/* Whitelist */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Lista Branca (Whitelist)</span>
            <span className="text-[10px] text-slate-400">Se houver itens, ativa APENAS neles</span>
          </div>
          <form onSubmit={handleAddWhitelist} className="flex gap-2">
            <input
              type="text"
              value={newWhiteItem}
              onChange={(e) => setNewWhiteItem(e.target.value)}
              placeholder="ex: chrome.exe"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              id="input-whitelist"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
              id="btn-add-whitelist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
          {config.whitelist.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic p-1">Todos os aplicativos permitidos (vazio)</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {config.whitelist.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                  {item}
                  <button type="button" onClick={() => removeWhitelist(item)} className="hover:text-emerald-100 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Blacklist */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">Lista Negra (Blacklist)</span>
            <span className="text-[10px] text-slate-400">NUNCA abre o teclado nestes processos</span>
          </div>
          <form onSubmit={handleAddBlacklist} className="flex gap-2">
            <input
              type="text"
              value={newBlackItem}
              onChange={(e) => setNewBlackItem(e.target.value)}
              placeholder="ex: cmd.exe"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              id="input-blacklist"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-colors"
              id="btn-add-blacklist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
          {config.blacklist.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic p-1">Nenhum aplicativo bloqueado (vazio)</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {config.blacklist.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 font-mono">
                  {item}
                  <button type="button" onClick={() => removeBlacklist(item)} className="hover:text-rose-100 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
