import { useState } from 'react'
import { DeforestationTab } from './components/DeforestationTab'
import { LibraryTab } from './components/LibraryTab'
import { ExternalSkillsTab } from './components/ExternalSkillsTab'
import './App.css'

type TabId = 'desmatamento' | 'biblioteca' | 'skills'

const tabs: { id: TabId; label: string }[] = [
  { id: 'desmatamento', label: 'Desmatamento' },
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'skills', label: 'Skills Externas' },
]

export default function App() {
  const [active, setActive] = useState<TabId>('desmatamento')
  return (
    <div className="app">
      <header className="app-header">
        <h1>Pantheon Dashboard</h1>
        <p className="subtitle">Painel de métricas de desmatamento e biblioteca Pantheon</p>
      </header>
      <nav className="tabs" role="tablist" aria-label="Abas">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={`tab ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="tab-content">
        {active === 'desmatamento' && <DeforestationTab />}
        {active === 'biblioteca' && <LibraryTab />}
        {active === 'skills' && <ExternalSkillsTab />}
      </main>
    </div>
  )
}
