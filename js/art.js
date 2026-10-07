/* Procedural art + small shared components */
const SVGNS = 'http://www.w3.org/2000/svg'

function avatarSVG(kind, accent) {
  const id = 'av-' + kind + '-' + Math.random().toString(36).slice(2, 6)
  let extra = ''
  if (kind === 'yaman') extra = `<path d="M70 72 Q72 44 100 44 Q130 44 130 72 Q116 58 100 58 Q84 58 70 72 Z" fill="#050608"/><path d="M74 135 Q100 160 126 135" fill="none" stroke="${accent}" stroke-width="2"/><rect x="78" y="76" width="18" height="9" rx="3" fill="none" stroke="${accent}" stroke-width="2"/><rect x="104" y="76" width="18" height="9" rx="3" fill="none" stroke="${accent}" stroke-width="2"/><line x1="96" y1="80" x2="104" y2="80" stroke="${accent}" stroke-width="2"/>`
  if (kind === 'developer') extra = `<path d="M66 82 A34 40 0 0 1 134 82" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/><rect x="58" y="78" width="12" height="26" rx="5" fill="${accent}"/><rect x="130" y="78" width="12" height="26" rx="5" fill="${accent}"/><path d="M64 100 Q70 120 94 118" fill="none" stroke="${accent}" stroke-width="3"/><rect x="80" y="150" width="40" height="24" rx="2" fill="#0a1a22" stroke="${accent}"/><path d="M86 158 L94 164 L86 170 M98 170 L110 170" fill="none" stroke="${accent}" stroke-width="2"/>`
  if (kind === 'creator') extra = `<path d="M68 70 Q70 38 100 38 Q130 38 132 70 Z" fill="#0b0c10" stroke="${accent}" stroke-width="2"/><path d="M66 70 L152 74" stroke="${accent}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="52" r="4" fill="${accent}"/><rect x="132" y="140" width="40" height="28" rx="4" fill="#0b0c10" stroke="${accent}"/><circle cx="152" cy="154" r="8" fill="none" stroke="${accent}" stroke-width="2"/>`
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${kind} portrait"><defs><radialGradient id="${id}" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="#05060a"/></radialGradient><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1e27"/><stop offset="1" stop-color="#07080b"/></linearGradient></defs><rect width="200" height="200" fill="url(#${id})"/><path d="M12 200 Q14 138 100 132 Q186 138 188 200 Z" fill="url(#${id}b)" stroke="${accent}" stroke-opacity=".5"/><rect x="86" y="108" width="28" height="30" fill="#14161c"/><ellipse cx="100" cy="82" rx="29" ry="35" fill="#171a21" stroke="${accent}" stroke-opacity=".7" stroke-width="1.4"/>${extra}<path d="M12 200 Q14 138 100 132 Q186 138 188 200" fill="none" stroke="${accent}" stroke-opacity=".25" stroke-width="6"/></svg>`
}

