/* Pages */
let curPage = null
function pageRefresh() { if (curPage && curPage.refresh) curPage.refresh() }
const reveal = (el, i) => { el.style.animationDelay = (i || 0) * 0.07 + 's' }

function frame(title, kicker, body, wide) {
  const tabs = h('div.tabs', { role: 'navigation', 'aria-label': 'Sections' }, SECTIONS.map((s, i) => {
    const on = s.path === G.path
    return h('button.tab' + (on ? '.on' : ''), { 'aria-current': on ? 'page' : null, onclick: () => go(s.path), onmouseenter: () => !on && play('hover') }, h('small', i + 1), s.label)
  }))
  setTimeout(() => { const a = $('.tab.on', tabs); if (a) tabs.scrollLeft = Math.max(0, a.offsetLeft - 40) }, 0)
  const wrap = h('div.wrap' + (wide ? '.wide' : ''), h('header', { style: { marginBottom: '24px' } }, h('div.label.accent', kicker), h('h1.title.h-page', letters(title))), body)
  return h('div.page', tabs, h('div.scroll', wrap))
}

/* ---------- HOME ---------- */
function pageHome() {
  let sel = 0
  const rows = [], ul = h('ul')
  const selBox = h('div.sel.panel')
  const drawSel = () => {
    const s = SECTIONS[sel]
    clear(selBox).append(h('div.label', 'Selected'), h('div.title', s.label), h('p', s.desc), h('button.btn.primary', { style: { marginTop: '12px' }, onclick: () => go(s.path) }, 'Open ' + s.label.toLowerCase()))
    rows.forEach((r, i) => r.classList.toggle('active', i === sel))
  }
  const setSel = (i, sound) => { if (i === sel) return; sel = i; if (sound) play('hover'); drawSel() }
  SECTIONS.forEach((s, i) => {
    const row = h('button.menu-row', { onmouseenter: () => setSel(i, true), onfocus: () => setSel(i), onclick: () => { setSel(i); go(s.path) } },
      h('span', h('span.n', i + 1), s.label), h('span.r', h('span.ck'), ico('right', 16)))
    rows.push(row); ul.appendChild(h('li', { style: { animationDelay: 0.08 + i * 0.045 + 's' } }, row))
  })
  const card = h('aside.panel.p5', { 'aria-label': 'Character card', style: { padding: '16px', animation: 'slideR .6s .5s both' } })
  const drawCard = () => {
    const c = CHARACTERS[G.character]
    clear(card).append(h('div', { style: { display: 'flex', gap: '12px', alignItems: 'center' } }, h('div.avatar', { style: { width: '80px', height: '80px' }, html: avatarSVG(c.id, c.accent) }), h('div', h('div.label', { style: { color: c.accent } }, c.tag), h('div.title', { style: { fontSize: '36px' } }, c.name), h('div.ui.dim', { style: { fontSize: '12px' } }, 'Available to join immediately'))),
      h('div', { style: { marginTop: '16px' } }, statBars(c.stats, c.accent, false)), h('button.btn', { style: { width: '100%', marginTop: '16px' }, onclick: () => go('/profile') }, 'Switch character'))
  }
  const refresh = () => { rows.forEach((r, i) => { const k = $('.ck', r); k.textContent = G.visited[SECTIONS[i].key] ? '✓' : '' }) }
  window.homeRefresh = drawCard
  const key = (e) => {
    if (G.path !== '/' || G.phoneOpen || G.resumeOpen || G.projectId || G.missionRun || G.travel || isTyping(e)) return
    const n = SECTIONS.length
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((sel + 1) % n, true) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((sel + n - 1) % n, true) }
    else if (e.key === 'Enter' && document.activeElement === document.body) { e.preventDefault(); go(SECTIONS[sel].path) }
  }
  document.addEventListener('keydown', key)
  const el = h('div.home', h('div.home-grid',
    h('nav.menu', { 'aria-label': 'Main menu' }, h('div.head', h('b', 'Menu'), h('span.ui.dim', { style: { fontSize: '12px' } }, 'Yaman Choudhary')), ul, h('div.help.ui', '↑↓ Navigate · Enter Open · Esc Back · M Map · P Phone · 1–9 Jump')),
    h('div.hero', h('div.label.accent', 'Los Santos · Jaipur, India'), h('h1.title.big', h('span.block', letters('YAMAN', 0.35)), h('span.block', letters('CHOUDHARY', 0.6))),
      h('ul', OWNER.roles.map((r, i) => h('li.ui', { style: { animationDelay: 1.2 + i * 0.15 + 's' } }, r))), selBox),
    card))
  drawSel(); drawCard(); refresh()
  return { el, refresh, destroy: () => document.removeEventListener('keydown', key) }
}

