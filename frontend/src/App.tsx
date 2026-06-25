import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #07080d;
    --s1:      #0d1018;
    --s2:      #131720;
    --s3:      #1a2030;
    --amber:   #f0a500;
    --amber2:  #ffcc55;
    --cyan:    #00d4ff;
    --red:     #ff3a5c;
    --green:   #00e896;
    --text:    #dce8f0;
    --muted:   #4a6070;
    --border:  rgba(240,165,0,0.12);
    --borderB: rgba(240,165,0,0.35);
    --ff-head: 'Bebas Neue', sans-serif;
    --ff-body: 'DM Mono', monospace;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--ff-body); }
  ::selection { background: rgba(240,165,0,0.25); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--amber); border-radius: 2px; }

  .rai-input {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 14px; color: var(--text);
    font-family: var(--ff-body); font-size: 13px; outline: none;
    transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
  }
  .rai-input::placeholder { color: var(--muted); }
  .rai-input:focus {
    border-color: var(--amber); background: var(--s3);
    box-shadow: 0 0 0 3px rgba(240,165,0,0.08), 0 0 20px rgba(240,165,0,0.06);
  }
  textarea.rai-input { resize: vertical; min-height: 80px; line-height: 1.6; }
  select.rai-input { cursor: pointer; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeDown { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideL   { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes popIn    { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes spinRev  { to { transform: rotate(-360deg); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes countUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @keyframes glitch1  {
    0%,100% { clip-path:inset(0 0 95% 0); transform:translate(-3px,0); }
    20% { clip-path:inset(40% 0 50% 0); transform:translate(3px,0); }
    40% { clip-path:inset(80% 0 10% 0); transform:translate(-2px,0); }
    60% { clip-path:inset(20% 0 70% 0); transform:translate(2px,0); }
    80% { clip-path:inset(60% 0 30% 0); transform:translate(-1px,0); }
  }
  @keyframes glitch2  {
    0%,100% { clip-path:inset(90% 0 0% 0); transform:translate(3px,0); }
    25% { clip-path:inset(30% 0 60% 0); transform:translate(-3px,0); }
    50% { clip-path:inset(70% 0 20% 0); transform:translate(2px,0); }
    75% { clip-path:inset(10% 0 85% 0); transform:translate(-2px,0); }
  }
  @keyframes radarSpin { to { transform:rotate(360deg); } }
  @keyframes toastIn  { from { opacity:0; transform:translateX(120%); } to { opacity:1; transform:translateX(0); } }
  @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(120%); } }
  @keyframes nodeFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  @keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes barGrow  { from { width: 0%; } to { width: var(--target-w); } }
  @keyframes tickerSlide { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
  @keyframes confettiFall { 0% { transform:translateY(-10px) rotate(0deg); opacity:1; } 100% { transform:translateY(300px) rotate(720deg); opacity:0; } }
  @keyframes scoreGlow { 0%,100% { text-shadow:0 0 20px currentColor; } 50% { text-shadow:0 0 40px currentColor, 0 0 80px currentColor; } }
  @keyframes borderPulse { 0%,100% { border-color: rgba(240,165,0,0.2); } 50% { border-color: rgba(240,165,0,0.7); } }
  @keyframes tipSlide { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scanLine { 0% { top:-2px; } 100% { top:100%; } }
  @keyframes navSlideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes heroReveal { from { opacity:0; transform:translateY(24px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes statPop  { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
  @keyframes connectorGrow { from { width:0; } to { width:100%; } }

  .glitch-wrap { position:relative; display:inline-block; }
  .glitch-wrap::before, .glitch-wrap::after {
    content: attr(data-text); position: absolute; inset: 0;
    font-family: var(--ff-head); font-size: inherit; color: var(--amber); pointer-events: none;
  }
  .glitch-wrap::before { color: var(--cyan); animation: glitch1 4s infinite; }
  .glitch-wrap::after  { color: var(--red);  animation: glitch2 4s infinite 0.1s; }

  .scan-parent { position:relative; overflow:hidden; }
  .scan-parent::after {
    content:''; position:absolute; left:0; right:0; height:1px; pointer-events:none;
    background: linear-gradient(90deg, transparent, rgba(240,165,0,0.15), transparent);
    animation: scanLine 4s linear infinite; z-index:0;
  }

  .shimmer-txt {
    background: linear-gradient(90deg, var(--text) 0%, var(--amber2) 30%, var(--cyan) 50%, var(--amber2) 70%, var(--text) 100%);
    background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 4s linear infinite;
  }

  .rai-card {
    background: var(--s1); border: 1px solid var(--border); border-radius: 14px; padding: 24px;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  }
  .rai-card:hover { border-color: var(--borderB); box-shadow: 0 0 30px rgba(240,165,0,0.07); transform: translateY(-2px); }

  .rai-btn {
    display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:15px 24px;
    background: var(--amber); color: #07080d; border:none; border-radius:10px;
    font-family: var(--ff-head); font-size: 20px; letter-spacing: 1.5px; cursor:pointer;
    position:relative; overflow:hidden; transition: transform 0.2s, box-shadow 0.3s, filter 0.2s;
  }
  .rai-btn::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    transform: translateX(-100%); transition: transform 0.5s ease;
  }
  .rai-btn:hover:not(:disabled)::after { transform: translateX(100%); }
  .rai-btn:hover:not(:disabled) { box-shadow:0 0 32px rgba(240,165,0,0.55); transform:translateY(-2px); filter:brightness(1.08); }
  .rai-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .rai-btn:disabled { opacity:0.3; cursor:not-allowed; }

  .rai-btn-ghost {
    display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:12px 24px;
    background: transparent; color: var(--muted); border: 1px solid var(--border); border-radius:10px;
    font-family: var(--ff-body); font-size:12px; letter-spacing:1.5px; text-transform:uppercase;
    cursor:pointer; transition: all 0.3s;
  }
  .rai-btn-ghost:hover { color:var(--text); border-color:var(--muted); background:rgba(255,255,255,0.03); }

  .rai-tag {
    display:inline-flex; align-items:center; gap:5px; padding:3px 11px; border-radius:20px;
    font-size:10px; letter-spacing:1.5px; text-transform:uppercase; background: rgba(240,165,0,0.1);
    border:1px solid rgba(240,165,0,0.25); color: var(--amber2); animation: popIn 0.4s ease both;
  }

  .ring-spin-outer { animation: spin    1.4s linear infinite; }
  .ring-spin-inner { animation: spinRev 1.0s linear infinite; }

  .trust-ticker { display:flex; gap:40px; animation: tickerSlide 30s linear infinite; white-space:nowrap; }
  .trust-stat { display:flex; align-items:center; gap:10px; flex-shrink:0; }

  .prio-HIGH   { background:rgba(255,58,92,0.12); border:1px solid rgba(255,58,92,0.35); color:var(--red); }
  .prio-MEDIUM { background:rgba(240,165,0,0.12); border:1px solid rgba(240,165,0,0.35); color:var(--amber2); }
  .prio-LOW    { background:rgba(0,212,255,0.10); border:1px solid rgba(0,212,255,0.28); color:var(--cyan); }

  .score-bar-fill {
    height:100%; border-radius:4px; position:relative; overflow:hidden;
    animation: barGrow 1.2s cubic-bezier(0.4,0,0.2,1) both;
  }
  .score-bar-fill::after {
    content:''; position:absolute; top:0; left:0; right:0; bottom:0;
    background:linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%);
    animation: shimmer 2s linear infinite;
  }

  .kw-chip {
    display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:20px;
    font-size:10px; letter-spacing:1px; text-transform:uppercase;
    background:rgba(255,58,92,0.08); border:1px solid rgba(255,58,92,0.25); color:var(--red);
    animation: popIn 0.3s ease both;
  }

  .recruiter-quote {
    border-left:3px solid var(--cyan); background:rgba(0,212,255,0.05);
    padding:16px 18px; border-radius:0 10px 10px 0; font-style:italic;
    line-height:1.8; font-size:13px; color:var(--text);
    animation: fadeUp 0.5s 0.3s ease both;
  }

  .cover-hook-card {
    background: linear-gradient(135deg, rgba(240,165,0,0.06), rgba(0,212,255,0.04));
    border:1px solid rgba(240,165,0,0.2); border-radius:12px; padding:18px 20px;
    animation: fadeUp 0.5s ease both; position:relative; overflow:hidden;
  }
  .cover-hook-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg, var(--amber), var(--cyan));
  }

  .improvement-item {
    display:flex; align-items:flex-start; gap:12px; padding:12px 14px;
    background:rgba(0,232,150,0.04); border:1px solid rgba(0,232,150,0.12);
    border-radius:10px; animation: slideL 0.4s ease both;
  }

  .feature-card {
    background: var(--s1); border: 1px solid var(--border); border-radius:14px; padding:20px;
    transition: all 0.4s; cursor:default; position:relative; overflow:hidden;
  }
  .feature-card:hover { border-color: var(--borderB); transform:translateY(-4px); box-shadow:0 16px 50px rgba(0,0,0,0.4), 0 0 30px rgba(240,165,0,0.06); }
  .feature-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--amber),transparent); opacity:0; transition:opacity 0.4s; }
  .feature-card:hover::before { opacity:1; }

  .testimonial-card {
    background:var(--s1); border:1px solid var(--border); border-radius:14px; padding:20px;
    animation: fadeUp 0.5s ease both; flex:1; min-width:220px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .testimonial-card:hover { border-color: rgba(240,165,0,0.3); box-shadow: 0 0 24px rgba(240,165,0,0.06); }

  .dim-row { transition: background 0.2s; border-radius:8px; padding:6px 8px; }
  .dim-row:hover { background: rgba(255,255,255,0.03); }

  .analysis-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
  @media (max-width: 1024px) { .analysis-layout { grid-template-columns: 1fr; } }
  .pdf-preview-frame { width: 100%; height: 80vh; min-height: 600px; border: 1px solid var(--border); border-radius: 14px; background: var(--s2); }

  .insights-panel { background: rgba(0,212,255,0.05); border-left: 4px solid var(--cyan); border-radius: 12px; padding: 24px; margin-top: 24px; animation: fadeUp 0.6s ease; }

  /* ══ NEW: NAVBAR ══════════════════════════════════════════════════════════ */
  .rai-navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 62px; display: flex; align-items: center; padding: 0 28px; gap: 16px;
    transition: background 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease, box-shadow 0.4s ease;
    animation: navSlideDown 0.6s ease both;
  }
  .rai-navbar.scrolled {
    background: rgba(7,8,13,0.94);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border-bottom: 1px solid rgba(240,165,0,0.13);
    box-shadow: 0 4px 40px rgba(0,0,0,0.55);
  }
  .rai-navbar-logo {
    display: flex; align-items: center; gap: 8px; cursor: pointer; flex-shrink: 0;
    font-family: var(--ff-head); font-size: 22px; letter-spacing: 2px; line-height: 1;
    transition: opacity 0.2s;
  }
  .rai-navbar-logo:hover { opacity: 0.85; }
  .rai-navbar-ver {
    font-size: 9px; letter-spacing: 1.5px; padding: 2px 7px; border-radius: 4px;
    border: 1px solid rgba(240,165,0,0.28); color: rgba(240,165,0,0.65);
    align-self: center; font-family: var(--ff-body);
  }
  .rai-navbar-tabs {
    display: flex; gap: 2px; background: rgba(13,16,24,0.9); border: 1px solid rgba(240,165,0,0.12);
    border-radius: 9px; padding: 3px;
  }
  .rai-navbar-tab {
    padding: 7px 18px; border: none; border-radius: 7px; font-family: var(--ff-head); font-size: 14px;
    letter-spacing: 1.5px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); white-space: nowrap;
  }
  .rai-navbar-tab.active  { background: var(--amber); color: #07080d; box-shadow: 0 0 16px rgba(240,165,0,0.4); }
  .rai-navbar-tab.idle    { background: transparent; color: var(--muted); }
  .rai-navbar-tab.idle:hover { color: var(--text); background: rgba(255,255,255,0.04); }
  .rai-live-badge {
    display: flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: 1.5px;
    color: var(--green); border: 1px solid rgba(0,232,150,0.25); padding: 5px 12px; border-radius: 20px;
  }
  .rai-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; flex-shrink: 0; }

  /* ══ NEW: HERO ════════════════════════════════════════════════════════════ */
  .rai-hero { text-align: center; padding: 54px 20px 36px; animation: heroReveal 0.8s cubic-bezier(0.4,0,0.2,1) both; }
  .rai-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 2px;
    color: var(--amber); background: rgba(240,165,0,0.08); border: 1px solid rgba(240,165,0,0.2);
    padding: 5px 14px; border-radius: 20px; margin-bottom: 22px;
  }
  .rai-hero-title {
    font-family: var(--ff-head); font-size: clamp(46px,7vw,82px); line-height: 1; letter-spacing: 2px; margin-bottom: 18px;
  }
  .rai-hero-sub {
    font-size: clamp(12px,1.4vw,14px); color: var(--muted); max-width: 500px; margin: 0 auto 36px;
    line-height: 1.9; letter-spacing: 0.3px;
  }
  .rai-hero-stats { display: flex; justify-content: center; gap: 36px; flex-wrap: wrap; }
  .rai-hero-stat { text-align: center; position: relative; animation: statPop 0.5s ease both; }
  .rai-hero-stat-val { font-family: var(--ff-head); font-size: 30px; letter-spacing: 1.5px; line-height: 1; color: var(--amber); }
  .rai-hero-stat-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-top: 5px; }

  /* ══ NEW: BUILDER HERO ════════════════════════════════════════════════════ */
  .rai-builder-hero { padding: 20px 0 4px; animation: fadeDown 0.5s ease both; }
  .rai-builder-hero-title { font-family: var(--ff-head); font-size: clamp(34px,5vw,54px); letter-spacing: 2px; line-height: 1; margin-bottom: 8px; }
  .rai-builder-hero-sub { font-size: 12px; color: var(--muted); line-height: 1.7; letter-spacing: 0.3px; }
  .form-completion-track { height: 2px; background: rgba(240,165,0,0.1); border-radius: 1px; overflow: hidden; margin-top: 12px; }
  .form-completion-fill {
    height: 100%; border-radius: 1px; background: linear-gradient(90deg, var(--amber), var(--amber2));
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 10px rgba(240,165,0,0.4);
  }

  /* ══ NEW: STEP PROGRESS ══════════════════════════════════════════════════ */
  .rai-steps-bar {
    display: flex; align-items: center; gap: 0;
    padding: 14px 24px; background: var(--s1); border: 1px solid rgba(240,165,0,0.1);
    border-radius: 12px; margin-bottom: 20px; animation: fadeUp 0.4s 0.05s ease both;
  }
  .rai-step-node { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
  .rai-step-circle {
    width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: var(--ff-head); font-size: 14px; border: 2px solid; transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .rai-step-circle.done  { background: var(--green); border-color: var(--green); color: #07080d; box-shadow: 0 0 14px rgba(0,232,150,0.4); }
  .rai-step-circle.active { background: rgba(240,165,0,0.1); border-color: var(--amber); color: var(--amber); animation: borderPulse 2s infinite; }
  .rai-step-circle.idle  { background: transparent; border-color: rgba(240,165,0,0.15); color: var(--muted); }
  .rai-step-label { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap; transition: color 0.3s; }
  .rai-step-connector { flex: 1; height: 2px; background: rgba(240,165,0,0.1); border-radius: 1px; overflow: hidden; margin: 0 8px 18px; }
  .rai-step-connector-fill { height: 100%; border-radius: 1px; background: linear-gradient(90deg, var(--green), rgba(0,232,150,0.6)); transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }

  /* ══ NEW: HOW IT WORKS ═══════════════════════════════════════════════════ */
  .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; animation: fadeUp 0.5s 0.1s ease both; }
  @media (max-width: 768px) { .how-grid { grid-template-columns: 1fr; } }
  .how-step-card {
    background: var(--s1); border: 1px solid rgba(240,165,0,0.1); border-radius: 12px; padding: 22px 20px;
    text-align: center; position: relative; overflow: hidden; transition: all 0.35s ease;
  }
  .how-step-card:hover { border-color: rgba(240,165,0,0.3); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 24px rgba(240,165,0,0.06); }
  .how-step-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(240,165,0,0.3),transparent); opacity:0; transition:opacity 0.4s; }
  .how-step-card:hover::before { opacity:1; }
  .how-step-bg-num {
    font-family: var(--ff-head); font-size: 64px; line-height: 1; color: rgba(240,165,0,0.06);
    position: absolute; top: 6px; right: 10px; letter-spacing: 1px; pointer-events: none;
  }
  .how-step-icon { font-size: 30px; margin-bottom: 12px; display: block; }
  .how-step-title { font-family: var(--ff-head); font-size: 17px; letter-spacing: 1.5px; color: var(--amber); margin-bottom: 8px; }
  .how-step-desc { font-size: 11px; color: var(--muted); line-height: 1.75; letter-spacing: 0.3px; }

  /* ══ NEW: FOOTER ═════════════════════════════════════════════════════════ */
  .rai-footer {
    border-top: 1px solid rgba(240,165,0,0.1); background: rgba(7,8,13,0.9);
    padding: 52px 28px 28px; margin-top: 80px; position: relative;
  }
  .rai-footer::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(240,165,0,0.3), transparent);
  }
  .rai-footer-inner { max-width: 1100px; margin: 0 auto; }
  .rai-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 36px; }
  @media (max-width: 768px) { .rai-footer-grid { grid-template-columns: 1fr; gap: 28px; } }
  .rai-footer-brand { font-family: var(--ff-head); font-size: 26px; letter-spacing: 2px; color: var(--amber); margin-bottom: 12px; }
  .rai-footer-desc { font-size: 11px; color: var(--muted); line-height: 1.85; max-width: 280px; }
  .rai-footer-col-title {
    font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted);
    margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(240,165,0,0.08);
  }
  .rai-footer-link { font-size: 11px; color: var(--muted); display: block; margin-bottom: 9px; cursor: pointer; transition: color 0.2s; text-decoration: none; letter-spacing: 0.3px; }
  .rai-footer-link:hover { color: var(--amber); }
  .rai-footer-status { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .rai-footer-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex-shrink: 0; animation: pulse 2s infinite; }
  .rai-footer-bottom {
    padding-top: 20px; border-top: 1px solid rgba(240,165,0,0.07);
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
  }
  .rai-footer-copy { font-size: 10px; color: rgba(74,96,112,0.7); letter-spacing: 0.5px; }
  .rai-footer-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .rai-footer-pill {
    font-size: 9px; letter-spacing: 1.5px; color: rgba(74,96,112,0.55);
    border: 1px solid rgba(240,165,0,0.07); padding: 3px 10px; border-radius: 20px;
  }

  /* ══ NEW: SCROLL-TOP BTN ═════════════════════════════════════════════════ */
  .scroll-top-btn {
    position: fixed; bottom: 28px; right: 28px; width: 40px; height: 40px; border-radius: 50%;
    background: rgba(240,165,0,0.1); border: 1px solid rgba(240,165,0,0.28); color: var(--amber);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    font-size: 16px; z-index: 199; transition: all 0.3s ease; backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .scroll-top-btn:hover { background: rgba(240,165,0,0.2); box-shadow: 0 0 20px rgba(240,165,0,0.3); transform: translateY(-2px); }

  /* ══ MOBILE OVERRIDES ════════════════════════════════════════════════════ */
  @media (max-width: 640px) {
    .rai-navbar-tabs { display: none; }
    .rai-hero-stats { gap: 20px; }
    .rai-live-badge { display: none; }
    .analysis-layout { grid-template-columns: 1fr; }
  }
`;

const StyleTag = () => <style>{STYLES}</style>;

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
const ParticleCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number, pts: any[], raf: number;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    const init = () => {
      pts = Array.from({ length: 60 }, () => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5, a: Math.random()
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,165,0,${p.a * 0.5})`; ctx.fill();
      });
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(240,165,0,${0.06 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.6 }} />;
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }: any) => {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 3000);
    const t2 = setTimeout(onClose, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);
  const colors: any = { success: 'var(--green)', error: 'var(--red)', info: 'var(--cyan)' };
  const icons: any = { success: '✓', error: '✕', info: 'ℹ' };
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', border: `1px solid ${colors[type]}`, borderRadius: 12, padding: '14px 20px', animation: leaving ? 'toastOut 0.4s ease both' : 'toastIn 0.4s ease both', boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 20px ${colors[type]}33`, maxWidth: 340, fontFamily: 'var(--ff-body)', fontSize: 13, color: 'var(--text)' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: colors[type], color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

