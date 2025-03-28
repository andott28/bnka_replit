// Denne filen legges til i index.html og kjøres ved oppstart for å hjelpe med autentisering i Netlify-miljøet
(function() {
  // Setter opp alle fetch-kall til å inkludere credentials
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Sikre at alle kall til vår API inkluderer credentials
    if (url.toString().includes('/api/')) {
      options.credentials = 'include';
      
      // Legg til cors-mode for å sikre at nettleseren vet at dette er en CORS-forespørsel
      options.mode = 'cors';
      
      // Sikre at Content-Type alltid er satt for POST/PUT
      if (options.method === 'POST' || options.method === 'PUT') {
        options.headers = options.headers || {};
        if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
          options.headers['Content-Type'] = 'application/json';
        }
      }
    }
    
    return originalFetch(url, options);
  };
  
  console.log('Netlify Auth Helper: Installert fetch-override for å støtte cross-domain autentisering');
})();