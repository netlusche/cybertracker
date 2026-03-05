# Planning: Release 3.0 (Architektur & Basis für Multitenancy)

## Themen & Fokuspunkte
*Dieses Release ist das Fundament für die Zukunft von CyberTasker. Der Umfang des Refactorings ist so signifikant, dass wir es zum Major-Release 3.0 aufwerten (AI-Lokalisierung wurde in 2.7 ausgegliedert). Der Fokus liegt auf massiven Code-Konsolidierungen und architektonischen Umbauten, um das System auf Mandantenfähigkeit (Teams, Release 3.1) und Whitelabeling (Branchen, Release 4.0) vorzubereiten.*

**Wichtige Architektonische Leitplanke:**
CyberTasker muss zwingend mit einfachen Shared-Hosting Umgebungen (wie z.B. **Strato Hosting Plus**) kompatibel bleiben. Das Backend bleibt Vanilla PHP (kein Node.js Daemon, keine komplexen Build-Pipelines auf dem Server). Moderne Architekturmuster (Middlewares, Repositories) müssen rein in PHP 8+ abgebildet werden.

- **Applikationslogik-Analyse:** Identifizierung von Flaschenhälsen, Redundanzen und inkonsistenten Architektur-Ansätzen.
- **Refactoring:** Saubere Trennung von UI-Komponenten (React) und streng typisierter Business-Logik (PHP).
- **Infrastruktur-Vorbereitung:** Grundlegung der Datenarchitektur für kommende Team-Funktionen sowie die Architekturkomponenten für dynamisches Branding.

## Zielsetzung
Das primäre Ziel dieses Releases ist **nicht** die Einführung neuer sichtbarer Features für den Endnutzer, sondern die Verbesserung der internen Code-Qualität, Wartbarkeit und Performance für zukünftige Skalierung auf einem Shared Host.

## Neue Epics / Aufgabenbereiche

### Epic 1: Frontend-Architektur (React)
**US-3.0.1: Frontend State-Management Architektur (Zustand/Context)**
* **Aktion:** Einführung eines sauberen, globalen und skalierbaren Store-Managements (z.B. Zustand oder React Context).
* **Ziel:** Prop-Drilling rigoros eliminieren. Vorbereitung eines `TenantStore` und `ThemeStore`, auf den spätere Whitelabel-Komponenten zugreifen können. Aktiver Mandant, User-Session und aktives Theme dürfen in der React-Hierarchie nicht mehr als Props durchgereicht werden.

### Epic 2: Backend-Architektur (Vanilla PHP für Shared Hosting)
**US-3.0.2: Data Access Layer (DAL) / Repository Pattern für PHP**
* **Aktion:** Direkte PDO/MySQL/SQLite Aufrufe aus den Controllern in spezielle Klassen (Repositories, z.B. `TaskRepository`) verschieben.
* **Ziel:** Dies ist der künftige Flaschenhals, an dem wir in Release 3.1 in *allen* Queries die `tenant_id` (Team ID) erzwingen können, ohne sie manuell in Controllern anhängen zu müssen. Kein Controller enthält noch direkte SQL-Strings. Kompatibel mit einfachem PHP-Hosting.

**US-3.0.3: API Middleware & Standardisierung**
* **Aktion:** Zentralisierung des API-In- und Outputs auf Basis von purem PHP. Alle Responses nutzen ein strenges JSON-Format via Helper-Klassen (z.B. `JsonResponse`). Fehler werfen standardisierte Exceptions, die von einem globalen Exception-Handler gefangen werden.
* **Ziel:** Strict Typing (Type-Hints und Return-Types für alle Methoden). Vorbereitung des Kern-Routings, damit Middleware-Checks (Auth, Tenant-Context) einfach vorgeschaltet werden können.

**US-3.0.4: Schema-Migration Engine Update**
* **Aktion:** Das Datenbank-Initialisierungs-Skript (`install.php` o.ä.) so umbauen, dass wir in Zukunft non-destruktive `ALTER TABLE` Migrationen fahren können.
* **Ziel:** Für Release 3.1 werden wir an fast jede Tabelle eine `team_id` hängen müssen. Dies erfordert ein System, das Schema-Updates auf Hostern wie Strato ohne Datenverlust anwendet.


## Ergänzungen für den Testplan
*(Wird nach Festlegung der genauen Refactoring-Ziele definiert. Fokus wird auf umfassenden Regressionstests liegen, um sicherzustellen, dass die bestehende Funktionalität durch das Refactoring exakt erhalten bleibt und auf Standard-Hostern stabil läuft.)*
