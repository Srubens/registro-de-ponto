import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './css/main.scss'


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider
  clientId='976760394244-5d8cqu7hm9hkiqro59uf35sdk2l4h9hh.apps.googleusercontent.com'
  >
  <StrictMode>
    <App />
  </StrictMode>
  </GoogleOAuthProvider>,
)
