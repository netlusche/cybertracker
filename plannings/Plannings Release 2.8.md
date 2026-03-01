# CyberTasker - Plannings Release 2.8

## Fokus: Quality of Life & Power-User Tools
Release 2.8 dient als finales "Aufpolieren" der Agenten-Erfahrung vor dem großen Architektur-Refactoring in Version 3.0. Der Fokus liegt auf UX-Verbesserungen, die häufige Workflows beschleunigen und das Cyberpunk-Gefühl verstärken.

---

### US-2.8.1: Default Categories for Initial Tasks
**Als** neuer Administrator (nach der Erst-Installation)
**möchte ich**, dass die automatisch generierten Beispiel-Direktiven (z.B. "Jack in to CyberTasker") direkt einer sinnvollen System-Kategorie (wie "Work") zugeordnet sind,
**damit** das Dashboard Filtersystem (Kategorie-Dropdown) sofort ab Minute 1 demonstriert und funktionsfähig ist, ohne dass ich erst selbst Kategorien anlegen oder zuweisen muss.

**Akzeptanzkriterien:**
- [ ] Bei der Ausführung von `api/install.php` wird eine Standardkategorie "Work" angelegt.
- [ ] Die Basis-Direktiven des Admin-Beispiel-Accounts (ID 1) erhalten beim Seed-Vorgang in `install.php` (und `tests/seed_test_data.php`) den Kategorie-Wert "Work" statt `null` oder "General".

---

### US-2.8.2: Agent Focus Mode ("Zen Mode")
**Als** überforderter Operative
**möchte ich** alle unwichtigen UI-Elemente und Nebenaufgaben per Knopfdruck ausblenden können,
**damit** ich mich ausschließlich auf meine dringendste Mission konzentrieren kann, um Prokrastination durch visuelle Überladung zu vermeiden.

**Akzeptanzkriterien:**
- [ ] Ein "Focus Mode" Toggle-Button im Main Header oder Dashboard.
- [ ] Bei Aktivierung verschwinden Sidebar, Filter, Pills und alle unwichtigen HUD-Elemente.
- [ ] Das Raster der Tasks wird durch eine einzige, maximierte "Hero Card" im Zentrum des Bildschirms ersetzt.
- [ ] Angezeigt wird automatisch die Aufgabe aus der regulären View mit der aktuell höchsten Priorität und dem dringendsten Datum.
- [ ] Die Hero Card enthält einen massiven "COMPLETE" Button sowie einen "SKIP / NEXT" Button, um zur zweitwichtigsten Aufgabe zu springen.

---

### US-2.8.3: Batch Actions (Multi-Select Operations)
**Als** Power-Nutzer mit vielen überfälligen oder gleichartigen Tasks
**möchte ich** mehrere Direktiven gleichzeitig auf dem Dashboard markieren können, um Massen-Operationen auszuführen,
**damit** ich nicht 10 Klicks brauche, um 5 Tasks als abgeschlossen zu markieren oder ihre Kategorie zu wechseln.

**Akzeptanzkriterien:**
- [ ] In der Task-Karten-Ansicht (`TaskCard.jsx`) erscheinen Checkboxen (z.B. beim Hovern der Karte oder per speziellem Tastatur-Shortcut).
- [ ] Sobald mindestens 1 Karte ausgewählt ist, fährt am unteren Bildschirmrand eine persistente "Command Bar" aus (`[3 Directives Selected]`).
- [ ] Die Command Bar bietet Massen-Aktionen:
  - [ ] Alle markierten Tasks auf "Completed" setzen.
  - [ ] Alle markierten Tasks löschen (mit einem einzigen CyberConfirm).
  - [ ] Option: Einer massenhaft ausgewählten Kategorie zuweisen.
- [ ] Das Backend (`TaskController.php`) muss erweitert werden, um Arrays von IDs zu verarbeiten (Bulk Update / Bulk Delete).

---

### US-2.8.4: Random Categories for Seeded Test Data
**Als** Entwickler/Tester der End-to-End-Pipeline
**möchte ich**, dass die beim Ausführen von `tests/seed_test_data.php` automatisch generierten Direktiven (z.B. die 50 Direktiven für Admin_Alpha) zufälligen sinnvollen Kategorien ("Work", "Personal", "Code", "Health") zugeordnet werden,
**damit** das Dashboard beim Entwickeln oder in E2E-Tests direkt lebensechte, gut gefilterte Datensätze anzeigt und die Filter-Dropdowns robuster getestet werden können.

**Akzeptanzkriterien:**
- [ ] `tests/seed_test_data.php` wählt beim Loop, der 50 bzw. 55 Test-Direktiven anlegt, zufällig aus einem Array an typischen Kategorien ("Work", "Personal", "Code", "Finance", "Health") aus.
- [ ] Zuvor legt das Seed-Skript sicherheitshalber diese Kategorien in der `categories`-Tabelle an (sofern wir eine dedizierte Tabelle dafür in V3 oder V2.8 nutzen, ansonsten einfach als validen String einfügen).

---

### US-2.8.5: Live Calendar WebFeed (WebCal)
**Als** Power-User & Agent, der viel unterwegs ist,
**möchte ich** einen dynamischen, geheimen URL-Link (WebCal Feed) in meinem Profil generieren und kopieren können,
**damit** ich CyberTasker direkt in meinen Google Calendar oder Apple Calendar einhängen kann und sich anstehende Direktiven (inkl. Dossier-Text und Fälligkeitsdatum) vollautomatisch auf mein Smartphone synchronisieren.

**Akzeptanzkriterien:**
- [ ] User-Settings / Profile Modal enthält einen Bereich für den "WebCal Comlink".
- [ ] Ein `api/calendar_feed.php` Endpunkt, der anhand eines sicheren, benutzerspezifischen Tokens (in der Datenbank hinterlegt oder via JWT generiert) alle aktiven Tasks des Users abfragt.
- [ ] Der Endpunkt gibt die Daten on-the-fly als kombinierten `text/calendar` (iCalendar / `.ics`) Stream aus, der von externen Kalender-Apps gelesen werden kann.
