# Meine Auszeit

Kostenlose Retro-iPod-App auf GitHub Pages: https://thomasley.github.io/Meine-Auszeit/

## Bedienung

- Auf dem Rad im Kreis streichen oder mit ◀◀ / ▶▶ auswählen. OK bestätigt, MENU geht zurück. Menüpunkte lassen sich direkt antippen.
- Die untere Play-Taste startet die Norddeich-Hörprobe sofort, auch aus dem Hauptmenü. Während der Wiedergabe zeigt sie Pause; erneutes Drücken pausiert oder setzt fort.
- Während der Wiedergabe springen ◀◀ / ▶▶ zehn Sekunden zurück bzw. vor.
- Stimmung, Ort und Dauer werden lokal gespeichert; bis zu 50 beendete Hörproben erscheinen mit Datum und Bewertung im Verlauf.

## Aufnahmebestand und offene Arbeit

Die eingebettete kurze Originalaufnahme aus Norddeich ist unverändert erhalten. Vollständige Sitzungen für Entspannung und Einschlafhilfe, weitere Orte, Stimmungen und die wählbaren 5/10/15/20 Minuten fehlen noch. Die Auswahl erzeugt noch keine passende neue Aufnahme. Dies wird vor dem Start ausdrücklich angezeigt. Ortsbilder fehlen ebenfalls noch; die Wiedergabe zeigt bislang eine Platzhaltergrafik.

## Prüfung vom 07.11.2026

Die Steuerungslogik wurde mit simulierten DOM- und Audio-Ereignissen geprüft: sofortiger Start, Pause, Fortsetzen aus dem Menü, Zeitsprünge, Abschluss, Verlauf und Rad-Ereignisse. Die eingebetteten Audio-Daten wurden mit dem vorherigen Git-Stand verglichen und sind identisch. Ein echter Chrome-/iPhone-Test steht noch aus, da die Browser-Testverbindung nicht gestartet werden konnte. Insbesondere Touch-Gesten, hörbare Wiedergabe und Verhalten bei gesperrtem Bildschirm sind dadurch noch nicht bestätigt.

## Hosting

GitHub Pages: main, / (root). Kein Server und keine kostenpflichtigen Dienste erforderlich.
