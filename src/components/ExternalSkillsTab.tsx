import { useMemo, useState } from 'react'

interface ExternalSkill {
  name: string
  source: string
  category: string
  installs: string
  jevScore: number
  rationale: string
  command: string
  url: string
}

const SKILLS: ExternalSkill[] = [
  {
    name: 'react-vite-dashboard',
    source: 'google-labs-code/stitch-skills',
    category: 'Dashboard',
    installs: '5.9K',
    jevScore: 92,
    rationale: 'Alta proveniência (Google Labs), dashboards data-dense, TanStack Query, tokens a11y',
    command: 'npx skills add https://github.com/google-labs-code/stitch-skills --skill react-vite-dashboard',
    url: 'https://skills.sh/google-labs-code/stitch-skills/react-vite-dashboard',
  },
  {
    name: 'react-frontend-skills',
    source: 'PyModel/react-frontend-skills',
    category: 'Frontend',
    installs: '—',
    jevScore: 88,
    rationale: '18 skills React 19/TS7, testes, UI, shadcn, tanstack-query',
    command: "npx skills add PyModel/react-frontend-skills -a opencode -s '*' -y",
    url: 'https://github.com/PyModel/react-frontend-skills',
  },
  {
    name: 'frontend-accessibility',
    source: 'aiskillstore/marketplace',
    category: 'A11y',
    installs: '1',
    jevScore: 85,
    rationale: 'WCAG, semântica, teclado, foco, ARIA',
    command: 'npx skills add https://github.com/aiskillstore/marketplace --skill frontend-accessibility',
    url: 'https://skills.sh/aiskillstore/marketplace/frontend-accessibility',
  },
  {
    name: 'web-accessibility',
    source: 'autohandai/community-skills',
    category: 'A11y',
    installs: '3',
    jevScore: 80,
    rationale: 'Auditoria WCAG AA, formulários, modais',
    command: 'npx skills add https://github.com/autohandai/community-skills --skill web-accessibility',
    url: 'https://skills.sh/autohandai/community-skills/web-accessibility',
  },
  {
    name: 'accessibility',
    source: 'danielteles/awesome-agent-skills',
    category: 'A11y',
    installs: '18',
    jevScore: 78,
    rationale: 'Revisão WCAG 2.2 AA (POUR)',
    command: 'npx skills add https://github.com/danielteles/awesome-agent-skills --skill accessibility',
    url: 'https://skills.sh/danielteles/awesome-agent-skills/accessibility',
  },
  {
    name: 'react',
    source: 'magnus919/agent-skills',
    category: 'React',
    installs: '—',
    jevScore: 75,
    rationale: 'Diagnóstico React/Vite, arquitetura, testes',
    command: 'npx skills add https://github.com/magnus919/agent-skills --skill react',
    url: 'https://github.com/magnus919/agent-skills',
  },
  {
    name: 'tailwind',
    source: 'PyModel/react-frontend-skills',
    category: 'Styling',
    installs: '—',
    jevScore: 70,
    rationale: 'Tailwind v4, theming',
    command: 'npx skills add PyModel/react-frontend-skills -a opencode -s tailwind -y',
    url: 'https://github.com/PyModel/react-frontend-skills',
  },
  {
    name: 'tanstack-query',
    source: 'PyModel/react-frontend-skills',
    category: 'Data',
    installs: '—',
    jevScore: 72,
    rationale: 'Data fetching/cache',
    command: 'npx skills add PyModel/react-frontend-skills -a opencode -s tanstack-query -y',
    url: 'https://github.com/PyModel/react-frontend-skills',
  },
  {
    name: 'playwright',
    source: 'magnus919/agent-skills',
    category: 'Testing',
    installs: '—',
    jevScore: 68,
    rationale: 'E2E browser',
    command: 'npx skills add https://github.com/magnus919/agent-skills --skill playwright',
    url: 'https://github.com/magnus919/agent-skills',
  },
]

const CATEGORIES = ['Todos', 'Dashboard', 'Frontend', 'A11y', 'React', 'Styling', 'Data', 'Testing'] as const
type Category = (typeof CATEGORIES)[number]

export function ExternalSkillsTab() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Todos')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SKILLS.filter((s) => {
      if (category !== 'Todos' && s.category !== category) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        s.rationale.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    })
  }, [query, category])

  const counts = useMemo(() => {
    const c: Record<string, number> = { Todos: SKILLS.length }
    SKILLS.forEach((s) => {
      c[s.category] = (c[s.category] ?? 0) + 1
    })
    return c
  }, [])

  async function handleCopy(command: string) {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(command)
      setTimeout(() => setCopied((cur) => (cur === command ? null : cur)), 2000)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="external-skills">
      <p className="jev-note">
        <strong>JEV (Justification-Evidence-Value):</strong> ranking por proveniência (fonte confiável),
        instalações (adoção) e relevância para o stack React/TS/Tailwind/TanStack do projeto. Scores mais
        altos indicam maior prioridade de instalação.
      </p>

      <div className="lib-controls">
        <input
          type="search"
          placeholder="Buscar skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar skills externas"
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

      <ul className="lib-list">
        {filtered.map((s) => (
          <li key={`${s.source}-${s.name}`} className="lib-item skill-card">
            <div className="lib-item-head">
              <span className="lib-cat">{s.category}</span>
              <span className="lib-name">{s.name}</span>
              <span className="jev-badge" aria-label={`JEV score ${s.jevScore}`}>
                JEV {s.jevScore}
              </span>
            </div>
            <div className="lib-detail">Fonte: {s.source} · Instalações: {s.installs}</div>
            <div className="lib-detail">{s.rationale}</div>
            <div className="skill-command">
              <code>{s.command}</code>
              <button
                type="button"
                className="copy-btn"
                onClick={() => void handleCopy(s.command)}
                aria-label={`Copiar comando de instalação de ${s.name}`}
              >
                {copied === s.command ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="skill-link">
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                Ver fonte
              </a>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="empty">Nenhuma skill encontrada.</p>}
    </div>
  )
}
