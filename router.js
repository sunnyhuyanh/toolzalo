// Simple client-side router for development
// This handles routing without server configuration

(function() {
  // Get current path
  const path = window.location.pathname;
  
  // Router configuration
  const routes = {
    '/': 'index.html',
    '/admin': 'admin.html',
    '/index': 'index.html'
  };
  
  // Check if we're on GitHub Pages or similar
  const isGitHubPages = window.location.hostname.includes('github.io');
  const basePath = isGitHubPages ? '/' + window.location.pathname.split('/')[1] : '';
  
  // Handle routing
  function route() {
    const currentPath = path.replace(basePath, '');
    const targetFile = routes[currentPath];
    
    if (targetFile && !path.endsWith('.html')) {
      // Redirect to the appropriate HTML file
      window.location.replace(basePath + '/' + targetFile);
    }
  }
  
  // Route on page load
  route();
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', route);
})();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { route };
} 