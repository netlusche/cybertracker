# Planning Release 2.2

## Themen & Fokuspunkte
*Hier sammeln wir im Laufe unserer Planung die übergeordneten Ziele und Features für Release 2.2.*
- **UI/UX Optimierung im Dashboard:** Anpassung der Pagination aufgrund größer werdender Directive Cards.
- **Benutzerfreundlichkeit (Usability):** Alphabetische Sortierung der Sprachen im Language Switcher. Erweiterung des Sprachpakets.
- **Directive Dossier Optimierungen:** Bessere visuelle Strukturierung durch Titelumbruch, vollständige Markdown-Unterstützung (inkl. Überschriften) in der Protocol Description und die Möglichkeit, den Directive-Namen direkt im Dossier zu editieren.
- **Sicherheit & Profil-Verwaltung:** Einführung einer Passwort-Bestätigung ("Confirm new password") bei manuellen Passwort-Änderungen und beim Passwort-Reset (nicht bei der Registrierung).
- **Personalisiertes Kalender-Feature:** Einführung eines internen Kalenders im Overlay-Format, um Directives mit Fälligkeitsdatum (Due Date) themengerecht und interaktiv darzustellen.
- **Dokumentations-Update:** Anpassung und Erweiterung von `USER STORIES.md` und `MASTER_TEST_PLAN.md` gemäß den neuen Features.

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

**US-2.2.2: Alphabetische Sortierung der Sprachauswahl**
* **Als** Nutzer
* **Möchte ich**, dass die angebotenen Sprachen im Dropdown-Menü alphabetisch sortiert sind
* **Damit** ich meine gewünschte Sprache schneller und intuitiver finde.
* **Akzeptanzkriterien:**
  - Die Einträge im Sprachauswahl-Menü sind streng alphabetisch sortiert (A-Z, basierend auf dem angezeigten Namen, z. B. Dansk, Deutsch, English, Español...).

**US-2.2.3: Umbruch im Titel des Directive Dossiers**
* **Als** Nutzer
* **Möchte ich**, dass in der Ansicht "Directive Dossier" der Name der Directive in einer neuen Zeile unter "DIRECTIVE DOSSIER:" beginnt
* **Damit** der eigentliche Name klar separiert ist und der Textfluss (besonders bei langen Namen) sauberer wirkt.
* **Akzeptanzkriterien:**
  - Es gibt einen optischen Zeilenumbruch direkt im Titel-Bereich nach dem Präfix "DIRECTIVE DOSSIER:".
  - Das Layout (Abstände nach oben/unten, Zentrierung/Ausrichtung) wirkt nach dem Umbruch stimmig.

**US-2.2.4: Erweiterte Markdown-Unterstützung (Überschriften) in der Protocol Description**
* **Als** Nutzer
* **Möchte ich**, dass in der Beschreibung (Protocol Description) auch Markdown-Überschriften (z.B. `# Was`, `## ist`) korrekt gerendert werden
* **Damit** ich umfangreiche Inhalte besser gliedern und übersichtlicher darstellen kann.
* **Akzeptanzkriterien:**
  - Rauten (`#`, `##` usw.) am Zeilenanfang im Text der Protocol Description werden als HTML-Überschriften (H1, H2 usw.) geparst und nicht mehr als reiner Text ausgegeben.
  - Die gerenderten Überschriften passen sich optisch an das bestehende (Cyberpunk-)Theme an.

**US-2.2.5: Neues Feld "Confirm new password" im User Profile**
* **Als** Nutzer
* **Möchte ich** bei der Änderung meines Passworts im User Profile das neue Passwort zur Bestätigung ein zweites Mal eingeben müssen
* **Damit** ich sicher bin, dass ich mich beim Eintippen meines neuen Passworts nicht vertippt habe, bevor ich mich versehentlich aussperre.
* **Akzeptanzkriterien:**
  - Es gibt ein neues Eingabefeld "Confirm new password" im Bereich "UPDATE CYPHER".
  - Eine Passwortänderung ist nur möglich, wenn "New Password" und "Confirm new password" identisch sind (Frontend- & Backend-Validierung).
  - Fehlermeldungen bei Nichtübereinstimmung sind klar verständlich und lokalisierbar.
  - Das Label "Confirm new password" und zugehörige Fehlermeldungen sind in die Übersetzungsdateien aufgenommen worden.
  - Die Registrierungsseite bleibt von dieser Änderung explizit unberührt (hier existiert weiterhin nur ein einzelnes Passwortfeld).

