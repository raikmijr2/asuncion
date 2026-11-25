'use strict';

/* =========================================================
   Utilidades
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoOf(new Date());
const dateOf = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtLong = (iso) => dateOf(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = (iso) => dateOf(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const fmtStamp = (ms) => new Date(ms).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
const fmtTime = (s) => { if (!isFinite(s) || s < 0) return '–:––'; s = Math.floor(s); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

function dayLabel(iso) {
  if (iso === todayISO()) return 'Hoy';
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (iso === isoOf(y)) return 'Ayer';
  return cap(fmtLong(iso));
}
function greeting() {
  const h = new Date().getHours();
  return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}
const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } },
};

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* =========================================================
   Iconos
   ========================================================= */
const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  gear: '<path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.3"/><circle cx="9.5" cy="17" r="2.3"/>',
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  self: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  sos: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  hist: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
  next: '<path d="M6 6l9 6-9 6z" fill="currentColor" stroke="none"/><path d="M18 6v12"/>',
  prev: '<path d="M18 6l-9 6 9 6z" fill="currentColor" stroke="none"/><path d="M6 6v12"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>',
  loop: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4M9 2.5h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
};
const ic = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* =========================================================
   Estado
   ========================================================= */
const S = { stages: [], activeId: null, identity: [] };

async function loadState() {
  S.stages = (await DB.all('stages')).sort((a, b) => a.createdAt - b.createdAt);
  S.activeId = (await DB.kvGet('activeStageId')) || null;
  S.identity = (await DB.kvGet('identity')) || [];
}
const stageById = (id) => S.stages.find((s) => s.id === id);
const activeStage = () => stageById(S.activeId);
const scopeName = (scope) => (scope === 'self' ? 'Autoconcepto' : stageById(scope)?.title || 'Etapa');
const exHref = (scope, id) => `#/ej/${encodeURIComponent(scope)}/${id}`;
const momentLabel = (id) => MOMENTS.find((m) => m.id === id)?.label || '';
const sortEntries = (list) => list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

/* Sustituye {p}/{P} por el nombre de la persona de la etapa (o «ella») */
function personalize(v, p) {
  if (typeof v === 'string') return v.replace(/\{p\}/g, p).replace(/\{P\}/g, cap(p));
  if (Array.isArray(v)) return v.map((x) => personalize(x, p));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, personalize(x, p)]));
  return v;
}
function exFor(id, scope) {
  const p = (scope && scope !== 'self' && stageById(scope)?.person?.trim()) || 'ella';
  return personalize(EX[id], p);
}

async function seed() {
  if (await DB.kvGet('seeded')) return;
  await DB.kvSet('identity', SEED_IDENTITY.slice());
  await DB.kvSet('seeded', true);
}

async function markListened() {
  const t = todayISO();
  const days = (await DB.kvGet('listenDays')) || [];
  if (!days.includes(t)) {
    days.push(t);
    await DB.kvSet('listenDays', days.slice(-800));
  }
}

/* =========================================================
   Fragmentos de interfaz
   ========================================================= */
const affsHTML = (st) => `<ol class="affs">${st.affirmations.map((a, i) => `<li><span class="n">${i + 1}</span><p>${esc(a)}</p></li>`).join('')}</ol>`;

function previewHTML(e) {
  const ex = EX[e.exerciseId];
  if (!ex) return '';
  const d = e.data || {};
  if (ex.preview) {
    const t = ex.preview(d);
    if (t) return `<p class="clamp">${esc(t)}</p>`;
  }
  for (const f of ex.fields) {
    const v = d[f.k];
    if (f.type === 'lines' && lines(v).length) {
      const L = lines(v);
      return `<ul class="mini-list">${L.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}${L.length > 3 ? `<li class="more">+${L.length - 3} más</li>` : ''}</ul>`;
    }
    if (typeof v === 'string' && v.trim()) return `<p class="clamp">${esc(v)}</p>`;
    if (Array.isArray(v) && v.length) return `<p class="clamp">${esc(v.join(' · '))}</p>`;
  }
  return '<p class="clamp muted">Sin contenido</p>';
}

function entryCard(e, showExercise) {
  const ex = EX[e.exerciseId] ? exFor(e.exerciseId, e.scope) : null;
  const top = showExercise
    ? `<span>${ex?.icon || ''} ${esc(ex?.title || e.exerciseId)}</span><span class="ec-scope">${esc(scopeName(e.scope))}</span>`
    : `<span>${esc(dayLabel(e.date))}</span>`;
  return `<a class="entry-card" href="#/entrada/${e.id}"><span class="ec-top">${top}</span>${previewHTML(e)}</a>`;
}

function exRow(scope, id, all) {
  const ex = exFor(id, scope);
  const mine = all.filter((e) => e.scope === scope && e.exerciseId === id);
  const last = mine.reduce((m, e) => (e.date > m ? e.date : m), '');
  const meta = mine.length
    ? `${plural(mine.length, 'entrada', 'entradas')} · última ${last === todayISO() ? 'hoy' : fmtShort(last)}`
    : 'Sin entradas todavía';
  return `<a class="ex-row" href="${exHref(scope, id)}">
    <span class="ex-ico">${ex.icon}</span>
    <span class="ex-body"><span class="ex-title">${esc(ex.title)}</span><span class="ex-meta">${esc(meta)}</span></span>
    ${ic('arrow')}</a>`;
}

function exListByMoment(scope, ids, all) {
  let html = '';
  for (const m of MOMENTS) {
    const these = ids.filter((x) => EX[x]?.moment === m.id);
    if (!these.length) continue;
    html += `<h3 class="moment-h">${m.label}</h3><div class="list">${these.map((x) => exRow(scope, x, all)).join('')}</div>`;
  }
  return html;
}

const tipsHTML = (ex) => (ex.tips
  ? `<details class="tips"><summary>Ideas para escribir</summary><ul>${ex.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>`
  : '');

/* =========================================================
   Vistas
   ========================================================= */
