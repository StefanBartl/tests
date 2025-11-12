
## 📦 Vorbereitung

```bash
npm install @alvarocastro/quicksort
```

Datei speichern als `benchmark.js` und mit Node.js ausführen:

```bash
node benchmark.js
```

---

## 🧪 Beispielausgabe

```text
== Benchmark QuickSort Varianten ==

Array-Größe: 1000
  quicksort1  : Ø 2.03 ms über 3 Läufe
  quicksort2  : Ø 0.64 ms über 3 Läufe
  builtinSort : Ø 0.42 ms über 3 Läufe
  quicksort4  : Ø 1.36 ms über 3 Läufe

Array-Größe: 5000
  quicksort1  : Ø 17.42 ms über 3 Läufe
  quicksort2  : Ø 3.20 ms über 3 Läufe
  builtinSort : Ø 1.97 ms über 3 Läufe
  quicksort4  : Ø 11.08 ms über 3 Läufe

...
```

---

## ✅ Vorteile

* Alle Varianten auf **derselben Datenbasis**
* Wiederholungen pro Größe = belastbare Durchschnittswerte
* Einfach konfigurierbar (nur `ITERATION_SIZES` ändern)
* Kein zusätzliches Tooling nötig

---

Sag Bescheid, wenn du auch:

* eine **CSV-Ausgabe** möchtest
* die Ergebnisse **plotten** willst (z. B. mit `gnuplot` oder `chart.js`)
* oder **validieren willst**, ob das Sortierergebnis korrekt ist
