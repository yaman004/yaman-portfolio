/* Game state + helpers (plain JS, no framework). Everything is a global so the other scripts can share it. */

/* ---------- tiny DOM helper: h('div.a.b', {onclick, style, class, html}, ...children) ---------- */
function h(sel, props, ...kids) {
  const m = /^([a-z0-9]*)(?:#([\w-]+))?((?:\.[\w-]+)*)$/i.exec(sel) || [null, 'div', '', '']
  const el = document.createElement(m[1] || 'div')
  if (m[2]) el.id = m[2]
  if (m[3]) el.className = m[3].slice(1).split('.').join(' ')
  if (props && (props.nodeType || typeof props === 'string' || Array.isArray(props))) { kids.unshift(props); props = null }
  for (const k in props || {}) {
    const v = props[k]
    if (v == null || v === false) continue
    if (k === 'class') el.className += (el.className ? ' ' : '') + v
    else if (k === 'html') el.innerHTML = v
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v)
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v)
    else if (k === 'value') el.value = v
    else el.setAttribute(k, v === true ? '' : v)
  }
  add(el, kids)
  return el
}
function add(el, kids) {
  for (const k of kids) {
    if (k == null || k === false) continue
    if (Array.isArray(k)) add(el, k)
    else el.appendChild(k.nodeType ? k : document.createTextNode(String(k)))
  }
  return el
}
function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el }
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))
const isTyping = (e) => !!(e.target && e.target.closest && e.target.closest('input,textarea,[contenteditable="true"]'))
const pad2 = (n) => String(n).padStart(2, '0')

function letters(text, delay = 0, tag = 'span') {
  return h(tag + '.letters', { 'aria-label': text }, Array.from(text).map((c, i) => h('span', { 'aria-hidden': 'true', style: { animationDelay: delay + i * 0.035 + 's' } }, c)))
}

/* ---------- persistent state ---------- */
const KEY = 'ls-portfolio-v1'
const G = {
  prefs: { sound: true, volume: 0.6, cinematic: true },
  achievements: {}, visited: {}, viewed: {}, classified: false,
  wanted: 0, waypoint: null, character: 0, devMode: false,
  path: '/', entered: false,
  phoneOpen: false, phoneApp: null, resumeOpen: false, projectId: null, missionRun: null, travel: null, fx: null,
}
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
  Object.assign(G.prefs, raw.prefs || {})
  G.achievements = raw.achievements || {}
  G.visited = raw.visited || {}
  G.viewed = raw.viewed || {}
  G.classified = !!raw.classified
} catch (e) { /* storage blocked or corrupt */ }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ prefs: G.prefs, achievements: G.achievements, visited: G.visited, viewed: G.viewed, classified: G.classified })) } catch (e) { /* ignore */ }
}

const cityState = { theme: 0, hold: null }
const play = (n) => sound.play(n)
function applyPrefs() { sound.setEnabled(G.prefs.sound); sound.setVolume(G.prefs.volume) }
function setPref(k, v) { G.prefs[k] = v; applyPrefs(); persist(); if (window.refreshAudioUI) refreshAudioUI() }

/* ---------- toasts ---------- */
function pushToast(t) {
  const box = $('#toasts')
  if (!box) return
  while (box.children.length > 3) box.removeChild(box.firstChild)
  const icon = t.kind === 'wanted' ? (t.clear ? 'check' : 'zap') : 'trophy'
  const el = h('button.toast.panel.' + (t.kind === 'wanted' ? (t.clear ? 'clear' : 'wanted') : 'ach'), { type: 'button', onclick: () => el.remove() },
    h('span.ic', ico(icon, 22)),
    h('span', h('span.k.block', { style: { display: 'block' } }, t.kind === 'achievement' ? 'Achievement unlocked' : t.clear ? 'All clear' : 'Wanted'), h('span.t', { style: { display: 'block' } }, t.title), t.text ? h('span.m', { style: { display: 'block' } }, t.text) : null))
  box.appendChild(el)
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = 0; setTimeout(() => el.remove(), 420) }, 4600)
}

