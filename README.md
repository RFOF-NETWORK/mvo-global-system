# MVO – Mathematical Value Office (von RFOF-NETWORK)

## 🧾 Was ist das MVO?
Das MVO ist ein privates, mathematisch gedecktes Wertesystem, das auf einer unveränderlichen Formel basiert:
**Preis(n) = 10 × 2^n**, wobei n die Anzahl der vollständigen Roundtrips seit Gründung ist.

## 📜 Gründungsdaten
- Betreiber: RFOF-NETWORK
- Owner: Satoramy
- Gründungsdatum: 2026-01-01
- Starteinlage: 0,001 MTK & 0,01 €
- Startpreis: 10,00 €/MTK

## 🔐 Sicherheit & Transparenz
- Jedes Zertifikat ist physisch (unterschrieben) und digital (PDF + QR-Code) hinterlegt.
- Das öffentliche Register (registry.json) ist für jeden einsehbar.
- QR-Codes werden **ausschließlich lokal** generiert – keine externen Dienste.

## 🔁 Einlösungsprozess
1. Inhaber oder Owner ruft redeem.html auf.
2. Seriennummer eingeben → aktueller Wert wird angezeigt.
3. Einlösung beantragen → E-Mail an den Owner (info@rfof-bitcoin.org).
4. Owner prüft, überweist den Euro-Betrag und ändert den Status auf „Eingelöst“.

---

## 📂 Verzeichnisstruktur

```text
mvo-global-system/
├── .nojekyll                     # GitHub Pages – keine Jekyll-Verarbeitung
├── .gitignore                    # Ausgeschlossene lokale Dateien
├── index.html                    # Startseite (Zertifikatsregister)
├── redeem.html                   # System-Erklärung & Einlösung
├── zertifikat.html               # Öffentliche Zertifikatsvorlage (nur für Betreiber)
├── mvo-0001.html                 # Eigenständige HTML-Ansicht für Zertifikat 1
├── mvo-0002.html                 # Eigenständige HTML-Ansicht für Zertifikat 2
├── config.json                   # Systemparameter (unveränderlich)
├── registry.json                 # Öffentliches Zertifikatsregister (mit htmlLink)
├── README.md                     # Diese Datei
├── LICENSE.md                    # Proprietäre Lizenz
├── /certificates/                # Ordner für Zertifikats-PDFs
│   ├── MVO-0001.pdf
│   └── MVO-0002.pdf
├── /assets/                      # Alle statischen Ressourcen
│   ├── /css/
│   │   └── style.css             # Design für alle Seiten
│   ├── /js/
│   │   ├── menu.js               # Hamburger-Menü (6 Links)
│   │   ├── main.js               # Startseiten-Logik (Tabelle mit htmlLink)
│   │   ├── redeem.js             # Such- & Einlöse-Logik für redeem.html
│   │   └── qrcode.js             # Eigene lokale QR-Code-Bibliothek (keine CDN)
│   └── /qr-codes/                # Generierte QR-Code-Bilder (PNG)
│       ├── MVO-0001.png
│       └── MVO-0002.png
└── /docs/                        # Juristische & technische Dokumentation
    ├── gruendungsurkunde.html    # Gründungsurkunde (Web)
    ├── gruendungsurkunde.pdf     # Gründungsurkunde (PDF)
    ├── preisgesetz.html          # Preisgesetz (Web)
    ├── preisgesetz.pdf           # Preisgesetz (PDF)
    ├── wp-pruefbericht.html      # Wirtschaftsprüfer-Bericht (Web)
    └── wp-pruefbericht.pdf       # Wirtschaftsprüfer-Bericht (PDF) – Platzhalter
```

---

## 🌐 Öffentliche Seiten (alle über das Menü erreichbar)

Seite URL
Zertifikatsregister /index.html
System & Einlösung /redeem.html
Zertifikatsvorlage /zertifikat.html
Gründungsurkunde /docs/gruendungsurkunde.html
Preisgesetz /docs/preisgesetz.html
WP‑Bericht /docs/wp-pruefbericht.html

Jedes Zertifikat hat zusätzlich eine eigene HTML‑Seite (z.B. /mvo-0001.html), die über die Tabelle auf der Startseite verlinkt ist.

---

## 🧑‍⚖️ Rechtlicher Hinweis

Dieses System ist kein Finanzprodukt im Sinne des KWG. Es handelt sich um eine private, vertragliche Wertvereinbarung zwischen dem MVO und den Zertifikatsinhabern.

---

***Betreiber: RFOF-NETWORK***
***Owner: Satoramy***
***Repository: https://github.com/RFOF-NETWORK/mvo-global-system***
