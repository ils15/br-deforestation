import { useMemo, useState } from 'react'
import {
  agents,
  commands,
  skills,
  mcpServers,
  pluginTools,
  testsSummary,
} from '../data/pantheon'

interface LibraryItem {
  category: string
  name: string
  detail: string
}

const CATEGORIES = ['Todos', 'Agentes', 'Comandos', 'Skills', 'MCP', 'Plugin', 'Testes'] as const
type Category = (typeof CATEGORIES)[number]

export function LibraryTab() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Todos')

  const items = useMemo<LibraryItem[]>(() => {
    const list: LibraryItem[] = []
    agents.forEach((a) => list.push({ category: 'Agentes', name: a.name, detail: a.domain }))
    commands.forEach((c) => list.push({ category: 'Comandos', name: c, detail: 'Comando Pantheon' }))
    skills.forEach((s) => list.push({ category: 'Skills', name: s, detail: 'Skill' }))
    mcpServers.forEach((s) => {
      list.push({
        category: 'MCP',
        name: `Servidor: ${s.name}`,
        detail: s.tools.join(', '),
      })
      s.tools.forEach((t) => {
        if (t.startsWith('11 URIs')) return
        list.push({ category: 'MCP', name: t, detail: `MCP tool (${s.name})` })
      })
    })
    pluginTools.forEach((p) =>
      list.push({ category: 'Plugin', name: p, detail: 'Plugin tool' }),
    )
    list.push({
      category: 'Testes',
      name: `~${testsSummary.total} arquivos de teste`,
      detail: testsSummary.note,
    })
    return list
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      if (category !== 'Todos' && it.category !== category) return false
      if (!q) return true
      return (
        it.name.toLowerCase().includes(q) || it.detail.toLowerCase().includes(q)
      )
    })
  }, [items, query, category])

  const counts = useMemo(() => {
    const c: Record<string, number> = { Todos: items.length }
    items.forEach((it) => {
      c[it.category] = (c[it.category] ?? 0) + 1
    })
    return c
  }, [items])

  return (
    <div className="library">
      <div className="lib-controls">
        <input
          type="search"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar na biblioteca"
        />
        <div className="chip-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat} ({counts[cat] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div className="lib-summary">
        <span>Agentes: {agents.length}</span>
        <span>Comandos: {commands.length}</span>
        <span>Skills: {skills.length}</span>
        <span>MCP servidores: {mcpServers.length}</span>
        <span>Plugin tools: {pluginTools.length}</span>
        <span>Testes: ~{testsSummary.total}</span>
      </div>

      <ul className="lib-list">
        {filtered.map((it, idx) => (
          <li key={`${it.category}-${it.name}-${idx}`} className="lib-item">
            <div className="lib-item-head">
              <span className="lib-cat">{it.category}</span>
              <span className="lib-name">{it.name}</span>
            </div>
            <div className="lib-detail">{it.detail}</div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="empty">Nenhum resultado.</p>}
    </div>
  )
}