async function vHome() {
  const st = activeStage();
  const all = await DB.all('entries');
  const t = todayISO();
  let html = `<p class="greet">${greeting()} · ${esc(cap(fmtLong(t)))}</p>`;

  if (st) {
    const done = new Set(all.filter((e) => e.date === t).map((e) => `${e.scope}|${e.exerciseId}`));
    const listened = ((await DB.kvGet('listenDays')) || []).includes(t);
    html += `
      <a class="stage-card" href="#/etapa/${st.id}">
        <span class="eyebrow">Etapa actual</span>
        <h1 class="stage-title">${esc(st.title)}</h1>
        ${affsHTML(st)}
        <span class="stage-cta">Abrir ejercicios ${ic('arrow')}</span>
      </a>
      <button class="btn primary block lg" data-action="listen" data-stage="${st.id}">${ic('play')} Escuchar mis afirmaciones</button>`;

    const items = [...st.exercises.map((id) => [st.id, id]), ...SELF_EX.map((id) => ['self', id])];
    html += `<h2 class="sec">Tu rutina de hoy</h2>
      <p class="sec-hint">No hace falta hacerlo todo. Elige lo que te sirva hoy.</p><div class="routine">`;
    for (const m of MOMENTS) {
      const rows = [];
      if (m.id === 'manana') {
        rows.push(`<button class="r-item ${listened ? 'done' : ''}" data-action="listen" data-stage="${st.id}"><span class="check">${ic('check')}</span>Escuchar mis afirmaciones</button>`);
      }
      for (const [sc, id] of items.filter(([, x]) => EX[x]?.moment === m.id)) {
        rows.push(`<a class="r-item ${done.has(`${sc}|${id}`) ? 'done' : ''}" href="${exHref(sc, id)}"><span class="check">${ic('check')}</span>${esc(exFor(id, sc).title)}</a>`);
      }
      html += `<div class="moment"><h3>${m.label}</h3>${rows.join('')}</div>`;
    }
    html += '</div>';
  } else {
    const first = !S.stages.length;
    html += `<div class="card">
        <span class="eyebrow">${first ? 'Bienvenido' : 'Siguiente paso'}</span>
        <h1 class="stage-title">${first ? 'Tu primera etapa' : '¿Cuál es tu próxima etapa?'}</h1>
        <p class="small-p">${first
          ? 'Todo avanza en pequeños pasos. Ponle nombre a la etapa en la que estás y escribe sus 3 afirmaciones.'
          : 'Ponle nombre, escribe sus 3 afirmaciones y empieza a vivir desde el final.'}</p>
        <a class="btn primary block" href="#/etapa/nueva">${ic('plus')} Crear etapa</a>
        ${first ? '<p class="tiny">¿Tienes una copia de seguridad? <a href="#/ajustes" style="text-decoration:underline">Restáurala en Ajustes</a>.</p>' : ''}
      </div>`;
    const achieved = S.stages.filter((s) => s.status === 'conseguida');
    if (achieved.length) {
      html += `<h2 class="sec">Etapas conseguidas</h2><div class="list">${achieved.map((s) => `
        <a class="ex-row" href="#/etapa/${s.id}"><span class="ex-ico">✓</span>
        <span class="ex-body"><span class="ex-title">${esc(s.title)}</span><span class="ex-meta">Conseguida</span></span>${ic('arrow')}</a>`).join('')}</div>`;
    }
  }

  html += `<a class="sos-card" href="#/sos"><span class="sos-ico">${ic('sos')}</span>
    <span class="sos-body"><strong>¿Un momento difícil?</strong><small>Si la notas distante o te entra ansiedad, empieza aquí.</small></span>${ic('arrow')}</a>`;
  return { title: 'Asunción', tab: 'home', html };
}

async function vStage(id) {
  const st = stageById(id);
  if (!st) return null;
  const all = await DB.all('entries');
  const audios = (await DB.all('audios')).filter((a) => a.stageId === id).sort((a, b) => a.createdAt - b.createdAt);
  const achieved = st.status === 'conseguida';
  const label = achieved ? `Conseguida · ${fmtShort(isoOf(new Date(st.achievedAt)))}` : id === S.activeId ? 'Etapa actual' : 'Etapa en pausa';

  let html = `<div class="stage-head"><span class="eyebrow">${label}</span><h1 class="stage-title">${esc(st.title)}</h1></div>
    <div class="card affs-card">${affsHTML(st)}
      <div class="row-actions"><a class="btn ghost small" href="#/etapa/${id}/editar">${ic('edit')} Editar</a></div>
    </div>`;
  if (st.vision?.length) {
    html += `<details class="vision"><summary>Lo que estoy construyendo</summary><ul>${st.vision.map((v) => `<li>${esc(v)}</li>`).join('')}</ul></details>`;
  }

  html += `<h2 class="sec">Mis audios</h2><div class="card">
    ${audios.length
      ? audios.map((a) => `<div class="audio-row">
          <button class="icon-btn round soft" data-action="play-audio" data-stage="${id}" data-id="${a.id}" aria-label="Reproducir ${esc(a.name)}">${ic('play')}</button>
          <span class="audio-name">${esc(a.name)}</span>
          <button class="icon-btn" data-action="del-audio" data-id="${a.id}" aria-label="Borrar ${esc(a.name)}">${ic('trash')}</button>
        </div>`).join('')
      : '<p class="small-p muted">Sube la grabación de tus afirmaciones con tu propia voz, o grábala aquí. Podrás escucharla en bucle.</p>'}
    <div class="audio-actions">
      <button class="btn ghost small" data-action="upload" data-stage="${id}">${ic('upload')} Subir audio</button>
      <button class="btn ghost small" data-action="record" data-stage="${id}">${ic('mic')} Grabar</button>
      ${audios.length ? `<button class="btn primary small" data-action="listen" data-stage="${id}">${ic('loop')} Escuchar en bucle</button>` : ''}
    </div></div>`;

  html += `<h2 class="sec">Ejercicios</h2>${exListByMoment(id, st.exercises, all)}
    <p class="sec-hint center" style="margin-top:18px">Los ejercicios de autoconcepto tienen su propia pestaña: te acompañan en todas las etapas.</p>`;
  return { title: st.title, back: '#/', tab: id === S.activeId ? 'home' : '', html };
}

async function vExercise(scope, exId) {
  if (!EX[exId]) return null;
  const st = scope === 'self' ? null : stageById(scope);
  if (scope !== 'self' && !st) return null;
  const ex = exFor(exId, scope);
  const list = sortEntries((await DB.all('entries')).filter((e) => e.scope === scope && e.exerciseId === exId));

  let html = `<div class="ex-head"><span class="ex-ico big">${ex.icon}</span><div>
      <span class="eyebrow">${esc(scopeName(scope))} · ${momentLabel(ex.moment)}</span>
      <h1 class="h1">${esc(ex.title)}</h1>${ex.sub ? `<p class="sub">${esc(ex.sub)}</p>` : ''}</div></div>
    <p class="intro">${esc(ex.intro)}</p>${tipsHTML(ex)}`;

  if (exId === 'afirmaciones' && st) {
    html += `<div class="card affs-card"><span class="eyebrow">Mis 3 afirmaciones principales</span>${affsHTML(st)}
      <div class="row-actions">
        <a class="btn ghost small" href="#/etapa/${st.id}/editar">${ic('edit')} Editar</a>
        <button class="btn ghost small" data-action="listen" data-stage="${st.id}">${ic('play')} Escuchar</button>
      </div></div>`;
  }

  html += `<a class="btn primary block lg" href="#/nueva/${encodeURIComponent(scope)}/${exId}">${ic('plus')} Nueva entrada</a>
    <h2 class="sec">Historial <span class="count">${list.length}</span></h2>
    ${list.length ? `<div class="list">${list.map((e) => entryCard(e, false)).join('')}</div>` : '<div class="empty">Todavía no hay entradas. La primera puede ser hoy.</div>'}`;

  return { title: ex.title, back: scope === 'self' ? '#/autoconcepto' : `#/etapa/${scope}`, tab: scope === 'self' ? 'self' : '', html };
}

