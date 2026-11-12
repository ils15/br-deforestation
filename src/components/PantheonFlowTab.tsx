import { useEffect, useState } from 'react'
import { agents, commands, flowPhases, executionModes } from '../data/pantheon'

export function PantheonFlowTab() {
  const [step, setStep] = useState<number>(-1)
  const [running, setRunning] = useState(false)

  function runSimulation() {
    if (running) return
    setStep(0)
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return
    if (step < 0) return
    if (step >= flowPhases.length - 1) {
      const t = setTimeout(() => setRunning(false), 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900)
    return () => clearTimeout(t)
  }, [running, step])

  return (
    <div className="flow">
      <div className="flow-actions">
        <button type="button" className="btn-primary" onClick={runSimulation} disabled={running}>
          {running ? 'Executando...' : 'Executar simulação'}
        </button>
        {step >= 0 && (
          <span className="flow-status">
            Fase atual: {flowPhases[step]?.label ?? ''}
          </span>
        )}
      </div>

      <div className="phase-track">
        {flowPhases.map((p, i) => (
          <div
            key={p.id}
            className={`phase ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
          >
            <div className="phase-index">{i + 1}</div>
            <div className="phase-label">{p.label}</div>
            <div className="phase-desc">{p.description}</div>
          </div>
        ))}
      </div>

      <section className="card">
        <h2>Agentes (14)</h2>
        <div className="agent-grid">
          {agents.map((a) => (
            <div key={a.id} className="agent-card">
              <div className="agent-name">{a.name}</div>
              <div className="agent-domain">{a.domain}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Comandos</h2>
        <div className="chip-list">
          {commands.map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Modos de execução</h2>
        <ul className="mode-list">
          {executionModes.map((m) => (
            <li key={m.name}>
              <strong>{m.name}</strong> — {m.description}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
