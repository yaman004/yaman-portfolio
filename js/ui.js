/* HUD, minimap, overlays (phone, project, mission run, resume, travel, effects) */

/* ================= HUD ================= */
let hudBuilt = false, mmWorld, mmDyn, mmN, mmWp, hudEls = {}
function buildHUD() {
  const hud = $('#hud')
  clear(hud)
  let clicks = 0, lastClick = 0
  hudEls.title = h('div.sub.ui')
  hud.appendChild(h('div.hud-tl',
    h('button.logo', { 'aria-label': 'Logo', onclick: () => { const t = performance.now(); clicks = t - lastClick > 2500 ? 1 : clicks + 1; lastClick = t; play('click'); if (clicks >= 5) { clicks = 0; toggleDev() } } }, h('span', 'YC')),
    h('div', h('div.nm', 'Yaman Choudhary'), hudEls.title)))
  hudEls.t = h('div.t'); hudEls.d = h('div.d.ui'); hudEls.l = h('div.l.ui'); hudEls.j = h('div.j.ui', 'Jaipur, India'); hudEls.stars = h('div.stars')
  hudEls.audioBtn = h('button.iconbtn.panel-flat', { 'aria-label': 'Sound settings', 'aria-haspopup': 'true', onclick: (e) => { e.stopPropagation(); toggleAudioPop() } })
  hudEls.audioPop = h('div.audio-pop.panel', { hidden: true, onclick: (e) => e.stopPropagation() })
  hud.appendChild(h('div.hud-tr', h('div.clock', hudEls.t, hudEls.d, hudEls.l, hudEls.j, hudEls.stars), h('div', { style: { position: 'relative' } }, hudEls.audioBtn, hudEls.audioPop)))
  document.addEventListener('click', () => { hudEls.audioPop.hidden = true })

  // minimap
  mmWorld = document.createElementNS(SVGNS, 'g'); mmWorld.id = 'mm-world'
  const art = document.createElementNS(SVGNS, 'g'); art.innerHTML = mapArtMarkup(false, 'mini')
  mmDyn = document.createElementNS(SVGNS, 'g')
  mmWorld.append(art, mmDyn)
  const scale = document.createElementNS(SVGNS, 'g'); scale.setAttribute('transform', 'scale(.62)'); scale.appendChild(mmWorld)
  const svg = svgEl(0, 0, { viewBox: '-100 -100 200 200' }, '')
  svg.appendChild(scale)
  const fg = document.createElementNS(SVGNS, 'g')
  fg.innerHTML = '<path d="M0 -26 L22 -64 A74 74 0 0 0 -22 -64 Z" fill="rgba(255,255,255,.14)"/><circle r="9" fill="rgba(255,255,255,.2)" class="ping"/><path d="M0 -9 L7 8 L0 4 L-7 8 Z" fill="#fff" stroke="#000" stroke-width="1.6"/>'
  svg.appendChild(fg)
  mmWp = document.createElementNS(SVGNS, 'path'); mmWp.setAttribute('d', 'M0 -7 L6 5 L-6 5 Z'); mmWp.setAttribute('fill', '#e94fd0'); mmWp.setAttribute('stroke', '#000'); mmWp.setAttribute('stroke-width', '1.4'); mmWp.style.display = 'none'
  mmN = document.createElementNS(SVGNS, 'text'); mmN.setAttribute('font-family', 'Barlow Condensed'); mmN.setAttribute('font-weight', '700'); mmN.setAttribute('font-size', '13'); mmN.setAttribute('fill', '#ff6a5a'); mmN.setAttribute('text-anchor', 'middle'); mmN.textContent = 'N'
  svg.append(mmWp, mmN)
  hudEls.mmCap = h('span.cap.ui')
  hud.appendChild(h('button.mm', { 'aria-label': 'Minimap. Click to open the full map.', onclick: openMap }, h('div.disc', h('div.sway', svg), h('div.rim')), hudEls.mmCap))

  // status
  hudEls.obj = h('div.obj.ui'); hudEls.pgf = h('div.f'); hudEls.pgt = h('span.ui', { style: { fontSize: '12px' } }); hudEls.ach = h('div.ui.dim', { style: { fontSize: '12px', marginTop: '4px' } }); hudEls.wp = h('div.wp', { hidden: true })
  hud.appendChild(h('div.status.panel-flat', h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, h('span.label.accent', 'Mission status'), h('button.label', { style: { background: 'none', border: 0 }, onclick: togglePhone, 'aria-label': 'Open phone' }, 'P · Phone')),
    hudEls.obj, h('div.pg', h('div.t', hudEls.pgf), hudEls.pgt), hudEls.ach, hudEls.wp))
  hud.appendChild(h('button.phone-fab.panel-flat', { 'aria-label': 'Open phone', onclick: togglePhone }, ico('phone', 22)))
  hudEls.dock = h('nav.dock', { 'aria-label': 'Touch controls' }, [['arrowleft', 'Back', back], ['grid', 'Menu', () => go('/')], ['map', 'Map', openMap], ['phone', 'Phone', togglePhone]].map(([i, l, fn]) => h('button', { 'aria-label': l, 'data-k': l, onclick: fn }, ico(i, 20), h('span', l))))
  hud.appendChild(hudEls.dock)
  hudEls.dev = h('div.devpanel.panel', { hidden: true })
  hud.appendChild(hudEls.dev)
  hudBuilt = true
}
function toggleAudioPop() { hudEls.audioPop.hidden = !hudEls.audioPop.hidden; play('click'); refreshAudioUI() }
function refreshAudioUI() {
  if (!hudBuilt) return
  clear(hudEls.audioBtn).appendChild(ico(G.prefs.sound ? 'vol' : 'mute', 20))
  const pop = clear(hudEls.audioPop)
  pop.append(
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('span.ui', 'Sound'), h('button.switch', { role: 'switch', 'aria-checked': String(G.prefs.sound), 'aria-label': 'Sound on or off', onclick: () => { setPref('sound', !G.prefs.sound); play('click') } })),
    h('label', { style: { display: 'block', marginTop: '12px' } }, h('span.label', { style: { display: 'block', marginBottom: '4px' } }, 'Volume · ' + Math.round(G.prefs.volume * 100) + '%'), h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: G.prefs.volume, 'aria-label': 'Volume', oninput: (e) => { G.prefs.volume = Number(e.target.value); applyPrefs(); persist(); e.target.previousSibling.textContent = 'Volume · ' + Math.round(G.prefs.volume * 100) + '%' }, onchange: () => play('click') })),
    h('button.btn.sm', { style: { width: '100%', marginTop: '12px' }, onclick: () => { setPref('sound', !G.prefs.sound) } }, G.prefs.sound ? 'Mute all' : 'Unmute'))
}
function tickClock() {
  if (!hudBuilt) return
  const n = new Date()
  hudEls.t.textContent = n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
  hudEls.d.innerHTML = n.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase() + ' · <span class="full">' + n.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() + '</span>'
}
function refreshHUD() {
  if (!hudBuilt) return
  const sec = sectionByPath(G.path), sp = spot()
  hudEls.title.textContent = (sec ? sec.label : 'Main menu') + ' · Full Stack · UI · AI'
  hudEls.l.textContent = sp.place + ', Los Santos'
  clear(hudEls.stars)
  if (G.wanted > 0) for (let i = 0; i < 5; i++) hudEls.stars.appendChild(h('span' + (i < G.wanted ? '.wanted-star' : '.off'), '★'))
  document.body.classList.toggle('map', G.path === '/map')
  hudEls.mmCap.innerHTML = sp.place + ' <span style="opacity:.5">· click to expand</span>'
  hudEls.obj.textContent = sec ? sec.objective : 'Choose a destination'
  const pc = percent()
  hudEls.pgf.style.width = pc + '%'; hudEls.pgt.textContent = pc + '%'
  hudEls.ach.textContent = 'Achievements ' + Object.keys(G.achievements).length + '/' + ACHIEVEMENTS.length + (G.classified ? ' · Classified found' : '')
  const wp = G.waypoint && projectById(G.waypoint), rt = currentRoute()
  hudEls.wp.hidden = !wp
  if (wp) {
    clear(hudEls.wp).append(
      h('button.ui', { style: { background: 'none', border: 0, textAlign: 'left', color: '#ff7ae0', padding: 0 }, onclick: () => go('/map', { instant: true }) }, '◆ Waypoint · ' + wp.title, rt ? h('small', kmFromUnits(rt.length) + ' km · ETA ' + etaMinutes(rt.length) + ' min') : null),
      h('button.iconbtn', { 'aria-label': 'Clear waypoint', style: { width: '24px', height: '24px', border: '1px solid rgba(255,255,255,.2)', background: 'none' }, onclick: () => setWaypoint(null) }, ico('x', 12)))
  }
  $$('button', hudEls.dock).forEach((b) => b.classList.toggle('on', b.dataset.k === 'Menu' && G.path === '/'))
  // minimap
  const [px, py] = NODES[sp.node], rot = sp.rot, R = 100, S = 0.62
  mmWorld.style.transform = 'rotate(' + rot + 'deg) translate(' + -px + 'px,' + -py + 'px)'
  const list = missionList()
  let d = ''
  if (rt) d += `<polyline points="${rt.points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#e94fd0" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" opacity=".95"/>`
  let wpPos = null
  list.forEach((p) => {
    const pos = NODES[DISTRICTS.find((x) => x.id === p.district).node]
    if (p.id === G.waypoint) wpPos = pos
    d += `<g transform="translate(${pos[0]} ${pos[1]})"><circle r="11" fill="#f5b01c" stroke="#000" stroke-width="2.5"/>${G.viewed[p.id] ? '<path d="M-4.5 0 L-1.2 3.6 L5 -3.6" stroke="#000" stroke-width="2.2" fill="none"/>' : ''}</g>`
  })
  if (wpPos) d += `<circle cx="${wpPos[0]}" cy="${wpPos[1]}" r="16" fill="none" stroke="#e94fd0" stroke-width="3"/>`
  mmDyn.innerHTML = d
  mmWp.style.display = 'none'
  if (wpPos) {
    const a = (rot * Math.PI) / 180, dx = wpPos[0] - px, dy = wpPos[1] - py
    const sx = (dx * Math.cos(a) - dy * Math.sin(a)) * S, sy = (dx * Math.sin(a) + dy * Math.cos(a)) * S, dist = Math.hypot(sx, sy)
    if (dist > R - 10) { mmWp.style.display = ''; mmWp.setAttribute('transform', `translate(${(sx / dist) * (R - 10)} ${(sy / dist) * (R - 10)}) rotate(${(Math.atan2(sy, sx) * 180) / Math.PI + 90})`) }
  }
  const na = (-rot * Math.PI) / 180
  mmN.setAttribute('x', Math.sin(na) * (R - 9)); mmN.setAttribute('y', -Math.cos(na) * (R - 9) + 4)
  // dev panel
  hudEls.dev.hidden = !G.devMode
  if (G.devMode) {
    clear(hudEls.dev).append(h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, h('b', 'DEV MODE'), h('button', { 'aria-label': 'Close dev mode', style: { margin: 0 }, onclick: toggleDev }, '×')),
      h('div', 'FPS ', h('span#fps', '0')), h('div', 'ROUTE ' + G.path), h('div', 'VIEWPORT ' + innerWidth + '×' + innerHeight), h('div', 'ACH ' + Object.keys(G.achievements).length + '/' + ACHIEVEMENTS.length + ' · ' + pc + '%'),
      h('div', { style: { marginTop: '8px' } }, h('button', { onclick: () => triggerWanted(2, 'Spawned from dev panel.') }, 'WANTED'), h('button', { onclick: resetProgress }, 'RESET')))
  }
}
let fpsN = 0, fpsT = performance.now()
function fpsLoop(t) { fpsN++; if (t - fpsT >= 1000) { const f = $('#fps'); if (f) f.textContent = fpsN; fpsN = 0; fpsT = t } requestAnimationFrame(fpsLoop) }
requestAnimationFrame(fpsLoop)