async function vEntry(id) {
  const e = await DB.get('entries', id);
  if (!e || !EX[e.exerciseId]) return null;
  const ex = exFor(e.exerciseId, e.scope);
  const d = e.data || {};
  let body = '';
  for (const f of ex.fields) {
    if (f.type === 'note' || f.type === 'timer') continue;
    const v = d[f.k];
    if (f.type === 'lines') {
      const L = lines(v);
      if (L.length) body += `<div class="read-field"><span class="lbl">${esc(f.label)}</span><ul class="read-list">${L.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    } else if (f.type === 'chips' || f.type === 'choice') {
      const arr = Array.isArray(v) ? v : v ? [v] : [];
      if (arr.length) body += `<div class="read-field"><span class="lbl">${esc(f.label)}</span><div class="tags">${arr.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div></div>`;
    } else if (v && String(v).trim()) {
      body += `<div class="read-field"><span class="lbl">${esc(f.label)}</span><p class="prose ${ex.serif ? 'serif' : ''}">${esc(v)}</p></div>`;
    }
  }
  const edited = e.updatedAt && e.updatedAt - e.createdAt > 1000 ? ` · editada ${fmtStamp(e.updatedAt)}` : '';
  const html = `<div class="ex-head"><span class="ex-ico big">${ex.icon}</span><div>
      <span class="eyebrow">${esc(dayLabel(e.date))} · ${esc(scopeName(e.scope))}</span>
      <h1 class="h1">${esc(ex.title)}</h1></div></div>
    <div class="card read">${body || '<p class="muted">Entrada vacía.</p>'}</div>
    <div class="row-actions spread">
      <button class="btn ghost small danger" data-action="del-entry" data-id="${e.id}">${ic('trash')} Borrar</button>
      <a class="btn primary" href="#/entrada/${e.id}/editar">${ic('edit')} Editar</a>
    </div>
    <p class="stamp">Escrita ${fmtStamp(e.createdAt)}${edited}</p>`;
  return { title: ex.title, back: exHref(e.scope, e.exerciseId), tab: e.scope === 'self' ? 'self' : '', html };
}

/* ---------- Formulario de entrada ---------- */
function ideasHTML(f) {
  if (!f.ideas) return '';
  return `<div class="ideas"><span class="ideas-lbl">Ideas</span>${f.ideas.map((t) => `<button type="button" class="idea" data-action="idea" data-target="${f.k}" data-text="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
}

function fieldHTML(f, v) {
  const id = `f-${f.k}`;
  switch (f.type) {
    case 'note':
      return `<div class="note">${esc(f.text)}</div>`;
    case 'timer':
      return `<div class="field"><span class="lbl">${esc(f.label)}</span>
        <button type="button" class="vis-timer" data-action="vis-timer" data-secs="${f.secs || 10}">
          <span class="vt-num">${f.secs || 10}</span><span class="vt-txt">Toca, cierra los ojos y vive la escena</span>
        </button></div>`;
    case 'chips':
    case 'choice': {
      const sel = Array.isArray(v) ? v : v ? [v] : [];
      return `<div class="field" data-field="${f.k}" data-type="${f.type}"><span class="lbl">${esc(f.label)}</span>
        <div class="chips">${f.options.map((o) => `<button type="button" class="chip ${sel.includes(o) ? 'on' : ''}" data-action="chip" data-value="${esc(o)}" aria-pressed="${sel.includes(o)}">${esc(o)}</button>`).join('')}</div></div>`;
    }
    case 'text':
      return `<div class="field"><label class="lbl" for="${id}">${esc(f.label)}</label>
        <input type="text" id="${id}" name="${f.k}" value="${esc(v || '')}" placeholder="${esc(f.placeholder || '')}">${ideasHTML(f)}</div>`;
    default:
      return `<div class="field"><label class="lbl" for="${id}">${esc(f.label)}</label>
        ${f.type === 'lines' ? '<span class="hint">Una por línea</span>' : ''}
        <textarea id="${id}" name="${f.k}" rows="${f.rows || 4}" placeholder="${esc(f.placeholder || '')}">${esc(v || '')}</textarea>${ideasHTML(f)}</div>`;
  }
}

function collect(ex, form) {
  const data = {};
  for (const f of ex.fields) {
    if (f.type === 'note' || f.type === 'timer') continue;
    if (f.type === 'chips' || f.type === 'choice') {
      const vals = $$(`[data-field="${f.k}"] .chip.on`, form).map((b) => b.dataset.value);
      data[f.k] = f.type === 'choice' ? vals[0] || '' : vals;
    } else {
      data[f.k] = form.elements[f.k]?.value || '';
    }
  }
  return data;
}
const hasContent = (data) => Object.values(data).some((v) => (Array.isArray(v) ? v.length : String(v).trim()));

async function vEntryForm(scope, exId, entryId) {
  let entry = null;
  if (entryId) {
    entry = await DB.get('entries', entryId);
    if (!entry) return null;
    scope = entry.scope;
    exId = entry.exerciseId;
  }
  if (!EX[exId]) return null;
  if (scope !== 'self' && !stageById(scope)) return null;
  const ex = exFor(exId, scope);

  const draftKey = entry ? null : `asuncion:draft:${scope}/${exId}`;
  const draft = draftKey ? ls.get(draftKey) : null;
  const useDraft = draft && hasContent(draft.data || {});
  const data = entry ? entry.data || {} : useDraft ? draft.data : {};
  const date = entry ? entry.date : (useDraft && draft.date) || todayISO();
  const cancelHref = entry ? `#/entrada/${entry.id}` : exHref(scope, exId);

  const html = `<div class="ex-head"><span class="ex-ico big">${ex.icon}</span><div>
      <span class="eyebrow">${entry ? 'Editar entrada' : 'Nueva entrada'} · ${esc(scopeName(scope))}</span>
      <h1 class="h1">${esc(ex.title)}</h1>${ex.sub ? `<p class="sub">${esc(ex.sub)}</p>` : ''}</div></div>
    ${entry ? '' : `<p class="intro">${esc(ex.intro)}</p>${tipsHTML(ex)}`}
    <form id="entry-form" class="form" autocomplete="off">
      ${useDraft ? `<div class="draft-note"><span>Has recuperado un borrador sin guardar.</span><button type="button" class="btn ghost small" data-action="discard-draft" data-key="${esc(draftKey)}">Descartar</button></div>` : ''}
      <div class="field"><label class="lbl" for="f-date">Fecha</label><input type="date" id="f-date" name="__date" value="${date}" required></div>
      ${ex.fields.map((f) => fieldHTML(f, data[f.k])).join('')}
      <div class="form-actions">
        <a class="btn ghost" href="${cancelHref}">Cancelar</a>
        <button class="btn primary" type="submit">${ic('check')} Guardar</button>
      </div>
    </form>`;

  const mount = () => {
    const form = $('#entry-form');
    let t;
    if (draftKey) {
      form.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => ls.set(draftKey, { date: form.elements.__date.value, data: collect(ex, form) }), 300);
      });
    }
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      clearTimeout(t);
      const raw = collect(ex, form);
      const clean = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      if (!hasContent(clean)) { toast('Escribe algo antes de guardar.'); return; }
      const now = Date.now();
      const day = form.elements.__date.value || todayISO();
      const rec = entry
        ? { ...entry, date: day, data: clean, updatedAt: now }
        : { id: uid(), scope, exerciseId: exId, date: day, data: clean, createdAt: now, updatedAt: now };
      await DB.put('entries', rec);
      if (draftKey) ls.del(draftKey);
      toast(entry ? 'Cambios guardados' : 'Entrada guardada');
      location.hash = entry ? `#/entrada/${rec.id}` : exHref(scope, exId);
    });
  };
  return { title: ex.title, back: cancelHref, tab: scope === 'self' ? 'self' : '', html, mount };
}

