/**
 * MH Studio Chatbot Widget — embeddable
 * Uso: <script src="chatbot-mhstudio.js" data-api-key="TU_KEY"></script>
 *
 * ADVERTENCIA DE SEGURIDAD: La API key queda expuesta en el cliente.
 * Para producción, reemplazá callClaude() por una llamada a tu propio backend
 * que actúe como proxy y guarde la key en el servidor.
 */
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────────
  const scriptEl = document.currentScript;
  const API_KEY  = scriptEl ? (scriptEl.getAttribute('data-api-key') || '') : '';
  const API_URL  = 'https://api.anthropic.com/v1/messages';
  const MODEL    = 'claude-haiku-4-5-20251001'; // rápido y económico para chat en vivo

  // ── Estilos ───────────────────────────────────────────────────────────────────
  const CSS = `
    #mhchat-bubble {
      position: fixed;
      bottom: 24px; right: 24px;
      width: 54px; height: 54px;
      border-radius: 50%;
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 99998;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #mhchat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 30px rgba(75,123,255,0.3);
    }
    #mhchat-bubble svg { width: 22px; height: 22px; }

    #mhchat-widget {
      font-family: 'DM Sans', system-ui, sans-serif;
      position: fixed;
      bottom: 90px; right: 24px;
      width: 380px; height: 560px;
      background: #0f0f0f;
      border: 1px solid #1e1e1e;
      border-radius: 16px;
      display: flex; flex-direction: column;
      box-shadow: 0 16px 56px rgba(0,0,0,0.65);
      z-index: 99999;
      overflow: hidden;
      transition: opacity 0.22s, transform 0.25s;
    }
    #mhchat-widget.mhchat-hidden {
      opacity: 0;
      transform: translateY(14px) scale(0.97);
      pointer-events: none;
    }

    #mhchat-header {
      padding: 13px 16px;
      border-bottom: 1px solid #1e1e1e;
      display: flex; align-items: center; gap: 10px;
      background: #0d0d0d;
      flex-shrink: 0;
    }
    #mhchat-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4B7BFF 0%, #1FD1A0 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
      letter-spacing: 0.5px; flex-shrink: 0;
    }
    #mhchat-header-info p {
      font-size: 13px; font-weight: 600;
      color: #f0f0f0; margin: 0; line-height: 1.3;
    }
    #mhchat-header-info span {
      font-size: 11px; color: #1FD1A0;
      display: flex; align-items: center; gap: 4px; margin-top: 1px;
    }
    #mhchat-header-info span::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%; background: #1FD1A0;
      display: inline-block;
    }
    #mhchat-close {
      margin-left: auto;
      background: none; border: none;
      color: #444; cursor: pointer;
      padding: 4px; line-height: 0;
      transition: color 0.15s;
    }
    #mhchat-close:hover { color: #888; }
    #mhchat-close svg { width: 16px; height: 16px; }

    #mhchat-messages {
      flex: 1; overflow-y: auto;
      padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: #2a2a2a #0f0f0f;
    }
    #mhchat-messages::-webkit-scrollbar { width: 4px; }
    #mhchat-messages::-webkit-scrollbar-track { background: #0f0f0f; }
    #mhchat-messages::-webkit-scrollbar-thumb { background: #252525; border-radius: 2px; }

    .mhchat-msg {
      max-width: 84%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px; line-height: 1.58;
      animation: mhchat-fade 0.18s ease;
      white-space: pre-wrap; word-break: break-word;
    }
    .mhchat-bot {
      background: #181818; color: #d0d0d0;
      border-radius: 4px 14px 14px 14px;
      align-self: flex-start;
    }
    .mhchat-user {
      background: #4B7BFF; color: #fff;
      border-radius: 14px 4px 14px 14px;
      align-self: flex-end;
    }
    .mhchat-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 13px 14px; background: #181818;
      border-radius: 4px 14px 14px 14px;
      align-self: flex-start;
    }
    .mhchat-dot {
      width: 6px; height: 6px;
      border-radius: 50%; background: #555;
      animation: mhchat-bounce 1.2s infinite;
    }
    .mhchat-dot:nth-child(2) { animation-delay: 0.2s; }
    .mhchat-dot:nth-child(3) { animation-delay: 0.4s; }

    .mhchat-chips {
      display: flex; flex-wrap: wrap; gap: 7px;
      align-self: flex-start;
      animation: mhchat-fade 0.2s ease;
    }
    .mhchat-chip {
      padding: 7px 14px;
      border: 1px solid #272727;
      border-radius: 20px;
      font-size: 13px; cursor: pointer;
      background: #161616; color: #c8c8c8;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      font-family: inherit;
    }
    .mhchat-chip:hover {
      background: #1e1e1e;
      border-color: #4B7BFF; color: #fff;
    }

    #mhchat-input-area {
      padding: 10px 12px;
      border-top: 1px solid #1a1a1a;
      display: flex; gap: 8px; align-items: center;
      background: #0f0f0f; flex-shrink: 0;
    }
    #mhchat-input {
      flex: 1;
      border: 1px solid #242424;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 13.5px;
      background: #161616; color: #e0e0e0;
      outline: none; font-family: inherit;
      transition: border-color 0.15s;
    }
    #mhchat-input::placeholder { color: #444; }
    #mhchat-input:focus { border-color: #4B7BFF; }
    #mhchat-input:disabled { opacity: 0.45; cursor: not-allowed; }

    #mhchat-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: #4B7BFF; border: none;
      cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, opacity 0.15s;
    }
    #mhchat-send:hover { background: #3a6aee; }
    #mhchat-send:disabled { opacity: 0.35; cursor: not-allowed; }
    #mhchat-send svg {
      width: 15px; height: 15px;
      stroke: #fff; fill: none; stroke-width: 2;
    }

    #mhchat-footer {
      text-align: center;
      font-size: 10px; color: #2e2e2e;
      padding: 5px 8px;
      border-top: 1px solid #161616;
      letter-spacing: 0.3px; flex-shrink: 0;
    }
    #mhchat-footer a {
      color: #3a5acc; text-decoration: none;
      transition: color 0.15s;
    }
    #mhchat-footer a:hover { color: #4B7BFF; }

    @keyframes mhchat-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-5px); }
    }
    @keyframes mhchat-fade {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 440px) {
      #mhchat-widget { width: calc(100vw - 32px); right: 16px; bottom: 82px; }
      #mhchat-bubble { right: 16px; bottom: 20px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'mhchat-styles';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ── HTML ──────────────────────────────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'mhchat-root';
  root.innerHTML = `
    <button id="mhchat-bubble" aria-label="Abrir chat de MH Studio">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div id="mhchat-widget" class="mhchat-hidden" role="dialog" aria-label="Chat MH Studio">
      <div id="mhchat-header">
        <div id="mhchat-avatar">MH</div>
        <div id="mhchat-header-info">
          <p>Asistente MH Studio</p>
          <span>En línea</span>
        </div>
        <button id="mhchat-close" aria-label="Cerrar chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div id="mhchat-messages" aria-live="polite"></div>

      <div id="mhchat-input-area">
        <input
          id="mhchat-input"
          type="text"
          placeholder="Escribí tu mensaje..."
          autocomplete="off"
          disabled
        />
        <button id="mhchat-send" aria-label="Enviar mensaje" disabled>
          <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        </button>
      </div>

      <div id="mhchat-footer">
        Powered by <a href="https://mhstudio.cr" target="_blank" rel="noopener">MH Studio</a> &middot; IA real
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // ── Referencias DOM ───────────────────────────────────────────────────────────
  const widgetEl   = document.getElementById('mhchat-widget');
  const bubbleEl   = document.getElementById('mhchat-bubble');
  const closeEl    = document.getElementById('mhchat-close');
  const messagesEl = document.getElementById('mhchat-messages');
  const inputEl    = document.getElementById('mhchat-input');
  const sendEl     = document.getElementById('mhchat-send');

  // ── Estado ────────────────────────────────────────────────────────────────────
  let businessType        = null;
  let conversationHistory = [];
  let waitingForBusiness  = true;
  let chatStarted         = false;

  const BUSINESS_TYPES = [
    'Restaurante',
    'Tienda / Boutique',
    'Salón de belleza',
    'Otro negocio',
  ];

  // ── Toggle ────────────────────────────────────────────────────────────────────
  function openChat() {
    widgetEl.classList.remove('mhchat-hidden');
    bubbleEl.style.display = 'none';
    if (!chatStarted) { chatStarted = true; startConversation(); }
    else { inputEl.focus(); }
  }

  function closeChat() {
    widgetEl.classList.add('mhchat-hidden');
    bubbleEl.style.display = '';
  }

  bubbleEl.addEventListener('click', openChat);
  closeEl.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !widgetEl.classList.contains('mhchat-hidden')) closeChat();
  });

  // ── Helpers de mensajes ───────────────────────────────────────────────────────
  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMsg(text, role) {
    const div = document.createElement('div');
    div.className = `mhchat-msg mhchat-${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollBottom();
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'mhchat-typing';
    div.id = 'mhchat-typing';
    div.setAttribute('aria-label', 'Escribiendo...');
    div.innerHTML = '<div class="mhchat-dot"></div><div class="mhchat-dot"></div><div class="mhchat-dot"></div>';
    messagesEl.appendChild(div);
    scrollBottom();
  }

  function removeTyping() {
    const t = document.getElementById('mhchat-typing');
    if (t) t.remove();
  }

  function showChips() {
    const row = document.createElement('div');
    row.className = 'mhchat-chips';
    row.id = 'mhchat-chips';
    BUSINESS_TYPES.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'mhchat-chip';
      btn.textContent = label;
      btn.addEventListener('click', () => selectBusiness(label));
      row.appendChild(btn);
    });
    messagesEl.appendChild(row);
    scrollBottom();
  }

  // ── Flujo de conversación ─────────────────────────────────────────────────────
  function startConversation() {
    setTimeout(() => {
      addMsg('¡Hola! 👋 Bienvenido al demo de chatbot de MH Studio.', 'bot');
      setTimeout(() => {
        addMsg('¿Cuál es el tipo de negocio que tenés?', 'bot');
        setTimeout(showChips, 300);
      }, 750);
    }, 400);
  }

  async function selectBusiness(type) {
    businessType       = type;
    waitingForBusiness = false;

    const chips = document.getElementById('mhchat-chips');
    if (chips) chips.remove();

    addMsg(type, 'user');
    inputEl.disabled = false;
    sendEl.disabled  = false;
    inputEl.focus();

    const system = `Sos un asistente virtual de demostración para un negocio de tipo: ${type}, en Costa Rica.
Respondé como si fueras el asistente real de ese negocio. Inventá detalles realistas (nombre del negocio, horarios, servicios o menú).
Al final de tu primera respuesta, en una línea separada, agregá exactamente este texto:
"— Demo creado por MH Studio · mhstudio.cr"
Máximo 3-4 oraciones en total. Respondé siempre en español.`;

    conversationHistory = [
      { role: 'user', content: `Hola, ¿me podés contar sobre el ${type}?` },
    ];

    showTyping();
    try {
      const reply = await callClaude(system, conversationHistory);
      removeTyping();
      conversationHistory.push({ role: 'assistant', content: reply });
      addMsg(reply, 'bot');
    } catch (err) {
      removeTyping();
      console.error('[MH Chat]', err);
      addMsg('¡Hola! ¿En qué te puedo ayudar hoy?', 'bot');
    }
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || waitingForBusiness) return;

    inputEl.value    = '';
    inputEl.disabled = true;
    sendEl.disabled  = true;

    addMsg(text, 'user');
    conversationHistory.push({ role: 'user', content: text });

    const system = `Asistente virtual de ${businessType} en Costa Rica. Respondé natural, conciso, en español. Máximo 3 oraciones.`;

    showTyping();
    try {
      const reply = await callClaude(system, conversationHistory);
      removeTyping();
      conversationHistory.push({ role: 'assistant', content: reply });
      addMsg(reply, 'bot');
    } catch (err) {
      removeTyping();
      console.error('[MH Chat]', err);
      addMsg('Hubo un problema al conectar. Intentá de nuevo.', 'bot');
    }

    inputEl.disabled = false;
    sendEl.disabled  = false;
    inputEl.focus();
  }

  sendEl.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ── Claude API ────────────────────────────────────────────────────────────────
  async function callClaude(system, messages) {
    if (!API_KEY) {
      throw new Error('API key no configurada. Agregá data-api-key al script tag.');
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || 'Con gusto te ayudo.';
  }

})();