/* ================= PHONE ================= */
function phoneRow(icon, label, sub, opts) {
  const inner = [h('span.ri', { style: { background: opts.bg } }, ico(icon, 17)), h('span', { style: { minWidth: 0, flex: 1 } }, h('b', label), sub ? h('small', sub) : null)]
  if (opts.href) return h('a.ph-row', { href: opts.href, onclick: () => play('click') }, inner)
  return h('button.ph-row', { onclick: opts.onclick }, inner)
}
function contactRows() {
  return [
    phoneRow('phone', 'Call', OWNER.phone, { href: OWNER.phoneHref, bg: '#059669' }),
    phoneRow('whatsapp', 'WhatsApp', OWNER.phone, { onclick: () => openExternal('whatsapp'), bg: '#16a34a' }),
    phoneRow('mail', 'Email', OWNER.email, { onclick: () => openExternal('email'), bg: '#0284c7' }),
    phoneRow('linkedin', 'LinkedIn', 'in/yaman004', { onclick: () => openExternal('linkedin'), bg: '#1d4ed8' }),
    phoneRow('github', 'GitHub', 'yaman004', { onclick: () => openExternal('github'), bg: '#3f3f46' }),
  ]
}
function phoneFrame(inner, extraStyle) {
  const time = h('span', new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }))
  return h('div.phone-body', { style: extraStyle }, h('div.phone-screen',
    h('div.ph-status', time, h('span.notch'), h('span', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, h('span.ph-bar', [3, 5, 7, 9].map((x) => h('i', { style: { height: x + 'px' } }))), h('span', { style: { width: '20px', height: '10px', border: '1px solid rgba(255,255,255,.8)', borderRadius: '3px', padding: '1px' } }, h('i', { style: { display: 'block', height: '100%', width: '75%', background: 'var(--green)' } })))),
    h('div.ph-body', inner), h('div.ph-home')))
}
function achievementList(compact) {
  return h('ul.ach', ACHIEVEMENTS.map((a) => {
    const got = G.achievements[a.id], hide = !got && a.secret
    return h('li' + (got ? '.got' : ''), h('span.ic', ico(got ? 'trophy' : 'lock', 15)), h('span', h('b', hide ? '???' : a.name), compact ? null : h('small', hide ? 'Secret achievement' : a.desc)))
  }))
}
function toggleRow(label, on, set) {
  return h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' } }, h('span.ui', { style: { fontSize: '16px' } }, label), h('button.switch', { role: 'switch', 'aria-checked': String(!!on), 'aria-label': label, onclick: () => set(!on) }))
}
function phoneAppHeader(title) { return h('div.ph-head', h('button.bk', { 'aria-label': 'Back', onclick: () => { play('back'); G.phoneApp = null; renderPhone() } }, ico('left', 20)), h('b', title)) }
function phoneContent() {
  const app = G.phoneApp
  if (!app) {
    const APPS = [['contacts', 'Contacts', 'user', '#059669'], ['messages', 'Messages', 'msg', '#0284c7'], ['projects', 'Projects', 'briefcase', '#ea580c'], ['skills', 'Skills', 'zap', '#ca8a04'], ['resume', 'Resume', 'file', '#e11d48'], ['socials', 'Socials', 'share', '#7c3aed'], ['map', 'Map', 'map', '#0d9488'], ['trophies', 'Trophies', 'trophy', '#b45309'], ['settings', 'Settings', 'sliders', '#52525b']]
    return h('div', { style: { padding: '12px 16px', height: '100%' } }, h('div.title', { style: { fontSize: '40px' } }, 'Yaman'), h('div.label', { style: { marginBottom: '16px' } }, 'Full stack · UI · AI'),
      h('div.ph-apps', APPS.map(([id, label, ic, col], i) => h('button', { 'aria-label': label, style: { animationDelay: i * 0.05 + 's' }, onclick: () => {
        play('click')
        if (id === 'skills') return go('/skills')
        if (id === 'map') { closePhone(true); return openMap() }
        if (id === 'resume') return openResume()
        G.phoneApp = id; renderPhone()
      } }, h('span.ai', { style: { background: col } }, ico(ic, 26)), h('span.t', label)))))
  }
  const wrap = (title, body) => h('div.ph-app', phoneAppHeader(title), h('div.ph-list', body))
  if (app === 'contacts') return wrap('Contacts', [h('div', { style: { textAlign: 'center', padding: '16px' } }, h('span', { style: { width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'inline-grid', placeItems: 'center', font: 'bold 30px var(--f-body)' } }, 'YC'), h('div.title', { style: { fontSize: '30px', marginTop: '8px' } }, 'Yaman Choudhary'), h('div.label', OWNER.headline)), contactRows()])
  if (app === 'projects') return wrap('Projects', PROJECTS.map((p) => phoneRow('briefcase', p.title, 'Mission ' + pad2(p.n) + ' · ' + p.type, { onclick: () => openRepo(p.id), bg: '#ea580c' })))
  if (app === 'socials') return wrap('Socials', [phoneRow('github', 'GitHub', 'github.com/yaman004', { onclick: () => openExternal('github'), bg: '#3f3f46' }), phoneRow('linkedin', 'LinkedIn', 'linkedin.com/in/yaman004', { onclick: () => openExternal('linkedin'), bg: '#1d4ed8' }), phoneRow('whatsapp', 'WhatsApp', OWNER.phone, { onclick: () => openExternal('whatsapp'), bg: '#16a34a' }), phoneRow('mail', 'Email', OWNER.email, { onclick: () => openExternal('email'), bg: '#0284c7' })])
  if (app === 'trophies') return wrap('Achievements', h('div', { style: { padding: '12px' } }, achievementList(true)))
  if (app === 'settings') return wrap('Settings', h('div', { style: { padding: '16px' } },
    toggleRow('Sound', G.prefs.sound, (v) => { setPref('sound', v); renderPhone() }),
    h('label', { style: { display: 'block', marginBottom: '14px' } }, h('span.label', { style: { display: 'block' } }, 'Volume'), h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: G.prefs.volume, 'aria-label': 'Volume', oninput: (e) => { G.prefs.volume = Number(e.target.value); applyPrefs(); persist() } })),
    toggleRow('Cinematic vehicle travel', G.prefs.cinematic, (v) => { setPref('cinematic', v); renderPhone() }),
    toggleRow('Developer mode', G.devMode, () => { toggleDev(); renderPhone() }),
    h('button.btn', { style: { width: '100%' }, onclick: resetProgress }, 'Reset progress')))
  if (app === 'messages') return messagesApp()
  return h('div')
}
let msgTimers = []
function messagesApp() {
  const thread = ['Hey! Thanks for stopping by.', 'I build MERN apps and AI-powered products.', 'Interested in working together?']
  const list = h('div.ph-list', { style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } })
  const send = (s, b) => { play('accept'); openUrl(composeUrl(s, b)) }
  msgTimers.forEach(clearTimeout)
  msgTimers = thread.map((m, i) => setTimeout(() => {
    if (!list.isConnected) return
    list.appendChild(h('div.bubble', m)); play('notify')
    if (i === thread.length - 1) list.appendChild(h('div.row', { style: { justifyContent: 'flex-end', paddingTop: '8px' } }, [["Let's work together", 'Opportunity', "Hi Yaman, I'd like to talk about working together."], ['I have a question', 'Quick question', 'Hi Yaman, I had a quick question about your work.'], ['Send me your resume', 'Resume request', 'Hi Yaman, could you share your latest resume?']].map(([l, s, b]) => h('button.pill.o', { onclick: () => send(s, b) }, l))))
  }, 500 + i * 1100))
  const input = h('input', { placeholder: 'Type a message', 'aria-label': 'Message' })
  return h('div.ph-app', phoneAppHeader('Yaman'), list, h('form.ph-input', { onsubmit: (e) => { e.preventDefault(); if (!input.value.trim()) return play('error'); send('Message from your portfolio', input.value.trim()) } }, input, h('button', { 'aria-label': 'Send message' }, ico('send', 16))))
}
function renderPhone() {
  const box = $('#phone')
  if (!box) return
  const body = $('.ph-body', box)
  clear(body).append(phoneContent())
}
function openPhone() {
  if (G.phoneOpen) return
  G.phoneOpen = true; G.phoneApp = null
  const wrap = h('div#phone-wrap', h('div.bd', { onclick: () => closePhone() }), h('div#phone', { role: 'dialog', 'aria-label': 'Phone' }, phoneFrame(null), h('button.x', { 'aria-label': 'Close phone', onclick: () => closePhone() }, ico('x', 14))))
  document.body.appendChild(wrap)
  renderPhone()
  play('phone')
}
function closePhone(silent) {
  if (!G.phoneOpen) return
  G.phoneOpen = false; msgTimers.forEach(clearTimeout)
  const w = $('#phone-wrap'); if (w) w.remove()
  if (!silent) play('back')
}
function togglePhone() { G.phoneOpen ? closePhone() : openPhone() }