/* ---------- achievements, wanted ---------- */
function unlock(id) {
  if (G.achievements[id]) return
  const def = ACHIEVEMENTS.find((a) => a.id === id)
  if (!def) return
  G.achievements[id] = Date.now()
  persist()
  play('achievement')
  pushToast({ kind: 'achievement', title: def.name, text: def.desc })
  if (id !== 'hundred' && ACHIEVEMENTS.filter((a) => a.core).every((a) => G.achievements[a.id])) setTimeout(() => unlock('hundred'), 2200)
  refreshAll()
}
let wantedTimer = 0
function triggerWanted(level, message) {
  clearTimeout(wantedTimer)
  G.wanted = level
  play('wanted')
  pushToast({ kind: 'wanted', title: 'WANTED LEVEL ' + '★'.repeat(level) + '☆'.repeat(5 - level), text: message })
  refreshHUD()
  wantedTimer = setTimeout(() => {
    G.wanted = 0
    pushToast({ kind: 'wanted', title: 'WANTED LEVEL CLEARED', text: 'You lost the cops.', clear: true })
    refreshHUD()
  }, 7000)
}
function percent() {
  const core = ACHIEVEMENTS.filter((a) => a.core).length
  const got = ACHIEVEMENTS.filter((a) => a.core && G.achievements[a.id]).length
  const secs = SECTIONS.filter((s) => G.visited[s.key]).length
  return Math.round(((got / core) * 0.6 + (secs / SECTIONS.length) * 0.4) * 100)
}

/* ---------- map helpers ---------- */
const spot = () => PLAYER_SPOTS[G.path] || PLAYER_SPOTS['/']
function currentRoute() {
  if (!G.waypoint) return null
  const p = projectById(G.waypoint)
  const d = p && DISTRICTS.find((x) => x.id === p.district)
  return d ? findRoute(spot().node, d.node) : null
}
const missionList = () => (G.classified ? [...PROJECTS, CLASSIFIED] : PROJECTS)
function setWaypoint(id) {
  G.waypoint = id
  play(id ? 'accept' : 'back')
  refreshAll()
  if (window.mapRefresh) mapRefresh(true)
}

/* ---------- projects ---------- */
function viewProject(id) {
  if (!G.viewed[id]) { G.viewed[id] = true; persist() }
  unlock('first_mission')
  if (PROJECTS.every((p) => G.viewed[p.id])) unlock('full_stack')
  refreshAll()
}
function openProject(id) { if (!projectById(id)) return; closePhone(true); G.projectId = id; viewProject(id); play('click'); renderProjectModal() }
function closeProject() { G.projectId = null; play('back'); renderProjectModal() }
function startMission(id) { if (!projectById(id)) return; closePhone(true); G.projectId = null; renderProjectModal(); G.missionRun = id; viewProject(id); play('accept'); renderMissionRun() }
function endMission() { G.missionRun = null; renderMissionRun() }
function discoverClassified() {
  if (!G.classified) {
    G.classified = true; persist()
    triggerWanted(1, "You've discovered a hidden project.")
    unlock('classified')
  }
  setTimeout(() => openProject('classified'), 600)
  refreshAll()
}

/* ---------- external links (all go through here so they behave the same everywhere) ---------- */
function openUrl(url) {
  play('click')
  if (/^https?:/.test(url)) {
    let w = null
    try { w = window.open(url, '_blank', 'noopener,noreferrer') } catch (e) { w = null }
    if (!w) {
      const a = document.createElement('a')
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'
      document.body.appendChild(a); a.click(); a.remove()
    }
  } else window.location.href = url
}
function openExternal(kind) {
  const urls = { github: OWNER.github, repos: OWNER.repos, linkedin: OWNER.linkedin, email: OWNER.gmailCompose, mailto: 'mailto:' + OWNER.email, whatsapp: OWNER.whatsapp, phone: OWNER.phoneHref }
  const url = urls[kind]
  if (!url) { play('error'); return }
  if (kind === 'github' || kind === 'repos') unlock('code_criminal')
  openUrl(url)
}
function openRepo(id) {
  const p = projectById(id)
  if (!p || !p.repo) { play('error'); return }
  viewProject(id); unlock('code_criminal'); openUrl(p.repo)
}
const composeUrl = (subject, body) => OWNER.gmailCompose + '&su=' + encodeURIComponent(subject || 'Hello Yaman') + '&body=' + encodeURIComponent(body || '')