/* ---------- PROFILE ---------- */
function pageProfile() {
  const wheel = h('div.wheel'), card = h('div.char-card.panel'), achBox = h('div'), achHead = h('div')
  const POS = [[50, 14], [24, 70], [76, 70]]
  const drawChar = () => {
    const c = CHARACTERS[G.character]
    clear(wheel).append(h('div', { html: '<svg class="bg" viewBox="0 0 100 100" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.18)" stroke-dasharray="1.5 2"/><polygon points="50,18 20,72 80,72" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.2)"/></svg>' }),
      h('div.mid.ui', 'Switch', h('br'), 'character'))
    CHARACTERS.forEach((ch, i) => {
      const on = i === G.character
      wheel.appendChild(h('button.pick' + (on ? '.on' : ''), { 'aria-pressed': String(on), 'aria-label': 'Switch to ' + ch.name, html: avatarSVG(ch.id, ch.accent), style: { left: POS[i][0] + '%', top: POS[i][1] + '%', border: '3px solid ' + (on ? ch.accent : 'rgba(255,255,255,.35)'), boxShadow: on ? '0 0 28px ' + ch.accent + '88' : 'none' }, onclick: () => i !== G.character && setCharacter(i), onmouseenter: () => !on && play('hover') }))
      wheel.appendChild(h('span.nm.ui', { style: { left: POS[i][0] + '%', top: 'calc(' + POS[i][1] + '% + 20%)', color: on ? ch.accent : 'rgba(255,255,255,.6)' } }, ch.name))
    })
    clear(card).append(h('div.char-head', h('div.avatar', { html: avatarSVG(c.id, c.accent) }), h('div', h('div.label', { style: { color: c.accent } }, c.tag), h('h2.title', { style: { fontSize: 'clamp(44px,7vw,84px)' } }, letters(c.name)), h('div.ui.dim', 'Yaman Choudhary · Jaipur'))),
      h('p', { style: { marginTop: '16px', fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,.85)' } }, c.desc), h('div.label', { style: { margin: '20px 0 8px' } }, 'Stats'), statBars(c.stats, c.accent, true), h('div.ui', { style: { marginTop: '16px', fontSize: '12px', opacity: .4 } }, '← → to switch · stats are self-assessed'))
  }
  const refresh = () => { clear(achHead).append(h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' } }, h('div', h('div.label.accent', 'Achievements'), h('div.title', { style: { fontSize: '30px' } }, Object.keys(G.achievements).length + ' unlocked')), h('div.title', { style: { fontSize: '40px' } }, percent() + '%'))); clear(achBox).appendChild(achievementList(false)) }
  window.profileRefresh = () => { drawChar() }
  const key = (e) => { if (G.path !== '/profile' || isTyping(e) || G.phoneOpen || G.resumeOpen || G.projectId || G.missionRun) return; const n = CHARACTERS.length; if (e.key === 'ArrowRight') setCharacter((G.character + 1) % n); if (e.key === 'ArrowLeft') setCharacter((G.character + n - 1) % n) }
  document.addEventListener('keydown', key)
  drawChar(); refresh()
  const body = h('div', h('div.char-grid', wheel, card),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '24px', marginTop: '32px' }, class: 'prof2' },
      h('section.panel.p5', h('div.label.accent', 'Character bio'), h('h2.title', { style: { fontSize: '36px', marginTop: '4px' } }, OWNER.headline), h('p', { style: { marginTop: '12px', lineHeight: 1.6, color: 'rgba(255,255,255,.85)' } }, OWNER.summary),
        h('div.row', { style: { marginTop: '16px' } }, h('span.chip', OWNER.location), h('span.chip', 'Status: available immediately')),
        h('div.row', { style: { marginTop: '20px' } }, h('button.btn', { onclick: () => openExternal('github') }, ico('github', 15), 'GitHub'), h('button.btn', { onclick: () => openExternal('linkedin') }, ico('linkedin', 15), 'LinkedIn'), h('button.btn', { onclick: () => openExternal('email') }, ico('mail', 15), 'Email'), h('button.btn.primary', { onclick: openResume }, ico('file', 15), 'Resume'))),
      h('section.panel', { style: { padding: '20px' } }, achHead, h('div', { style: { marginTop: '12px' } }, achBox))))
  return { el: frame('PROFILE', '01 · Character select', body), refresh, destroy: () => document.removeEventListener('keydown', key) }
}

/* ---------- MISSIONS ---------- */
function pageMissions() {
  let sel = 0
  const list = h('ul.mlist', { role: 'listbox', 'aria-label': 'Missions' }), cardBox = h('div.mcard.panel')
  const drawCard = () => { const p = PROJECTS[sel]; clear(cardBox).append(h('span.ghost.title', pad2(p.n)), missionCard(p, true)); cardBox.style.animation = 'none'; void cardBox.offsetWidth; cardBox.style.animation = '' ; $$('.menu-row', list).forEach((r, i) => r.classList.toggle('active', i === sel && !r.dataset.x)) }
  const drawList = () => {
    clear(list)
    PROJECTS.forEach((m, i) => list.appendChild(h('li', h('button.menu-row' + (i === sel ? '.active' : ''), { role: 'option', 'aria-selected': String(i === sel), onmouseenter: () => { if (sel !== i) { sel = i; play('hover'); drawCard() } }, onfocus: () => { sel = i; drawCard() }, onclick: () => { sel = i; play('click'); drawCard() } }, h('span', { style: { display: 'flex', alignItems: 'center', minWidth: 0 } }, h('span.num', m.n), m.title), h('span.ck', ico('check', 16))))))
    const all = PROJECTS.every((x) => G.viewed[x.id]) || G.classified
    list.appendChild(h('li', all ? h('button.menu-row.pink', { 'data-x': 1, onclick: discoverClassified }, h('span', '██████ ' + CLASSIFIED.title), h('span', { style: { fontSize: '12px' } }, 'Tap to decrypt')) : h('div.menu-row.lock', { 'data-x': 1 }, h('span', '??? Locked mission'), ico('lock', 14))))
  }
  drawList(); drawCard()
  const body = h('div', h('div.mis-grid', list, cardBox), h('p.ui', { style: { marginTop: '16px', fontSize: '12px', opacity: .4 } }, 'View every project to unlock the last mission.'))
  return { el: frame('MISSIONS', '02 · Mission select', body), refresh: () => { drawList(); const a = $$('.menu-row', list)[sel]; a && a.classList.add('active') } }
}

/* ---------- SKILLS ---------- */
const RARITY = { LEGENDARY: '#f5b01c', EPIC: '#c06bff', RARE: '#3ec9ff' }
function pageSkills() {
  let cat = 'ALL', sel = INVENTORY[0]
  const CATS = ['ALL', ...Array.from(new Set(INVENTORY.map((i) => i.cat)))]
  const selBox = h('section.panel.p5', { 'aria-live': 'polite' }), grid = h('div.inv'), filters = h('div.row', { style: { margin: '32px 0 12px', alignItems: 'center' } })
  const drawSel = () => clear(selBox).append(h('div.label', 'Selected item'), h('div.title', { style: { fontSize: '48px', color: RARITY[sel.rarity] } }, sel.name), h('div.ui.dim', sel.cat + ' · ' + sel.rarity), h('p', { style: { marginTop: '12px', color: 'rgba(255,255,255,.85)' } }, sel.note), h('div', { style: { marginTop: '16px' } }, h('div.label', { style: { marginBottom: '4px' } }, 'Proficiency · ' + sel.lvl + '/10'), segBar(sel.lvl * 10, RARITY[sel.rarity], 10)))
  const drawGrid = () => { clear(grid); INVENTORY.filter((i) => cat === 'ALL' || i.cat === cat).forEach((it, i) => grid.appendChild(h('button.item.panel-flat' + (sel === it ? '.on' : ''), { style: { '--rc': RARITY[it.rarity], animationDelay: i * 0.015 + 's' }, 'aria-pressed': String(sel === it), onmouseenter: () => play('hover'), onclick: () => { sel = it; play('click'); drawSel(); drawGrid() } }, h('div.rl', it.rarity), h('div.nm', it.name), h('small', it.cat)))) }
  const drawFilters = () => { clear(filters).append(h('h2.title', { style: { fontSize: '36px', marginRight: '12px' } }, 'Inventory'), CATS.map((c) => h('button.btn.sm' + (cat === c ? '.on' : ''), { 'aria-pressed': String(cat === c), onclick: () => { cat = c; play('click'); drawFilters(); drawGrid() } }, c))) }
  drawSel(); drawGrid(); drawFilters()
  const body = h('div', h('div.grid.g2', h('section.panel.p5', h('div.label.accent', STATS_SPECIAL.label), h('div.title', { style: { fontSize: '36px', marginBottom: '20px' } }, STATS_SPECIAL.name), STAT_BARS.map((s, i) => h('div.stat', { style: { marginBottom: '16px' } }, h('div.hd.ui', h('span', s.label), h('span', s.value + '%')), segBar(s.value, '#f5b01c', 20, i * 0.08)))), selBox), filters, grid)
  return { el: frame('SKILLS', '03 · Character statistics', body) }
}

/* ---------- PROJECTS ---------- */
function pageProjects() {
  let f = 'All'
  const FILTERS = ['All', 'AI', 'Full Stack', 'Cloud']
  const bar = h('div.row', { style: { marginBottom: '20px', alignItems: 'center' } }), grid = h('div.grid.g3')
  const drawBar = () => clear(bar).append(FILTERS.map((x) => h('button.btn' + (f === x ? '.on' : ''), { 'aria-pressed': String(f === x), onclick: () => { f = x; play('click'); drawBar(); drawGrid() } }, x)), h('button.btn', { style: { marginLeft: 'auto' }, onclick: () => openExternal('repos') }, 'All repositories ↗'))
  const card = (p, i) => {
    const glare = h('div.glare')
    const b = h('button.pcard.panel', { 'aria-label': 'Open ' + p.title + ' on GitHub', style: { animationDelay: i * 0.08 + 's' }, onclick: () => openRepo(p.id), onmouseenter: () => play('hover'),
      onmousemove: (e) => { const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; b.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 14}deg) rotateY(${(x - 0.5) * 16}deg)`; glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%,rgba(255,255,255,.18),transparent 55%)` },
      onmouseleave: () => { b.style.transform = '' } },
      glare, h('div.top', h('span.num', p.n), h('span.ui.green', { style: { display: 'flex', gap: '4px', alignItems: 'center', fontSize: '14px' } }, ico('check', 14), 'Completed')),
      h('h3.title', p.title), h('div.ui.dim', { style: { fontSize: '14px' } }, p.subtitle), h('div', { style: { marginTop: '8px' } }, stars(p.difficulty)), h('p', p.desc),
      h('div.row', { style: { marginTop: '16px', gap: '6px' } }, p.tech.slice(0, 4).map((t) => h('span.chip', { style: { fontSize: '11px' } }, t))), h('div.go.ui', 'Open on GitHub ↗'))
    return b
  }
  const drawGrid = () => { clear(grid); PROJECTS.filter((p) => f === 'All' || p.cat === f).forEach((p, i) => grid.appendChild(card(p, i))) }
  drawBar(); drawGrid()
  return { el: frame('PROJECTS', '04 · Project gallery', h('div', bar, grid)) }
}

