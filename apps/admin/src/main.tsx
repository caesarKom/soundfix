import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { authApi } from './features/auth/api/auth-api.ts';
import { useAuthStore } from './store/useAuthStore.ts';
import { AudioEngine } from './components/Player/AudioEngine.tsx';
import { PlayerBar } from './components/Player/PlayerBar.tsx';

(async () => {
  try {
    // 1. First call refresh to populate the access token in memory from HttpOnly cookie
    await authApi.refresh(); 
    // 2. Fetch profile data using the recovered token
    const user = await authApi.getMe();
    
    // 3. Inject into Zustand store
    const token = useAuthStore.getState().accessToken;
    useAuthStore.getState().setAuth(user, token);
  } catch {
    // If cookies are expired, silently clear state to login page
    useAuthStore.getState().setAuth(null, null);
  } finally {
    useAuthStore.getState().setLoading(false);
    
    // 4. Mount React Application safely
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
        <AudioEngine />
      <PlayerBar />
      </StrictMode>
    );
  }
})();
