import { ScriptConfig } from '../types';

export function generateAHKScript(config: ScriptConfig): string {
  const whitelistStr = config.whitelist.length > 0 
    ? `Global Whitelist := [${config.whitelist.map(w => `"${w}"`).join(', ')}]`
    : 'Global Whitelist := []';
    
  const blacklistStr = config.blacklist.length > 0 
    ? `Global Blacklist := [${config.blacklist.map(b => `"${b}"`).join(', ')}]`
    : 'Global Blacklist := []';

  return `#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent

; ==============================================================================
; SCRIPT: Teclado Virtual de Toque Automático (Auto Touch Keyboard)
; CONFIGURAÇÃO PERSONALIZADA - GERADA EM: ${new Date().toLocaleDateString('pt-BR')}
; ==============================================================================

; --- CONFIGURAÇÕES DE COMPORTAMENTO ---
Global TabTipPath := "${config.tabtipPath.replace(/\\/g, '\\\\')}"
Global AutoClose := ${config.autoClose ? 'true' : 'false'}
Global DelayMs := ${config.delayMs}
${whitelistStr}
${blacklistStr}
Global OnlyInTabletMode := ${config.onlyInTabletMode ? 'true' : 'false'}
Global UseAdvancedUIA := ${config.useAdvancedUIA ? 'true' : 'false'}
Global DebugMode := ${config.debugMode ? 'true' : 'false'}
Global SoundOnTrigger := ${config.soundOnTrigger ? 'true' : 'false'}

; --- VARIÁVEIS DE CONTROLE INTERNO ---
Global Hook := 0
Global TimerActive := false
Global LogGui := 0
Global LogEdit := 0

; Inicializa o Console de Depuração se estiver ativado
if DebugMode {
    try {
        LogGui := Gui("+AlwaysOnTop +ToolWindow", "Console de Foco - Teclado Virtual")
        LogGui.SetFont("s9", "Consolas")
        LogEdit := LogGui.Add("Edit", "w550 h280 ReadOnly Multi")
        LogGui.Show("NoActivate x50 y50")
        LogMsg("Console de depuração iniciado com sucesso.")
    }
}

LogMsg("Iniciando monitoramento de foco do sistema...")

; Registra o gancho (hook) para monitorar mudanças de foco globalmente
StartHook() {
    Global Hook
    ; EVENT_OBJECT_FOCUS = 0x8005
    Hook := DllCall("SetWinEventHook"
        , "UInt", 0x8005 ; eventMin
        , "UInt", 0x8005 ; eventMax
        , "Ptr", 0      ; hmodWinEventProc (nulo para contexto local)
        , "Ptr", CallbackCreate(OnFocusChange, "F") ; lpfnWinEventProc
        , "UInt", 0     ; idProcess (0 = monitorar todos os processos)
        , "UInt", 0     ; idThread (0 = monitorar todas as threads)
        , "UInt", 0     ; dwflags (WINEVENT_OUTOFCONTEXT)
        , "Ptr")
}

; Remove o gancho ao fechar o script para liberar recursos
Cleanup(*) {
    Global Hook
    if Hook {
        DllCall("UnhookWinEvent", "Ptr", Hook)
        LogMsg("Gancho de foco desregistrado.")
    }
}

OnExit(Cleanup)
StartHook()
LogMsg("Gancho de foco registrado! Aguardando interação...")

; Callback disparada sempre que um elemento recebe foco no Windows
OnFocusChange(hWinEventHook, event, hwnd, idObject, idChild, dwEventThread, dwmsEventTime) {
    if !hwnd || !WinExist(hwnd)
        return

    ; Evita loops ignorando o próprio Teclado Virtual e o AutoHotkey
    try {
        Class := WinGetClass(hwnd)
        ProcessName := WinGetProcessName(hwnd)
    } catch {
        return
    }

    if (Class = "IPTip_Main_Window" || ProcessName = "TabTip.exe" || ProcessName = "AutoHotkeyUX.exe")
        return

    LogMsg("Foco mudou para: " ProcessName " | Classe: " Class)

    ; 1. Verifica se o processo está na Blacklist (nunca abrir o teclado)
    for app in Blacklist {
        if (StrLower(app) = StrLower(ProcessName)) {
            LogMsg("Processo na Blacklist: " ProcessName ". Fechando teclado.")
            TriggerClose()
            return
        }
    }

    ; 2. Verifica se o processo está na Whitelist (se houver itens cadastrados)
    if (Whitelist.Length > 0) {
        IsWhitelisted := false
        for app in Whitelist {
            if (StrLower(app) = StrLower(ProcessName)) {
                IsWhitelisted := true
                break
            }
        }
        if !IsWhitelisted {
            LogMsg("Processo fora da Whitelist: " ProcessName ". Fechando teclado.")
            TriggerClose()
            return
        }
    }

    ; 3. Verifica se o sistema está em Modo Tablet se configurado
    if OnlyInTabletMode && !CheckTabletMode() {
        LogMsg("Modo Tablet desativado no Windows. Ação ignorada.")
        TriggerClose()
        return
    }

    ; 4. Determina se o controle atual é um campo editável
    IsEditable := false

    ; Validação rápida por classe de controle conhecida no Windows
    if RegExMatch(Class, "i)^(Edit|RichEdit|Scintilla|TextBox|Input|Search|Txt|Gmail|Document|DirectUIHWND|Windows\\\\.UI\\\\.Core\\\\.CoreWindow)") {
        IsEditable := true
        LogMsg("Detectado por Classe de Controle compatível: " Class)
    }

    ; Validação avançada via UI Automation nativa (ideal para navegadores, Office, etc)
    if !IsEditable && UseAdvancedUIA {
        IsEditable := CheckUIAEditable(hwnd)
    }

    ; Abre ou fecha o teclado com base no resultado da detecção
    if IsEditable {
        LogMsg(">>> Entrada de texto ativa. Solicitando abertura do teclado virtual.")
        TriggerOpen()
    } else {
        LogMsg(">>> Controle não editável. Solicitando fechamento.")
        TriggerClose()
    }
}

; Consulta a API nativa de UI Automation do Windows
CheckUIAEditable(hwnd) {
    try {
        ; Cria a instância de automação nativa (UIAutomationCore.dll)
        ; CLSID_CUIAutomation = {ff48dba5-7732-432a-9215-61278e10e6e0}
        ; IID_IUIAutomation = {30cbe57d-d9d0-40a0-ab22-f54729dec83f}
        UIA := ComObject("{ff48dba5-7732-432a-9215-61278e10e6e0}", "{30cbe57d-d9d0-40a0-ab22-f54729dec83f}")
        
        Element := 0
        ; ElementFromHandle -> vtable index 6
        ComCall(6, UIA, "Ptr", hwnd, "Ptr*", &Element := 0)
        
        if Element {
            ; get_CurrentHasKeyboardFocus -> vtable index 13
            HasFocus := 0
            ComCall(13, Element, "Int*", &HasFocus := 0)
            
            ; get_CurrentControlType -> vtable index 21
            ControlType := 0
            ComCall(21, Element, "Int*", &ControlType := 0)
            
            ; UIA_EditControlTypeId = 50004
            ; UIA_DocumentControlTypeId = 50030 (ex: Google Chrome, MS Word)
            if (ControlType = 50004 || ControlType = 50030) {
                LogMsg("UIA: Identificado como Edit (50004) ou Document (50030)")
                return true
            }

            ; get_CurrentIsValuePatternAvailable -> vtable index 38 (ex: inputs em sites)
            IsValuePattern := 0
            ComCall(38, Element, "Int*", &IsValuePattern := 0)
            if IsValuePattern {
                LogMsg("UIA: Elemento suporta o padrão Value (entrada editável)")
                return true
            }
        }
    } catch {
        ; Silencia falhas ao consultar elementos sem suporte a COM/UIA
    }
    return false
}

; Lê o estado do Modo Tablet do registro do Windows
CheckTabletMode() {
    try {
        return RegRead("HKCU\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\ImmersiveShell", "TabletMode") = 1
    } catch {
        return false
    }
}

; Executa o Teclado Virtual (TabTip.exe)
TriggerOpen() {
    Global TimerActive, SoundOnTrigger, TabTipPath
    if TimerActive {
        SetTimer(CloseKeyboard, 0)
        TimerActive := false
    }
    
    if SoundOnTrigger {
        SoundPlay("*64") ; Emite o som padrão de notificação de forma discreta
    }
    
    try {
        Run(TabTipPath)
    } catch {
        LogMsg("ERRO: Falha ao executar o teclado virtual no caminho: " TabTipPath)
    }
}

; Dispara a contagem regressiva para fechar o teclado
TriggerClose() {
    Global AutoClose, TimerActive, DelayMs
    if !AutoClose
        return
        
    if !TimerActive {
        SetTimer(CloseKeyboard, -DelayMs)
        TimerActive := true
    }
}

; Fecha o teclado virtual se estiver visível
CloseKeyboard() {
    Global TimerActive
    TimerActive := false
    try {
        ; Fecha o Teclado Virtual fechando sua janela principal
        if WinExist("ahk_class IPTip_Main_Window") {
            WinClose("ahk_class IPTip_Main_Window")
            LogMsg("Teclado virtual fechado com sucesso.")
        }
    } catch {
        LogMsg("UIA: Falha ao ocultar o teclado.")
    }
}

; Adiciona uma mensagem ao console visual
LogMsg(msg) {
    Global DebugMode, LogEdit
    if DebugMode {
        try {
            FormatTime := FormatTime(, "HH:mm:ss")
            CurrentText := LogEdit.Value
            LogEdit.Value := CurrentText . "[" . FormatTime . "] " . msg . "\\r\\n"
            ; Envia mensagem para rolar automaticamente para o final
            SendMessage(0x0115, 7, 0, LogEdit.Hwnd) ; WM_VSCROLL, SB_BOTTOM
        }
    }
}
`;
}
