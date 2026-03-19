# Design System Strategy: Digital Zen

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Monolith."** 

We are moving away from the cluttered, "noisy" aesthetics of traditional dashboards toward a high-fidelity, lo-fi experience. The goal is to create a digital environment that feels like a premium, dark-mode terminal found in a quiet, high-tech sanctuary. By stripping away traditional UI crutches—like rounded corners and 1px borders—we lean into a rigid, pixel-perfect grid that feels intentional and architectural. The "Zen" is achieved through extreme negative space and a strict adherence to a 0px radius scale, creating a sharp, professional clarity that respects the user's cognitive load.

## 2. Colors: The Chromatic Pulse
This design system utilizes a deep, obsidian base to allow vibrant, period-specific accents to act as the primary information carriers.

### The Accents (Temporal Logic)
To maintain the "Digital Zen" vibe, colors are tied to time-horizons, providing an immediate subconscious anchor for the user:
- **Day:** `primary` (#9cff93) - A vibrant, electric green representing immediate growth and "now."
- **Week:** `tertiary` (#a0fff0) - A cool, digital cyan for mid-range planning.
- **Month/Year:** `secondary` (#bc87fe) - A sophisticated, ethereal violet for long-term vision.

### Implementation Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely through background shifts. For example, a sidebar using `surface_container_low` should sit against a `surface` background without a dividing line.
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of monolithic slabs. Use `surface_container_lowest` (#000000) for the deepest background layers and `surface_container_highest` (#262626) for active or elevated modules.
*   **The "Glass & Gradient" Rule:** To prevent the dark theme from feeling "flat" or "dead," use subtle linear gradients for primary CTAs, transitioning from `primary` (#9cff93) to `primary_container` (#00fc40). Floating overlays should utilize a 15% opacity `surface_variant` with a 20px backdrop blur to create a "digital frost" effect.

## 3. Typography: Sharp & Monolithic
The typography is designed to feel like a high-end editorial terminal. We pair the technical precision of **Space Grotesk** for headers with the Swiss-inspired clarity of **Inter** for data.

*   **Display & Headlines (Space Grotesk):** These should feel architectural. Use `display-lg` (3.5rem) for high-impact metrics. The slight monospaced feel of Space Grotesk provides the "high-tech" soul without sacrificing legibility.
*   **Body & Titles (Inter):** Inter handles all dense information. It is neutral, allowing the accent colors and headline scales to do the heavy lifting.
*   **Labeling:** Use `label-sm` (0.6875rem) in all-caps with a 0.05em letter-spacing for metadata. This mimics the "pixel-label" aesthetic of vintage hardware interfaces.

## 4. Elevation & Depth: Tonal Layering
In a "Digital Zen" environment, traditional shadows are too "organic." We use light and tone to imply position.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface_container_low` dashboard background hosts `surface_container` cards. To highlight a selected state, shift the card to `surface_container_high`.
*   **Ambient Shadows:** If an element must float (e.g., a dropdown or modal), use a high-spread, ultra-low opacity shadow. Shadow color must be `#000000` at 25% opacity, with a 40px blur and 0px offset. This creates a soft "glow" rather than a hard drop shadow.
*   **The "Ghost Border" Fallback:** For interactive inputs that require clear containment against dark backgrounds, use a "Ghost Border": `outline_variant` (#484847) at 20% opacity. 

## 5. Components: Precision Primitives

### Buttons
*   **Primary:** Solid `primary` background with `on_primary` text. **Radius: 0px.** 
*   **Secondary:** Ghost-style. No background, `outline` color text, with a 10% `outline_variant` ghost border.
*   **States:** On hover, primary buttons should shift to `primary_dim`.

### Cards & Lists
*   **No Dividers:** Forbid the use of horizontal lines. Use the Spacing Scale (specifically `spacing.8` or `spacing.10`) to create "visual air" between items.
*   **The "Active State":** An active list item is indicated by a 4px left-aligned vertical "pixel bar" in the current period's accent color (e.g., `primary` for Day view).

### Input Fields
*   **Styling:** Fields should be bottom-aligned with a subtle `outline_variant` underline. 
*   **Focus:** On focus, the underline transforms into a 2px solid bar of the `primary` accent.

### Digital Zen "Status" Chips
*   Instead of traditional pill-shaped chips, use rectangular blocks (0px radius). 
*   **Day Status:** Background `on_primary_fixed`, Text `primary`.

## 6. Do's and Don'ts

### Do:
*   **Embrace the Void:** Use `spacing.24` for margins between major functional groups. 
*   **Stick to the Grid:** Every element must align to a hard edge. Asymmetry is encouraged, but it must be calculated.
*   **Color as Data:** Only use accent colors (`primary`, `secondary`, `tertiary`) for data-driven elements. Use neutrals for all UI scaffolding.

### Don't:
*   **No Rounded Corners:** Never use a border-radius. Even a 2px radius breaks the "Kinetic Monolith" aesthetic.
*   **No High-Contrast Borders:** Do not use `on_background` white for borders; it creates visual vibration. Stick to tonal background shifts.
*   **No Standard Grays:** Avoid generic mid-tone grays. Use the `surface_container` tiers to ensure the dark theme feels "ink-rich" and deep.