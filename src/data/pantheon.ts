export interface Agent {
  id: string
  name: string
  domain: string
}

export interface FlowPhase {
  id: string
  label: string
  description: string
}

export interface McpServer {
  name: string
  tools: string[]
}

export interface ExecutionMode {
  name: string
  description: string
}

export const agents: Agent[] = [
  { id: 'zeus', name: 'Zeus', domain: 'Orquestração central' },
  { id: 'athena', name: 'Athena', domain: 'Arquitetura e planejamento' },
  { id: 'hermes', name: 'Hermes', domain: 'Backend e APIs' },
  { id: 'aphrodite', name: 'Aphrodite', domain: 'Frontend e UX' },
  { id: 'demeter', name: 'Demeter', domain: 'Banco de dados e persistência' },
  { id: 'themis', name: 'Themis', domain: 'Segurança e qualidade (gate)' },
  { id: 'prometheus', name: 'Prometheus', domain: 'DevOps e infraestrutura' },
  { id: 'talos', name: 'Talos', domain: 'Hotfix rápido' },
  { id: 'apollo', name: 'Apollo', domain: 'Investigação e scout' },
  { id: 'hephaestus', name: 'Hephaestus', domain: 'Pipelines de IA e RAG' },
  { id: 'gaia', name: 'Gaia', domain: 'Geoespacial e sensoriamento' },
  { id: 'iris', name: 'Iris', domain: 'Git e release ops' },
  { id: 'mnemosyne', name: 'Mnemosyne', domain: 'Banco de memória do projeto' },
  { id: 'nyx', name: 'Nyx', domain: 'Observabilidade e telemetria' },
]

export const commands: string[] = [
  'pantheon',
  'pantheon-audit',
  'pantheon-consolidate',
  'pantheon-deepwork',
  'pantheon-focus',
  'pantheon-model',
  'pantheon-optimize',
  'pantheon-vision',
]

export const skills: string[] = [
  'agent-coordination',
  'agent-forge',
  'artifact-management',
  'auto-continue',
  'clonedeps',
  'code-review-checklist',
  'codemap',
  'context-compression',
  'fast-path-execution',
  'git-workflow-and-versioning',
  'incremental-implementation',
  'instruction-forge',
  'loop-engineering',
  'memory-bank',
  'prompt-refinery',
  'reflect',
  'security-hardening',
  'session-goal',
  'simplify',
  'spec-driven-development',
  'tdd-with-agents',
  'test-slicing',
  'verification-planning',
  'visual-review-pipeline',
  'worktrees',
]

export const mcpServers: McpServer[] = [
  { name: 'memory', tools: ['memory_store', 'memory_search', 'memory_recall', 'memory_forget', 'memory_list', 'memory_stats'] },
  { name: 'persistence', tools: ['goal_create', 'goal_get', 'goal_update', 'goal_done', 'context_save', 'context_get'] },
  { name: 'resources', tools: ['11 URIs (pantheon://agents, skills, routing, agents/{name}, deepwork/{slug}, deepwork/{slug}/status, skills/{name}, memory-bank/{path}, eval, eval/{plugin})'] },
  { name: 'code-mode', tools: ['execute_code_script', 'approve_code_script'] },
  { name: 'vision', tools: ['vision_describe', 'vision_ocr', 'vision_analyze'] },
]

export const pluginTools: string[] = [
  'hashline_edit',
  'pantheon_cost',
  'pantheon_model',
  'pantheon_local_decision',
  'todowrite',
  'pantheon_skill_search',
  'vision_describe (conditional)',
  'pantheon_jev_decide (conditional)',
  'pantheon_bounded_read (conditional)',
]

export const flowPhases: FlowPhase[] = [
  { id: 'request', label: 'Request', description: 'Requisição do usuário entra no sistema.' },
  { id: 'zeus', label: 'Zeus', description: 'Orquestrador central recebe e tria.' },
  { id: 'jev', label: 'Jev router', description: 'Roteador Jev classifica e direciona.' },
  { id: 'j1', label: 'J1 risk gate', description: 'Portão de risco J1 avalia segurança.' },
  { id: 'specialists', label: 'Specialists', description: 'Especialistas executam a tarefa.' },
  { id: 'themis', label: 'Themis gate', description: 'Gate de qualidade e segurança.' },
  { id: 'mcp', label: 'MCP', description: 'Chamadas a servidores MCP.' },
  { id: 'testslicing', label: 'Test slicing', description: 'Execução de testes direcionados.' },
  { id: 'delivery', label: 'Delivery', description: 'Entrega do resultado ao usuário.' },
]

export const executionModes: ExecutionMode[] = [
  { name: 'Fast-Track', description: '≤2 arquivos, ≤50 linhas. Sem cerimônia de TDD.' },
  { name: 'Council', description: '/pantheon — deliberação multi-especialista.' },
  { name: 'Deepwork', description: '/pantheon-deepwork — fluxo profundo e persistente.' },
]

export const testsSummary = {
  total: 237,
  topLevel: 152,
  pantheon: 81,
  note: '152 top-level + 81 pantheon + canary/eval',
}
