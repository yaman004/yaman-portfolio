// Fully synthesized sound engine (Web Audio API). No audio files, no copyrighted audio.

class SoundEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.ambient = null
    this.enabled = true
    this.volume = 0.6
    this.ambientOn = false
    this.timers = []
    this.noiseBuf = null
  }

  init() {
    if (this.ctx || typeof window === 'undefined') return
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.enabled ? this.volume : 0
    const comp = this.ctx.createDynamicsCompressor()
    this.master.connect(comp)
    comp.connect(this.ctx.destination)
    // 2s of white noise reused everywhere
    const len = this.ctx.sampleRate * 2
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    this.noiseBuf = buf
  }

  resume() {
    this.init()
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
  }

  setEnabled(on) {
    this.enabled = on
    this.apply()
  }
  setVolume(v) {
    this.volume = v
    this.apply()
  }
  apply() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(this.enabled ? this.volume : 0, t, 0.05)
  }

  /* ---------- helpers ---------- */
  osc(type, f0, f1, t0, dur, gain = 0.2, dest = this.master) {
    const c = this.ctx
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.setValueAtTime(f0, t0)
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g)
    g.connect(dest)
    o.start(t0)
    o.stop(t0 + dur + 0.05)
  }

  noise(t0, dur, { type = 'bandpass', f0 = 1000, f1 = 1000, q = 1, gain = 0.2, dest = this.master } = {}) {
    const c = this.ctx
    const s = c.createBufferSource()
    s.buffer = this.noiseBuf
    s.loop = true
    const f = c.createBiquadFilter()
    f.type = type
    f.Q.value = q
    f.frequency.setValueAtTime(f0, t0)
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.03, dur / 3))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    s.connect(f)
    f.connect(g)
    g.connect(dest)
    s.start(t0, Math.random() * 1.5)
    s.stop(t0 + dur + 0.05)
  }

  /* ---------- sound effects ---------- */
  play(name) {
    if (!this.enabled || !this.ctx) return
    this.resume()
    const t = this.ctx.currentTime
    switch (name) {
      case 'hover':
        this.osc('sine', 1500, 1100, t, 0.045, 0.05)
        break
      case 'click':
        this.osc('triangle', 780, 380, t, 0.07, 0.16)
        this.noise(t, 0.03, { type: 'highpass', f0: 3000, f1: 3000, gain: 0.05 })
        break
      case 'back':
        this.osc('sine', 560, 280, t, 0.1, 0.14)
        break
      case 'accept':
        ;[440, 554, 659, 880].forEach((f, i) => this.osc('square', f, f, t + i * 0.07, 0.16, 0.07))
        break
      case 'complete':
        ;[523, 659, 784, 1046].forEach((f, i) => this.osc('sawtooth', f, f, t + i * 0.12, 0.9, 0.05))
        this.osc('triangle', 261, 261, t, 1.4, 0.12)
        break
      case 'map':
        this.noise(t, 0.35, { f0: 400, f1: 2400, q: 2, gain: 0.12 })
        this.osc('sine', 330, 660, t, 0.2, 0.08)
        break
      case 'phone':
        this.osc('sine', 880, 880, t, 0.08, 0.1)
        this.osc('sine', 1175, 1175, t + 0.09, 0.12, 0.1)
        this.noise(t, 0.18, { f0: 800, f1: 1800, gain: 0.04 })
        break
      case 'notify':
        this.osc('sine', 1318, 1318, t, 0.14, 0.14)
        this.osc('sine', 1760, 1760, t + 0.14, 0.22, 0.14)
        break
      case 'achievement':
        ;[784, 1046, 1318, 1568].forEach((f, i) => this.osc('triangle', f, f, t + i * 0.1, 0.7, 0.13))
        this.noise(t + 0.3, 0.5, { type: 'highpass', f0: 5000, f1: 7000, gain: 0.03 })
        break
      case 'transition':
        this.noise(t, 0.55, { f0: 250, f1: 3200, q: 1.5, gain: 0.16 })
        break
      case 'vehicle': {
        this.osc('square', 90, 90, t, 0.06, 0.2) // door
        this.noise(t, 0.12, { type: 'lowpass', f0: 300, f1: 300, gain: 0.3 })
        const c = this.ctx
        const o = c.createOscillator()
        const f = c.createBiquadFilter()
        const g = c.createGain()
        o.type = 'sawtooth'
        f.type = 'lowpass'
        f.frequency.value = 500
        o.frequency.setValueAtTime(48, t + 0.3)
        o.frequency.exponentialRampToValueAtTime(150, t + 1.5)
        g.gain.setValueAtTime(0.0001, t + 0.3)
        g.gain.exponentialRampToValueAtTime(0.14, t + 0.5)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
        o.connect(f)
        f.connect(g)
        g.connect(this.master)
        o.start(t + 0.3)
        o.stop(t + 1.9)
        this.noise(t + 0.5, 1.2, { f0: 200, f1: 1800, q: 0.7, gain: 0.08 })
        break
      }
      case 'error':
        this.osc('square', 160, 150, t, 0.12, 0.12)
        this.osc('square', 160, 150, t + 0.16, 0.14, 0.12)
        break
      case 'wanted':
        for (let i = 0; i < 4; i++) this.osc('sine', i % 2 ? 960 : 720, i % 2 ? 960 : 720, t + i * 0.28, 0.27, 0.08)
        break
      case 'cheat':
        ;[392, 523, 659, 784, 1046].forEach((f, i) => this.osc('square', f, f, t + i * 0.06, 0.12, 0.06))
        break
      case 'static':
        this.noise(t, 0.5, { f0: 2500, f1: 900, q: 0.4, gain: 0.07 })
        break
      default:
    }
  }

  /* ---------- ambient city ---------- */
  startAmbient() {
    this.resume()
    if (!this.ctx || this.ambientOn) return
    this.ambientOn = true
    const c = this.ctx
    this.ambient = c.createGain()
    this.ambient.gain.value = 0.0001
    this.ambient.gain.setTargetAtTime(0.5, c.currentTime, 1.2)
    this.ambient.connect(this.master)
    // low city rumble (brown-ish noise)
    const s = c.createBufferSource()
    s.buffer = this.noiseBuf
    s.loop = true
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 380
    const g = c.createGain()
    g.gain.value = 0.22
    s.connect(lp)
    lp.connect(g)
    g.connect(this.ambient)
    s.start()
    this.rumble = s
    // distant hum
    const hum = c.createOscillator()
    const hg = c.createGain()
    hum.type = 'sine'
    hum.frequency.value = 58
    hg.gain.value = 0.05
    hum.connect(hg)
    hg.connect(this.ambient)
    hum.start()
    this.hum = hum
    // random one-shots: passing cars, distant sirens, static bursts
    const loop = () => {
      if (!this.ambientOn) return
      const t = this.ctx.currentTime
      const r = Math.random()
      if (r < 0.55) {
        this.noise(t, 2.2, { f0: 180, f1: 700, q: 0.8, gain: 0.05, dest: this.ambient })
      } else if (r < 0.85) {
        const lpf = this.ctx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 900
        lpf.connect(this.ambient)
        for (let i = 0; i < 6; i++) this.osc('sine', i % 2 ? 640 : 860, i % 2 ? 640 : 860, t + i * 0.55, 0.5, 0.03, lpf)
      } else {
        this.noise(t, 0.25, { f0: 3000, f1: 1500, q: 0.5, gain: 0.025, dest: this.ambient })
      }
      this.timers.push(setTimeout(loop, 4000 + Math.random() * 7000))
    }
    this.timers.push(setTimeout(loop, 1800))
  }

  stopAmbient() {
    if (!this.ambientOn) return
    this.ambientOn = false
    this.timers.forEach(clearTimeout)
    this.timers = []
    const c = this.ctx
    if (this.ambient) this.ambient.gain.setTargetAtTime(0.0001, c.currentTime, 0.3)
    const r = this.rumble
    const h = this.hum
    setTimeout(() => {
      try { r && r.stop() } catch (e) { /* noop */ }
      try { h && h.stop() } catch (e) { /* noop */ }
    }, 1200)
  }
}

const sound = new SoundEngine()
