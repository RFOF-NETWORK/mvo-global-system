function fetchWithCacheBust(url) {
  return fetch(url + '?t=' + Date.now());
}

function loadConfig() {
  return fetchWithCacheBust('/config.json')
    .then(r => { if (!r.ok) throw new Error('config.json nicht gefunden'); return r.json(); });
}

function loadRegistry() {
  return fetchWithCacheBust('/registry.json')
    .then(r => { if (!r.ok) throw new Error('registry.json nicht gefunden'); return r.json(); });
}

Promise.all([loadConfig(), loadRegistry()])
  .then(([config, registry]) => {
    document.getElementById('operator').textContent = config.operator || '—';
    document.getElementById('owner').textContent = config.owner || '—';
    document.getElementById('foundingDate').textContent = config.foundingDate || '—';
    document.getElementById('currentRoundtrips').textContent = config.currentRoundtrips || '0';
    const price = config.startPrice * Math.pow(2, config.currentRoundtrips || 0);
    document.getElementById('currentPrice').textContent = price.toFixed(4);

    const tbody = document.getElementById('certBody');
    tbody.innerHTML = '';
    registry.certificates.forEach(cert => {
      const value = cert.mtkAmount * price;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${cert.serial}</strong></td>
        <td>${cert.issueDate}</td>
        <td>${cert.mtkAmount}</td>
        <td>${value.toFixed(4)} €</td>
        <td>${cert.owner}</td>
        <td>${cert.status}</td>
        <td><a href="${cert.pdfLink}" target="_blank">📄 PDF</a></td>
        <td><img src="${cert.qrCodeLink}" alt="QR" width="50" onerror="this.style.display='none'"></td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(err => {
    document.body.innerHTML = `
      <div style="color:red;padding:20px;font-family:sans-serif;">
        <h2>❌ Fehler beim Laden der Systemdaten</h2>
        <p>${err.message}</p>
        <p>Bitte prüfe config.json und registry.json.</p>
      </div>
    `;
    console.error(err);
  });