/* ---------- EXPERIENCE ---------- */
function pageExperience() {
  const body = h('ol.tl', EXPERIENCE.map((e, i) => h('li', { style: { animationDelay: i * 0.12 + 's' } }, h('article.panel.p5',
    h('div.exp-top', h('div', h('div.ui.green', 'Mission completed'), h('h2.title', e.company), h('div.ui.accent', { style: { fontSize: '18px' } }, e.role)), h('div', { style: { textAlign: 'right' } }, h('div.ui', e.period), h('div.label', e.place))),
    h('div.label', { style: { margin: '20px 0 8px' } }, 'Objectives'), h('ul.objs', e.objectives.map((o) => h('li', ico('check', 15), o))),
    h('button.btn', { style: { marginTop: '20px' }, onclick: () => { play('click'); missionPassed(e.company + ' · ' + e.role) } }, 'Replay “Mission passed”')))))
  return { el: frame('EXPERIENCE', '05 · Mission history', body) }
}

/* ---------- EDUCATION ---------- */
function pageEducation() {
  const body = h('div', h('div.grid.g2', EDUCATION.map((e, i) => h('article.panel.p5', { style: { animation: 'fadeUp .5s ' + i * 0.12 + 's both' } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('span', { style: { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'grid', placeItems: 'center' } }, ico('cap', 22)), h('span.ui.green', { style: { display: 'flex', gap: '4px', alignItems: 'center' } }, ico('check', 16), 'Completed')),
    h('h2.title', { style: { fontSize: 'clamp(28px,3.6vw,44px)', marginTop: '16px' } }, e.title), h('div.ui.accent', { style: { fontSize: '18px' } }, e.school), h('div.label', { style: { marginTop: '4px' } }, e.years + ' · ' + e.place),
    h('div', { style: { marginTop: '20px' } }, h('div.hd.ui', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } }, h('span', e.stat), h('span.dim', e.shown)), segBar((e.value / e.max) * 100, '#6fbe44'))))),
    h('h2.title', { style: { fontSize: '36px', margin: '32px 0 12px' } }, 'Certifications'),
    h('div.grid.g3', { style: { gap: '8px' } }, CERTS.map((c, i) => h('div.cert.panel-flat', { style: { animation: 'pop .4s ' + (0.3 + i * 0.07) + 's both' } }, ico('award', 20), h('div', h('div.ui', { style: { fontSize: '16px', lineHeight: 1.1 } }, c.name), h('div.label', { style: { fontSize: '10px' } }, c.by))))))
  return { el: frame('EDUCATION', '06 · Character record', body) }
}