/* ---------- Autoconcepto ---------- */
async function vSelf() {
  const all = await DB.all('entries');
  const html = `<div class="stage-head"><span class="eyebrow">Te acompaña en todas las etapas</span><h1 class="stage-title">Autoconcepto</h1></div>
    <div class="card identity" id="identity">
      <span class="eyebrow">El hombre que soy</span>
      <ul class="identity-list">${S.identity.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="row-actions"><button class="btn ghost small" data-action="edit-identity">${ic('edit')} Editar</button></div>
    </div>
    <h2 class="sec">Ejercicios</h2>${exListByMoment('self', SELF_EX, all)}`;
  return { title: 'Autoconcepto', tab: 'self', html };
}

/* ---------- Momento difícil ---------- */
async function vSos() {
  const st = activeStage();
  let html = `<div class="calm">
      <div class="breath" aria-hidden="true"></div>
      <p class="breath-txt">Inspira 4 · Suelta 6</p>
      <h1 class="stage-title">Respira</h1>
      <p>Lo que sientes ahora es una emoción pasajera, no una predicción de lo que va a pasar.</p>
    </div>`;
  if (st) {
    html += `<div class="card affs-card"><span class="eyebrow">Vuelve a tus afirmaciones</span>${affsHTML(st)}
      <button class="btn primary block" style="margin-top:16px" data-action="listen" data-stage="${st.id}">${ic('play')} Escucharlas ahora</button></div>`;
  }
  const options = [
    ['percepcion', st?.id, 'La noto distante o poco cariñosa'],
    ['reciprocidad', st?.id, 'La echo de menos y me entra ansiedad'],
    ['chico-seguro', 'self', 'Me siento inseguro ante una situación'],
    ['lo-mejor', 'self', 'Tengo miedo al futuro'],
    ['inseguridades', 'self', 'Tengo un pensamiento negativo sobre mí'],
  ].filter(([id, sc]) => sc && (sc === 'self' || st.exercises.includes(id)));
  html += `<h2 class="sec">¿Qué te está pasando?</h2><div class="list">${options.map(([id, sc, label]) => `
    <a class="ex-row" href="#/nueva/${encodeURIComponent(sc)}/${id}"><span class="ex-ico">${EX[id].icon}</span>
      <span class="ex-body"><span class="ex-title">${esc(label)}</span><span class="ex-meta">${esc(exFor(id, sc).title)}</span></span>${ic('arrow')}</a>`).join('')}</div>`;
  return { title: 'Momento difícil', tab: 'sos', html };
}

