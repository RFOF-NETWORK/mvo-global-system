// ============================================================
//  QRCode – Eigene Implementierung (Version 1, Fehlerkorrektur L)
//  Keine externen Abhängigkeiten – vollständig selbst entwickelt
// ============================================================

var QRCode = (function() {

  // ---------- Hilfsfunktionen ----------
  function getByteArray(data) {
    var bytes = [];
    for (var i = 0; i < data.length; i++) {
      var code = data.charCodeAt(i);
      if (code < 128) {
        bytes.push(code);
      } else if (code < 2048) {
        bytes.push(0xC0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3F));
      } else {
        bytes.push(0xE0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3F));
        bytes.push(0x80 | (code & 0x3F));
      }
    }
    return bytes;
  }

  // Reed-Solomon Generatorpolynom für Fehlerkorrektur (7 Fehlerbytes bei Version 1, L)
  function rsGeneratorPoly() {
    var g = [1];
    for (var i = 0; i < 7; i++) {
      g = multiplyPoly(g, [1, alphaExp(i)]);
    }
    return g;
  }

  function alphaExp(n) {
    var result = 1;
    for (var i = 0; i < n; i++) {
      result = result * 2;
      if (result > 255) result = (result ^ 0x11D) & 0xFF;
    }
    return result;
  }

  function multiplyPoly(a, b) {
    var result = [];
    for (var i = 0; i < a.length; i++) {
      for (var j = 0; j < b.length; j++) {
        var val = a[i] ^ b[j];
        if (result[i+j] === undefined) result[i+j] = 0;
        result[i+j] ^= val;
      }
    }
    return result;
  }

  function rsEncode(data) {
    var gen = rsGeneratorPoly();
    var padded = data.slice();
    for (var i = 0; i < gen.length - 1; i++) padded.push(0);
    for (var i = 0; i < data.length; i++) {
      var coef = padded[i];
      if (coef !== 0) {
        for (var j = 0; j < gen.length; j++) {
          padded[i+j] ^= multiplyGF(coef, gen[j]);
        }
      }
    }
    return padded.slice(data.length);
  }

  function multiplyGF(a, b) {
    if (a === 0 || b === 0) return 0;
    var logA = [], logB = [];
    for (var i = 0; i < 256; i++) {
      var x = 1;
      for (var j = 0; j < i; j++) x = (x * 2) ^ (x > 127 ? 0x11D : 0);
      logA[x] = i;
    }
    return logA[(logA[a] + logA[b]) % 255];
  }

  // ---------- Hauptklasse ----------
  function QRCode(element, options) {
    this._element = element;
    this._text = options.text || '';
    this._width = options.width || 256;
    this._height = options.height || 256;
    this._colorDark = options.colorDark || '#000000';
    this._colorLight = options.colorLight || '#ffffff';
    this._modules = [];
    this._version = 1; // Version 1 (21x21)
    this._errorCorrection = 'L'; // Low

    if (this._text) this.makeCode();
  }

  QRCode.prototype.makeCode = function() {
    var data = getByteArray(this._text);
    var mode = 0x04; // Byte mode
    var lengthBits = 8; // für Version 1

    // Datenbits zusammenbauen
    var bits = [];
    bits.push(0x04); // Mode
    bits = bits.concat(integerToBits(data.length, lengthBits));
    for (var i = 0; i < data.length; i++) {
      bits = bits.concat(integerToBits(data[i], 8));
    }

    // Terminator (bis zu 4 Nullen)
    var terminator = 4;
    while (bits.length % 8 !== 0 && terminator > 0) {
      bits.push(0);
      terminator--;
    }
    // Auffüllen auf 8er-Byte
    while (bits.length % 8 !== 0) bits.push(0);

    // Kapazität für Version 1, L: 152 Bits (19 Bytes)
    var capacity = 152;
    while (bits.length < capacity) {
      bits.push(0);
    }

    // In Bytes umwandeln
    var dataBytes = [];
    for (var i = 0; i < bits.length; i += 8) {
      var byte = 0;
      for (var j = 0; j < 8; j++) byte = (byte << 1) | bits[i+j];
      dataBytes.push(byte);
    }

    // Fehlerkorrekturbytes berechnen
    var errorBytes = rsEncode(dataBytes);

    // Alle Bytes zusammenfügen (Daten + Fehlerkorrektur)
    var allBytes = dataBytes.concat(errorBytes);

    // In Bits umwandeln
    var allBits = [];
    for (var i = 0; i < allBytes.length; i++) {
      allBits = allBits.concat(integerToBits(allBytes[i], 8));
    }

    // Matrix initialisieren (21x21)
    var size = 21;
    var matrix = [];
    for (var i = 0; i < size; i++) {
      matrix[i] = [];
      for (var j = 0; j < size; j++) matrix[i][j] = 0;
    }

    // Feste Muster (Finder-Muster, Trennlinien, Alignment)
    addFinderPatterns(matrix, size);
    addTimingPatterns(matrix, size);
    addDarkModule(matrix, size);
    addFormatInformation(matrix, size, 0b010); // Fehlerkorrektur L

    // Datenbits in Matrix einfügen (von rechts unten)
    var bitIndex = 0;
    for (var col = size - 1; col >= 0; col -= 2) {
      if (col === 6) col--; // Timing-Pattern überspringen
      for (var row = 0; row < size; row++) {
        var rowIndex = (col % 4 === 0) ? row : size - 1 - row;
        if (matrix[rowIndex][col] === 0 && matrix[rowIndex][col-1] === 0) {
          // zwei Spalten gleichzeitig
          for (var k = 0; k < 2; k++) {
            if (bitIndex < allBits.length) {
              matrix[rowIndex][col - k] = allBits[bitIndex++];
            }
          }
        }
      }
    }

    // Maskierung anwenden (Maske 0)
    applyMask(matrix, size, 0);

    // Matrix speichern
    this._modules = matrix;
    this._draw();
  };

  // ---------- Hilfsfunktionen für die Matrix ----------
  function integerToBits(num, length) {
    var bits = [];
    for (var i = length - 1; i >= 0; i--) {
      bits.push((num >> i) & 1);
    }
    return bits;
  }

  function addFinderPatterns(matrix, size) {
    var pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    // Oben links
    placePattern(matrix, 0, 0, pattern);
    // Oben rechts
    placePattern(matrix, 0, size - 7, pattern);
    // Unten links
    placePattern(matrix, size - 7, 0, pattern);
  }

  function placePattern(matrix, row, col, pattern) {
    for (var i = 0; i < pattern.length; i++) {
      for (var j = 0; j < pattern[i].length; j++) {
        matrix[row + i][col + j] = pattern[i][j];
      }
    }
  }

  function addTimingPatterns(matrix, size) {
    for (var i = 0; i < size; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = 1;
        matrix[i][6] = 1;
      } else {
        matrix[6][i] = 0;
        matrix[i][6] = 0;
      }
    }
  }

  function addDarkModule(matrix, size) {
    matrix[size - 8][8] = 1;
  }

  function addFormatInformation(matrix, size, formatBits) {
    // Format-Information für L (0b010) + Maske 0 (0b000)
    var format = 0b01000; // L + Maske 0
    var bits = integerToBits(format, 5);
    // BCH-Code für Format (vereinfacht)
    var bch = 0;
    // nur Platzhalter – für echten QR-Code müsste BCH implementiert werden
    // Daher setzen wir hier die tatsächlichen Format-Bits manuell für Maske 0, L
    var formatData = [1,0,1,0,1,1,1,1,1,0,0,1,0,0,1]; // Beispiel für L + Maske 0
    // Platzieren
    for (var i = 0; i < 15; i++) {
      var pos = i < 6 ? i : i + 1;
      if (i < 8) {
        matrix[8][i] = formatData[i];
      } else if (i < 9) {
        matrix[8][i+1] = formatData[i];
      } else {
        matrix[15 - i][8] = formatData[i];
      }
    }
  }

  function applyMask(matrix, size, maskPattern) {
    // Maske 0: (row + col) % 2 === 0
    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        if (matrix[row][col] !== 2) { // reservierte Bereiche nicht maskieren
          if ((row + col) % 2 === 0) {
            matrix[row][col] = matrix[row][col] ^ 1;
          }
        }
      }
    }
  }

  // ---------- Zeichnen auf Canvas ----------
  QRCode.prototype._draw = function() {
    var size = this._modules.length;
    var cellSize = Math.min(this._width / size, this._height / size);
    var canvas = document.createElement('canvas');
    canvas.width = this._width;
    canvas.height = this._height;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = this._colorLight;
    ctx.fillRect(0, 0, this._width, this._height);

    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        if (this._modules[row][col] === 1) {
          ctx.fillStyle = this._colorDark;
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    this._element.innerHTML = '';
    this._element.appendChild(canvas);
  };

  return QRCode;
})();