/* ================= PROJECT MODAL ================= */
function renderProjectModal() {
  let o = $('#proj-modal')
  if (o) o.remove()
  const p = G.projectId && projectById(G.projectId)
  if (!p) return
  const d = DISTRICTS.find((x) => x.id === p.district)
  const close = h('button.btn.closeb', { 'aria-label': 'Close', onclick: closeProject }, ico('x', 15), 'Close')
  o = h('div#proj-modal.overlay', h('div.bd', { onclick: closeProject }),
    h('div.modal.panel', { role: 'dialog', 'aria-modal': 'true', 'aria-label': p.title + ' briefing' }, h('div.bar4'), close,
      h('div.in', h('div.label.accent', (p.hidden ? 'Hidden mission' : 'Mission ' + pad2(p.n)) + ' · ' + (d ? d.name : '')), h('h2.title', p.title), h('div.ui.dim', { style: { fontSize: '18px' } }, p.subtitle),
        h('div.fields', field('Type', p.type), field('Difficulty', stars(p.difficulty)), field('Status', statusBadge(p))),
        h('p', { style: { marginTop: '20px' } }, p.desc),
        h('div.label', { style: { margin: '24px 0 8px' } }, 'Objectives'),
        h('ul.objs', p.objectives.map((x) => h('li', ico('check', 15), x))),
        h('div.label', { style: { margin: '24px 0 8px' } }, 'Tech'), h('div.row', p.tech.map((t) => h('span.chip', t))),
        h('div.row', { style: { marginTop: '28px' } },
          h('button.btn.primary', { onclick: () => startMission(p.id) }, ico('play'), 'Start mission'),
          h('button.btn', { onclick: () => openRepo(p.id) }, ico('code'), 'View on GitHub'),
          h('button.btn', { onclick: () => { G.projectId = null; renderProjectModal(); setWaypoint(p.id); go('/map', { instant: true }) } }, ico('pin'), 'Set waypoint')))))
  document.body.appendChild(o)
  close.focus()
}