/* ---------- Historial ---------- */
let histFilter = '';
async function vHistory() {
  const all = sortEntries(await DB.all('entries'));
  const listenDays = (await DB.kvGet('listenDays')) || [];
  const perDay = new Map();
  for (const e of all) perDay.set(e.date, (perDay.get(e.date) || 0) + 1);
  for (const d of listenDays) perDay.set(d, (perDay.get(d) || 0) + 1);

  let streak = 0;
  const c = new Date();
  if (!perDay.has(isoOf(c))) c.setDate(c.getDate() - 1);
  while (perDay.has(isoOf(c))) { streak++; c.setDate(c.getDate() - 1); }

  // Últimas semanas, empezando en lunes
  const today = new Date();
  const offset = (today.getDay() + 6) % 7;
  const start = new Date(today); start.setDate(today.getDate() - offset - 21);
  let cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span class="wd">${d}</span>`).join('');
  for (let i = 0; i < 28; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = isoOf(d);
    const n = perDay.get(iso) || 0;
    const cls = d > today ? 'future' : `${n >= 3 ? 'l2' : n ? 'l1' : ''} ${iso === todayISO() ? 'today' : ''}`;
    cells += `<i class="${cls}" title="${esc(fmtShort(iso))}: ${n}"></i>`;
  }

  const groups = [...S.stages.map((s) => [s.id, s.title, s.exercises]), ['self', 'Autoconcepto', SELF_EX]];
  const opts = groups.map(([sc, name, ids]) => `<optgroup label="${esc(name)}">${ids.map((id) => {
    const v = `${sc}/${id}`;
    return `<option value="${esc(v)}" ${histFilter === v ? 'selected' : ''}>${esc(exFor(id, sc).title)}</option>`;
  }).join('')}</optgroup>`).join('');

  const filtered = histFilter ? all.filter((e) => `${e.scope}/${e.exerciseId}` === histFilter) : all;
  let list = '';
  let cur = null;
  for (const e of filtered) {
    if (e.date !== cur) {
      if (cur !== null) list += '</div>';
      list += `<h3 class="date-h">${esc(dayLabel(e.date))}</h3><div class="list">`;
      cur = e.date;
    }
    list += entryCard(e, true);
  }
  if (cur !== null) list += '</div>';

  const html = `
    <div class="stats">
      <div class="stat"><b>${streak}</b><span>${streak === 1 ? 'día seguido' : 'días seguidos'}</span></div>
      <div class="stat"><b>${perDay.size}</b><span>días practicados</span></div>
      <div class="stat"><b>${all.length}</b><span>entradas</span></div>
    </div>
    <div class="card heat-wrap"><span class="eyebrow" style="margin-bottom:10px">Últimas 4 semanas</span><div class="heat">${cells}</div></div>
    <div class="field"><label class="lbl" for="hist-filter">Ver</label>
      <select id="hist-filter" data-change="hist-filter"><option value="">Todos los ejercicios</option>${opts}</select></div>
    ${filtered.length ? list : '<div class="empty" style="margin-top:14px">Aún no hay entradas aquí.</div>'}`;
  return { title: 'Historial', tab: 'hist', html };
}

/* ---------- Ajustes ---------- */
async function vSettings() {
  let persisted = false;
  let usage = null;
  try { persisted = await navigator.storage?.persisted?.(); } catch { /* no disponible */ }
  try { usage = (await navigator.storage?.estimate?.())?.usage ?? null; } catch { /* no disponible */ }
  const lastBackup = await DB.kvGet('lastBackup');

  const rows = S.stages.map((s) => {
    const status = s.id === S.activeId ? 'Etapa actual' : s.status === 'conseguida' ? 'Conseguida' : 'En pausa';
    const actions = [];
    if (s.status !== 'conseguida' && s.id !== S.activeId) actions.push(`<button class="btn ghost small" data-action="set-active" data-id="${s.id}">Hacer actual</button>`);
    actions.push(s.status === 'conseguida'
      ? `<button class="btn ghost small" data-action="reopen" data-id="${s.id}">Reabrir</button>`
      : `<button class="btn ghost small" data-action="achieve" data-id="${s.id}">${ic('check')} Conseguida</button>`);
    actions.push(`<a class="btn ghost small" href="#/etapa/${s.id}/editar" aria-label="Editar ${esc(s.title)}">${ic('edit')}</a>`);
    return `<div class="card stage-row"><div><span class="eyebrow">${status}</span><a class="stage-row-title" href="#/etapa/${s.id}">${esc(s.title)}</a></div>
      <div class="row-actions">${actions.join('')}</div></div>`;
  }).join('');

  const html = `
    <h2 class="sec first">Mis etapas</h2>
    <div class="list">${rows || '<div class="empty">Aún no hay etapas.</div>'}</div>
    <a class="btn ghost block" style="margin-top:10px" href="#/etapa/nueva">${ic('plus')} Nueva etapa</a>

    <h2 class="sec">Copia de seguridad</h2>
    <div class="card">
      <p class="small-p">Todo se guarda solo en este dispositivo, dentro de este navegador. Si borras los datos del navegador o cambias de móvil, se perdería. Descarga una copia de vez en cuando.</p>
      <label class="check-row"><input type="checkbox" id="exp-audio" checked> Incluir los audios</label>
      ${pendingBackup
        ? `<div class="draft-note" style="margin-top:10px"><span>Copia lista (${(pendingBackup.file.size / 1048576).toFixed(1)} MB).${isTouch() ? ' En iPhone elige «Guardar en Archivos».' : ''}</span>
            <button class="btn primary small" data-action="save-backup">Guardar</button></div>`
        : `<div class="row-actions" style="justify-content:flex-start">
            <button class="btn primary small" data-action="export">Hacer copia</button>
            <button class="btn ghost small" data-action="import">Restaurar copia</button>
          </div>`}
      <p class="tiny">${lastBackup ? `Última copia: ${fmtStamp(lastBackup)}. ` : 'Todavía no has hecho ninguna copia. '}${persisted ? 'El navegador conservará tus datos aunque falte espacio.' : 'Usa siempre la app desde el icono de la pantalla de inicio: así el navegador no borra los datos.'}${usage != null ? ` Espacio usado: ${(usage / 1048576).toFixed(1)} MB.` : ''}</p>
    </div>

    <h2 class="sec">Sobre el método</h2>
    <div class="card">
      <p class="small-p">Basado en la Ley de la Asunción de Neville Goddard: vivir en el final, SATS, dieta mental, revisión, afirmaciones, visualización, autoconcepto y scripting.</p>
      <p class="small-p" style="margin:0">Estas herramientas trabajan tus pensamientos, emociones y comportamientos. No garantizan lo que otra persona piense o haga: tu deseo convive siempre con el respeto a su libertad y sus decisiones.</p>
    </div>`;
  return { title: 'Ajustes', back: '#/', html };
}

/* ---------- Crear / editar etapa ---------- */
async function vStageForm(id) {
  const st = id ? stageById(id) : null;
  if (id && !st) return null;
  const selected = st ? st.exercises : STAGE_EX_ALL;
  const first = !S.stages.length;
  const cancelHref = st ? `#/etapa/${st.id}` : first ? '#/' : '#/ajustes';
  const html = `<div class="stage-head"><span class="eyebrow">${st ? 'Editar etapa' : 'Nueva etapa'}</span><h1 class="h1">${st ? esc(st.title) : first ? 'Tu primera etapa' : 'Tu siguiente paso'}</h1></div>
    <form id="stage-form" class="form" autocomplete="off">
      <div class="field"><label class="lbl" for="sf-title">Nombre de la etapa</label>
        <input type="text" id="sf-title" name="title" required value="${esc(st?.title || '')}" placeholder="Ej.: Reconciliación"></div>
      <div class="field"><label class="lbl" for="sf-person">Nombre de la persona</label>
        <span class="hint">Opcional. Solo se guarda en tu móvil y personaliza los ejercicios.</span>
        <input type="text" id="sf-person" name="person" value="${esc(st?.person || '')}" placeholder="Su nombre"></div>
      <div class="field"><span class="lbl">Mis 3 afirmaciones</span><span class="hint">En presente, como si ya fuera real.</span>
        ${[0, 1, 2].map((i) => `<textarea name="aff${i}" rows="3" aria-label="Afirmación ${i + 1}" placeholder="Afirmación ${i + 1}">${esc(st?.affirmations[i] || '')}</textarea>`).join('')}</div>
      <div class="field"><label class="lbl" for="sf-vision">Lo que estoy construyendo</label><span class="hint">Opcional. Una idea por línea.</span>
        <textarea id="sf-vision" name="vision" rows="7">${esc((st?.vision || []).join('\n'))}</textarea></div>
      <div class="field"><span class="lbl">Ejercicios de esta etapa</span>
        ${STAGE_EX_ALL.map((x) => `<label class="check-row"><input type="checkbox" name="ex" value="${x}" ${selected.includes(x) ? 'checked' : ''}> ${EX[x].icon} ${esc(exFor(x, st?.id).title)}</label>`).join('')}</div>
      ${st || first ? '' : '<label class="check-row"><input type="checkbox" name="makeActive" checked> Convertirla en mi etapa actual</label>'}
      <div class="form-actions">
        <a class="btn ghost" href="${cancelHref}">Cancelar</a>
        <button class="btn primary" type="submit">${ic('check')} Guardar</button>
      </div>
    </form>`;

  const mount = () => {
    const form = $('#stage-form');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const el = form.elements;
      const title = el.title.value.trim();
      const affirmations = [el.aff0, el.aff1, el.aff2].map((t) => t.value.trim()).filter(Boolean);
      if (!title) { toast('Ponle un nombre a la etapa.'); return; }
      if (!affirmations.length) { toast('Escribe al menos una afirmación.'); return; }
      const checked = $$('input[name="ex"]:checked', form).map((c) => c.value);
      const exercises = STAGE_EX_ALL.filter((x) => checked.includes(x));
      const vision = lines(el.vision.value);
      const person = el.person.value.trim();
      const rec = st
        ? { ...st, title, person, affirmations, vision, exercises }
        : { id: uid(), title, person, affirmations, vision, exercises, status: 'en-curso', createdAt: Date.now() };
      await DB.put('stages', rec);
      if (!st && (!el.makeActive || el.makeActive.checked)) await DB.kvSet('activeStageId', rec.id);
      await loadState();
      Player.ui();
      toast('Etapa guardada');
      location.hash = `#/etapa/${rec.id}`;
    });
  };
  return { title: st ? 'Editar etapa' : 'Nueva etapa', back: cancelHref, html, mount };
}

/* =========================================================
   Enrutado
   ========================================================= */
async function route(p) {
  const [a, b, c] = p;
  if (!a) return vHome();
  switch (a) {
    case 'etapa':
      if (b === 'nueva') return vStageForm(null);
      return c === 'editar' ? vStageForm(b) : vStage(b);
    case 'ej': return vExercise(b, c);
    case 'nueva': return vEntryForm(b, c, null);
    case 'entrada': return c === 'editar' ? vEntryForm(null, null, b) : vEntry(b);
    case 'autoconcepto': return vSelf();
    case 'sos': return vSos();
    case 'historial': return vHistory();
    case 'ajustes': return vSettings();
    default: return null;
  }
}

