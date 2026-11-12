import { useState } from 'react'
import { DeforestationTab } from './components/DeforestationTab'
import { PantheonFlowTab } from './components/PantheonFlowTab'
import { LibraryTab } from './components/LibraryTab'
import './App.css'

type TabId = 'desmatamento' | 'fluxo' | 'biblioteca'

const tabs: { id: TabId; label: string }[] = [
  { id: 'desmatamento', label: 'Desmatamento' },
  { id: 'fluxo', label: 'Fluxo Pantheon' },
  { id: 'biblioteca', label: 'Biblioteca' },
]

export default function App() {
  const [active, setActive] = useState<TabId>('desmatamento')
  return (
    <div className="app">
      <header className="app-header">
        <h1>Pantheon Dashboard</h1>
        <p className="subtitle">Painel de métricas de desmatamento e fluxo Pantheon</p>
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
        {active === 'fluxo' && <PantheonFlowTab />}
        {active === 'biblioteca' && <LibraryTab />}
      </main>
    </div>
  )
}
