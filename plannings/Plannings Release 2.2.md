# Planning Release 2.2

## Themen & Fokuspunkte
*Hier sammeln wir im Laufe unserer Planung die übergeordneten Ziele und Features für Release 2.2.*
- **UI/UX Optimierung im Dashboard:** Anpassung der Pagination aufgrund größer werdender Directive Cards.

## Neue User Stories
*Hier formulieren wir die daraus resultierenden konkreten User Stories.*

**US-2.2.1: Anpassung der Dashboard-Pagination (25 Directives pro Seite)**
* **Als** Nutzer
* **Möchte ich** auf dem Dashboard nur noch maximal 25 Directives pro Seite sehen
* **Damit** die Seite trotz der größer werdenden Directive Cards übersichtlich bleibt und performant lädt.
* **Akzeptanzkriterien:**
  - Im Dashboard werden maximal 25 statt bisher 50 Directives pro Seite (in der Pagination) angezeigt.
  - Die Seitenanzahl der Pagination berechnet sich korrekt auf Basis der neuen Limitierung.
  - Die API-Anfrage (falls dynamisch) bzw. das Backend limitiert die Ergebnisse für das Dashboard entsprechend auf 25.

## Ergänzungen für den Testplan
*Hier notieren wir uns, welche Testfälle neu in den Testplan aufgenommen werden müssen.*

**Zu US-2.2.1 (Pagination-Anpassung):**
- **Testfall:** Prüfen, ob auf der ersten Seite im Dashboard exakt 25 Directives angezeigt werden (vorausgesetzt, es existieren >25).
- **Testfall:** Prüfen, ob die Pagination-Buttons (Seite 2, nächste Seite etc.) korrekt berechnet werden und funktionieren.
- **Testfall:** Prüfen, ob nach einem Wechsel auf Seite 2 die Directives 26 bis 50 korrekt geladen und angezeigt werden.