/* ================= MISSION RUN + PASSED ================= */
function missionPassed(sub, title, onDone) {
  const old = $('#passed'); if (old) old.remove()
  play('complete')
  const el = h('div#passed', { role: 'status' }, h('div.band'), h('div.txt', h('div.big', Array.from((title || 'mission passed').toUpperCase()).map((c, i) => h('span', { style: { animationDelay: 0.35 + i * 0.035 + 's' } }, c))), sub ? h('div.sub', sub) : null))
  document.body.appendChild(el)
  setTimeout(() => el.classList.add('out'), 3300)
  setTimeout(() => { el.remove(); onDone && onDone() }, 3900)
}
let runTimers = []
function renderMissionRun() {
  runTimers.forEach(clearTimeout); runTimers = []
  let o = $('#run'); if (o) o.remove()
  const p = G.missionRun && projectById(G.missionRun)
  if (!p) return
  o = h('div#run', h('button.btn.close', { onclick: () => { endMission(); play('back') } }, ico('x', 15), 'Close'))
  document.body.appendChild(o)
  o.appendChild(h('div.run-title', h('div', h('div.label.accent', 'Mission ' + pad2(p.n) + ' · ' + p.type), h('div.title', p.title), h('div.ui.dim', { style: { fontSize: '20px' } }, p.subtitle))))
  let ticked = 0, list, actions
  const finish = () => { runTimers.forEach(clearTimeout); $$('li', list).forEach((li) => { li.classList.add('done'); li.firstChild.textContent = '✓' }); if (!actions.hasChildNodes()) passed() }
  const passed = () => {
    missionPassed(p.title + ' · ' + p.type)
    actions.append(h('button.btn.primary', { onclick: () => { endMission(); openProject(p.id) } }, 'View project'), h('button.btn', { onclick: endMission }, 'Back to menu'))
  }
  runTimers.push(setTimeout(() => {
    if (!$('#run')) return
    clear(o).append(h('button.btn.close', { onclick: () => { endMission(); play('back') } }, ico('x', 15), 'Close'))
    list = h('ul', { onclick: finish }, p.objectives.map((x) => h('li', h('i'), x)))
    actions = h('div.row', { style: { marginTop: '24px' } })
    o.appendChild(h('div.run-obj', h('div.label.accent', 'Objectives'), h('div.title', { style: { fontSize: '48px' } }, p.title), list, h('button.btn', { style: { marginTop: '20px' }, onclick: finish }, 'Skip to the end'), actions))
    const step = () => {
      if (!$('#run')) return
      if (ticked >= p.objectives.length) { runTimers.push(setTimeout(() => { if (!actions.hasChildNodes()) passed() }, 700)); return }
      const li = $$('li', list)[ticked]; li.classList.add('done'); li.firstChild.textContent = '✓'; ticked++; play('accept')
      runTimers.push(setTimeout(step, 900))
    }
    runTimers.push(setTimeout(step, 600))
  }, 1900))
}

