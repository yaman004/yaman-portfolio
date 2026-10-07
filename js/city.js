const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

const THEMES = [
  { dusk: ['#3a2a5a', '#d9622b', '#ffb347'], night: ['#04050c', '#0c1224', '#1a2340'], glow: '#ffb347' },
  { dusk: ['#10243a', '#1e6f8c', '#5ad1e6'], night: ['#02060c', '#06182a', '#0d3550'], glow: '#3ec9ff' },
  { dusk: ['#3a1450', '#b8337a', '#ff9a6a'], night: ['#07030d', '#1d0a2c', '#3a1250'], glow: '#ff6aa8' },
].map((t) => ({ dusk: t.dusk.map(hex), night: t.night.map(hex), glow: hex(t.glow) }))

const rand = (a, b) => a + Math.random() * (b - a)

function makeLayer(W, H, o) {
  const cw = W + 240
  const body = document.createElement('canvas')
  const win = document.createElement('canvas')
  body.width = win.width = cw
  body.height = win.height = H
  const bc = body.getContext('2d')
  const wc = win.getContext('2d')
  if (!bc || !wc) return null
  const stacks = []
  const lights = []
  let x = -10
  while (x < cw) {
    const w = rand(o.minW, o.maxW)
    const h = rand(o.minH, o.maxH)
    bc.fillStyle = o.fill
    bc.fillRect(x, o.baseY - h, w, h + 40)
    if (Math.random() < 0.35) bc.fillRect(x + w * 0.25, o.baseY - h - rand(5, 12), w * 0.5, 12)
    if (o.antenna && Math.random() < 0.25) {
      bc.fillRect(x + w / 2 - 1, o.baseY - h - 34, 2, 34)
      lights.push([x + w / 2, o.baseY - h - 34])
    }
    if (o.stacks && Math.random() < 0.14) {
      bc.fillRect(x + w * 0.45, o.baseY - h - 16, w * 0.1, 16)
      stacks.push([x + w * 0.5, o.baseY - h - 16])
    }
    if (o.density) {
      const cols = Math.floor((w - 6) / 7)
      const rows = Math.floor((h - 8) / 9)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (Math.random() < o.density) {
            wc.fillStyle = Math.random() < 0.2 ? '#fff4c8' : '#ffd88a'
            wc.globalAlpha = 0.35 + Math.random() * 0.65
            wc.fillRect(x + 4 + c * 7, o.baseY - h + 6 + r * 9, 3, 4)
          }
    }
    x += w + rand(0, 4)
  }
  if (o.palms) {
    bc.strokeStyle = o.fill
    bc.fillStyle = o.fill
    for (let i = 0; i < o.palms; i++) {
      const px = rand(0, cw)
      const ph = rand(H * 0.2, H * 0.34)
      const lean = rand(-18, 18)
      bc.lineWidth = 4
      bc.beginPath()
      bc.moveTo(px, o.baseY)
      bc.quadraticCurveTo(px + lean * 0.3, o.baseY - ph * 0.5, px + lean, o.baseY - ph)
      bc.stroke()
      for (let f = 0; f < 7; f++) {
        const a = (f / 7) * Math.PI - Math.PI
        const len = rand(26, 44)
        bc.lineWidth = 2.4
        bc.beginPath()
        bc.moveTo(px + lean, o.baseY - ph)
        bc.quadraticCurveTo(
          px + lean + Math.cos(a) * len * 0.6,
          o.baseY - ph + Math.sin(a) * len * 0.6 - 10,
          px + lean + Math.cos(a) * len,
          o.baseY - ph + Math.sin(a) * len * 0.6 + 14,
        )
        bc.stroke()
      }
    }
  }
  return { body, win, stacks, lights, cw }
}