// ─── GLITCH LOGO ─────────────────────────────────────────────────────────────
/*const GlitchLogo = () => (
  <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 64, lineHeight: 1, letterSpacing: 3, color: 'var(--amber)', position: 'relative' }}>
    <span className="glitch-wrap" data-text="RESUME">RESUME</span>
    <span style={{ color: 'var(--text)', marginLeft: 6 }}>.AI</span>
  </h1>
);*/

// ─── TRUST BAR ───────────────────────────────────────────────────────────────
const TRUST_STATS = [
  { icon: '⚡', val: '50,000+', label: 'Resumes Analyzed' },
  { icon: '🎯', val: '94%', label: 'ATS Pass Rate' },
  { icon: '🏢', val: 'FAANG', label: 'Placements Tracked' },
  { icon: '⭐', val: '4.9 / 5', label: 'User Rating' },
  { icon: '🔒', val: '100%', label: 'Data Private' },
  { icon: '🚀', val: '<30s', label: 'Analysis Time' },
  { icon: '📊', val: '8-Axis', label: 'Scoring Rubric' },
  { icon: '✅', val: 'Free', label: 'No Sign-Up' },
];
const TrustBar = () => (
  <div style={{ overflow: 'hidden', background: 'rgba(240,165,0,0.03)', borderTop: '1px solid rgba(240,165,0,0.07)', borderBottom: '1px solid rgba(240,165,0,0.07)', padding: '8px 0', marginBottom: 28 }}>
    <div style={{ display: 'flex' }}>
      <div className="trust-ticker">
        {[...TRUST_STATS, ...TRUST_STATS].map((s, i) => (
          <div className="trust-stat" key={i}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--ff-head)', fontSize: 16, color: 'var(--amber)', letterSpacing: 1 }}>{s.val}</span>
            <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.label}</span>
            <span style={{ color: 'var(--border)', marginLeft: 20 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── FEATURES ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🧠', title: 'Neural ATS Engine', desc: 'Mirrors Workday, Taleo & Greenhouse scoring logic with an 8-dimension rubric.' },
  { icon: '🎯', title: 'Pinpoint Feedback', desc: 'Pros & cons reference your exact lines — not generic advice.' },
  { icon: '⚡', title: 'STAR-Method Bullets', desc: 'Every experience entry rewritten with power verbs and quantified results.' },
  { icon: '🔑', title: 'Keyword Gap Analysis', desc: 'Flags missing ATS keywords before recruiters even see your resume.' },
  { icon: '📄', title: 'Instant Preview', desc: 'See your final resume rendered in recruiter-ready format, ready to copy.' },
  { icon: '🛡️', title: '100% Private', desc: 'Your data is never stored. Every scan is ephemeral and encrypted.' },
];
const FeatureHighlights = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, animation: 'fadeUp 0.6s 0.3s ease both' }}>
    {FEATURES.map((f, i) => (
      <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 16, letterSpacing: 1.5, color: 'var(--amber2)', marginBottom: 6 }}>{f.title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.7, letterSpacing: 0.5 }}>{f.desc}</div>
      </div>
    ))}
  </div>
);

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya S.', role: 'SWE @ Google', score: 96, text: 'Went from 12% callback rate to 3 offers in one month. The keyword gap analysis was a game-changer.' },
  { name: 'Marcus T.', role: 'PM @ Meta', score: 91, text: 'The STAR rewrites saved me 6 hours. My ATS score jumped from 54 to 91 in one session.' },
  { name: 'Aisha K.', role: 'Data Analyst @ McKinsey', score: 88, text: 'Pinpoint cons — it literally quoted my weak bullet and showed me exactly how to fix it.' },
];
const Testimonials = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.5s ease both' }}>
    {TESTIMONIALS.map((t, i) => (
      <div className="testimonial-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--ff-head)', fontSize: 15, color: 'var(--text)', letterSpacing: 1 }}>{t.name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, marginTop: 2 }}>{t.role}</div>
          </div>
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 22, color: 'var(--green)', textShadow: '0 0 16px rgba(0,232,150,0.4)' }}>{t.score}</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8, fontStyle: 'italic' }}>"{t.text}"</div>
        <div style={{ display: 'flex', gap: 2, marginTop: 10 }}>
          {[...Array(5)].map((_, si) => <span key={si} style={{ color: 'var(--amber)', fontSize: 10 }}>★</span>)}
        </div>
      </div>
    ))}
  </div>
);