let renderSeq = 0;
async function render(keepScroll = false) {
  const seq = ++renderSeq;
  const y = window.scrollY;
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  let v;
  try {
    v = await route(parts);
  } catch (err) {
    console.error(err);
    v = { title: 'Error', back: '#/', html: `<div class="empty">Algo ha fallado: ${esc(err.message)}</div>` };
  }
  if (seq !== renderSeq) return;
  if (!v) v = { title: 'No encontrado', back: '#/', html: '<div class="empty">Esta página no existe. <a href="#/">Volver al inicio</a></div>' };

  $('#title').textContent = v.title || 'Asunción';
  document.title = v.title && v.title !== 'Asunción' ? `${v.title} · Asunción` : 'Asunción';
  const back = $('#back');
  back.style.visibility = v.back ? 'visible' : 'hidden';
  back.href = v.back || '#/';
  $$('.tabbar a').forEach((t) => t.classList.toggle('on', t.dataset.tab === v.tab));
  $('#view').innerHTML = v.html;
  window.scrollTo(0, keepScroll ? y : 0);
  v.mount?.();
}

/* =========================================================
   Reproductor de afirmaciones (bucle + temporizador)
   ========================================================= */
const FADE_MS = 30000;
const Player = {
  a: new Audio(),
  queue: [],
  i: 0,
  mode: 'all', // 'all' = repetir todas, 'one' = repetir la actual
  stageId: null,
  current: null,
  active: false,
  isOpen: false,
  seeking: false,
  timerMs: 0,
  remaining: 0,
  last: 0,
  mediaReady: false,
  canFade: true,
  wake: ls.get('asuncion:wake') === true,
  wakeLock: null,

  init() {
    const a = this.a;
    a.preload = 'auto';
    a.setAttribute('playsinline', '');
    // En iPhone el volumen no se puede cambiar desde la web: el temporizador solo pausa.
    a.volume = 0.5;
    this.canFade = Math.abs(a.volume - 0.5) < 0.01;
    a.volume = 1;
    a.addEventListener('play', () => { this.ui(); this.media(); this.syncWake(); });
    a.addEventListener('pause', () => { this.ui(); this.media(); this.syncWake(); });
    const wakeBtn = $('#p-wake');
    if ('wakeLock' in navigator) {
      wakeBtn.onclick = () => {
        this.wake = !this.wake;
        ls.set('asuncion:wake', this.wake);
        this.syncWake();
        this.ui();
      };
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.syncWake(); });
    } else {
      wakeBtn.hidden = true;
    }
    a.addEventListener('timeupdate', () => { this.tick(); this.uiTime(); });
    a.addEventListener('loadedmetadata', () => this.uiTime());
    a.addEventListener('ended', () => { if (this.queue.length > 1 && this.mode === 'all') this.next(1); });

    $('#p-play').onclick = () => this.toggle();
    $('#p-next').onclick = () => this.next(1);
    $('#p-prev').onclick = () => { if (a.currentTime > 3) a.currentTime = 0; else this.next(-1); };
    $('#p-close').onclick = () => this.show(false);
    $('#p-stop').onclick = () => this.stop();
    $('#p-loop').onclick = () => {
      if (this.queue.length < 2) return;
      this.mode = this.mode === 'all' ? 'one' : 'all';
      a.loop = this.mode === 'one';
      this.ui();
    };
    $('#p-timer').onchange = (e) => this.setTimer(Number(e.target.value));
    const seek = $('#p-seek');
    seek.oninput = () => { this.seeking = true; if (isFinite(a.duration)) a.currentTime = (seek.value / 1000) * a.duration; };
    seek.onchange = () => { this.seeking = false; };
    $('#mini-open').onclick = () => this.show(true);
    $('#mini-toggle').onclick = () => this.toggle();
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.show(false); });

    this.last = performance.now();
    setInterval(() => { this.tick(); if (this.timerMs) this.uiTime(); }, 500);
    this.ui();
  },

  /* Carga (o actualiza) la lista de audios de una etapa sin cortar lo que suena */
  async load(stageId) {
    if (stageId !== this.stageId) {
      this.a.pause();
      this.queue.forEach((t) => URL.revokeObjectURL(t.url));
      this.queue = [];
      this.current = null;
      this.i = 0;
      this.stageId = stageId;
    }
    const list = (await DB.all('audios')).filter((x) => x.stageId === stageId).sort((x, y) => x.createdAt - y.createdAt);
    const old = new Map(this.queue.map((t) => [t.id, t]));
    const q = list.map((x) => {
      const prev = old.get(x.id);
      return prev ? { ...prev, name: x.name } : { id: x.id, name: x.name, url: URL.createObjectURL(x.blob) };
    });
    old.forEach((t, id) => {
      if (!q.some((n) => n.id === id)) {
        if (this.current === id) { this.a.pause(); this.a.removeAttribute('src'); this.current = null; }
        URL.revokeObjectURL(t.url);
      }
    });
    this.queue = q;
    const ci = q.findIndex((t) => t.id === this.current);
    this.i = ci >= 0 ? ci : Math.min(this.i, Math.max(0, q.length - 1));
    if (!q.length) this.active = false;
    this.ui();
  },

  async refresh(stageId) {
    if (stageId && stageId === this.stageId) await this.load(stageId);
  },

  async open(stageId, startId) {
    await this.load(stageId);
    if (startId) {
      const k = this.queue.findIndex((t) => t.id === startId);
      if (k >= 0) this.i = k;
    }
    this.show(true);
    if (this.queue.length && (startId || this.a.paused)) this.play();
  },

  play() {
    const t = this.queue[this.i];
    if (!t) return;
    if (this.current !== t.id) { this.a.src = t.url; this.current = t.id; }
    this.a.loop = this.mode === 'one' || this.queue.length === 1;
    if (!this.timerMs || this.remaining > FADE_MS) this.a.volume = 1;
    this.active = true;
    this.a.play().then(() => markListened()).catch((err) => console.warn('No se pudo reproducir', err));
    this.ui();
  },

  toggle() { if (this.a.paused) this.play(); else this.a.pause(); },

  next(dir) {
    if (!this.queue.length) return;
    this.i = (this.i + dir + this.queue.length) % this.queue.length;
    this.play();
  },

  stop() {
    this.a.pause();
    try { this.a.currentTime = 0; } catch { /* sin pista */ }
    this.setTimer(0);
    $('#p-timer').value = '0';
    this.active = false;
    this.show(false);
  },

  setTimer(min) {
    this.timerMs = min * 60000;
    this.remaining = this.timerMs;
    this.a.volume = 1;
    this.uiTime();
  },

  /* Cuenta atrás del temporizador (solo mientras suena) y bajada de volumen final */
  tick() {
    const now = performance.now();
    const dt = now - this.last;
    this.last = now;
    if (!this.timerMs || this.a.paused) return;
    this.remaining -= dt;
    if (this.remaining <= 0) {
      this.a.pause();
      this.a.volume = 1;
      this.timerMs = 0;
      this.remaining = 0;
      $('#p-timer').value = '0';
      this.uiTime();
      toast('Temporizador terminado. Que descanses.');
      return;
    }
    this.a.volume = this.remaining < FADE_MS ? Math.max(0.02, this.remaining / FADE_MS) : 1;
  },

  show(open) {
    this.isOpen = open;
    $('#player').hidden = !open;
    document.body.classList.toggle('noscroll', open);
    if (open) $('#p-close').focus();
    this.syncWake();
    this.ui();
  },

  /* Mantiene la pantalla encendida mientras suena el audio con el reproductor abierto */
  async syncWake() {
    if (!('wakeLock' in navigator)) return;
    const want = this.wake && this.isOpen && !this.a.paused && document.visibilityState === 'visible';
    try {
      if (want && !this.wakeLock) {
        this.wakeLock = navigator.wakeLock.request('screen');
        const lock = await this.wakeLock;
        this.wakeLock = lock;
        lock.addEventListener('release', () => { if (this.wakeLock === lock) this.wakeLock = null; });
      } else if (!want && this.wakeLock) {
        const lock = await this.wakeLock;
        this.wakeLock = null;
        await lock.release();
      }
    } catch {
      this.wakeLock = null;
    }
  },

  media() {
    if (!('mediaSession' in navigator)) return;
    const t = this.queue[this.i];
    const st = stageById(this.stageId);
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t?.name || 'Mis afirmaciones',
        artist: st?.title || 'Asunción',
        album: 'Asunción',
        artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }],
      });
      navigator.mediaSession.playbackState = this.a.paused ? 'paused' : 'playing';
      if (!this.mediaReady) {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.a.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.next(1));
        navigator.mediaSession.setActionHandler('previoustrack', () => this.next(-1));
        this.mediaReady = true;
      }
    } catch { /* no compatible */ }
  },

  ui() {
    const st = stageById(this.stageId);
    const t = this.queue[this.i];
    const playing = !this.a.paused;
    $('#p-stage').textContent = st ? st.title : '';
    $('#p-affs').innerHTML = st ? st.affirmations.map((x) => `<li>${esc(x)}</li>`).join('') : '';
    $('#p-empty').hidden = !st || this.queue.length > 0;
    $('#p-upload').dataset.stage = this.stageId || '';
    $('#p-controls').hidden = !this.queue.length;
    $('#p-name').textContent = t ? t.name : '';
    $('#p-play').innerHTML = ic(playing ? 'pause' : 'play');
    $('#p-play').setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
    $('#mini-toggle').innerHTML = ic(playing ? 'pause' : 'play');
    $('#mini-name').textContent = t ? t.name : '';
    const single = this.queue.length < 2;
    $('#p-prev').disabled = single;
    $('#p-next').disabled = single;
    const loop = $('#p-loop');
    loop.innerHTML = `${ic('loop')} ${single ? 'En bucle' : this.mode === 'one' ? 'Repetir esta' : 'Repetir todas'}`;
    loop.classList.add('on');
    loop.style.cursor = single ? 'default' : 'pointer';
    const wakeBtn = $('#p-wake');
    wakeBtn.classList.toggle('on', this.wake);
    wakeBtn.setAttribute('aria-pressed', String(this.wake));
    const showMini = this.active && !this.isOpen && this.queue.length > 0;
    $('#mini').hidden = !showMini;
    document.body.classList.toggle('has-mini', showMini);
    this.uiTime();
  },

  uiTime() {
    const a = this.a;
    const d = a.duration;
    $('#p-cur').textContent = fmtTime(a.currentTime);
    $('#p-dur').textContent = isFinite(d) ? fmtTime(d) : '';
    const seek = $('#p-seek');
    seek.disabled = !isFinite(d);
    if (isFinite(d) && d > 0 && !this.seeking) seek.value = Math.round((a.currentTime / d) * 1000);
    $('#p-remaining').textContent = this.timerMs > 0
      ? `Se detendrá en ${fmtTime(this.remaining / 1000)}${this.canFade && this.remaining <= FADE_MS ? ' · bajando el volumen' : ''}`
      : '';
  },
};

