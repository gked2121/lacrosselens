import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/reset.css";

// Add global network logging to catch 404 errors
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log('🌐 FETCH REQUEST:', args[0], args[1]);
    try {
      const response = await originalFetch(...args);
      console.log('🌐 FETCH RESPONSE:', args[0], response.status);
      if (response.status === 404) {
        console.error('❌ 404 ERROR for URL:', args[0]);
        console.trace('Stack trace for 404:');
      }
      return response;
    } catch (error) {
      console.error('❌ FETCH ERROR:', error);
      throw error;
    }
  };

  // Also log navigation attempts
  const originalPushState = window.history.pushState;
  window.history.pushState = function(...args) {
    console.log('🔄 Navigation attempt via pushState:', args);
    return originalPushState.apply(window.history, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