// ─── NEURAL LOADER ───────────────────────────────────────────────────────────
const STEPS = ['PARSING PDF LAYERS', 'EXTRACTING TOKENS', 'SCORING TECH STACK', 'ANALYZING METRICS', 'CALIBRATING ATS', 'FINALIZING REPORT'];
const LOADER_TIPS = [
  '💡 ATS systems reject 75% of resumes before human review.',
  '🎯 Resumes with metrics get 40% more callbacks.',
  '⚡ Top recruiters spend just 6 seconds on a first scan.',
  '🔑 Job-specific keywords increase shortlist rate by 60%.',
  '📏 Two-page limit applies only after 5+ years experience.',
  '✅ STAR-method bullets outperform duty lists by 3x.',
];

const NeuralLoader = ({ label = 'AGILE ITERATION: SPRINT 1' }) => {
  const [step, setStep] = useState(0); const [pct, setPct] = useState(0); const [tip, setTip] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % STEPS.length), 800); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setPct(p => p >= 95 ? 95 : p + Math.random() * 3), 200); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setTip(s => (s + 1) % LOADER_TIPS.length), 3500); return () => clearInterval(t); }, []);

  return (
    <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg viewBox="0 0 120 120" width={120} height={120} style={{ position: 'absolute', inset: 0 }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(240,165,0,0.08)" strokeWidth="4" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" strokeDasharray="80 260" className="ring-spin-outer" />
        </svg>
        <svg viewBox="0 0 120 120" width={96} height={96} style={{ position: 'absolute', top: 12, left: 12 }}>
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="3" />
          <circle cx="48" cy="48" r="40" fill="none" stroke="var(--cyan)" strokeWidth="3" strokeLinecap="round" strokeDasharray="50 201" className="ring-spin-inner" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-head)', fontSize: 22, color: 'var(--amber)', letterSpacing: 1 }}>{Math.round(pct)}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div key={step} style={{ fontFamily: 'var(--ff-head)', fontSize: 18, color: 'var(--amber)', letterSpacing: 3, animation: 'fadeDown 0.4s ease' }}>{STEPS[step]}</div>
        <div style={{ fontSize: 11, color: 'var(--cyan)', letterSpacing: 2, marginTop: 8, animation: 'pulse 2s infinite' }}>{label}</div>
      </div>
      <div style={{ width: '100%', maxWidth: 320, height: 3, background: 'var(--s2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--amber), var(--amber2))', width: `${pct}%`, borderRadius: 2, transition: 'width 0.2s ease', boxShadow: '0 0 10px var(--amber)' }} />
      </div>
      <div key={tip} style={{ maxWidth: 340, textAlign: 'center', fontSize: 11, color: 'var(--muted)', lineHeight: 1.8, padding: '10px 16px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 10, animation: 'tipSlide 0.5s ease both', letterSpacing: 0.5 }}>
        {LOADER_TIPS[tip]}
      </div>
    </div>
  );
};

// ─── UPLOAD ZONE ─────────────────────────────────────────────────────────────
const UploadZone = ({ file, onFile }: any) => {
  const inputRef = useRef<HTMLInputElement>(null); const [drag, setDrag] = useState(false); const [scanning, setScanning] = useState(false);
  const handle = useCallback((raw: any) => {
    const f = raw?.dataTransfer?.files?.[0] || raw?.target?.files?.[0];
    if (!f || f.type !== 'application/pdf') return;
    setScanning(true); setTimeout(() => { setScanning(false); onFile(f); }, 1200);
  }, [onFile]);

  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handle(e); }} onClick={() => inputRef.current?.click()} className="scan-parent" style={{ border: `2px dashed ${drag ? 'var(--amber)' : file ? 'rgba(0,232,150,0.4)' : 'var(--border)'}`, borderRadius: 16, padding: '52px 32px', textAlign: 'center', cursor: 'pointer', position: 'relative', background: drag ? 'rgba(240,165,0,0.04)' : file ? 'rgba(0,232,150,0.03)' : 'var(--s1)', transition: 'all 0.4s', transform: drag ? 'scale(1.01)' : 'scale(1)', boxShadow: drag ? '0 0 40px rgba(240,165,0,0.12)' : 'none' }}>
      <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handle} />
      {scanning ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'fadeIn 0.3s' }}>
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <svg viewBox="0 0 64 64" width={64} height={64} style={{ position: 'absolute', inset: 0 }}>
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(240,165,0,0.2)" strokeWidth="2" />
              <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(240,165,0,0.15)" strokeWidth="1" />
              <line x1="32" y1="32" x2="32" y2="4" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: '32px 32px', animation: 'radarSpin 1s linear infinite' }} />
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 18, letterSpacing: 3, color: 'var(--amber)', animation: 'pulse 1s infinite' }}>PARSING FILE</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', animation: drag ? 'nodeFloat 0.6s ease-in-out infinite' : 'nodeFloat 3s ease-in-out infinite', filter: file ? 'drop-shadow(0 0 12px var(--green))' : drag ? 'drop-shadow(0 0 12px var(--amber))' : 'none' }}>{file ? '✅' : drag ? '📥' : '📄'}</div>
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 22, letterSpacing: 2, color: file ? 'var(--green)' : drag ? 'var(--amber)' : 'var(--text)', marginBottom: 8 }}>{file ? file.name : drag ? 'RELEASE TO UPLOAD' : 'DROP PDF / CLICK TO BROWSE'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2 }}>{file ? `${(file.size / 1024).toFixed(1)} KB · PDF LOADED` : 'PDF · MAX 5MB'}</div>
          {!file && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
              {['ATS-Scored', '8-Dimension Rubric', 'Instant Results', 'No Sign-Up'].map((b, i) => (
                <span key={i} style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, padding: '3px 10px', border: '1px solid rgba(240,165,0,0.1)', borderRadius: 20 }}>{b}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── SCORE RING ──────────────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
  const [display, setDisplay] = useState(0); const [filled, setFilled] = useState(0); const R = 54, C = 2 * Math.PI * R;
  useEffect(() => {
    let frame: number, start: number | null = null, dur = 1800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * ease)); setFilled(C - C * score / 100 * ease);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [score, C]);
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  const label = score >= 75 ? 'STRONG' : score >= 50 ? 'AVERAGE' : 'WEAK';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'popIn 0.6s ease' }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg viewBox="0 0 140 140" width={140} height={140} style={{ position: 'absolute', inset: 0 }}>
          <circle cx="70" cy="70" r="62" fill="none" stroke="var(--s2)" strokeWidth="8" />
          <circle cx="70" cy="70" r="62" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={filled} style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 0.1s' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 38, lineHeight: 1, color, textShadow: `0 0 20px ${color}`, animation: 'countUp 0.4s ease' }}>{display}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginTop: 3 }}>/ 100</div>
        </div>
      </div>
      <div className="rai-tag" style={{ borderColor: color, color, background: `${color}18` }}>{label}</div>
    </div>
  );
};

