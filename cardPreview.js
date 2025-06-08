// Remove any existing overlay if present
function removeOverlay() {
    const existing = document.getElementById('set-iframe-overlay');
    if (existing) existing.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);
}

function onKeyDown(e) {
    if (e.key === 'Escape') removeOverlay();
}

// Add event listeners to set links
const setLinks = document.querySelectorAll('a[href$="/"]');
setLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        removeOverlay();
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'set-iframe-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = 2000;
        overlay.style.transition = 'background 0.3s';
        overlay.style.cursor = 'zoom-out';

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = link.getAttribute('href') + 'index.html';
        iframe.style.width = 'min(98vw, 1100px)';
        iframe.style.height = '95vh';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '16px';
        iframe.style.boxShadow = '0 0 32px 8px rgba(0,0,0,0.7)';
        iframe.style.background = 'white';
        iframe.style.transition = 'transform 0.3s';
        iframe.style.transform = 'scale(0.95)';
        overlay.appendChild(iframe);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            iframe.style.transform = 'scale(1)';
        }, 10);
        // Close overlay on click outside iframe
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) removeOverlay();
        });
        // Close on Escape
        document.addEventListener('keydown', onKeyDown);
        // Inject card preview logic into iframe after it loads
        iframe.onload = function() {
            try {
                const script = iframe.contentDocument.createElement('script');
                script.textContent = `
                  (function() {
                    function showCardPreview(card) {
                      const overlay = document.createElement('div');
                      overlay.id = 'card-preview-overlay';
                      overlay.style.position = 'fixed';
                      overlay.style.top = 0;
                      overlay.style.left = 0;
                      overlay.style.width = '100vw';
                      overlay.style.height = '100vh';
                      overlay.style.background = 'rgba(0,0,0,0.7)';
                      overlay.style.display = 'flex';
                      overlay.style.alignItems = 'center';
                      overlay.style.justifyContent = 'center';
                      overlay.style.zIndex = 1000;
                      overlay.style.cursor = 'zoom-out';
                      overlay.style.transition = 'background 0.3s';
                      const img = document.createElement('img');
                      img.src = card.src;
                      img.alt = card.alt;
                      img.style.width = 'min(90vw, 600px)';
                      img.style.height = 'auto';
                      img.style.maxHeight = '90vh';
                      img.style.boxShadow = '0 0 32px 8px rgba(0,0,0,0.7)';
                      img.style.borderRadius = '12px';
                      img.style.transform = 'scale(0.7)';
                      img.style.transition = 'transform 0.3s';
                      img.style.cursor = 'zoom-out';
                      overlay.appendChild(img);
                      document.body.appendChild(overlay);
                      setTimeout(() => { img.style.transform = 'scale(1)'; }, 10);
                      function closePreview() {
                        img.style.transform = 'scale(0.7)';
                        overlay.style.background = 'rgba(0,0,0,0)';
                        setTimeout(() => { overlay.remove(); }, 300);
                      }
                      overlay.addEventListener('click', closePreview);
                      img.addEventListener('click', function(e) { e.stopPropagation(); closePreview(); });
                      function onKeyDown(e) { if (e.key === 'Escape') closePreview(); }
                      document.addEventListener('keydown', onKeyDown);
                      overlay.addEventListener('transitionend', () => { document.removeEventListener('keydown', onKeyDown); });
                    }
                    const cards = document.querySelectorAll('#card');
                    cards.forEach(card => {
                      card.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showCardPreview(card);
                      });
                    });
                  })();
                `;
                iframe.contentDocument.body.appendChild(script);
              } catch (err) {
                // Cross-origin issue or other error
              }
        };
    });
}); 