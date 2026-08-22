import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { AudioEngine } from "./components/Player/AudioEngine.tsx"
import { PlayerBar } from "./components/Player/PlayerBar.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <AudioEngine />
    <PlayerBar />
  </StrictMode>,
)