/* ================= RESUME VIEWER ================= */
function resumeDoc() {
  const sec = (t, ...k) => h('section', h('h3', t), k)
  const eduName = (e) => e.title.replace('B.TECH, COMPUTER SCIENCE ENGINEERING', 'B.Tech, Computer Science Engineering').replace('SENIOR SECONDARY (12TH, RBSE)', 'Senior Secondary (12th, RBSE)')
  const title = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  return h('article.doc',
    h('h1', OWNER.name), h('div.hl', OWNER.headline), h('div.ct', OWNER.location + ' · ' + OWNER.phone + ' · ' + OWNER.email), h('div.ct', 'linkedin.com/in/yaman004 · GitHub: yaman004'),
    sec('Professional Summary', h('p', OWNER.summary)),
    sec('Technical Skills', RESUME.skills.map(([k, v]) => h('p', h('b', k + ': '), v))),
    sec('Experience', RESUME.experience.map((e) => h('div', h('div.rw', h('span', e.role + ' — ' + e.org), h('span', e.period)), h('ul', e.bullets.map((b) => h('li', b)))))),
    sec('Projects', RESUME.projects.map((p) => h('div', h('div', { style: { fontWeight: 600 } }, p.name, h('span.tc', ' | ' + p.tech)), h('ul', h('li', p.bullet))))),
    sec('Education', EDUCATION.map((e) => h('div', { style: { marginBottom: '8px' } }, h('div.rw', h('span', eduName(e) + ' — ' + title(e.school)), h('span', e.years)), h('div', { style: { color: '#525252' } }, (e.stat === 'CGPA' ? 'CGPA: ' : 'Percentage: ') + e.shown + ' | ' + e.place)))),
    sec('Certifications', h('p', CERTS.map((c) => c.name + ' (' + c.by + ')').join(' • '))))
}
function openResume() {
  closePhone(true)
  if (G.resumeOpen) return
  G.resumeOpen = true; play('click')
  let mode = 'doc'
  const main = h('div.main'), box = h('div#resume-v', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Resume viewer' })
  const draw = () => {
    clear(main)
    if (mode === 'doc') main.appendChild(resumeDoc())
    else main.append(h('div', { style: { maxWidth: '900px', margin: '0 auto' } }, h('iframe', { title: 'Resume PDF', src: resumeUrl, style: { width: '100%', height: '78vh', background: '#fff', border: 0 } }), h('a.btn', { href: resumeUrl, target: '_blank', rel: 'noopener noreferrer', style: { marginTop: '12px' } }, ico('ext', 15), 'Open PDF in a new tab')))
    docBtn.classList.toggle('on', mode === 'doc'); pdfBtn.classList.toggle('on', mode === 'pdf')
  }
  const docBtn = h('button.btn', { onclick: () => { mode = 'doc'; play('click'); draw() } }, 'Document')
  const pdfBtn = h('button.btn', { onclick: () => { mode = 'pdf'; play('click'); draw() } }, 'PDF')
  const fsBtn = h('button.btn', { onclick: () => {
    play('click')
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return }
    if (box.requestFullscreen) box.requestFullscreen().catch(() => window.open(resumeUrl, '_blank', 'noopener')); else window.open(resumeUrl, '_blank', 'noopener')
  } }, ico('max', 15), 'Open full screen')
  box.append(h('div.bar', ico('file', 18), h('div', { style: { marginRight: 'auto' } }, h('div.ui', 'Resume.pdf'), h('div.label', 'Classification: public')), docBtn, pdfBtn,
    h('a.btn.primary', { href: resumeUrl, download: OWNER.resumeFile, onclick: () => play('accept') }, ico('download', 15), 'Download resume'), fsBtn, h('button.btn', { onclick: () => closeResume() }, ico('x', 15), 'Close')), main)
  document.body.appendChild(box)
  draw()
}
function closeResume(silent) {
  if (!G.resumeOpen) return
  G.resumeOpen = false
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  const b = $('#resume-v'); if (b) b.remove()
  if (!silent) play('back')
}