/* ---------- segmented stat bar (animated) ---------- */
function segBar(value, color, segments, delay) {
  segments = segments || 20
  const el = h('div.seg', { role: 'meter', 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': 100, style: { gridTemplateColumns: 'repeat(' + segments + ',1fr)', '--bar': color || '#fff' } })
  const cells = []
  for (let i = 0; i < segments; i++) { const c = document.createElement('i'); el.appendChild(c); cells.push(c) }
  const t0 = performance.now() + (delay || 0) * 1000
  const tick = (t) => {
    if (!el.isConnected && t - t0 > 3000) return
    const p = Math.min(1, Math.max(0, (t - t0) / 900))
    const e = 1 - Math.pow(1 - p, 2)
    const on = Math.round((value * e / 100) * segments)
    cells.forEach((c, i) => c.classList.toggle('on', i < on))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  return el
}
function statBars(stats, color, cols) {
  const entries = Array.isArray(stats) ? stats.map((s) => [s.label, s.value]) : Object.entries(stats)
  return h('div.stat-grid' + (cols ? '' : '.one'), entries.map(([k, v], i) =>
    h('div.stat', h('div.hd.ui', h('span', k), h('span', v)), segBar(v, color, 20, i * 0.06))))
}

/* ---------- map art ---------- */
const LAND = 'M170,-40 L1040,-40 L1040,680 L240,680 C205,610 120,565 150,480 C182,415 118,380 150,320 C176,258 140,205 170,140 C196,85 150,35 170,-40 Z'
const COAST = 'M170,-40 C150,35 196,85 170,140 C140,205 176,258 150,320 C118,380 182,415 150,480 C120,565 205,610 240,680'
const MAP_BLOCKS = (() => {
  let s = 42
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const out = []
  const dd = (id) => DISTRICTS.find((d) => d.id === id)
  const dt = dd('downtown'), ind = dd('industrial'), vw = dd('vinewood')
  for (let i = 0; i < 46; i++) out.push({ x: dt.x + r() * (dt.w - 22), y: dt.y + r() * (dt.h - 22), w: 10 + r() * 16, h: 10 + r() * 16, c: '#39404c' })
  for (let i = 0; i < 16; i++) out.push({ x: ind.x + r() * (ind.w - 40), y: ind.y + r() * (ind.h - 30), w: 24 + r() * 26, h: 14 + r() * 14, c: '#2f3238' })
  for (let i = 0; i < 20; i++) out.push({ x: vw.x + r() * (vw.w - 18), y: vw.y + r() * (vw.h - 18), w: 8 + r() * 10, h: 8 + r() * 10, c: '#2f3a30' })
  return out
})()
const MAP_SIGNS = [['H', 'J3', 'NH-48'], ['J7', 'J8', 'SH-12'], ['J4', 'J6', 'SH-7'], ['V', 'J5', 'NH-52']]

function mapArtMarkup(detail, uid) {
  const apt = DISTRICTS.find((d) => d.id === 'airport')
  const dfill = (id) => (id === 'beach' ? '#4a432f' : id === 'airport' ? '#232830' : id === 'industrial' ? '#2a2724' : '#262b33')
  let o = `<defs><clipPath id="${uid}-land"><path d="${LAND}"/></clipPath><linearGradient id="${uid}-sea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#081c2a"/><stop offset="1" stop-color="#0e3047"/></linearGradient></defs>`
  o += `<rect x="-300" y="-300" width="1700" height="1300" fill="url(#${uid}-sea)"/><path d="${COAST}" fill="none" stroke="#cdb67a" stroke-opacity=".5" stroke-width="22" stroke-linecap="round"/><path d="${LAND}" fill="#1d2128"/><g clip-path="url(#${uid}-land)">`
  o += '<g stroke="#2b313a" stroke-width="3">'
  for (let i = 0; i < 19; i++) o += `<line x1="${180 + i * 48}" y1="-10" x2="${180 + i * 48}" y2="650"/>`
  for (let i = 0; i < 14; i++) o += `<line x1="150" y1="${i * 48 + 10}" x2="1010" y2="${i * 48 + 10}"/>`
  o += '</g><rect x="610" y="190" width="60" height="70" rx="6" fill="#1d3a2a"/><rect x="320" y="395" width="90" height="48" rx="6" fill="#1d3a2a"/><rect x="860" y="270" width="80" height="90" rx="6" fill="#1d3a2a"/><rect x="270" y="160" width="100" height="60" rx="8" fill="#0f2f44"/>'
  DISTRICTS.forEach((d) => { o += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="10" fill="${dfill(d.id)}" stroke="rgba(255,255,255,.1)" stroke-dasharray="4 6"/>` })
  MAP_BLOCKS.forEach((b) => { o += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${b.c}"/>` })
  o += `<rect x="${apt.x + 14}" y="${apt.y + 20}" width="${apt.w - 28}" height="10" fill="#3a3f48"/><rect x="${apt.x + 34}" y="${apt.y + 62}" width="${apt.w - 60}" height="10" fill="#3a3f48"/><g stroke="#9aa0aa" stroke-width="1" stroke-dasharray="6 5"><line x1="${apt.x + 18}" y1="${apt.y + 25}" x2="${apt.x + apt.w - 18}" y2="${apt.y + 25}"/><line x1="${apt.x + 38}" y1="${apt.y + 67}" x2="${apt.x + apt.w - 26}" y2="${apt.y + 67}"/></g><rect x="108" y="498" width="60" height="6" fill="#5b4c30"/>`
  const line = (a, b, st, w, ex) => `<line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="${st}" stroke-width="${w}" ${ex || ''}/>`
  o += '<g stroke-linecap="round" stroke-linejoin="round" fill="none">'
  EDGES.forEach(([a, b]) => { o += line(a, b, '#07080a', 13) })
  EDGES.forEach(([a, b]) => { o += line(a, b, '#6b7280', 8) })
  EDGES.forEach(([a, b]) => { o += line(a, b, '#c58a2b', 1.2, 'stroke-dasharray="6 6"') })
  o += '</g></g>'
  if (detail) {
    o += '<g style="pointer-events:none;user-select:none">'
    DISTRICTS.forEach((d) => { o += `<text x="${d.x + d.w / 2}" y="${d.y + d.h + 18}" text-anchor="middle" font-family="Barlow Condensed" font-weight="600" font-size="15" letter-spacing="3" fill="rgba(255,255,255,.55)">${d.name}</text>` })
    o += '<text x="70" y="330" text-anchor="middle" font-family="Barlow Condensed" font-size="16" letter-spacing="6" fill="rgba(160,200,230,.4)" transform="rotate(-90 70 330)">PACIFIC OCEAN</text>'
    MAP_SIGNS.forEach(([a, b, label]) => {
      const x = (NODES[a][0] + NODES[b][0]) / 2, y = (NODES[a][1] + NODES[b][1]) / 2
      o += `<g transform="translate(${x} ${y})"><rect x="-19" y="-9" width="38" height="18" rx="4" fill="#0d5c3a" stroke="#fff" stroke-width="1.4"/><text y="4.5" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="12" fill="#fff">${label}</text></g>`
    })
    o += '</g>'
  }
  return o
}
function svgEl(w, hgt, attrs, inner) {
  const s = document.createElementNS(SVGNS, 'svg')
  for (const k in attrs) s.setAttribute(k, attrs[k])
  s.innerHTML = inner
  return s
}

/* ---------- mission card (missions page + map popup) ---------- */
function stars(n, max) { max = max || 5; return h('span.starsd', { 'aria-label': 'Difficulty ' + n + ' of ' + max }, '★'.repeat(n), h('i', '★'.repeat(max - n))) }
function field(label, val) { return h('div', h('div.label', label), h('div.v', val)) }
function statusBadge(p) {
  return h('span.' + (p.hidden ? 'pink' : 'green'), { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } }, ico(p.hidden ? 'unlock' : 'check', 15), p.hidden ? 'Clearance granted' : 'Completed')
}
function missionCard(p, showWaypoint) {
  const isWp = G.waypoint === p.id
  const wpBtn = h('button.btn', { onclick: () => setWaypoint(G.waypoint === p.id ? null : p.id) }, ico('pin'), isWp ? 'Clear waypoint' : 'Set waypoint')
  return h('div',
    h('div.label.accent', p.hidden ? 'Hidden mission' : 'Mission ' + pad2(p.n)),
    h('h2.title', '“' + p.title + '”'),
    h('div.ui.dim', { style: { fontSize: '16px' } }, p.subtitle),
    h('div.fields', field('Mission type', p.type), field('Difficulty', stars(p.difficulty)), field('Status', statusBadge(p))),
    h('div', { style: { marginTop: '16px' } }, h('div.label', { style: { marginBottom: '6px' } }, 'Tech'), h('div.row', p.tech.map((t) => h('span.chip', t)))),
    h('div', { style: { marginTop: '16px' } }, h('div.label', 'Mission description'), h('p', p.desc)),
    h('div.row', { style: { marginTop: '20px' } },
      h('button.btn.primary', { onclick: () => startMission(p.id) }, ico('play'), 'Start mission'),
      h('button.btn', { onclick: () => openRepo(p.id) }, ico('ext'), 'View project'),
      h('button.btn', { onclick: () => openProject(p.id) }, ico('file'), 'Briefing'),
      showWaypoint ? wpBtn : null))
}