function startCity(canvas, state) {
  const themeRef = { get current() { return state.theme } }
  const holdRef = { get current() { return state.hold } }
  const speed = 1
  const stop = (() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return () => {}

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, dpr = 1
    let layers = null
    let cars = []
    let smoke = []
    let dust = []
    let stars = []
    let heli = { x: -120, y: 0, dir: 1, ph: 0 }
    let raf = 0
    let last = performance.now()
    let elapsed = 0
    let mx = 0, tmx = 0
    let hidden = false
    const cp = { dusk: THEMES[0].dusk.map((c) => [...c]), night: THEMES[0].night.map((c) => [...c]), glow: [...THEMES[0].glow] }

    const build = () => {
      const r = canvas.getBoundingClientRect()
      W = Math.max(320, Math.floor(r.width))
      H = Math.max(240, Math.floor(r.height))
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const base = H * 0.86
      layers = [
        makeLayer(W, H, { baseY: base - H * 0.02, minH: H * 0.1, maxH: H * 0.3, minW: 16, maxW: 38, fill: '#0b0f1b', density: 0.22 }),
        makeLayer(W, H, { baseY: base, minH: H * 0.18, maxH: H * 0.46, minW: 26, maxW: 62, fill: '#06080f', density: 0.34, antenna: true, stacks: true }),
        makeLayer(W, H, { baseY: base + 4, minH: H * 0.06, maxH: H * 0.2, minW: 40, maxW: 92, fill: '#020305', density: 0.5, palms: 7 }),
      ]
      stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.5, r: rand(0.4, 1.3), p: Math.random() * 6 }))
      const cl = Math.max(34, H * 0.07)
      cars = Array.from({ length: 9 }, (_, i) => {
        const dir = i % 2 ? 1 : -1
        return { x: rand(0, W), lane: dir === 1 ? 0.7 : 0.28, dir, v: rand(70, 150) * (dir === 1 ? 1 : 0.8), len: cl * rand(0.8, 1.25), tint: [rand(20, 70), rand(20, 70), rand(25, 80)] }
      })
      dust = Array.from({ length: 46 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: rand(4, 14), r: rand(0.5, 1.8), p: Math.random() * 6 }))
      heli.y = H * 0.2
    }

    const onMove = (e) => {
      tmx = (e.clientX / window.innerWidth) * 2 - 1
    }
    const onVis = () => { hidden = document.hidden }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    const ro = new ResizeObserver(() => build())
    ro.observe(canvas)
    build()

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      if (hidden || !layers) return
      const dt = Math.min(0.05, ((now - last) / 1000) * speed)
      last = now
      if (!reduced) elapsed += dt

      // theme lerp
      const target = THEMES[themeRef.current] || THEMES[0]
      const k = Math.min(1, dt * 3)
      for (let i = 0; i < 3; i++) {
        cp.dusk[i] = mix(cp.dusk[i], target.dusk[i], k)
        cp.night[i] = mix(cp.night[i], target.night[i], k)
      }
      cp.glow = mix(cp.glow, target.glow, k)

      const t = holdRef.current != null ? holdRef.current : Math.min(1, elapsed / 22)
      const ease = t * t * (3 - 2 * t)
      mx += (tmx - mx) * Math.min(1, dt * 4)
      const horizon = H * 0.86

      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, rgb(mix(cp.dusk[0], cp.night[0], ease)))
      sky.addColorStop(0.55, rgb(mix(cp.dusk[1], cp.night[1], ease)))
      sky.addColorStop(1, rgb(mix(cp.dusk[2], cp.night[2], ease)))
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // stars
      if (ease > 0.35) {
        const a = (ease - 0.35) / 0.65
        stars.forEach((s) => {
          ctx.globalAlpha = a * (0.45 + 0.55 * Math.sin(elapsed * 2 + s.p))
          ctx.fillStyle = '#fff'
          ctx.fillRect(s.x + mx * -6, s.y, s.r, s.r)
        })
        ctx.globalAlpha = 1
      }
      // sun / moon
      const sunY = horizon - 20 - Math.sin(Math.min(1, 1 - ease) * 1.2) * H * 0.18 + ease * H * 0.1
      const sunC = mix(cp.glow, [255, 255, 255], ease * 0.8)
      const sg = ctx.createRadialGradient(W * 0.72, sunY, 4, W * 0.72, sunY, H * (0.22 - ease * 0.1))
      sg.addColorStop(0, rgb(sunC, 0.95))
      sg.addColorStop(0.25, rgb(sunC, 0.35))
      sg.addColorStop(1, rgb(sunC, 0))
      ctx.fillStyle = sg
      ctx.fillRect(0, 0, W, H)

      const haze = (a) => {
        const g = ctx.createLinearGradient(0, horizon - H * 0.4, 0, horizon + 6)
        const c = mix(cp.dusk[2], cp.night[2], ease)
        g.addColorStop(0, rgb(c, 0))
        g.addColorStop(1, rgb(c, a))
        ctx.fillStyle = g
        ctx.fillRect(0, horizon - H * 0.4, W, H * 0.4 + 6)
      }

      const winA = 0.08 + ease * 0.92
      const drawLayer = (L, par, flick) => {
        const ox = -120 + mx * par
        ctx.drawImage(L.body, ox, 0)
        ctx.globalAlpha = winA * (flick ? 0.85 + 0.15 * Math.sin(elapsed * 3) : 1)
        ctx.drawImage(L.win, ox, 0)
        ctx.globalAlpha = 1
        return ox
      }

      drawLayer(layers[0], -8, false)
      haze(0.45)
      const oxMid = drawLayer(layers[1], -18, true)
      // antenna lights
      layers[1].lights.forEach(([lx, ly], i) => {
        if (Math.sin(elapsed * 2.2 + i) > 0.2) {
          ctx.fillStyle = 'rgba(255,40,40,.95)'
          ctx.fillRect(lx + oxMid - 1.5, ly - 1, 3, 3)
          ctx.fillStyle = 'rgba(255,40,40,.2)'
          ctx.beginPath()
          ctx.arc(lx + oxMid, ly, 7, 0, 6.3)
          ctx.fill()
        }
      })
      // smoke
      if (!reduced && Math.random() < dt * 5 && layers[1].stacks.length) {
        const s = layers[1].stacks[(Math.random() * layers[1].stacks.length) | 0]
        smoke.push({ x: s[0], y: s[1], a: 0.28, r: 3, vx: rand(3, 12), life: 0 })
      }
      smoke = smoke.filter((p) => p.a > 0.01)
      smoke.forEach((p) => {
        p.life += dt
        p.y -= 16 * dt
        p.x += p.vx * dt
        p.r += 6 * dt
        p.a -= 0.05 * dt
        ctx.fillStyle = `rgba(120,125,140,${Math.max(0, p.a)})`
        ctx.beginPath()
        ctx.arc(p.x + oxMid, p.y, p.r, 0, 6.3)
        ctx.fill()
      })

      // helicopter + searchlight
      heli.x += 38 * dt * heli.dir
      heli.ph += dt
      if (heli.x > W + 140) { heli.dir = -1; heli.y = rand(H * 0.12, H * 0.28) }
      if (heli.x < -140) { heli.dir = 1; heli.y = rand(H * 0.12, H * 0.28) }
      const hy = heli.y + Math.sin(heli.ph * 1.3) * 6
      const tx = heli.x + Math.sin(heli.ph * 0.5) * W * 0.18 + 60 * heli.dir
      const ty = horizon - H * 0.04
      ctx.globalCompositeOperation = 'lighter'
      const bg = ctx.createLinearGradient(heli.x, hy, tx, ty)
      bg.addColorStop(0, `rgba(255,255,230,${0.22 * (0.3 + ease)})`)
      bg.addColorStop(1, 'rgba(255,255,230,0)')
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.moveTo(heli.x, hy + 4)
      ctx.lineTo(tx - 46, ty)
      ctx.lineTo(tx + 46, ty)
      ctx.closePath()
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.save()
      ctx.translate(heli.x, hy)
      ctx.scale(heli.dir, 1)
      ctx.fillStyle = '#050608'
      ctx.beginPath()
      ctx.ellipse(0, 0, 15, 6, 0, 0, 6.3)
      ctx.fill()
      ctx.fillRect(-34, -2, 22, 3)
      ctx.fillRect(-36, -9, 2, 10)
      ctx.fillRect(-1, -9, 2, 4)
      ctx.strokeStyle = 'rgba(5,6,8,.9)'
      ctx.lineWidth = 2
      const ra = elapsed * 40
      ctx.beginPath()
      ctx.moveTo(-26 * Math.cos(ra), -9)
      ctx.lineTo(26 * Math.cos(ra), -9)
      ctx.stroke()
      if (Math.sin(elapsed * 4) > 0) {
        ctx.fillStyle = '#ff2a2a'
        ctx.fillRect(-36, -10, 3, 3)
      }
      ctx.restore()

      drawLayer(layers[2], -34, false)
      haze(0.18)

      // road
      const roadTop = H * 0.88
      const rg = ctx.createLinearGradient(0, roadTop, 0, H)
      rg.addColorStop(0, '#15171c')
      rg.addColorStop(1, '#050507')
      ctx.fillStyle = rg
      ctx.fillRect(0, roadTop, W, H - roadTop)
      ctx.fillStyle = 'rgba(255,255,255,.12)'
      ctx.fillRect(0, roadTop, W, 2)
      ctx.fillStyle = 'rgba(245,176,28,.55)'
      const midY = roadTop + (H - roadTop) * 0.5
      const off = (elapsed * 90) % 70
      for (let x = -70 + off; x < W; x += 70) ctx.fillRect(x, midY - 1, 36, 2)

      // streetlights
      const spacing = Math.max(240, W / 5)
      const slOff = (mx * -50) % spacing
      for (let x = -spacing + slOff; x < W + spacing; x += spacing) {
        const top = roadTop - H * 0.17
        ctx.fillStyle = '#050608'
        ctx.fillRect(x - 1.5, top, 3, roadTop - top + 6)
        ctx.fillRect(x - 1.5, top, 20, 3)
        const gx = x + 18
        const g = ctx.createRadialGradient(gx, top + 4, 1, gx, top + 4, H * 0.2)
        g.addColorStop(0, rgb(cp.glow, 0.7 * winA))
        g.addColorStop(0.2, rgb(cp.glow, 0.2 * winA))
        g.addColorStop(1, rgb(cp.glow, 0))
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = g
        ctx.fillRect(gx - H * 0.2, top - H * 0.16, H * 0.4, H * 0.4)
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = '#fff6d6'
        ctx.fillRect(gx - 3, top + 3, 6, 2)
      }

      // cars with headlights and motion streaks
      cars.forEach((c) => {
        c.x += c.v * c.dir * dt
        if (c.dir === 1 && c.x > W + 160) c.x = -160
        if (c.dir === -1 && c.x < -160) c.x = W + 160
        const y = roadTop + (H - roadTop) * c.lane
        const h = c.len * 0.32
        ctx.fillStyle = rgb(c.tint, 0.95)
        ctx.fillRect(c.x - c.len / 2, y - h, c.len, h)
        ctx.fillRect(c.x - c.len * 0.28, y - h * 1.6, c.len * 0.5, h * 0.7)
        // streak
        const sg2 = ctx.createLinearGradient(c.x, 0, c.x - c.dir * c.len * 1.6, 0)
        sg2.addColorStop(0, c.dir === 1 ? 'rgba(255,60,50,.28)' : 'rgba(255,60,50,.28)')
        sg2.addColorStop(1, 'rgba(255,60,50,0)')
        ctx.globalCompositeOperation = 'lighter'
        const tail = c.x - (c.dir * c.len) / 2
        ctx.fillStyle = sg2
        ctx.fillRect(Math.min(tail, tail - c.dir * c.len * 1.6), y - h * 0.8, c.len * 1.6, 3)
        ctx.fillStyle = 'rgba(255,50,40,.95)'
        ctx.fillRect(tail - 1.5, y - h * 0.8, 3, 3)
        // headlight cone
        const hx = c.x + (c.dir * c.len) / 2
        const hg = ctx.createLinearGradient(hx, 0, hx + c.dir * c.len * 2.4, 0)
        hg.addColorStop(0, 'rgba(255,248,210,.55)')
        hg.addColorStop(1, 'rgba(255,248,210,0)')
        ctx.fillStyle = hg
        ctx.beginPath()
        ctx.moveTo(hx, y - h * 0.7)
        ctx.lineTo(hx + c.dir * c.len * 2.4, y - h * 1.5)
        ctx.lineTo(hx + c.dir * c.len * 2.4, y + h * 0.4)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#fffbe0'
        ctx.fillRect(hx - 1.5, y - h * 0.8, 3, 3)
        ctx.globalCompositeOperation = 'source-over'
      })

      // floating particles
      ctx.globalCompositeOperation = 'lighter'
      dust.forEach((d) => {
        d.y -= d.v * dt
        d.x += Math.sin(elapsed + d.p) * 6 * dt + 5 * dt
        if (d.y < -5) { d.y = H + 5; d.x = Math.random() * W }
        if (d.x > W + 5) d.x = -5
        ctx.fillStyle = rgb(cp.glow, 0.25 + 0.25 * Math.sin(elapsed * 2 + d.p))
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, 6.3)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      // bottom legibility gradient
      const bgd = ctx.createLinearGradient(0, H * 0.55, 0, H)
      bgd.addColorStop(0, 'rgba(0,0,0,0)')
      bgd.addColorStop(1, 'rgba(0,0,0,.55)')
      ctx.fillStyle = bgd
      ctx.fillRect(0, H * 0.55, W, H * 0.45)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }

  })()
  return stop
}