// ─── INFO CARD ───────────────────────────────────────────────────────────────
const InfoCard = ({ title, items, accent, delay = 0 }: any) => (
  <div className="rai-card scan-parent" style={{ animation: `fadeUp 0.5s ${delay}s ease both`, borderLeft: `3px solid ${accent}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0, boxShadow: `0 0 10px ${accent}`, animation: 'pulse 2s infinite' }} />
      <span style={{ letterSpacing: 2.5, color: accent, fontFamily: 'var(--ff-head)', fontSize: 14 }}>{title} </span>    </div>
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item: string, i: number) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, animation: `slideL 0.4s ${delay + i * 0.07}s ease both`, opacity: 0, animationFillMode: 'both' }}>
          <span style={{ color: accent, flexShrink: 0, marginTop: 2 }}>›</span><span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ─── SCORE BREAKDOWN ─────────────────────────────────────────────────────────
const DIM_LABELS: Record<string, string> = {
  keyword_optimization: 'Keyword Optimization',
  quantified_impact: 'Quantified Impact',
  format_parseability: 'Format & Parseability',
  contact_completeness: 'Contact Completeness',
  work_experience_structure: 'Work Experience',
  summary_quality: 'Summary Quality',
  education_certifications: 'Education & Certs',
  length_relevance: 'Length & Relevance',
};
const ScoreBreakdown = ({ breakdown }: { breakdown: Record<string, any> }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);
  if (!breakdown) return null;
  return (
    <div className="rai-card" style={{ animation: 'fadeUp 0.5s 0.1s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 10px var(--amber)', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: 'var(--ff-head)', fontSize: 16, letterSpacing: 2, color: 'var(--amber)' }}>SCORE BREAKDOWN</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>8-DIMENSION RUBRIC</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(breakdown).map(([key, val]: any, i) => {
          const pct = Math.round((val.score / val.max) * 100);
          const color = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
          return (
            <div key={key} className="dim-row" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'var(--text)', letterSpacing: 0.5 }}>{DIM_LABELS[key] || key}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--ff-head)', color, letterSpacing: 1 }}>{val.score}<span style={{ color: 'var(--muted)' }}>/{val.max}</span></span>
              </div>
              <div style={{ height: 6, background: 'var(--s2)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                {visible && (
                  <div className="score-bar-fill" style={{ '--target-w': `${pct}%`, width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, animationDelay: `${i * 0.08}s`, boxShadow: `0 0 8px ${color}55` } as any} />
                )}
              </div>
              {val.note && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>{val.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── PRIORITY SUGGESTIONS ────────────────────────────────────────────────────
const PrioritySuggestions = ({ suggestions }: { suggestions: any[] }) => {
  if (!suggestions?.length) return null;
  const isObjectFormat = typeof suggestions[0] === 'object';
  if (!isObjectFormat) return <InfoCard title="IMPROVEMENT ROADMAP" items={suggestions} accent="var(--cyan)" delay={0.16} />;

  const sorted = [...suggestions].sort((a, b) => {
    const order: any = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  return (
    <div className="rai-card scan-parent" style={{ animation: 'fadeUp 0.5s 0.24s ease both', borderLeft: '3px solid var(--cyan)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: 'var(--ff-head)', fontSize: 14, letterSpacing: 2.5, color: 'var(--cyan)' }}>IMPROVEMENT ROADMAP</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((s: any, i: number) => (
          <div key={i} style={{ background: 'var(--s2)', borderRadius: 10, padding: '14px 16px', animation: `slideL 0.4s ${i * 0.07}s ease both`, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span className={`rai-tag prio-${s.priority}`} style={{ borderRadius: 6, fontSize: 9 }}>{s.priority}</span>
              {s.category && <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.category}</span>}
            </div>
            {s.issue && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8, lineHeight: 1.6 }}>⚠ {s.issue}</div>}
            {s.fix && (
              <div style={{ fontSize: 12, color: 'var(--green)', lineHeight: 1.7, padding: '8px 12px', background: 'rgba(0,232,150,0.05)', borderRadius: 8, border: '1px solid rgba(0,232,150,0.1)' }}>
                <span style={{ opacity: 0.6, marginRight: 6 }}>✓ FIX:</span>{s.fix}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MISSING KEYWORDS ────────────────────────────────────────────────────────
const MissingKeywords = ({ keywords }: { keywords: string[] }) => {
  if (!keywords?.length) return null;
  return (
    <div className="rai-card" style={{ animation: 'fadeUp 0.5s 0.32s ease both', borderLeft: '3px solid var(--red)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 10px var(--red)', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: 'var(--ff-head)', fontSize: 14, letterSpacing: 2.5, color: 'var(--red)' }}>MISSING ATS KEYWORDS</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>ADD THESE TO PASS FILTERS</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {keywords.map((kw, i) => (
          <span key={i} className="kw-chip" style={{ animationDelay: `${i * 0.05}s` }}>
            <span style={{ fontSize: 8 }}>✕</span>{kw}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── RECRUITER IMPRESSION ────────────────────────────────────────────────────
const RecruiterImpression = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="rai-card" style={{ animation: 'fadeUp 0.5s 0.4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>👔</span>
        <span style={{ fontFamily: 'var(--ff-head)', fontSize: 14, letterSpacing: 2.5, color: 'var(--amber)' }}>RECRUITER FIRST IMPRESSION</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--muted)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20, letterSpacing: 1 }}>6-SECOND SCAN</span>
      </div>
      <div className="recruiter-quote">{text}</div>
    </div>
  );
};

// ─── COVER LETTER HOOK ───────────────────────────────────────────────────────
/*const CoverLetterHook = ({ hook }: { hook: string }) => {
  const [copied, setCopied] = useState(false);
  if (!hook) return null;
  const copy = async () => { await navigator.clipboard.writeText(hook); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="cover-hook-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>✍️</span>
        <span style={{ fontFamily: 'var(--ff-head)', fontSize: 14, letterSpacing: 2.5, color: 'var(--amber2)' }}>COVER LETTER OPENING</span>
        <button onClick={copy} style={{ marginLeft: 'auto', background: copied ? 'rgba(0,232,150,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(0,232,150,0.4)' : 'var(--border)'}`, color: copied ? 'var(--green)' : 'var(--muted)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--ff-body)', fontSize: 10, letterSpacing: 1, transition: 'all 0.3s' }}>{copied ? '✓ COPIED' : '⎘ COPY'}</button>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic' }}>{hook}</div>
    </div>
  );
};*/