**US-2.2.6: Neues Feld "Confirm new password" beim Password Reset**
* **Als** Nutzer
* **Möchte ich** beim Zurücksetzen meines Passworts (reset_password.html) das neue Passwort ebenfalls ein zweites Mal zur Bestätigung eingeben müssen
* **Damit** das Risiko von Tippfehlern beim Setzen eines komplett neuen Zugangs minimiert wird.
* **Akzeptanzkriterien:**
  - Es gibt ein neues Eingabefeld "Confirm new password" unterhalb von "NEW PWD" in `reset_password.html`.
  - Der "OVERRIDE" Button bzw. der Absendevorgang wird blockiert oder schlägt mit aussagekräftigem Fehler fehl, wenn beide Passwörter nicht übereinstimmen.
  - Das Label und die Fehlermeldungen sind im Übersetzungssystem gepflegt.

**US-2.2.7: Kalender-Navigation und Basis-Ansicht**
* **Als** Nutzer
* **Möchte ich** über die Hauptnavigation Zugriff auf einen persönlichen Kalender haben, der sich geordnet als Overlay öffnet
* **Damit** ich auf einen Blick alle meine Directives sehe, die ein gesetztes Fälligkeitsdatum (Due Date) haben.
* **Akzeptanzkriterien:**
  - Es gibt einen neuen, passenden Menüpunkt/Button (z. B. "CALENDAR" oder ein Icon) in der globalen Navigation, welcher den Kalender öffnet.
  - Ein Klick öffnet den Kalender als funktionales Overlay/Panel, das sich optisch in das bestehende Theme einfügt.
  - Der Kalender zeigt Tage/Wochen so an, dass man Termine erkennt, und Directives mit Due Date werden den jeweiligen Tagen zugewiesen.
  - Directives ohne Due Date tauchen im Kalender nicht auf.

**US-2.2.8: Interaktionen im Kalender (Dossier-Aufruf)**
* **Als** Nutzer
* **Möchte ich** im Kalender auf einen Eintrag klicken können, um sofort das dazugehörige Directive Dossier zu öffnen
* **Damit** ich Details zur fälligen Aufgabe einsehen und bearbeiten kann, ohne den Kalender-Kontext dauerhaft zu verlassen.
* **Akzeptanzkriterien:**
  - Ein Klick auf ein Directive-Event im Kalender öffnet das "Directive Dossier" Modal/Overlay für diese spezifische Directive über dem Kalender bzw. austauschend.
  - Schließt der Nutzer das Directive Dossier wieder, wird automatisch wieder das Kalender-Overlay in seinem vorherigen Zustand angezeigt.
  - Der Zustand (State) der geöffneten Modals wird so verwaltet, dass dieser Vor-/Zurück-Flow fehlerfrei funktioniert.

**US-2.2.9: Directive-Name direkt im Dossier editieren**
* **Als** Nutzer
* **Möchte ich** den Namen (Titel) einer Directive direkt aus dem geöffneten Dossier heraus ändern können
* **Damit** ich für einfache Umbenennungen nicht extra zurück ins Dashboard wechseln muss und der Bearbeitungs-Flow konsistent bleibt.
* **Akzeptanzkriterien:**
  - Der Titel (Name) im Directive Dossier ist editierbar und verhält sich (z. B. Inline-Edit, Klicken zum Bearbeiten oder Edit-Icon) logisch analog zur bestehenden Funktion auf der Directive Card.
  - Änderungen am Namen werden direkt ins Backend gespeichert.
  - Das Dashboard und andere Ansichten spiegeln den aktualisierten Namen nach dem Schließen des Dossiers (oder in Echtzeit) wider.

**US-2.2.10: Nachpflege der zentralen Dokumentationen**
* **Als** Entwickler/Projekt-Manager
* **Möchte ich**, dass die Dateien `USER_STORIES.md` und `MASTER_TEST_PLAN.md` nach Abschluss der Release-Planung oder -Übersetzung um die neuen Features ergänzt werden
* **Damit** die zentrale Wissenbasis des Projekts stets aktuell und vollständig den Stand des Releases 2.2 abbildet.
* **Akzeptanzkriterien:**
  - Alle neuen User Stories (US-2.2.1 bis US-2.2.11) sind in der offiziellen `USER_STORIES.md` nachgepflegt.
  - Der gesamte Testplan ist in die Datei `MASTER_TEST_PLAN.md` integriert worden.
  - In der `MASTER_TEST_PLAN.md` wurde klar abgegrenzt, welche der neuen Tests durch Playwright (Automated E2E Tests) und welche manuell (Manual Verification) getestet werden müssen.

**US-2.2.11: Erweiterung des Sprachpakets**
* **Als** globaler Nutzer
* **Möchte ich**, dass die Applikation auch auf Japanisch, Koreanisch, Hindi, Türkisch und Vietnamesisch verfügbar ist
* **Damit** CyberTasker in noch mehr weltweiten Regionen nativ genutzt werden kann.
* **Akzeptanzkriterien:**
  - Das Sprachauswahl-Menü (Header.jsx / LanguageSwitcher) wird um die Einträge für Japanisch (`ja`), Koreanisch (`ko`), Hindi (`hi`), Türkisch (`tr`) und Vietnamesisch (`vi`) erweitert.
  - Alle Basis-Übersetzungsdateien (`translation.json`) für diese neuen Sprachen werden generiert und im Ordner `public/locales/` abgelegt.
  - Die veralteten Relikte von *Hebräisch (`he`)* (RTL) wurden vollständig und fehlerfrei aus dem Frontend (inkl. LanguageSwitcher.jsx) sowie dem `locales`-Verzeichnis entfernt, um Inkompatibilitäten beim Layout vorzubeugen.

