import ReactDOM from 'react-dom/client'
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Remove <React.StrictMode> wrapper
  <App />
)
