import React, { useState } from 'react';
import { ScriptConfig } from '../types';
import { generateAHKScript } from '../utils/generator';
import { Copy, Check, Download, FileCode, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

interface CodePanelProps {
  config: ScriptConfig;
}

export default function CodePanel({ config }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const scriptCode = generateAHKScript(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teclado_virtual_auto.ahk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simple syntax highlighter function for AHK v2
  const highlightCode = (code: string) => {
    return code.split('\n').map((line, idx) => {
      // Handle comments first
      let commentPart = '';
      let codePart = line;
      
      const commentIndex = line.indexOf(';');
      if (commentIndex !== -1) {
        // Simple check to ensure semicolon is not inside a string (rough approximation)
        const beforeComment = line.substring(0, commentIndex);
        const quoteCount = (beforeComment.match(/"/g) || []).length;
        if (quoteCount % 2 === 0) {
          codePart = beforeComment;
          commentPart = line.substring(commentIndex);
        }
      }

      // Highlight code part
      let html = codePart
        // Escape HTML tags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Highlight strings (between double quotes)
      html = html.replace(/("[^"]*")/g, '<span class="text-amber-300">$1</span>');

      // Highlight directives and keywords
      const keywords = [
        '#Requires', '#SingleInstance', 'Persistent', 'Global', 'try', 'catch', 
        'return', 'if', 'for', 'in', 'else', 'break', 'continue', 'true', 'false', 'OnExit'
      ];
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'g');
        html = html.replace(regex, '<span class="text-indigo-400">$1</span>');
      });

      // Highlight built-in functions / DLL Calls
      const builtins = [
        'DllCall', 'CallbackCreate', 'WinExist', 'WinGetClass', 'WinGetProcessName', 
        'ComObject', 'ComCall', 'RegRead', 'Run', 'SetTimer', 'SoundPlay', 
        'FormatTime', 'SendMessage', 'RegExMatch', 'StrLower', 'OutputDebug'
      ];
      builtins.forEach(bi => {
        const regex = new RegExp(`\\b(${bi})\\b`, 'g');
        html = html.replace(regex, '<span class="text-sky-400 font-semibold">$1</span>');
      });

      return (
        <div key={idx} className="table-row font-mono text-[11px] sm:text-xs leading-relaxed">
          <span className="table-cell select-none text-right pr-4 text-slate-600 border-r border-slate-800/60 w-10 text-[10px] sm:text-xs">
            {idx + 1}
          </span>
          <span className="table-cell pl-4 whitespace-pre">
            <span dangerouslySetInnerHTML={{ __html: html }} />
            {commentPart && <span className="text-emerald-500 italic">{commentPart}</span>}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full" id="code-panel-container">
      {/* Quick script stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Versão AHK</span>
            <span className="text-xs font-bold text-slate-200">v2.0 (Requerido)</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Impacto CPU</span>
            <span className="text-xs font-bold text-slate-200">&lt; 0.1% (Super Leve)</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Uso de Memória</span>
            <span className="text-xs font-bold text-slate-200">~ 2MB (Nativo)</span>
          </div>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="flex flex-col flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[480px]">
        {/* Editor Titlebar */}
        <div className="bg-slate-900/80 border-b border-slate-850 px-4 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">teclado_virtual_auto.ahk</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-750 border border-slate-750 hover:border-slate-650 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
              title="Copiar código"
              id="btn-copy-code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-650 border border-indigo-500/40 text-xs font-medium text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-950/20"
              title="Baixar arquivo .ahk"
              id="btn-download-code"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Script</span>
            </button>
          </div>
        </div>

        {/* Code View Canvas */}
        <div className="flex-1 overflow-auto p-4 bg-[#0a0f1d] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="table min-w-full">
            {highlightCode(scriptCode)}
          </div>
        </div>
      </div>
    </div>
  );
}
