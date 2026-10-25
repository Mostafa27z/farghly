# Obsidian Studio Design System (فرغلي | Farghly)

**Project ID**: `6138947229921144934`  
**Screen ID**: `73b74b99f73747ccb713b1ef39ea021b`  
**Title**: فرغلي | Farghly - الصفحة الرئيسية الفاخرة  

---

## 1. Color Palette Tokens

| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `background` / `surface` | `#0F131C` / `#0B0F17` | Canvas background, non-reflective obsidian void |
| `surface-container-lowest` | `#0A0E16` | Deepest inset containers, video player base |
| `surface-container` | `#1C2028` | Cards, transcript rows, dialogs |
| `surface-container-high` | `#262A33` | Hover states, active dropdowns |
| `surface-container-highest`| `#31353E` | Modals, elevated cards |
| `primary` | `#4EDEA3` / `#10B981` | Cyber Emerald: Active timestamps, CTAs, audio playhead |
| `on-primary` | `#003824` | High-contrast dark text on emerald buttons |
| `secondary` | `#C0C1FF` / `#6366F1` | Electric Indigo: AI tags, secondary highlights |
| `tertiary` | `#FFB95F` / `#F59E0B` | Warm Gold: Premium badges, enterprise tiers |
| `outline` | `#86948A` | Hairline border strokes (`1px solid rgba(255,255,255,0.08)`) |
| `on-surface` | `#DFE2EE` | Primary reading text (high-contrast off-white) |
| `on-surface-variant` | `#BBCAFF` / `#94A3B8` | Muted subtitle text, metadata |

---

## 2. Typography Cascade

* **Arabic Headlines & Display**: `Noto Sans Arabic` / `Readex Pro` / `Cairo`
* **Latin Display**: `Plus Jakarta Sans`
* **Body Copy**: `Inter`
* **Timestamps, Timecodes & Code**: `JetBrains Mono` (`font-variant-numeric: tabular-nums`)

---

## 3. UI Elevation & Materials

* **Frosted Acrylic Glass**: `backdrop-filter: blur(16px)` over `#111827` at 75% opacity.
* **Borders**: Translucent hairline `1px solid rgba(255, 255, 255, 0.08)`.
* **Luminous Glow**: Radial backlight `box-shadow: 0 0 24px rgba(16, 185, 129, 0.22)`.