/* ---------- CONTACT ---------- */
function pageContact() {
  let showForm = false, notif = null
  const right = h('div'), phoneList = h('div', { style: { position: 'relative', height: '100%', overflowY: 'auto' } })
  const toForm = () => { showForm = true; if (notif) notif.remove(); play('accept'); drawRight() }
  const drawRight = () => {
    if (!showForm) {
      clear(right).append(h('div.panel.p5', h('div.label.accent', 'Incoming'), h('h2.title', { style: { fontSize: '48px' } }, 'Let’s work together'), h('p', { style: { marginTop: '12px', color: 'rgba(255,255,255,.8)' } }, 'Tap REPLY on the phone to write a message, or use one of the quick actions.'),
        h('div.row', { style: { marginTop: '20px' } }, h('button.btn.primary', { onclick: toForm }, ico('msg', 15), 'Reply'), h('button.btn', { onclick: () => openExternal('email') }, ico('mail', 15), 'Email'), h('button.btn', { onclick: () => openExternal('whatsapp') }, ico('whatsapp', 15), 'WhatsApp'), h('a.btn', { href: OWNER.phoneHref, onclick: () => play('click') }, ico('phone', 15), 'Call'), h('button.btn', { onclick: () => openExternal('linkedin') }, ico('linkedin', 15), 'LinkedIn'), h('button.btn', { onclick: () => openExternal('github') }, ico('github', 15), 'GitHub'))))
      return
    }
    const name = h('input', { autocomplete: 'name' }), mail = h('input', { type: 'email', autocomplete: 'email' }), msg = h('textarea', { rows: 5 }), err = h('p.err.ui', { role: 'alert' })
    clear(right).append(h('form.panel.p5', { novalidate: true, onsubmit: (e) => {
      e.preventDefault()
      if (!name.value.trim() || !/^\S+@\S+\.\S+$/.test(mail.value) || msg.value.trim().length < 5) { err.textContent = 'Enter your name, a valid email and a message.'; play('error'); return }
      err.textContent = ''; play('accept')
      pushToast({ kind: 'wanted', title: 'MESSAGE READY', text: 'Opening Gmail with your message.', clear: true })
      openUrl(composeUrl('Portfolio message from ' + name.value, msg.value + '\n\n— ' + name.value + ' (' + mail.value + ')'))
    } }, h('div.label.accent', 'Reply'), h('h2.title', { style: { fontSize: '40px' } }, 'Send a message'),
      h('label.field', h('span.label', 'Name'), name), h('label.field', h('span.label', 'Email'), mail), h('label.field', h('span.label', 'Message'), msg), err,
      h('button.btn.primary', { style: { width: '100%', marginTop: '12px' } }, ico('send', 15), 'Send message'),
      h('p.dim', { style: { fontSize: '12px', marginTop: '8px' } }, 'This opens a Gmail compose window addressed to ' + OWNER.email + '. Prefer WhatsApp? Use the phone.')))
  }
  clear(phoneList).append(h('div.ph-head', h('b', 'Contacts')), h('div', { style: { textAlign: 'center', padding: '12px 16px' } }, h('span', { style: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'inline-grid', placeItems: 'center', font: 'bold 24px var(--f-body)' } }, 'YC'), h('div.title', { style: { fontSize: '24px', marginTop: '4px' } }, 'Yaman Choudhary')), contactRows())
  setTimeout(() => {
    if (G.path !== '/contact' || showForm) return
    play('notify')
    notif = h('div.ph-notif', h('div.nt', '✉ New message'), h('div.nb', '“Interested in working together?”'), h('div.row', { style: { marginTop: '8px' } }, h('button.pill.y', { onclick: toForm }, 'REPLY'), h('button.pill', { onclick: () => { notif.remove(); play('back') } }, 'Dismiss')))
    phoneList.insertBefore(notif, phoneList.children[1])
  }, 700)
  drawRight()
  const phone = h('div', { style: { width: '320px', height: '600px', maxWidth: '100%', margin: '0 auto', animation: 'phoneIn .7s both' } }, phoneFrame(phoneList, { height: '100%' }))
  return { el: frame('CONTACT', '07 · Phone', h('div.contact-grid', phone, right)) }
}