/* ---------- navigation ---------- */
let travelTimers = []
function navigate(path) {
  const target = '#' + path
  if (location.hash === target || (path === '/' && !location.hash)) showPath(path)
  else location.hash = target
}
function go(to, opts) {
  opts = opts || {}
  if (G.travel) return
  const from = G.path
  if (to === from) return
  closePhone(true); G.projectId = null; renderProjectModal(); closeResume(true)
  const fs = sectionByPath(from), ts = sectionByPath(to)
  if (G.prefs.cinematic && !opts.instant && fs && ts) {
    G.travel = { from: fs.label, to: ts.label, path: to, place: (PLAYER_SPOTS[to] || {}).place }
    renderTravel()
    play('vehicle')
    travelTimers = [setTimeout(() => navigate(to), 1500), setTimeout(() => { G.travel = null; renderTravel() }, 2300)]
  } else {
    play(to === '/' ? 'back' : 'transition')
    navigate(to)
  }
}
function skipTravel() {
  if (!G.travel) return
  travelTimers.forEach(clearTimeout); travelTimers = []
  navigate(G.travel.path)
  G.travel = null
  renderTravel()
}
function openMap() { play('map'); go('/map', { instant: true }) }
// Esc / back: close the top-most overlay first, otherwise return to the main menu.
function back() {
  if (G.travel) return skipTravel()
  if (G.missionRun) { endMission(); play('back'); return }
  if (G.resumeOpen) { closeResume(); return }
  if (G.projectId) { closeProject(); return }
  if (G.phoneOpen) { closePhone(); return }
  if (G.path !== '/') go('/')
}

/* ---------- character ---------- */
function setCharacter(i) {
  G.character = i
  const c = CHARACTERS[i]
  document.documentElement.style.setProperty('--accent', c.accent)
  cityState.theme = c.sky
  const cv = $('#city'); if (cv) cv.style.transform = 'scale(' + c.zoom + ')'
  play('transition')
  const f = $('#flash'); if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go') }
  if (window.profileRefresh) profileRefresh()
  if (window.homeRefresh) homeRefresh()
}

/* ---------- dev mode + cheats ---------- */
function toggleDev() {
  G.devMode = !G.devMode
  document.body.classList.toggle('dev', G.devMode)
  if (G.devMode) { unlock('dev_mode'); triggerWanted(1, 'Developer mode: someone is watching the console.') } else play('back')
  refreshHUD()
}
function resetProgress() {
  G.achievements = {}; G.viewed = {}; G.visited = {}; G.classified = false; G.waypoint = null
  persist(); play('back'); refreshAll(); if (window.mapRefresh) mapRefresh(true)
  if (window.pageRefresh) pageRefresh()
}
function runCheat(kind) {
  play('cheat')
  G.fx = { kind, key: Date.now() }
  renderFx()
  setTimeout(() => { G.fx = null; renderFx() }, kind === 'gta' ? 5200 : 4600)
  if (kind === 'konami') { unlock('cheat_code'); triggerWanted(2, 'Cheat activated: infinite coffee.') }
  if (kind === 'gta') { unlock('gta'); triggerWanted(3, 'Vehicle spawned. Los Santos PD is on the way.') }
}

/* ---------- refresh fan-out ---------- */
function refreshAll() { refreshHUD(); if (window.pageRefresh) pageRefresh() }

// Let .append() accept nested arrays (and skip null/false) so builders can pass lists directly.
Element.prototype.append = function () { add(this, Array.prototype.slice.call(arguments)); return undefined }