/* ================= FAST TRAVEL ================= */
function skylineUri(seed, fill, maxH) {
  let s = seed
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  let x = 0, out = ''
  while (x < 600) {
    const w = 24 + r() * 50, hh = 40 + r() * maxH
    out += `<rect x='${x}' y='${300 - hh}' width='${w}' height='${hh}' fill='${fill}'/>`
    for (let i = 0; i < 14; i++) if (r() < 0.5) out += `<rect x='${x + 4 + r() * (w - 10)}' y='${300 - hh + 6 + r() * (hh - 12)}' width='3' height='4' fill='%23ffd88a' opacity='.7'/>`
    x += w + 2
  }
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300'>${out}</svg>")`
}
let skyL
function renderTravel() {
  let t = $('#travel'); if (t) t.remove()
  const tv = G.travel
  if (!tv) return
  skyL = skyL || [[7, '%23121a2e', 150, 5, '38%'], [19, '%230a0e18', 190, 2.6, '48%'], [31, '%23040509', 120, 1.1, '34%']].map(([s, f, m, d, hh]) => ({ img: skylineUri(s, f, m), d, hh }))
  t = h('div#travel', { role: 'status', 'aria-label': 'Travelling from ' + tv.from + ' to ' + tv.to, onclick: skipTravel }, h('div.sky'),
    skyL.map((l) => h('div.lyr', { style: { height: l.hh, backgroundImage: l.img, animation: 'skyMove ' + l.d + 's linear infinite' } })),
    h('div.road', h('i')), h('div.streak'),
    h('div.dash', { html: '<svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="width:100%;height:100%"><path d="M0 300 L0 170 Q500 90 1000 170 L1000 300 Z" fill="#050506"/><path d="M0 170 Q500 90 1000 170" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3"/><ellipse cx="500" cy="330" rx="230" ry="150" fill="none" stroke="#0e0f12" stroke-width="38"/></svg>' }),
    h('div.lb', { style: { top: 0, height: '10%' } }), h('div.lb', { style: { bottom: 0, height: '8%' } }),
    h('div.txt', h('div.a', 'ENTER VEHICLE'), h('div.ui.dim', { style: { fontSize: '18px', marginTop: '8px' } }, tv.from + ' → ' + tv.to), h('div.d', h('div.title.accent', { style: { fontSize: 'clamp(36px,8vw,96px)' } }, tv.to), tv.place ? h('div.ui.dim', tv.place + ', Los Santos') : null)),
    h('div.skip.ui', 'Press Enter or tap to skip'))
  document.body.appendChild(t)
}