// ─── ATS IMPROVEMENTS ────────────────────────────────────────────────────────
/*const ATSImprovements = ({ improvements }: { improvements: string[] }) => {
  if (!improvements?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeUp 0.5s 0.2s ease both' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />ATS OPTIMIZATIONS APPLIED
      </div>
      {improvements.map((item, i) => (
        <div key={i} className="improvement-item" style={{ animationDelay: `${i * 0.07}s` }}>
          <span style={{ color: 'var(--green)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
          <span style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.7 }}>{item}</span>
        </div>
      ))}
    </div>
  );
};*/

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    x: Math.random() * 100, delay: Math.random() * 0.8, color: ['var(--amber)', 'var(--cyan)', 'var(--green)', 'var(--amber2)'][i % 4]
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: 0, width: 8, height: 8, borderRadius: 2, background: p.color, animation: `confettiFall 2.5s ${p.delay}s ease-in forwards`, opacity: 0.9 }} />
      ))}
    </div>
  );
};

// ─── ANALYSIS RESULT ─────────────────────────────────────────────────────────
const AnalysisResult = ({ data, file, onReset }: any) => {
  const score = parseInt(data.ats_score) || 0;
  const [showConfetti, setShowConfetti] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (score >= 80) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
  }, [score]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const prosItems = Array.isArray(data.pros) ? data.pros : [];
  const consItems = Array.isArray(data.cons) ? data.cons : [];

  return (
    <div className="analysis-layout" style={{ animation: 'fadeIn 0.5s ease' }}>
      <Confetti active={showConfetti} />
      <div style={{ position: 'sticky', top: 76 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>📄</span>
          <span style={{ fontFamily: 'var(--ff-head)', fontSize: 16, letterSpacing: 2, color: 'var(--amber)' }}>LIVE RESUME PREVIEW</span>
        </div>
        {pdfUrl ? (
          <iframe src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`} className="pdf-preview-frame" title="Resume Preview" />
        ) : (
          <div className="pdf-preview-frame" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Preview not available</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Result banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 16, background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(240,165,0,0.4), transparent)' }} />
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, marginBottom: 6 }}>ANALYSIS COMPLETE</div>
            <div style={{ fontFamily: 'var(--ff-head)', fontSize: 30, color: 'var(--text)', letterSpacing: 2 }}>{data.best_domain?.toUpperCase() || 'GENERAL'}</div>
            {score >= 80 && <div style={{ fontSize: 11, color: 'var(--green)', letterSpacing: 1.5, marginTop: 4, animation: 'pulse 2s infinite' }}>🎉 STRONG ATS CANDIDATE</div>}
          </div>
          <ScoreRing score={score} />
        </div>

        {data.score_breakdown && <ScoreBreakdown breakdown={data.score_breakdown} />}
        {data.recruiter_first_impression && <RecruiterImpression text={data.recruiter_first_impression} />}
        <InfoCard title="STRENGTHS" items={prosItems} accent="var(--green)" delay={0} />
        <InfoCard title="WEAKNESSES" items={consItems} accent="var(--red)" delay={0.08} />
        <PrioritySuggestions suggestions={data.suggestions || []} />
        {data.missing_keywords && <MissingKeywords keywords={data.missing_keywords} />}

        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'rgba(240,165,0,0.05)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5 }}>WANT A FIXED RESUME?</span>
            <span style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: 1, cursor: 'pointer' }} onClick={() => window.location.hash = '#build'}>→ TRY THE ARCHITECT TAB</span>
          </div>
          <button className="rai-btn-ghost" onClick={onReset}>← SCAN NEW RESUME</button>
        </div>
      </div>
    </div>
  );
};

// ─── EXP ROW ─────────────────────────────────────────────────────────────────
const ExpRow = ({ exp, idx, onChange, onRemove, showRemove }: any) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: hover ? 'var(--s2)' : 'var(--s1)', border: `1px solid ${hover ? 'var(--borderB)' : 'var(--border)'}`, borderRadius: 12, padding: 18, marginBottom: 12, transition: 'all 0.3s', animation: `fadeUp 0.4s ${idx * 0.06}s ease both`, boxShadow: hover ? '0 0 20px rgba(240,165,0,0.06)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="rai-tag">Entry #{idx + 1}</span>
        {showRemove && (<button onClick={onRemove} style={{ background: 'rgba(255,58,92,0.1)', border: '1px solid rgba(255,58,92,0.2)', color: 'var(--red)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 11, letterSpacing: 1, fontFamily: 'var(--ff-body)', transition: 'all 0.2s' }}>REMOVE ✕</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input className="rai-input" spellCheck={true} placeholder="Job Title *" value={exp.title} onChange={e => onChange('title', e.target.value)} />
        <input className="rai-input" spellCheck={true} placeholder="Company *" value={exp.company} onChange={e => onChange('company', e.target.value)} />
        <input className="rai-input" spellCheck={true} placeholder="Location" value={exp.location} onChange={e => onChange('location', e.target.value)} />
        <input className="rai-input" spellCheck={true} placeholder="Dates (e.g. Jan 2023 – Present)" value={exp.dates} onChange={e => onChange('dates', e.target.value)} />
      </div>
      <textarea className="rai-input" spellCheck={true} autoCorrect="on" placeholder="Description — key achievements, responsibilities, tech stack *" value={exp.description} onChange={e => onChange('description', e.target.value)} />
    </div>
  );
};

// ─── COPY BTN ────────────────────────────────────────────────────────────────
const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const go = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  return (
    <button onClick={go} style={{ width: '100%', padding: '13px', borderRadius: 10, background: copied ? 'var(--green)' : 'var(--s2)', border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`, color: copied ? '#000' : 'var(--text)', fontFamily: 'var(--ff-head)', fontSize: 16, letterSpacing: 2, cursor: 'pointer', transition: 'all 0.4s', boxShadow: copied ? '0 0 24px rgba(0,232,150,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      {copied ? '✓  COPIED TEXT' : '⎘  COPY RAW TEXT'}
    </button>
  );
};

// ─── DOWNLOAD ACTION BTN ─────────────────────────────────────────────────────
const DownloadActionBtn = ({ icon, text, onClick, color }: any) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{ width: '100%', padding: '13px', borderRadius: 10, background: hover ? `${color}11` : 'var(--s2)', border: `1px solid ${hover ? color : 'var(--border)'}`, color: hover ? color : 'var(--text)', fontFamily: 'var(--ff-head)', fontSize: 16, letterSpacing: 2, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: hover ? `0 0 15px ${color}33` : 'none' }}
    >
      <span>{icon}</span> {text}
    </button>
  );
};

