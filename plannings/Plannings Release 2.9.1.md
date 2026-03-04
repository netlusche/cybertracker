# CyberTasker Release 2.9.1 - Planning & User Stories

## User Stories

### US-2.9.1: Kanban Board Mobile/Touch Support
**Als** CyberTasker-Nutzer  
**möchte ich** das Kanban Board auch auf meinen mobilen Endgeräten (Smartphones/Tablets) flüssig bedienen können,  
**damit ich** Aufgaben (Directives) von unterwegs aus per Drag-and-Drop in andere Spalten verschieben kann, ohne dass die Karte hängenbleibt oder der Browser stattdessen scrollt.

**Akzeptanzkriterien:**
- Das Kanban Board lässt sich auf Touch-Geräten weiterhin normal horizontal scrollen.
- Ein kurzes Halten (Long-Press) auf eine Aufgaben-Karte löst den Drag-and-Drop Modus aus.
- Die Karte lässt sich sauber in andere Spalten ziehen und dort ablegen.

---

## Technical Implementation Info

Die Umsetzung erfordert nur geringfügige, aber essenzielle Anpassungen am `@dnd-kit` Setup, um Touch-Events sauber vom Standard-Scrolling des Browsers zu trennen.

### 1. TouchSensor hinzufügen (`src/components/KanbanBoard.jsx`)
Aktuell sind nur `PointerSensor` (Maus) und `KeyboardSensor` konfiguriert. Wir müssen den `TouchSensor` importieren und hinzufügen.
Damit man auf mobilen Geräten weiterhin durch die Spalten wischen kann (Scrollen), rüsten wir den `TouchSensor` mit einem Delay (Long-Press) aus:
```javascript
import { TouchSensor } from '@dnd-kit/core';

const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
        // WICHTIG: Erlaubt Scrollen, greift die Karte erst nach 250ms Halten
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    }),
    useSensor(KeyboardSensor)
);
```

### 2. Touch-Action im CSS unterbinden (`src/components/KanbanCard.jsx`)
Sobald ein Element per Drag gestartet wird, versucht der mobile Browser oft weiterhin, Scroll-Events (Pull-to-refresh etc.) auszuführen. 
Die Karte sollte entweder permanent oder während des Drags die CSS-Eigenschaft `touch-action: none;` erhalten. Bei Tailwind ist das die Klasse `touch-none`.

---

## E2E Testing (Playwright) für Touch DND

**Machbarkeit:** **Hoch komplex / Bedingt verlässlich**

Playwright unterstützt zwar "Mobile Emulation" (z.B. über `devices['Pixel 5']` in der config), aber das saubere Simulieren von Touchhold-Drags (inkl. Verzögerungen durch den `activationConstraint`) ist in `@dnd-kit` mit synthetischen E2E-Events bekanntermaßen fehleranfällig. 

**Möglicher Test-Ansatz:**
Anstatt den vollen "Touch-Wisch"-Prozess zu simulieren, verifizieren wir den *PointerSensor* im Mobile Viewport und prüfen, ob die CSS-Styles (`touch-action`) gesetzt sind:

```javascript
test.use({ ...devices['Pixel 5'] });

test('Mobile Touch DND setup correctly', async ({ page }) => {
    // 1. Prüfen ob die Karten touch-none (oder ähnliche Mechanismen) haben
    const card = page.locator('.card-cyber').first();
    await expect(card).toBeVisible();
    
    // Playwright kann Touch-Events abfeuern, benötigt für @dnd-kit aber oft manuelle JS-Events:
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    
    // Warte auf das 250ms TouchSensor Delay
    await page.waitForTimeout(300); 
    
    // Simuliere Drag nach rechts
    await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    // Behaupten, dass Status gewechselt hat...
});
```
*Empfehlung:* Wir sollten für diesen Fix eher einen manuellen Check (QA) auf einem echten Smartphone (bzw. dem Chrome DevTools Device Mode) priorisieren, anstatt stundenlang einen instabilen Playwright-Touch-Test zu bauen, der bei winzigen Timing-Unterschieden fehlschlägt. Playwright testet das prinzipielle DND bereits im Desktop-Mode erfolgreich ab.
