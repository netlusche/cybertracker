# CyberTasker - Plannings Release 2.8

## Fokus: Quality of Life & Power-User Tools
Release 2.8 dient als finales "Aufpolieren" der Agenten-Erfahrung vor dem großen Architektur-Refactoring in Version 3.0. Der Fokus liegt auf UX-Verbesserungen, die häufige Workflows beschleunigen und das Cyberpunk-Gefühl verstärken.

---

### US-2.8.1: Default Categories for Initial Tasks
**Als** neuer Administrator (nach der Erst-Installation)
**möchte ich**, dass die automatisch generierten Beispiel-Direktiven (z.B. "Jack in to CyberTasker") direkt einer sinnvollen System-Kategorie (wie "Work") zugeordnet sind,
**damit** das Dashboard Filtersystem (Kategorie-Dropdown) sofort ab Minute 1 demonstriert und funktionsfähig ist, ohne dass ich erst selbst Kategorien anlegen oder zuweisen muss.

**Akzeptanzkriterien:**
- [x] Im Backend (`CategoryRepository.php`) wird die Kategorie "Work" als globaler Standard (`is_default = 1`) für den Auto-Seeder definiert.
- [x] Sobald ein neuer User (oder der "Admin_Alpha" Installer) das Dashboard lädt und noch 0 Kategorien hat, generiert der Seeder automatisch die Basis-Kategorien, wobei "Work" vorausgewählt ist.
- [x] Die Basis-Direktiven des Admin-Beispiel-Accounts erhalten in `install.php` und `seed_test_data.php` den Kategorie-Wert "Work".
- [x] **QA**: E2E Test `01-auth.spec.js` prüft explizit die Sichtbarkeit des "Work" Badges auf dem frischen Dashboard.

---

### US-2.8.2: Custom Task Statuses
**Als** strukturierter Nutzer mit individuellen Workflows
**möchte ich** neben den harten Zuständen "OPEN" und "COMPLETED" eigene, flexible Zwischenstati anlegen können,
**damit** ich den exakten Lebenszyklus meiner Aufgaben (z.B. "IN PROGRESS", "QA", "BLOCKED") auf der Task-Karte detailliert dokumentieren kann.

**Akzeptanzkriterien:**
- [x] Ein neuer Tab "Task Statuses" im Profile Modal zur Verwaltung eigener Stati.
- [x] Backend-Logik (`user_task_statuses` / `workflow_status` Spalte in `tasks`) zum persistenten Speichern der Stati und der aktuellen Task-Zuweisung.
- [x] In der `TaskCard.jsx` taucht ein neues Dropdown direkt vor dem "Erledigen"-Button auf, um den Zwischenstatus einer unerledigten Aufgabe zu navigieren.
- [x] Umfassendes Styling nach den `THEME_GUIDELINES.md`.
- [x] **QA**: Playwright E2E Test für das Hinzufügen, Editieren, Auswählen und Löschen eines Custom Status.

---

### US-2.8.3: Dossier Notes
**Als** koordinierter Agent
**möchte ich** zeitgestempelte Notizen zum Dossier einer Direktive hinzufügen können,
**damit** ich den Fortschritt, wichtige Entscheidungen oder Blocker chronologisch protokollieren kann, ohne die ursprüngliche Task-Beschreibung zerstören zu müssen.

**Akzeptanzkriterien:**
- [ ] Im Dossier Modal wird ein neuer Bereich "Notes" (o.ä.) integriert.
- [ ] Neue Notizen speichern den Verfasser (`user_id`), die Task-Zuordnung (`task_id`), den Text und den Zeitstempel (`created_at`).
- [ ] Notizen werden optisch klar abgetrennt untereinander dargestellt, wobei der Name des Autors und der Zeitstempel sichtbar über dem Feld stehen.
- [ ] Eine Notiz kann vom Autor nachträglich bearbeitet (`updated_at` wird modifiziert) oder gelöscht werden.
- [ ] Backend: Neue DB-Tabelle `task_notes` zur Speicherung.
- [ ] Backend: CRUD Endpunkt(e) zur Verwaltung der Notizen.
- [ ] **QA**: Playwright E2E Test für das Hinzufügen, Editieren und Löschen von Dossier Notizen.
---

### US-2.8.4: Agent Focus Mode ("Zen Mode")
**Als** überforderter Operative
**möchte ich** alle unwichtigen UI-Elemente und Nebenaufgaben per Knopfdruck ausblenden können,
**damit** ich mich ausschließlich auf meine dringendste Mission konzentrieren kann, um Prokrastination durch visuelle Überladung zu vermeiden.