/* =========================================================
   Grabación y subida de audios
   ========================================================= */
let uploadStage = null;
let recorder = null;

async function saveAudio(stageId, blob, name) {
  await DB.put('audios', { id: uid(), stageId, name, type: blob.type, blob, createdAt: Date.now() });
}

async function toggleRecord(stageId, btn) {
  if (recorder) { recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    toast('Este navegador no permite grabar. Sube el audio desde un archivo.');
    return;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    toast('No se ha podido usar el micrófono.');
    return;
  }
  const chunks = [];
  const r = new MediaRecorder(stream);
  recorder = r;
  const t0 = Date.now();
  const label = () => { btn.innerHTML = `${ic('stop')} Detener ${fmtTime((Date.now() - t0) / 1000)}`; };
  label();
  btn.classList.add('recording');
  const iv = setInterval(label, 500);
  r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  r.onstop = async () => {
    clearInterval(iv);
    stream.getTracks().forEach((t) => t.stop());
    recorder = null;
    const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' });
    const name = blob.size ? prompt('Nombre de la grabación', `Mis afirmaciones (${fmtShort(todayISO())})`) : null;
    if (name !== null && blob.size) {
      await saveAudio(stageId, blob, name.trim() || 'Grabación');
      await Player.refresh(stageId);
      toast('Grabación guardada');
    }
    render(true);
  };
  r.start();
}

$('#audio-file').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  e.target.value = '';
  if (!files.length || !uploadStage) return;
  try {
    for (const f of files) {
      const blob = new Blob([await f.arrayBuffer()], { type: f.type || 'audio/mpeg' });
      await saveAudio(uploadStage, blob, f.name.replace(/\.[^.]+$/, ''));
    }
    await Player.refresh(uploadStage);
    toast(files.length > 1 ? `${files.length} audios guardados` : 'Audio guardado');
  } catch (err) {
    console.error(err);
    toast('No se ha podido guardar el audio.');
  }
  render(true);
});

/* =========================================================
   Copia de seguridad
   ========================================================= */
const blobToDataURL = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});
function dataURLToBlob(url) {
  const [head, b64] = url.split(',');
  const type = (head.match(/data:([^;]+)/) || [])[1] || '';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type });
}

async function exportData() {
  const withAudio = $('#exp-audio')?.checked;
  const out = {
    app: 'asuncion',
    version: 1,
    exportedAt: new Date().toISOString(),
    stages: await DB.all('stages'),
    entries: await DB.all('entries'),
    kv: {
      activeStageId: await DB.kvGet('activeStageId'),
      identity: await DB.kvGet('identity'),
      listenDays: await DB.kvGet('listenDays'),
    },
    audios: [],
  };
  if (withAudio) {
    for (const a of await DB.all('audios')) {
      const { blob, ...rest } = a;
      out.audios.push({ ...rest, data: await blobToDataURL(blob) });
    }
  }
  const file = new File([JSON.stringify(out)], `asuncion-copia-${todayISO()}.json`, { type: 'application/json' });
  if (pendingBackup) URL.revokeObjectURL(pendingBackup.url);
  pendingBackup = { file, url: URL.createObjectURL(file) };
  render(true);
}

/* En el móvil se abre «Compartir» (→ Guardar en Archivos); en el ordenador, se descarga. */
const isTouch = () => matchMedia('(pointer: coarse)').matches;
let pendingBackup = null;

