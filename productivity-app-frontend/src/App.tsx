import { useState } from 'react'
import viteLogo from '/vite.svg'
import SessionPage from './pages/SessionsPage'

function App(){
  return (
    <div style = {{ fontFamily: "sans-serif" }}>
      <h1>Productivity App</h1>
      <SessionPage />
    </div>
  )
}

export default App