// ─── BUILT PREVIEW ───────────────────────────────────────────────────────────
const BuiltPreview = ({ result, form, userType, onReset }: any) => {
  const [scoreAnim, setScoreAnim] = useState(0); const target = parseInt(result.ats_score) || 0;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let frame: number, start: number | null = null, dur = 1400;
    const tick = (ts: number) => {
      if (!start) start = ts; const p = Math.min((ts - start) / dur, 1);
      setScoreAnim(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [target]);
  useEffect(() => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }, []);

  const contactArr = [];
  if (form.email) contactArr.push(`✉️ ${form.email}`);
  if (form.phone) contactArr.push(`📱 ${form.phone}`);
  if (form.location) contactArr.push(`📍 ${form.location}`);
  if (form.linkedin) contactArr.push(`🔗 ${form.linkedin}`);
  const formattedContact = contactArr.join('  ·  ');

  const experienceText = form.experience.map((exp: any, i: number) => {
    const bullets = (result.optimized_experience[i] || []).map((b: string) => `• ${b}`).join('\n');
    return `${exp.title} | ${exp.company} (${exp.dates})\n${bullets}`;
  }).join('\n\n');

  const rawText = `${form.name.toUpperCase()}\n${formattedContact}\n\nSUMMARY\n${result.summary}\n\n${userType === 'fresher' ? 'PROJECTS' : 'EXPERIENCE'}\n${experienceText}${form.skills ? `\n\nSKILLS\n${form.skills}` : ''}${form.education ? `\n\nEDUCATION\n${form.education}` : ''}`;

  const getResumeHTML = () => `
    <!DOCTYPE html><html>
    <head>
      <meta charset="utf-8">
      <title>${form.name.replace(/\s+/g, '_')}_Resume</title>
      <style>
        @page { margin: 0.5in; }
        body { font-family: Georgia, serif; color: #1a1a1a; padding: 20px; margin: 0; background: #fff; line-height: 1.6; }
        h2 { text-align: center; font-size: 22pt; font-weight: 700; letter-spacing: 3px; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 6px; text-transform: uppercase; }
        .contact { text-align: center; font-size: 11pt; color: #666; margin: 8px 0 0 0; letter-spacing: 0.5px; }
        h4 { font-size: 11pt; color: #888; letter-spacing: 2px; margin-top: 24px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; }
        p { font-size: 12pt; line-height: 1.8; color: #333; margin: 0; }
        .exp-item { margin-bottom: 18px; page-break-inside: avoid; }
        .exp-head { display: flex; justify-content: space-between; font-weight: bold; font-size: 12pt; color: #1a1a1a; margin-bottom: 4px; }
        ul { padding-left: 18px; margin: 5px 0 0 0; }
        li { font-size: 12pt; line-height: 1.7; margin-bottom: 4px; color: #333; }
      </style>
    </head>
    <body>
      <h2>${form.name}</h2>
      ${formattedContact ? `<p class="contact">${formattedContact.replace(/  ·  /g, ' &middot; ')}</p>` : ''}
      <h4>PROFESSIONAL SUMMARY</h4>
      <p>${result.summary}</p>
      ${form.skills ? `<h4>SKILLS</h4><p>${result.formatted_skills || form.skills}</p>` : ''}
      <h4>${userType === 'fresher' ? 'PROJECTS' : 'RELEVANT EXPERIENCE'}</h4>
      ${form.experience.map((exp: any, i: number) => `
        <div class="exp-item">
          <div class="exp-head"><span>${exp.title.toUpperCase()} | ${exp.company.toUpperCase()}</span><span>${exp.dates}</span></div>
          <ul>${(result.optimized_experience[i] || []).map((b: string) => `<li>${b}</li>`).join('')}</ul>
        </div>`).join('')}
      ${form.education ? `<h4>EDUCATION</h4><p>${form.education}</p>` : ''}
    </body></html>`;

  const downloadDOC = () => {
    const blob = new Blob(['\ufeff', getResumeHTML()], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form.name.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open(); doc.write(getResumeHTML()); doc.close();
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); }, 500);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <Confetti active={showConfetti} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 20, animation: 'fadeDown 0.5s ease', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,232,150,0.4), transparent)' }} />
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 56, lineHeight: 1, color: 'var(--green)', textShadow: '0 0 30px rgba(0,232,150,0.4)', animation: 'scoreGlow 3s ease infinite' }}>{scoreAnim}</div>
        <div>
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 18, letterSpacing: 2, color: 'var(--green)' }}>ATS SCORE</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>Engineered for recruiter parsers & maximum visibility.</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {['Workday', 'Taleo', 'Greenhouse'].map(s => (
              <span key={s} style={{ fontSize: 9, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', letterSpacing: 1 }}>✓ {s}</span>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240 }}>
          <DownloadActionBtn icon="📄" text="DOWNLOAD PDF" color="var(--amber)" onClick={downloadPDF} />
          <DownloadActionBtn icon="📝" text="DOWNLOAD DOC" color="var(--cyan)" onClick={downloadDOC} />
          <CopyBtn text={rawText} />
        </div>
      </div>

      <div style={{ background: '#fff', color: '#1a1a1a', padding: '52px 48px', borderRadius: 12, fontFamily: 'Georgia, serif', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'fadeUp 0.6s 0.1s ease both' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: 3, borderBottom: '2px solid #1a1a1a', paddingBottom: 12, marginBottom: 6 }}>{form.name.toUpperCase()}</h2>
        {formattedContact && <p style={{ textAlign: 'center', fontSize: 11, color: '#666', margin: '8px 0 0 0', letterSpacing: 0.5 }}>{formattedContact}</p>}
        <h4 style={{ fontSize: 11, color: '#888', letterSpacing: 2, marginTop: 24, borderBottom: '1px solid #eee', paddingBottom: 6, marginBottom: 8, textTransform: 'uppercase' }}>PROFESSIONAL SUMMARY</h4>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: '#333' }}>{result.summary}</p>
        {form.skills && <><h4 style={{ fontSize: 11, color: '#888', letterSpacing: 2, marginTop: 22, borderBottom: '1px solid #eee', paddingBottom: 6, marginBottom: 8, textTransform: 'uppercase' }}>SKILLS</h4><p style={{ fontSize: 13, color: '#333' }}>{result.formatted_skills || form.skills}</p></>}
        <h4 style={{ fontSize: 11, color: '#888', letterSpacing: 2, marginTop: 22, borderBottom: '1px solid #eee', paddingBottom: 6, marginBottom: 8, textTransform: 'uppercase' }}>{userType === 'fresher' ? 'PROJECTS' : 'RELEVANT EXPERIENCE'}</h4>
        {form.experience.map((exp: any, i: number) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>
              <span>{exp.title.toUpperCase()} | {exp.company.toUpperCase()}</span><span>{exp.dates}</span>
            </div>
            <ul style={{ paddingLeft: 18, margin: '5px 0 0 0' }}>
              {(result.optimized_experience[i] || []).map((b: string, bi: number) => (
                <li key={bi} style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 4, color: '#333' }}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
        {form.education && <><h4 style={{ fontSize: 11, color: '#888', letterSpacing: 2, marginTop: 22, borderBottom: '1px solid #eee', paddingBottom: 6, marginBottom: 8, textTransform: 'uppercase' }}>EDUCATION</h4><p style={{ fontSize: 13, color: '#333' }}>{form.education}</p></>}
      </div>

      <div className="insights-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{ fontFamily: 'var(--ff-head)', fontSize: 18, letterSpacing: 2, color: 'var(--cyan)' }}>AI INSIGHTS & AGILE ITERATIONS</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16, lineHeight: 1.6 }}>
          The following micro-optimizations were applied to your raw input to guarantee high ATS parseability without compromising factual accuracy.
        </p>
        {result.ats_improvements?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.ats_improvements.map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--cyan)', marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>No major structural changes were required. Your input format is strictly preserved.</div>
        )}
      </div>

      <div style={{ marginTop: 20 }}><button className="rai-btn-ghost" onClick={onReset}>← BUILD ANOTHER</button></div>
    </div>
  );
};

// ─── SECTION / FIELD ─────────────────────────────────────────────────────────
const Section = ({ num, title, children }: any) => (
  <div className="rai-card scan-parent" style={{ animation: 'fadeUp 0.4s ease both' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(240,165,0,0.1)', border: '1px solid var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-head)', fontSize: 13, color: 'var(--amber)', letterSpacing: 1 }}>{num}</div>
      <div style={{ fontFamily: 'var(--ff-head)', fontSize: 20, letterSpacing: 2 }}>{title.toUpperCase()}</div>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: any) => (
  <div>
    <label style={{ display: 'block', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>{label}</label>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ✨ NEW COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── SCROLL HOOK ─────────────────────────────────────────────────────────────
const useScrolled = (threshold = 30) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [threshold]);
  return scrolled;
};

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const Navbar = ({ tab, onTabChange, scrolled }: { tab: string; onTabChange: (t: string) => void; scrolled: boolean }) => (
  <nav className={`rai-navbar${scrolled ? ' scrolled' : ''}`}>
    {/* Logo */}
    <div className="rai-navbar-logo" onClick={() => { onTabChange('analyze'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
      <span style={{ color: 'var(--amber)' }}>RESUME</span>
      <span style={{ color: 'var(--text)' }}>.</span>
      <span style={{ color: 'var(--cyan)' }}>AI</span>
      <span className="rai-navbar-ver">v3</span>
    </div>

    {/* Spacer */}
    <div style={{ flex: 1 }} />

    {/* Tab switcher */}
    <div className="rai-navbar-tabs">
      {[['analyze', '⬡  SCANNER'], ['build', '◈  ARCHITECT']].map(([id, label]) => (
        <button key={id} onClick={() => onTabChange(id)} className={`rai-navbar-tab${tab === id ? ' active' : ' idle'}`}>
          {label}
        </button>
      ))}
    </div>

    {/* Live badge */}
    <div className="rai-live-badge">
      <span className="rai-live-dot" />
      LIVE
    </div>
  </nav>
);

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
const HeroSection = () => (
  <div className="rai-hero">
    {/* Eyebrow badge */}
    <div className="rai-hero-eyebrow" style={{ animationDelay: '0s' }}>
      ⚡ 8-DIMENSION ATS ENGINE &nbsp;·&nbsp; <span style={{ color: 'var(--green)' }}>FREE</span> &nbsp;·&nbsp; NO SIGN-UP
    </div>

    {/* Main title */}
    <div className="rai-hero-title">
      <span className="glitch-wrap" data-text="BEAT THE">BEAT THE</span>
      <br />
      <span className="shimmer-txt">ATS FILTER</span>
    </div>

    {/* Subtitle */}
    <p className="rai-hero-sub">
      Upload your resume. Our engine scores it across 8 dimensions, flags keyword gaps, and
      delivers recruiter-grade feedback in under 30 seconds — for free.
    </p>

    {/* Stats row */}
    <div className="rai-hero-stats">
      {[
        { val: '50K+', label: 'Resumes Scanned', delay: '0.1s' },
        { val: '94%', label: 'ATS Pass Rate', delay: '0.2s' },
        { val: '<30s', label: 'Analysis Time', delay: '0.3s' },
        { val: 'Free', label: 'No Sign-Up', delay: '0.4s' },
      ].map(({ val, label, delay }) => (
        <div key={label} className="rai-hero-stat" style={{ animationDelay: delay }}>
          <div className="rai-hero-stat-val">{val}</div>
          <div className="rai-hero-stat-label">{label}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── BUILDER HERO ─────────────────────────────────────────────────────────────
const BuilderHero = ({ completionPct }: { completionPct: number }) => (
  <div className="rai-builder-hero">
    <div className="rai-builder-hero-title">
      <span className="shimmer-txt">RESUME</span>
      <span style={{ color: 'var(--text)' }}> ARCHITECT</span>
    </div>
    <div className="rai-builder-hero-sub">
      Fill in your details below. The AI rewrites every bullet using the STAR method, embeds
      role-specific keywords, and targets an ATS score of 85–98.
    </div>
    {/* Completion bar */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
      <div style={{ flex: 1 }}>
        <div className="form-completion-track">
          <div className="form-completion-fill" style={{ width: `${completionPct}%` }} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--ff-head)', fontSize: 13, color: completionPct === 100 ? 'var(--green)' : 'var(--muted)', letterSpacing: 1, flexShrink: 0 }}>
        {completionPct}% COMPLETE
      </div>
    </div>
  </div>
);

// ─── STEP PROGRESS ────────────────────────────────────────────────────────────
const StepProgress = ({ steps, completedCount }: { steps: string[]; completedCount: number }) => (
  <div className="rai-steps-bar">
    {steps.map((label, i) => {
      const done = i < completedCount;
      const active = i === completedCount;
      const cls = done ? 'done' : active ? 'active' : 'idle';
      const labelColor = done ? 'var(--green)' : active ? 'var(--amber)' : 'var(--muted)';
      return (
        <React.Fragment key={i}>
          <div className="rai-step-node">
            <div className={`rai-step-circle ${cls}`}>
              {done ? '✓' : i + 1}
            </div>
            <div className="rai-step-label" style={{ color: labelColor }}>{label}</div>
          </div>
          {i < steps.length - 1 && (
            <div className="rai-step-connector">
              <div className="rai-step-connector-fill" style={{ width: done ? '100%' : '0%' }} />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
const HowItWorks = () => (
  <div>
    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
      HOW IT WORKS
    </div>
    <div className="how-grid">
      {[
        { n: '01', icon: '📤', title: 'Upload Resume', desc: 'Drag-and-drop your PDF or click to browse. Supports any standard resume format.' },
        { n: '02', icon: '⚙️', title: 'AI Audit', desc: 'Our 8-dimension engine parses keywords, impact, formatting, and structure in seconds.' },
        { n: '03', icon: '🚀', title: 'Get Hired', desc: 'Receive your score, prioritized fixes, and missing keywords — then apply with confidence.' },
      ].map(({ n, icon, title, desc }, i) => (
        <div key={i} className="how-step-card" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="how-step-bg-num">{n}</div>
          <span className="how-step-icon">{icon}</span>
          <div className="how-step-title">{title}</div>
          <div className="how-step-desc">{desc}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="rai-footer">
    <div className="rai-footer-inner">
      <div className="rai-footer-grid">
        {/* Brand column */}
        <div>
          <div className="rai-footer-brand">RESUME.AI</div>
          <div className="rai-footer-desc">
            ATS Intelligence engine built for job seekers who refuse to be filtered out.
            Free forever. No account required. Zero data stored.
          </div>
          {/* Status */}
          <div className="rai-footer-status" style={{ marginTop: 18 }}>
            <div className="rai-footer-status-dot" />
            <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--ff-body)' }}>All Systems Operational</span>
          </div>
        </div>

        {/* Tools column */}
        <div>
          <div className="rai-footer-col-title">TOOLS</div>
          {['Resume Scanner', 'Resume Architect', 'Keyword Analyzer', 'ATS Simulator', 'Cover Letter Hook'].map(t => (
            <span key={t} className="rai-footer-link">{t}</span>
          ))}
        </div>

        {/* Trust column */}
        <div>
          <div className="rai-footer-col-title">TRUST</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.9 }}>
            <div>🔒 Zero data stored</div>
            <div>🛡️ No account required</div>
            <div>🚫 No ads or tracking</div>
            <div>✅ No data sold, ever</div>
            <div>🌐 Runs in your browser</div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="rai-footer-bottom">
        <div className="rai-footer-copy">© 2025 Resume.AI · Built for job seekers, by engineers</div>
        <div className="rai-footer-pills">
          {['Free Forever', 'No Ads', 'Open to All'].map(p => (
            <span key={p} className="rai-footer-pill">{p}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── SCROLL TOP BUTTON ───────────────────────────────────────────────────────
const ScrollTopBtn = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top">
      ↑
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [userType, setUserType] = useState('fresher');
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [buildResult, setBuildResult] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', target_job: '', email: '', phone: '', linkedin: '', location: '', skills: '', education: '',
    experience: [{ title: '', company: '', location: 'N/A', dates: 'N/A', description: '' }]
  });

  const scrolled = useScrolled();

  // ── form completion tracking for step indicator & progress bar ──────────
  const step0Done = !!(form.name.trim() && form.target_job.trim());
  const step1Done = !!(form.education?.trim() || form.skills?.trim() || form.email?.trim());
  const step2Done = !!form.experience[0]?.description.trim();
  const completedSteps = [step0Done, step1Done, step2Done];
  const completedCount = completedSteps.filter(Boolean).length;
  const completionPct = Math.round((completedCount / 3) * 100);

  const toast$ = (msg: string, type = 'info') => setToast({ msg, type });
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const setExp = (i: number, k: string, v: string) => setForm(p => ({ ...p, experience: p.experience.map((x, idx) => idx === i ? { ...x, [k]: v } : x) }));
  const addExp = () => setForm(p => ({ ...p, experience: [...p.experience, { title: '', company: '', location: 'N/A', dates: 'N/A', description: '' }] }));
  const rmExp = (i: number) => setForm(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  const canAnalyze = !!file;
  const canBuild = form.name.trim() && form.target_job.trim() && form.experience[0]?.description.trim();

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // ── keyboard shortcut: Ctrl/Cmd + Enter to submit ───────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (tab === 'analyze' && canAnalyze && !loading) doAnalyze();
        if (tab === 'build' && canBuild && !loading) doBuild();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tab, canAnalyze, canBuild, loading]);

  const doAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    // ADDED: Attach current date to form data to prevent AI timeline hallucinations
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    fd.append('current_date', currentDate);
    try {
      const r = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd });
      if (!r.ok) throw new Error((await r.json()).detail || 'Upload failed');
      setFeedback(await r.json());
      toast$('Analysis complete!', 'success');
    } catch (e: any) {
      toast$(e.message, 'error');
    }
    setLoading(false);
  };

  const doBuild = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_type: userType,
          // ADDED: Attach current date to JSON payload
          current_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        })
      });
      if (!r.ok) throw new Error((await r.json()).detail || 'Build failed');
      const data = await r.json();
      if (data.optimized_experience && typeof data.optimized_experience[0] === 'string')
        data.optimized_experience = [data.optimized_experience];
      setBuildResult(data);
      toast$('Resume generated!', 'success');
    } catch (e: any) {
      toast$(e.message, 'error');
    }
    setLoading(false);
  };

  const switchTab = (t: string) => {
    setTab(t);
    setFeedback(null);
    setBuildResult(null);
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dynamicMaxWidth = (tab === 'analyze' && feedback) ? 1200 : 860;

  // Whether we're in a "result" state (hide hero, use wide layout)
  const inResult = (tab === 'analyze' && !!feedback) || (tab === 'build' && !!buildResult);

  return (
    <>
      <StyleTag />
      <ParticleCanvas />
      {toast && <Toast key={toast.msg} message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Fixed navbar ── */}
      <Navbar tab={tab} onTabChange={switchTab} scrolled={scrolled} />

      {/* ── Scroll-to-top button ── */}
      <ScrollTopBtn visible={scrolled} />

      {/* ── Main content ── */}
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100vh',
        background: 'linear-gradient(160deg, rgba(7,8,13,0.97) 0%, rgba(12,15,24,0.97) 100%)',
        paddingTop: 62,  // offset for fixed navbar
      }}>
        <div style={{ maxWidth: dynamicMaxWidth, margin: '0 auto', padding: '0 20px 80px', transition: 'max-width 0.5s ease' }}>

          {/* ══ ANALYZE TAB ══════════════════════════════════════════════ */}
          {tab === 'analyze' && (
            loading ? <NeuralLoader label="RUNNING 8-DIMENSION AUDIT" /> :
              feedback ? (
                <AnalysisResult data={feedback} file={file} onReset={() => { setFeedback(null); setFile(null); }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Hero */}
                  <HeroSection />

                  {/* Trust bar */}
                  <TrustBar />

                  {/* Upload zone */}
                  <UploadZone file={file} onFile={setFile} />

                  {/* Score category quick-ref */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {[['KEYWORDS', '25 pts'], ['IMPACT', '20 pts'], ['FORMAT', '15 pts'], ['STRUCTURE', '40 pts']].map(([k, v], i) => (
                      <div key={k} className="rai-card" style={{ padding: '14px 16px', textAlign: 'center', animation: `fadeUp 0.4s ${i * 0.07}s ease both` }}>
                        <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 6 }}>{k}</div>
                        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 20, color: 'var(--amber)' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Submit button */}
                  <button className="rai-btn" disabled={!canAnalyze} onClick={doAnalyze} style={{ animation: 'fadeUp 0.5s 0.2s ease both' }}>
                    {canAnalyze ? '⚡  RUN ATS ANALYSIS' : '  UPLOAD PDF TO BEGIN'}
                    {canAnalyze && (
                      <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 8 }}>⌘ + Enter</span>
                    )}
                  </button>

                  {/* How it works */}
                  <div style={{ borderTop: '1px solid rgba(240,165,0,0.07)', paddingTop: 28 }}>
                    <HowItWorks />
                  </div>

                  {/* Features */}
                  <div style={{ borderTop: '1px solid rgba(240,165,0,0.07)', paddingTop: 28 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>WHY RESUME.AI</div>
                    <FeatureHighlights />
                  </div>

                  {/* Testimonials */}
                  <div style={{ borderTop: '1px solid rgba(240,165,0,0.07)', paddingTop: 28 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>WHAT USERS SAY</div>
                    <Testimonials />
                  </div>
                </div>
              )
          )}

          {/* ══ BUILD TAB ════════════════════════════════════════════════ */}
          {tab === 'build' && (
            loading ? <NeuralLoader label="AGILE ITERATION: SPRINT 1" /> :
              buildResult ? (
                <BuiltPreview result={buildResult} form={form} userType={userType} onReset={() => setBuildResult(null)} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Builder hero + completion bar */}
                  <BuilderHero completionPct={completionPct} />

                  {/* Step progress indicator */}
                  <StepProgress
                    steps={['Profile', 'Education & Skills', 'Experience']}
                    completedCount={completedCount}
                  />

                  {/* User type selector */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[['fresher', '🎓  FRESHER / STUDENT'], ['experienced', '💼  EXPERIENCED']].map(([v, l]) => (
                      <button key={v} onClick={() => setUserType(v)} style={{ flex: 1, padding: '13px 16px', borderRadius: 10, background: userType === v ? 'rgba(240,165,0,0.12)' : 'var(--s1)', border: `1px solid ${userType === v ? 'var(--amber)' : 'var(--border)'}`, color: userType === v ? 'var(--amber2)' : 'var(--muted)', fontFamily: 'var(--ff-head)', fontSize: 16, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.3s', boxShadow: userType === v ? '0 0 18px rgba(240,165,0,0.15)' : 'none' }}>{l}</button>
                    ))}
                  </div>

                  {/* Step 1: Profile */}
                  <Section num="01" title="Profile">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="FULL NAME *"><input className="rai-input" spellCheck={true} placeholder="Jane Doe" value={form.name} onChange={e => setF('name', e.target.value)} /></Field>
                      <Field label="TARGET ROLE *"><input className="rai-input" spellCheck={true} placeholder="Senior Frontend Engineer" value={form.target_job} onChange={e => setF('target_job', e.target.value)} /></Field>
                      <Field label="EMAIL"><input className="rai-input" spellCheck={true} placeholder="jane@example.com" value={form.email} onChange={e => setF('email', e.target.value)} /></Field>
                      <Field label="PHONE"><input className="rai-input" spellCheck={true} placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setF('phone', e.target.value)} /></Field>
                      <Field label="LINKEDIN"><input className="rai-input" spellCheck={true} placeholder="linkedin.com/in/janedoe" value={form.linkedin} onChange={e => setF('linkedin', e.target.value)} /></Field>
                      <Field label="LOCATION"><input className="rai-input" spellCheck={true} placeholder="Remote / New York" value={form.location} onChange={e => setF('location', e.target.value)} /></Field>
                    </div>
                  </Section>

                  {/* Step 2: Education & Skills */}
                  <Section num="02" title="Education & Skills">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Field label="EDUCATION"><input className="rai-input" spellCheck={true} placeholder="B.Tech Computer Science · XYZ University · 2024" value={form.education} onChange={e => setF('education', e.target.value)} /></Field>
                      <Field label="SKILLS (comma-separated)"><textarea className="rai-input" spellCheck={true} autoCorrect="on" placeholder="React, TypeScript, Node.js, AWS, Docker, PostgreSQL..." value={form.skills} onChange={e => setF('skills', e.target.value)} /></Field>
                    </div>
                  </Section>

                  {/* Step 3: Experience */}
                  <Section num="03" title={userType === 'fresher' ? 'Projects / Experience' : 'Work Experience'}>
                    {form.experience.map((exp, i) => (
                      <ExpRow key={i} exp={exp} idx={i} onChange={(k: string, v: string) => setExp(i, k, v)} onRemove={() => rmExp(i)} showRemove={form.experience.length > 1} />
                    ))}
                    <button
                      onClick={addExp}
                      style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted)', fontFamily: 'var(--ff-body)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--amber)'; (e.target as HTMLElement).style.color = 'var(--amber)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--muted)'; }}
                    >+ ADD ENTRY</button>
                  </Section>

                  {/* Trust pills */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['🔒 Data never stored', '⚡ Results in <30s', '🎯 STAR-method bullets', '📊 ATS score 85–98'].map((t, i) => (
                      <span key={i} style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 20 }}>{t}</span>
                    ))}
                  </div>

                  {/* Submit */}
                  <button className="rai-btn" disabled={!canBuild} onClick={doBuild}>
                    {canBuild ? (
                      <>🚀  GENERATE OPTIMIZED RESUME <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>⌘ + Enter</span></>
                    ) : '  FILL REQUIRED FIELDS (*)'}
                  </button>
                </div>
              )
          )}
        </div>
      </div>

      {/* ── Footer (shown when not in result mode) ── */}
      {!inResult && <Footer />}
    </>
  );
}