/* ================= EASTER EGG FX ================= */
let rainRaf = 0
function renderFx() {
  $$('.cheat,#rain,.gta-fx').forEach((n) => n.remove())
  cancelAnimationFrame(rainRaf)
  document.body.classList.toggle('cheat-hue', !!(G.fx && G.fx.kind === 'konami'))
  const fx = G.fx
  if (!fx) return
  if (fx.kind === 'konami') {
    const c = h('canvas#rain', { 'aria-hidden': 'true' }); document.body.appendChild(c)
    const x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight
    const size = 18, cols = Math.ceil(c.width / size), drops = Array.from({ length: cols }, () => Math.random() * -40), chars = '01{}[]<>/=;const let => async await import'.split('')
    const draw = () => {
      x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, 0, c.width, c.height); x.font = size + 'px "JetBrains Mono", monospace'
      drops.forEach((d, i) => { x.fillStyle = Math.random() < 0.08 ? '#fff' : i % 3 === 0 ? '#f5b01c' : '#6fbe44'; x.fillText(chars[(Math.random() * chars.length) | 0], i * size, d * size); drops[i] = d * size > c.height && Math.random() > 0.96 ? 0 : d + 0.7 })
      rainRaf = requestAnimationFrame(draw)
    }
    draw()
    document.body.appendChild(h('div.cheat', h('div', h('div.title.glitch', 'CHEAT ACTIVATED'), h('div.s', 'Infinite coffee · bugs −100%'))))
  } else {
    const car = '<svg viewBox="0 0 220 70"><path d="M8 46 Q10 30 38 28 L66 12 Q74 8 90 8 L132 8 Q148 8 158 20 L180 30 Q208 32 212 46 L212 52 L8 52 Z" fill="#c8321e" stroke="#000" stroke-width="2.5"/><path d="M72 14 L90 12 L90 28 L52 28 Z M98 12 L130 12 Q142 14 150 26 L98 28 Z" fill="#1b2a3a"/><rect x="196" y="36" width="14" height="6" fill="#fff8d0"/><circle cx="54" cy="54" r="13" fill="#0a0a0a"/><circle cx="54" cy="54" r="6" fill="#555"/><circle cx="160" cy="54" r="13" fill="#0a0a0a"/><circle cx="160" cy="54" r="6" fill="#555"/></svg>'
    document.body.appendChild(h('div.gta-fx', h('div.sirens'), h('div.car', { html: car }), h('div.txt', h('div.title', { style: { fontSize: 'clamp(40px,10vw,130px)' } }, 'VEHICLE SPAWNED'), h('div.ui.accent', { style: { fontSize: '22px' } }, 'Los Santos PD is on the way'))))
  }
}
