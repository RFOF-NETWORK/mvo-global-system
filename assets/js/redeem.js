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

// Matrix-Tabelle generieren
function generateMatrix() {
  const tbody = document.getElementById('matrixBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (let n = 0; n <= 10; n++) {
    const price = 10 * Math.pow(2, n);
    const fee = 0.01 * Math.pow(2, n);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${n}</td><td>${price.toFixed(2)} €</td><td>${fee.toFixed(4)} €</td>`;
    tbody.appendChild(row);
  }
  // Platzhalter für "n"
  const last = document.createElement('tr');
  last.innerHTML = `<td>...</td><td>10 × 2ⁿ</td><td>0,01 × 2ⁿ</td>`;
  tbody.appendChild(last);
}

// Historie laden
function loadHistory() {
  Promise.all([loadConfig(), loadRegistry()])
    .then(([config, registry]) => {
      const tbody = document.getElementById('historyBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      const price = config.startPrice * Math.pow(2, config.currentRoundtrips || 0);
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
    .catch(err => console.error('Historie-Fehler:', err));
}

// Suche & QR-Code
function lookupCertificate() {
  const serial = document.getElementById('serialInput').value.trim();
  const resultDiv = document.getElementById('result');
  const qrDiv = document.getElementById('qrcode');
  if (!serial) { resultDiv.innerHTML = '❌ Bitte Seriennummer eingeben.'; return; }

  loadRegistry()
    .then(data => {
      const cert = data.certificates.find(c => c.serial === serial);
      if (!cert) {
        resultDiv.innerHTML = '❌ Zertifikat nicht gefunden.';
        qrDiv.innerHTML = '';
        return;
      }
      return loadConfig().then(config => {
        const price = config.startPrice * Math.pow(2, config.currentRoundtrips || 0);
        const value = cert.mtkAmount * price;
        const pdfUrl = (config.baseUrl || '') + cert.pdfLink.replace(/^\//, '');

        resultDiv.innerHTML = `
          <h3>✅ Zertifikat gefunden</h3>
          <p><strong>Seriennummer:</strong> ${cert.serial}</p>
          <p><strong>Besitzer:</strong> ${cert.owner}</p>
          <p><strong>MTK-Menge:</strong> ${cert.mtkAmount}</p>
          <p><strong>Aktueller Wert:</strong> ${value.toFixed(4)} €</p>
          <p><strong>Status:</strong> ${cert.status}</p>
          ${cert.status === 'Aktiv' ? `
            <button onclick="requestRedemption('${cert.serial}')">📩 Einlösung beantragen</button>
          ` : `<p style="color:red;">Bereits eingelöst.</p>`}
        `;

        // QR-Code generieren (lokale Bibliothek)
        qrDiv.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrDiv, {
            text: pdfUrl,
            width: 128,
            height: 128,
            colorDark: '#1a2a3a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });
        } else {
          qrDiv.innerHTML = '<p style="color:orange;">QR-Code-Bibliothek nicht geladen.</p>';
        }
      });
    })
    .catch(err => { resultDiv.innerHTML = `❌ Fehler: ${err.message}`; });
}

function requestRedemption(serial) {
  loadConfig().then(config => {
    const subject = encodeURIComponent(`Einlösung von Zertifikat ${serial}`);
    const body = encodeURIComponent(
      `Sehr geehrtes MVO-Team,\n\n` +
      `ich möchte hiermit die Einlösung meines Zertifikats ${serial} beantragen.\n` +
      `Bitte teilen Sie mir den aktuellen Wert und die weiteren Schritte mit.\n\n` +
      `Mit freundlichen Grüßen`
    );
    window.location.href = `mailto:${config.contactEmail || 'info@rfof-bitcoin.org'}?subject=${subject}&body=${body}`;
  });
}

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
  generateMatrix();
  loadHistory();
});
