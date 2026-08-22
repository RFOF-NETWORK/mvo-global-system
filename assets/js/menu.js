document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('menu-container');
  if (!container) return;

  // Menü-HTML
  container.innerHTML = `
    <div class="menu-logo">☯ MVO</div>
    <button class="menu-toggle" id="menuToggle" aria-label="Menü öffnen">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav-links" id="navLinks">
      <a href="/index.html" id="navIndex">📋 Zertifikate</a>
      <a href="/redeem.html" id="navRedeem">📖 System & Einlösung</a>
    </nav>
  `;

  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Schließen bei Klick außerhalb
  document.addEventListener('click', function(e) {
    if (!container.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('active');
    }
  });

  // Aktive Seite markieren
  const current = window.location.pathname;
  if (current.includes('redeem.html')) {
    document.getElementById('navRedeem').classList.add('active');
  } else {
    document.getElementById('navIndex').classList.add('active');
  }
});
