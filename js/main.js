/* Boot: loading screen, keyboard, hash routing */
;(function () {
  // film grain texture
  try {
    const c = document.createElement('canvas'); c.width = c.height = 120
    const x = c.getContext('2d'), d = x.createImageData(120, 120)
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
    x.putImageData(d, 0, 0)
    $('.fx-grain').style.backgroundImage = 'url(' + c.toDataURL() + ')'
  } catch (e) {}

  applyPrefs()
  buildHUD(); refreshAudioUI(); tickClock(); setInterval(tickClock, 1000)
  $('#hud').style.display = 'none'
  setCharacter(0)
  let stopMain = startCity($('#city'), cityState)

  /* ---------- loading ---------- */
  const L = $('#loading')
  let phase = 0, ready = false, done = false, stopLoad = null
  const soundBtn = h('button.btn', { 'aria-pressed': String(G.prefs.sound), onclick: () => { setPref('sound', !G.prefs.sound); drawSoundBtn() } })
  const drawSoundBtn = () => { clear(soundBtn).append(ico(G.prefs.sound ? 'vol' : 'mute', 16), 'Sound: ' + (G.prefs.sound ? 'On' : 'Off')); soundBtn.setAttribute('aria-pressed', String(G.prefs.sound)) }
  drawSoundBtn()
  const beginBtn = h('button.btn.primary.blink', { style: { fontSize: '18px' }, onclick: begin }, 'Press Enter or tap to begin')
  clear(L).append(h('div.ld0', h('div.ld-logo', h('span', 'YC')), h('p.label', 'A Yaman Choudhary production'), beginBtn, soundBtn,
    h('p.label', { style: { maxWidth: '380px', textTransform: 'none', letterSpacing: '.04em' } }, 'Audio starts only after you press begin. You can mute or change the volume any time from the speaker icon.')))

  function begin() {
    if (phase !== 0) return
    phase = 1
    sound.resume(); applyPrefs(); sound.startAmbient(); play('static')
    const cv = h('canvas', { 'aria-hidden': 'true' })
    const tip = h('div.ld-tip.ui'), fill = h('div.fill'), pct = h('span.ui', { style: { width: '48px', textAlign: 'right', fontSize: '14px' } }, '0%'), stat = h('span.ui', { style: { width: '96px', fontSize: '14px' } }, 'Loading'), cont = h('div', { style: { display: 'flex', justifyContent: 'center', marginTop: '24px' } })
    clear(L).append(h('div.ld1', cv, h('div.ld-shade'),
      h('div.ld-title', h('span.label', { style: { color: 'rgba(255,255,255,.8)' } }, 'Los Santos · Jaipur'), h('h1.title', 'Yaman Choudhary'), h('span.title.accent', { style: { fontSize: 'clamp(22px,4vw,48px)' } }, 'The Career')),
      h('div', { style: { position: 'absolute', left: '20px', top: '20px', display: 'flex', gap: '12px', alignItems: 'center' } }, h('span.blink', { style: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)' } }), h('span.label', { style: { color: 'rgba(255,255,255,.8)' } }, 'FM 101.7 · YC Radio · tuning')),
      h('button.btn', { style: { position: 'absolute', right: '20px', top: '20px' }, onclick: enter }, 'Skip'),
      h('div.ld-bottom', h('div.in', tip, h('div.bar', stat, h('div.track', fill), pct), cont))))
    stopLoad = startCity(cv, { theme: 0, hold: 0.12 })
    let ti = Math.floor(Math.random() * TIPS.length)
    const showTip = () => { clear(tip).append(h('span.accent', 'Tip · '), TIPS[ti]); tip.style.animation = 'none'; void tip.offsetWidth; tip.style.animation = '' }
    showTip()
    const tips = setInterval(() => { ti = (ti + 1) % TIPS.length; showTip(); play('static') }, 2600)
    const t0 = performance.now()
    const tick = (t) => {
      if (done) return
      const p = Math.min(100, ((t - t0) / 4600) * 100)
      fill.style.width = p + '%'; pct.textContent = Math.round(p) + '%'
      if (p >= 100) { ready = true; stat.textContent = 'Ready'; cont.appendChild(h('button.btn.primary.blink', { style: { fontSize: '18px' }, onclick: enter }, 'Press Enter or tap to continue')); clearInterval(tips); return }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    L._tips = tips
  }
  function enter() {
    if (done) return
    done = true; clearInterval(L._tips)
    play('transition')
    L.classList.add('leaving')
    $('#hud').style.display = ''
    G.entered = true
    showPath(currentHashPath())
    setTimeout(() => { L.remove(); if (stopLoad) stopLoad() }, 1000)
  }
  const currentHashPath = () => (location.hash.slice(1) || '/')
  window.addEventListener('hashchange', () => { if (G.entered) showPath(currentHashPath()) })

  /* ---------- keyboard ---------- */
  const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']
  let buf = [], typed = ''
  document.addEventListener('keydown', (e) => {
    if (!G.entered) {
      if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement && document.activeElement.tagName === 'BUTTON') return; e.preventDefault(); phase === 0 ? begin() : ready && enter() }
      return
    }
    if (e.key === 'Escape') { if (document.fullscreenElement) return; back(); return }
    if (G.travel && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); skipTravel(); return }
    if (isTyping(e)) return
    buf = [...buf, e.key].slice(-8)
    if (buf.length === 8 && KON.every((v, i) => buf[i] === v)) { buf = []; runCheat('konami') }
    if (e.key.length === 1) { typed = (typed + e.key.toLowerCase()).slice(-3); if (typed === 'gta') { typed = ''; runCheat('gta') } }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const k = e.key.toLowerCase()
    if (k === 'm' && !G.travel) openMap()
    else if (k === 'p') togglePhone()
    else if (/^[1-9]$/.test(k) && !G.phoneOpen && !G.resumeOpen && !G.projectId && !G.missionRun) { const s = SECTIONS[Number(k) - 1]; if (s) go(s.path) }
  })
  // first interaction anywhere also resumes audio (autoplay policy)
  document.addEventListener('pointerdown', () => sound.resume(), { once: true })
  window.addEventListener('beforeunload', () => stopMain && stopMain())
})()