**Akzeptanzkriterien:**
- [ ] Ein "Focus Mode" Toggle-Button im Main Header der Hauptseite.
- [ ] Bei Aktivierung verschwinden alle Elemente, Filter, Pills und alle unwichtigen HUD-Elemente. Nur der Toggle-Button selbst, bleibt erhalten, um wieder zurückschalten zu können.
- [ ] Das Raster der Tasks wird durch eine einzige, maximierte "Hero Card" im Zentrum des Bildschirms ersetzt.
- [ ] Angezeigt wird automatisch die Aufgabe aus der regulären View mit der aktuell höchsten Priorität und dem dringendsten Datum.
- [ ] Die Hero Card enthält ein Dropdown, um den Status der Task ändern zu können.
- [ ]  Außerdem einen massiven "COMPLETE" Button sowie einen "SKIP / NEXT" Button, um zur zweitwichtigsten Aufgabe zu springen.
- [ ] **QA**: Ein Playwright E2E Test stellt sicher, dass der Toggle funktioniert und die Focus-Card isoliert dargestellt wird.

---

### US-2.8.5: Batch Actions (Multi-Select Operations)
**Als** Power-Nutzer mit vielen überfälligen oder gleichartigen Tasks
**möchte ich** mehrere Direktiven gleichzeitig auf dem Dashboard markieren können, um Massen-Operationen auszuführen,
**damit** ich nicht 10 Klicks brauche, um 5 Tasks als abgeschlossen zu markieren oder ihre Kategorie zu wechseln.

**Akzeptanzkriterien:**
- [ ] In der Task-Karten-Ansicht (`TaskCard.jsx`) erscheinen Checkboxen (beim Hovern der Karte).
- [ ] Sobald mindestens 1 Karte ausgewählt ist, fährt am unteren Bildschirmrand eine persistente "Command Bar" aus (`[3 Directives Selected]`).
- [ ] Die Command Bar bietet Massen-Aktionen:
  - [ ] Alle markierten Tasks auf "Completed" setzen.
  - [ ] Alle markierten Tasks löschen (mit einem einzigen CyberConfirm).
  - [ ] Option: Einer massenhaft ausgewählten Kategorie zuweisen.
- [ ] Das Backend (`TaskController.php`) muss erweitert werden, um Arrays von IDs zu verarbeiten (Bulk Update / Bulk Delete).
- [ ] **QA**: Eine neue Suite an Playwright E2E Tests validiert den Multi-Select-Workflow und die Statusänderungen/Löschungen im Bulk.

---

### US-2.8.6: Random Categories for Seeded Test Data
**Als** Entwickler/Tester der End-to-End-Pipeline
**möchte ich**, dass die beim Ausführen von `tests/seed_test_data.php` automatisch generierten Direktiven (z.B. die 50 Direktiven für Admin_Alpha) zufälligen sinnvollen Kategorien ("Work", "Personal", "Code", "Health") zugeordnet werden,
**damit** das Dashboard beim Entwickeln oder in E2E-Tests direkt lebensechte, gut gefilterte Datensätze anzeigt und die Filter-Dropdowns robuster getestet werden können.

**Akzeptanzkriterien:**
- [ ] `tests/seed_test_data.php` wählt beim Loop, der 50 bzw. 55 Test-Direktiven anlegt, zufällig aus einem Array an typischen Kategorien ("Work", "Personal", "Code", "Finance", "Health") aus.
- [ ] Zuvor legt das Seed-Skript sicherheitshalber diese Kategorien in der `categories`-Tabelle an (sofern wir eine dedizierte Tabelle dafür in V3 oder V2.8 nutzen, ansonsten einfach als validen String einfügen).

---

### US-2.8.7: Live Calendar WebFeed (WebCal)
**Als** Power-User & Agent, der viel unterwegs ist,
**möchte ich** einen dynamischen, geheimen URL-Link (WebCal Feed) in meinem Profil generieren und kopieren können,
**damit** ich CyberTasker direkt in meinen Google Calendar oder Apple Calendar einhängen kann und sich anstehende Direktiven (inkl. Dossier-Text und Fälligkeitsdatum) vollautomatisch auf mein Smartphone synchronisieren.

**Akzeptanzkriterien:**
- [ ] User-Settings / Profile Modal enthält einen Bereich für den "WebCal Comlink".
- [ ] Ein `api/calendar_feed.php` Endpunkt, der anhand eines sicheren, benutzerspezifischen Tokens (in der Datenbank hinterlegt oder via JWT generiert) alle aktiven Tasks des Users abfragt.
- [ ] Der Endpunkt gibt die Daten on-the-fly als kombinierten `text/calendar` (iCalendar / `.ics`) Stream aus, der von externen Kalender-Apps gelesen werden kann.
- [ ] **QA**: Ein Playwright E2E Test prüft, dass der URL-Link im UI existiert und der Feed-Endpoint den korrekten `text/calendar` Datentyp ausspuckt.

