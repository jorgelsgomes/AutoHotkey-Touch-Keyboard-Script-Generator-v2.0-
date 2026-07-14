import React from 'react';
import { 
  Download, 
  ArrowRight, 
  ExternalLink, 
  Folder, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Command, 
  HelpCircle,
  Clock,
  Terminal,
  FileCode
} from 'lucide-react';

export default function Guide() {
  return (
    <div className="flex flex-col gap-6 text-slate-200" id="guide-container">
      {/* Visual Step-by-Step */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-indigo-400 font-sans">Como Instalar e Usar</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-lg relative overflow-hidden group">
            <span className="absolute top-3 right-4 text-3xl font-black text-slate-800/50 select-none group-hover:text-indigo-500/10 transition-colors">01</span>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Instale o AutoHotkey v2</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O script exige a versão <strong className="text-slate-300">AutoHotkey v2.0+</strong> instalada no Windows para rodar corretamente com alto desempenho.
            </p>
            <a 
              href="https://www.autohotkey.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Baixar no Site Oficial
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-lg relative overflow-hidden group">
            <span className="absolute top-3 right-4 text-3xl font-black text-slate-800/50 select-none group-hover:text-indigo-500/10 transition-colors">02</span>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <FileCode className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Salve o Código</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clique na aba <strong className="text-indigo-400 font-semibold">Código AutoHotkey</strong> nesta página, baixe o arquivo ou copie todo o código e salve em seu computador como <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-[11px] text-indigo-300">teclado_virtual.ahk</code>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-lg relative overflow-hidden group">
            <span className="absolute top-3 right-4 text-3xl font-black text-slate-800/50 select-none group-hover:text-indigo-500/10 transition-colors">03</span>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Play className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Execute o Script</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dê dois cliques no arquivo salvo. O ícone oficial do AutoHotkey aparecerá na barra de tarefas (systray) do Windows ao lado do relógio do sistema, indicando execução ativa.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-lg relative overflow-hidden group">
            <span className="absolute top-3 right-4 text-3xl font-black text-slate-800/50 select-none group-hover:text-indigo-500/10 transition-colors">04</span>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Command className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Iniciar com o Windows</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Pressione <kbd className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-[10px] text-slate-300">Win + R</kbd>, digite <code className="text-indigo-300 font-mono text-[11px]">shell:startup</code> e aperte Enter. Na pasta que abrir, crie um <strong className="text-slate-300">Atalho</strong> do seu arquivo script para que ele inicie sozinho.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2"></div>

      {/* Troubleshooting Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-indigo-400 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Perguntas Frequentes &amp; Solução de Problemas
        </h3>

        <div className="flex flex-col gap-3.5">
          {/* FAQ 1 */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-200">O teclado virtual (TabTip.exe) não abre no meu computador. O que fazer?</span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Verifique se o caminho especificado para o <code className="bg-slate-950 px-1 rounded border border-slate-800/60 font-mono text-[11px] text-indigo-300">TabTip.exe</code> no início do seu script é o mesmo em sua máquina. O caminho padrão configurado no gerador atende a 99% das instalações do Windows 10 e Windows 11. Além disso, se o teclado continuar sem responder, tente executar o script como <strong className="text-indigo-300">Administrador</strong> (clique com o botão direito no arquivo .ahk e selecione &quot;Executar como Administrador&quot;).
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-200">Por que o teclado pisca rapidamente quando eu troco de campo de texto no formulário?</span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Isso acontece quando o delay de fechamento está curto demais. Para evitar que o teclado tente fechar e abrir novamente quando você clica em campos adjacentes, configure o <strong className="text-indigo-400 font-semibold">Delay de Fechamento (Debounce)</strong> para <strong className="text-slate-200 font-semibold">300ms</strong> ou <strong className="text-slate-200 font-semibold">400ms</strong> no painel de configurações. Isso dará tempo suficiente para o foco transitar sem piscar.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-200">Como funciona a detecção inteligente de navegadores (Chrome, Edge)?</span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              O script utiliza a interface nativa de <strong className="text-indigo-300">UI Automation (UIA)</strong> do próprio Windows através de conexões de objetos COM. Quando você foca em um campo de formulário HTML em um site, a UIA avisa o AutoHotkey que o elemento ativo suporta o padrão de entrada de texto (<code className="bg-slate-950 px-1 rounded border border-slate-800/60 font-mono text-[11px] text-indigo-300">ValuePattern</code> ou possui tipo de controle <code className="bg-slate-950 px-1 rounded border border-slate-800/60 font-mono text-[11px] text-indigo-300">Edit</code>), disparando o teclado automaticamente, sem falsos positivos em botões ou áreas vazias.
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-200">Como pausar ou fechar o script?</span>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Para suspender a detecção, clique com o botão direito no ícone verde com a letra <strong className="text-emerald-400 font-bold">&quot;H&quot;</strong> na sua barra de ferramentas do Windows (systray) e escolha <strong className="text-slate-200 font-semibold">Suspend Hotkeys</strong> ou <strong className="text-slate-200 font-semibold">Pause Script</strong>. Para encerrar o script completamente, clique em <strong className="text-rose-400 font-semibold">Exit</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