/* ---------- RESUME ---------- */
function pageResume() {
  const body = h('div.panel.p5', { style: { maxWidth: '672px', margin: '0 auto', textAlign: 'center' } }, h('div.paper', h('div', h('div', 'YAMAN'), h('div', 'CHOUDHARY'), h('div.ui', { style: { fontSize: '8px', fontWeight: 700, marginTop: '8px', letterSpacing: '.2em' } }, 'Resume'))),
    h('h2.title', { style: { fontSize: '36px', marginTop: '24px' } }, 'Classified file: Yaman Choudhary'), h('p.dim', { style: { marginTop: '8px' } }, OWNER.headline + '. Three internships, four shipped projects, available immediately.'),
    h('div.row', { style: { justifyContent: 'center', marginTop: '24px' } }, h('button.btn.primary', { onclick: openResume }, ico('eye', 15), 'View resume'), h('a.btn', { href: resumeUrl, download: OWNER.resumeFile, onclick: () => play('accept') }, ico('download', 15), 'Download resume'), h('a.btn', { href: resumeUrl, target: '_blank', rel: 'noopener noreferrer', onclick: () => play('click') }, ico('ext', 15), 'Open PDF')))
  return { el: frame('RESUME', '09 · Documents', body) }
}

/* ---------- MAP ---------- */
function pageMap() {
  const MIN = 0.7, MAX = 3.5
  let cam = { x: 0, y: 0, k: 1 }, sel = null, routeProg = 1, dragState = null, moved = false, raf = 0
  const pts = new Map(); let pinch = null
  const box = h('div#mapbox', { role: 'application', 'aria-label': 'Interactive city map. Drag to pan, scroll or pinch to zoom.' })
  const svg = svgEl(0, 0, { width: '100%', height: '100%' }, '')
  const camG = document.createElementNS(SVGNS, 'g'); camG.innerHTML = mapArtMarkup(true, 'full')
  const dyn = document.createElementNS(SVGNS, 'g')
  camG.appendChild(dyn); svg.appendChild(camG); box.appendChild(svg)
  const popup = h('div'), info = h('div')
  const apply = () => camG.setAttribute('transform', `translate(${cam.x} ${cam.y}) scale(${cam.k})`)
  const fit = () => { const r = box.getBoundingClientRect(); const k = Math.min(r.width / WORLD.w, r.height / WORLD.h) * 0.95; cam = { k, x: (r.width - WORLD.w * k) / 2, y: (r.height - WORLD.h * k) / 2 }; draw() }
  const zoomAt = (cx, cy, f) => { const k = Math.min(MAX, Math.max(MIN, cam.k * f)), r = k / cam.k; cam = { k, x: cx - (cx - cam.x) * r, y: cy - (cy - cam.y) * r }; draw() }
  const zoomBtn = (f) => { play('click'); const r = box.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, f) }
  const focusOn = (pos) => { const r = box.getBoundingClientRect(); cam.x = r.width / 2 - pos[0] * cam.k; cam.y = r.height / 2 - pos[1] * cam.k; draw() }
  const markers = () => missionList().map((p) => ({ p, pos: NODES[DISTRICTS.find((d) => d.id === p.district).node] }))
  const pick = (m) => { if (moved) return; play('click'); sel = m.p; drawPopup(); focusOn(m.pos) }
  function draw() {
    apply()
    const inv = 1 / Math.sqrt(cam.k), rt = currentRoute(), sp = spot(), [px, py] = NODES[sp.node]
    clear(dyn)
    if (rt) {
      const pl = rt.points.map((p) => p.join(',')).join(' ')
      dyn.insertAdjacentHTML('beforeend', `<polyline points="${pl}" fill="none" stroke="#000" stroke-width="${9 * inv}" stroke-linejoin="round" stroke-linecap="round" opacity=".6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - routeProg}"/>` +
        (routeProg >= 1 ? `<polyline class="route-dash" points="${pl}" fill="none" stroke="#e94fd0" stroke-width="${5 * inv}" stroke-linejoin="round" stroke-linecap="round"/>` : `<polyline points="${pl}" fill="none" stroke="#e94fd0" stroke-width="${5 * inv}" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - routeProg}"/>`))
    }
    markers().forEach((m) => {
      const g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'marker'); g.setAttribute('transform', `translate(${m.pos[0]} ${m.pos[1]}) scale(${inv})`)
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', 'Open ' + m.p.title)
      const col = m.p.hidden ? '#e94fd0' : '#f5b01c'
      g.innerHTML = `<circle r="26" fill="transparent"/><circle r="14" fill="${col}" opacity=".5" class="ping"/><circle r="14" fill="${col}" stroke="#000" stroke-width="3"/><text y="5" text-anchor="middle" font-family="Bebas Neue" font-size="16" fill="#000">${m.p.hidden ? '?' : m.p.n}</text>${G.viewed[m.p.id] ? '<circle cx="11" cy="-11" r="6" fill="#6fbe44" stroke="#000" stroke-width="2"/>' : ''}<text y="-24" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="16" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${m.p.title}</text>`
      g.addEventListener('click', () => pick(m)); g.addEventListener('keydown', (e) => e.key === 'Enter' && pick(m))
      g.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') pick(m) })
      dyn.appendChild(g)
      if (m.p.id === G.waypoint) dyn.insertAdjacentHTML('beforeend', `<g transform="translate(${m.pos[0]} ${m.pos[1]}) scale(${inv})" pointer-events="none"><circle r="22" fill="none" stroke="#e94fd0" stroke-width="3" class="ping"/><path d="M0 -4 L11 -26 L-11 -26 Z" fill="#e94fd0" stroke="#000" stroke-width="2"/></g>`)
    })
    dyn.insertAdjacentHTML('beforeend', `<g transform="translate(${px} ${py}) scale(${inv})" pointer-events="none"><circle r="16" fill="rgba(255,255,255,.2)" class="ping"/><path d="M0 -13 L10 11 L0 6 L-10 11 Z" fill="#fff" stroke="#000" stroke-width="2.5"/></g>`)
    drawInfo()
  }
  function drawInfo() {
    const wp = G.waypoint && projectById(G.waypoint), rt = currentRoute()
    clear(info)
    if (rt && wp && !sel) info.appendChild(h('div.mapinfo.panel', { onpointerdown: (e) => e.stopPropagation() }, h('div', h('div.label.pink', 'Waypoint set'), h('div.title', { style: { fontSize: '24px' } }, wp.title), h('div.ui.dim', kmFromUnits(rt.length) + ' km · ETA ' + etaMinutes(rt.length) + ' min')), h('button.btn', { onclick: () => setWaypoint(null) }, ico('x', 14), 'Clear')))
  }
  function drawPopup() {
    clear(popup)
    if (!sel) { drawInfo(); return }
    popup.appendChild(h('div.mappop.panel', { onpointerdown: (e) => e.stopPropagation() }, h('button.btn.close', { 'aria-label': 'Close mission card', onclick: () => { sel = null; play('back'); drawPopup() } }, ico('x', 16)), missionCard(sel, true)))
    drawInfo()
  }
  box.addEventListener('wheel', (e) => { e.preventDefault(); const r = box.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12) }, { passive: false })
  box.addEventListener('pointerdown', (e) => { if (e.target.closest('.mapctl,.mappop,.mapinfo')) return; pts.set(e.pointerId, [e.clientX, e.clientY]); moved = false; if (pts.size === 1) dragState = { x: e.clientX, y: e.clientY }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); dragState = null } })
  box.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return
    pts.set(e.pointerId, [e.clientX, e.clientY])
    if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), r = box.getBoundingClientRect(); zoomAt((a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top, d / pinch); pinch = d; moved = true }
    else if (dragState) { const dx = e.clientX - dragState.x, dy = e.clientY - dragState.y; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; dragState.x = e.clientX; dragState.y = e.clientY; cam.x += dx; cam.y += dy; apply() }
  })
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) setTimeout(() => { dragState = null; moved = false }, 0) }
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up)
  const ctl = h('div.mapctl', { onpointerdown: (e) => e.stopPropagation() }, h('button.btn', { 'aria-label': 'Zoom in', onclick: () => zoomBtn(1.3) }, ico('plus', 18)), h('button.btn', { 'aria-label': 'Zoom out', onclick: () => zoomBtn(1 / 1.3) }, ico('minus', 18)), h('button.btn', { 'aria-label': 'Center on my position', onclick: () => { play('click'); focusOn(NODES[spot().node]) } }, ico('crosshair', 18)), h('button.btn', { 'aria-label': 'Reset view', style: { fontSize: '12px' }, onclick: () => { play('click'); fit() } }, 'FIT'))
  box.append(ctl, h('div.maphelp.panel-flat', h('div.label.accent', 'Map'), h('div.ui.dim', { style: { fontSize: '14px' } }, 'Drag to pan · scroll or pinch to zoom · tap a marker for the mission.')), popup, info)
  const key = (e) => { if (G.path !== '/map' || isTyping(e)) return; if (e.key === '+' || e.key === '=') zoomBtn(1.25); if (e.key === '-') zoomBtn(0.8); if (e.key === '0') fit() }
  document.addEventListener('keydown', key)
  const onResize = () => fit()
  window.addEventListener('resize', onResize)
  const animate = () => { cancelAnimationFrame(raf); if (!currentRoute()) { routeProg = 1; return }; routeProg = 0; const t0 = performance.now(); const tick = (t) => { routeProg = Math.min(1, (t - t0) / 1400); draw(); if (routeProg < 1) raf = requestAnimationFrame(tick) }; raf = requestAnimationFrame(tick) }
  window.mapRefresh = (newRoute) => { if (G.path !== '/map') return; if (newRoute) animate(); else draw(); if (sel) drawPopup() }
  const el = h('div.mappage', box)
  setTimeout(() => { fit(); if (G.waypoint) animate() }, 0)
  return { el, refresh: () => { draw(); if (sel) drawPopup() }, destroy: () => { document.removeEventListener('keydown', key); window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); window.mapRefresh = null } }
}

/* ---------- router ---------- */
const PAGES = { '/': pageHome, '/profile': pageProfile, '/missions': pageMissions, '/skills': pageSkills, '/projects': pageProjects, '/experience': pageExperience, '/education': pageEducation, '/contact': pageContact, '/map': pageMap, '/resume': pageResume }
function showPath(path) {
  if (!PAGES[path]) path = '/'
  if (curPage && curPage.destroy) curPage.destroy()
  window.profileRefresh = null; window.homeRefresh = null
  G.path = path
  const view = clear($('#view'))
  view.style.animation = 'none'; void view.offsetWidth; view.style.animation = ''
  curPage = PAGES[path]()
  view.appendChild(curPage.el)
  const sec = sectionByPath(path)
  if (sec && !G.visited[sec.key]) {
    G.visited[sec.key] = true; persist()
    if (SECTIONS.every((s) => G.visited[s.key])) setTimeout(() => unlock('explorer'), 900)
  }
  refreshHUD()
  pageRefresh()
}
