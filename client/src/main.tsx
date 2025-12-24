import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClockWidget } from './components/ClockWidget'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <ClockWidget />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>IFRS 15 Revenue Manager</h1>
        <p>Sincronização de Data e Horário Implementada</p>
        <p>Relógio em tempo real funcionando com timezone do usuário</p>
      </div>
    </div>
  </React.StrictMode>,
)
