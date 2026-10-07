

const dist = (a, b) => Math.hypot(NODES[a][0] - NODES[b][0], NODES[a][1] - NODES[b][1])

const ADJ = {}
EDGES.forEach(([a, b]) => {
  ;(ADJ[a] ||= []).push(b)
  ;(ADJ[b] ||= []).push(a)
})

// Dijkstra over the hand-built road graph. Returns { nodes, points, length }.
function findRoute(from, to) {
  if (!NODES[from] || !NODES[to]) return null
  const d = {}
  const prev = {}
  const todo = new Set(Object.keys(NODES))
  Object.keys(NODES).forEach((n) => (d[n] = Infinity))
  d[from] = 0
  while (todo.size) {
    let u = null
    todo.forEach((n) => {
      if (u === null || d[n] < d[u]) u = n
    })
    if (u === null || d[u] === Infinity) break
    todo.delete(u)
    if (u === to) break
    ;(ADJ[u] || []).forEach((v) => {
      const nd = d[u] + dist(u, v)
      if (nd < d[v]) {
        d[v] = nd
        prev[v] = u
      }
    })
  }
  if (d[to] === Infinity) return null
  const nodes = []
  for (let n = to; n; n = prev[n]) nodes.unshift(n)
  return { nodes, points: nodes.map((n) => NODES[n]), length: d[to] }
}

const kmFromUnits = (u) => (u * 0.012).toFixed(1)
const etaMinutes = (u) => Math.max(1, Math.round((u * 0.012) / 0.6))
