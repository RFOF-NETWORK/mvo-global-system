document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('menu-container');
  if (!container) return;

  container.innerHTML = `
    <div class="menu-logo">☯ MVO</div>
    <button class="menu-toggle" id="menuToggle" aria-label="Menü öffnen">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav-links" id="navLinks">
      <a href="/index.html" id="navIndex">📋 Zertifikate</a>
      <a href="/redeem.html" id="navRedeem">📖 System & Einlösung</a>
      <a href="/zertifikat.html" id="navZertifikat">📄 Zertifikat erstellen</a>
      <a href="/docs/gruendungsurkunde.html" id="navGruendung">📜 Gründungsurkunde</a>
      <a href="/docs/preisgesetz.html" id="navPreis">📊 Preisgesetz</a>
      <a href="/docs/wp-pruefbericht.html" id="navWp">🧾 WP-Bericht</a>
    </nav>
  `;

  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  document.addEventListener('click', function(e) {
    if (!container.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('active');
    }
  });

  // Aktive Seite markieren
  const current = window.location.pathname;
  const links = {
    '/index.html': 'navIndex',
    '/redeem.html': 'navRedeem',
    '/zertifikat.html': 'navZertifikat',
    '/docs/gruendungsurkunde.html': 'navGruendung',
    '/docs/preisgesetz.html': 'navPreis',
    '/docs/wp-pruefbericht.html': 'navWp'
  };
  for (const [path, id] of Object.entries(links)) {
    if (current.includes(path)) {
      document.getElementById(id).classList.add('active');
    }
  }
});