## Ergänzungen für den Testplan
*Hier notieren wir uns, welche Testfälle neu in den Testplan aufgenommen werden müssen.*

**Zu US-2.2.1 (Pagination-Anpassung):**
- **Testfall:** Prüfen, ob auf der ersten Seite im Dashboard exakt 25 Directives angezeigt werden (vorausgesetzt, es existieren >25).
- **Testfall:** Prüfen, ob die Pagination-Buttons (Seite 2, nächste Seite etc.) korrekt berechnet werden und funktionieren.
- **Testfall:** Prüfen, ob nach einem Wechsel auf Seite 2 die Directives 26 bis 50 korrekt geladen und angezeigt werden.

**Zu US-2.2.2 (Sprachauswahl):**
- **Testfall:** Dropdown-Menü für die Sprache öffnen und prüfen, ob die Liste alphabetisch korrekt von A-Z sortiert ist (Dansk, Deutsch, English, Español, Français, Italiano, Nederlands, Svenska).

**Zu US-2.2.3 (Directive Dossier - Titelumbruch):**
- **Testfall:** Ein Dossier mit langem und kurzem Namen öffnen. Sicherstellen, dass der Variablen-Teil des Titels zwingend in einer neuen Zeile unter "DIRECTIVE DOSSIER:" steht und das "X" (Schließen-Button) weiterhin gut erreichbar ist.

**Zu US-2.2.4 (Directive Dossier - Markdown):**
- **Testfall:** Eine Directive anlegen oder editieren, bei der die Description verschiedene Überschriften-Ebenen enthält (z. B. `# Was`, `## ist`, `### denn`). Im Dossier prüfen, ob diese als formatierte Überschriften mit unterschiedlichen Größen (und nicht als Fließtext mit Rauten) angezeigt werden.

**Zu US-2.2.5 & US-2.2.6 (Passwort-Bestätigung):**
- **Testfall:** Im User Profile testen: "New Password" und "Confirm new password" mit *unterschiedlichen* Werten befüllen -> Validierungsfehler muss erscheinen, Update schlägt fehl.
- **Testfall:** Im User Profile testen: Beide Felder identisch füllen -> Update gelingt. Übersetzbarkeit der neuen Labels prüfen!
- **Testfall:** Auf `reset_password.html` (Password Reset Link auslösen): Gleicher Test mit *unterschiedlichen* und *identischen* Werten.
- **Testfall (Regression):** Registrierungsprozess prüfen und verifizieren, dass dort **kein** Bestätigungsfeld angezeigt wird (und die Registrierung mit einem Feld weiterhin klappt).

**Zu US-2.2.7 & US-2.2.8 (Personalisierter Kalender):**
- **Testfall:** Navigation via Button in den Kalender -> Das Kalender-Panel öffnet sich und rendert korrekt im Theme (Monats/Wochenübersicht).
- **Testfall:** Prüfen, ob eine existierende Directive *mit* Due Date im Kalender auftaucht und eine *ohne* Due Date nicht.
- **Testfall:** Kalendereintrag anklicken -> Dossier öffnet sich mit den richtigen Daten. Dossier schließen -> Kalender ist wieder im Foreground/Sichtbereich.

**Zu US-2.2.9 (Directive-Name im Dossier ändern):**
- **Testfall:** Directive Dossier öffnen, Namen anklicken/editieren und abspeichern -> Prüfen, ob der neue Name gespeichert wurde, im Dossier übernommen ist und beim Schließen des Dossiers auch das Dashboard den neu vergebenen Namen anzeigt.

**Zu US-2.2.10 (Dokumentations-Updates):**
- **Automatisierungs-Check:** Es wird als abschließender Schritt bei der Release-Arbeit verifiziert, dass die Master-Dateien aktualisiert wurden und die Testfälle in automatisierte Scripts vs. manuelle Durchgänge aufgeteilt wurden.

**Zu US-2.2.11 (Erweiterung des Sprachpakets & Entfernung Hebräisch):**
- **Testfall:** Prüfen, ob Japanisch (日本語), Koreanisch (한국어), Hindi (हिन्दी), Türkisch (Türkçe) und Vietnamesisch (Tiếng Việt) im Dropdown zur Verfügung stehen und ob sich das UI bei Auswahl entsprechend der neuen `translation.json` Dateien umstellt.
- **Regression:** Sicherstellen, dass Hebräisch (`he`) nirgends mehr referenziert oder geladen wird (kein 404 Fehler auf der Konsole für `translation.json`).