async function saveBackup() {
  const b = pendingBackup;
  if (!b) return;
  if (isTouch() && navigator.canShare?.({ files: [b.file] })) {
    try {
      await navigator.share({ files: [b.file], title: 'Copia de Asunción' });
      return backupDone();
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const link = document.createElement('a');
  link.href = b.url;
  link.download = b.file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return backupDone();
}

async function backupDone() {
  const b = pendingBackup;
  pendingBackup = null;
  if (b) setTimeout(() => URL.revokeObjectURL(b.url), 10000);
  await DB.kvSet('lastBackup', Date.now());
  toast('Copia guardada');
  render(true);
}

$('#import-file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (d.app !== 'asuncion') throw new Error('Este archivo no es una copia de Asunción.');
    const msg = `Se añadirán ${plural(d.entries?.length || 0, 'entrada', 'entradas')}, ${plural(d.stages?.length || 0, 'etapa', 'etapas')} y ${plural(d.audios?.length || 0, 'audio', 'audios')}. Lo que ya tienes no se borra; si una entrada ya existe, se sustituye por la de la copia. ¿Continuar?`;
    if (!confirm(msg)) return;
    for (const s of d.stages || []) await DB.put('stages', s);
    for (const x of d.entries || []) await DB.put('entries', x);
    for (const a of d.audios || []) {
      const { data, ...rest } = a;
      if (data) await DB.put('audios', { ...rest, blob: dataURLToBlob(data) });
    }
    if (d.kv) {
      if (Array.isArray(d.kv.identity) && d.kv.identity.length) await DB.kvSet('identity', d.kv.identity);
      if (d.kv.activeStageId) await DB.kvSet('activeStageId', d.kv.activeStageId);
      if (Array.isArray(d.kv.listenDays)) {
        const mine = (await DB.kvGet('listenDays')) || [];
        await DB.kvSet('listenDays', [...new Set([...mine, ...d.kv.listenDays])].sort().slice(-800));
      }
    }
    await DB.kvSet('seeded', true);
    await loadState();
    if (Player.stageId) await Player.load(Player.stageId);
    toast('Copia restaurada');
    render();
  } catch (err) {
    console.error(err);
    toast(err.message || 'No se ha podido leer el archivo.');
  }
});

/* =========================================================
   Acciones (delegación de eventos)
   ========================================================= */
function visTimer(el) {
  if (el.dataset.running) return;
  let n = Number(el.dataset.secs) || 10;
  el.dataset.running = '1';
  el.classList.add('running');
  const num = $('.vt-num', el);
  const txt = $('.vt-txt', el);
  num.textContent = n;
  txt.textContent = 'Siente que ya es real…';
  const iv = setInterval(() => {
    n--;
    num.textContent = n;
    if (n <= 0) {
      clearInterval(iv);
      delete el.dataset.running;
      el.classList.remove('running');
      num.innerHTML = ic('check');
      txt.textContent = 'Hecho. Puedes repetirla las veces que quieras.';
      navigator.vibrate?.(60);
    }
  }, 1000);
}

const ACTIONS = {
  listen: (el) => Player.open(el.dataset.stage),
  'play-audio': (el) => Player.open(el.dataset.stage, el.dataset.id),
  upload: (el) => {
    uploadStage = el.dataset.stage;
    if (uploadStage) $('#audio-file').click();
  },
  record: (el) => toggleRecord(el.dataset.stage, el),
  'del-audio': async (el) => {
    if (!confirm('¿Borrar este audio? No se puede deshacer.')) return;
    const a = await DB.get('audios', el.dataset.id);
    await DB.del('audios', el.dataset.id);
    await Player.refresh(a?.stageId);
    toast('Audio borrado');
    render(true);
  },
  chip: (el) => {
    const field = el.closest('[data-field]');
    if (field?.dataset.type === 'choice') $$('.chip', field).forEach((c) => { if (c !== el) { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); } });
    el.classList.toggle('on');
    el.setAttribute('aria-pressed', String(el.classList.contains('on')));
    el.closest('form')?.dispatchEvent(new Event('input', { bubbles: true }));
  },
  idea: (el) => {
    const ta = el.closest('form')?.elements[el.dataset.target];
    if (!ta) return;
    const v = ta.value.trimEnd();
    ta.value = v ? `${v}\n${el.dataset.text}` : el.dataset.text;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
  },
  'vis-timer': (el) => visTimer(el),
  'discard-draft': (el) => { ls.del(el.dataset.key); render(); },
  'del-entry': async (el) => {
    if (!confirm('¿Borrar esta entrada? No se puede deshacer.')) return;
    const e = await DB.get('entries', el.dataset.id);
    await DB.del('entries', el.dataset.id);
    toast('Entrada borrada');
    location.hash = e ? exHref(e.scope, e.exerciseId) : '#/';
  },
  'edit-identity': () => {
    const card = $('#identity');
    card.innerHTML = `<span class="eyebrow">El hombre que soy</span><span class="hint" style="display:block;margin-top:6px">Una frase por línea, en presente.</span>
      <textarea id="identity-ta" rows="12">${esc(S.identity.join('\n'))}</textarea>
      <div class="row-actions">
        <button class="btn ghost small" data-action="cancel-identity">Cancelar</button>
        <button class="btn primary small" data-action="save-identity">${ic('check')} Guardar</button>
      </div>`;
    $('#identity-ta').focus();
  },
  'cancel-identity': () => render(true),
  'save-identity': async () => {
    S.identity = lines($('#identity-ta').value);
    await DB.kvSet('identity', S.identity);
    toast('Guardado');
    render(true);
  },
  'set-active': async (el) => {
    await DB.kvSet('activeStageId', el.dataset.id);
    await loadState();
    toast('Etapa actual cambiada');
    render(true);
  },
  achieve: async (el) => {
    const s = stageById(el.dataset.id);
    if (!s || !confirm(`¿Marcar «${s.title}» como conseguida? Seguirás pudiendo consultar todo lo que escribiste.`)) return;
    await DB.put('stages', { ...s, status: 'conseguida', achievedAt: Date.now() });
    if (S.activeId === s.id) await DB.kvSet('activeStageId', null);
    await loadState();
    toast('¡Enhorabuena! Etapa conseguida');
    render(true);
  },
  reopen: async (el) => {
    const s = stageById(el.dataset.id);
    if (!s) return;
    const { achievedAt, ...rest } = s;
    await DB.put('stages', { ...rest, status: 'en-curso' });
    await loadState();
    render(true);
  },
  export: () => exportData(),
  'save-backup': () => saveBackup(),
  import: () => $('#import-file').click(),
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  ev.preventDefault();
  Promise.resolve(fn(el, ev)).catch((err) => { console.error(err); toast('Algo ha fallado. Inténtalo de nuevo.'); });
});

document.addEventListener('change', (ev) => {
  if (ev.target.dataset?.change === 'hist-filter') {
    histFilter = ev.target.value;
    render(true);
  }
});

/* =========================================================
   Arranque
   ========================================================= */
async function boot() {
  $$('[data-icon]').forEach((el) => { el.innerHTML = ic(el.dataset.icon); });
  try {
    await seed();
    await loadState();
  } catch (err) {
    console.error(err);
    $('#view').innerHTML = `<div class="empty">No se ha podido abrir el almacenamiento local (${esc(err.message)}). Abre la app desde el servidor local o prueba con otro navegador.</div>`;
    return;
  }
  Player.init();
  window.addEventListener('hashchange', () => render());
  render();
  try { navigator.storage?.persist?.(); } catch { /* no disponible */ }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
