import { DeforestationTab } from './components/DeforestationTab'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Desmatamento — Brasil</h1>
        <p className="subtitle">Painel de métricas de desmatamento</p>
      </header>
      <main className="tab-content">
        <DeforestationTab />
      </main>
    </div>
  )
}
