# Maritime English Level 11 - Océano Clásico

> Advanced naval communications training with a clean, readable design optimized for educational content.

## 🎨 Design System: Océano Clásico

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--ocean-white` | `#FFFFFF` | Primary background, cards |
| `--ocean-navy` | `#1B263B` | Headings, navigation, primary buttons |
| `--ocean-sky` | `#4A90E2` | Icons, accents, links, progress bars |
| `--ocean-red` | `#D32F2F` | Key terms (MAYDAY), alerts, errors |
| `--ocean-gray` | `#B0BEC5` | Borders, subtle dividers, muted text |

### Typography
- **Headings**: Montserrat (700 weight)
- **Body**: Inter (400-600 weight)
- **Code/Mono**: Roboto Mono (for technical terms)

### Key UI Components
- ✅ Glass-morphism cards with subtle borders
- ✅ Animated progress bars with shimmer effect
- ✅ Toast notifications for user feedback
- ✅ Skeleton loading states
- ✅ Focus-visible outlines for keyboard navigation
- ✅ Reduced motion support via `@media (prefers-reduced-motion)`
- ✅ High contrast mode support via `@media (prefers-contrast: high)`

## ⚙️ Technical Architecture

### File Structure
```
Level 11/
├── index.html              # Main page with semantic HTML5 + ARIA
├── styles/
│   └── enhancements.css    # Complete UI/UX system (WCAG 2.1 AA)
├── scripts/
│   └── progress-manager.js # Progress tracking with offline sync
├── lib/
│   └── api-client.js       # Reusable HTTP client with retry logic
├── service-worker.js       # Offline-first caching strategy
├── README.md               # This file
└── content/                # Existing unit content (unchanged)
```

### Progress Management
```javascript
// Initialize
const progressManager = new ProgressManager({
  level: 11,
  prerequisiteLevel: 10,  // Validates L10 completion
  apiClient: apiClient,
  userId: 'user-id'  // Optional: auto-generated if omitted
});

// Update progress
progressManager.updateModule('phonetics', 75, false);  // 75% complete
progressManager.updateModule('radio-procedures', 100, true);  // Completed

// Get progress
const levelPct = progressManager.getLevelProgress();  // 0-100
const modulePct = progressManager.getModuleProgress('phonetics');

// Check prerequisite
const canAdvance = await progressManager.canAdvance();  // true if L10 ≥80%
```

### Offline Support
- ✅ Progress saved to `localStorage` immediately
- ✅ Sync queue with exponential backoff retry (3 attempts)
- ✅ Service Worker caches static assets for offline use
- ✅ Background sync when connection restored

## 🚀 Getting Started

### Local Development
```bash
# Open directly in browser (no server required)
file:///C:/Users/user/Desktop/GetUnderwayESP_2026/Proposed%20site/Maritime%20Landing%20Page/Level%2011/index.html

# Or serve with a local server
npx serve .
# Then open: http://localhost:3000
```

### With Backend API
```javascript
// Configure API endpoint
const apiClient = new APIClient({ 
  baseUrl: 'https://your-api.com/api',
  timeout: 10000 
});

const progressManager = new ProgressManager({
  apiClient: apiClient,
  userId: 'authenticated-user-id',
  level: 11,
  prerequisiteLevel: 10
});
```

## ♿ Accessibility Compliance

### WCAG 2.1 AA Features
- [x] Skip link for keyboard users
- [x] ARIA labels on all interactive elements
- [x] `role="progressbar"` with `aria-valuenow/min/max`
- [x] Focus-visible outlines (2px, high contrast)
- [x] Color contrast ≥ 4.5:1 for text
- [x] Reduced motion preference respected
- [x] Screen reader announcements via `aria-live`

### Testing
```bash
# Lighthouse audit
# Open Chrome DevTools → Lighthouse → Run audit
# Expected scores: Performance 92+, Accessibility 98+, Best Practices 100

# Manual keyboard test
# Tab through page: all interactive elements should have visible focus
# Enter/Space should activate buttons and links
# Escape should close modals
```

## 🔧 Customization

### Override CSS Variables
```css
/* In a custom CSS file loaded after enhancements.css */
:root {
  --ocean-sky: #your-custom-blue;
  --ocean-navy: #your-custom-navy;
}
```

### Modify Progress Logic
Edit `scripts/progress-manager.js`:
```javascript
// Change prerequisite threshold (default: 80%)
async canAdvance() {
  return prereqData?.completedPercent >= 85;  // Require 85% instead
}
```

## 🧪 Testing Checklist

- [ ] Open page in Chrome, Firefox, Safari, Edge
- [ ] Verify text is readable on all backgrounds (no white-on-light issues)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Toggle dark mode: colors should invert appropriately
- [ ] Disable JavaScript: core content should still be accessible
- [ ] Go offline: progress should save locally, sync when back online
- [ ] Run Lighthouse: verify Accessibility ≥ 95, Performance ≥ 90

## 📦 Dependencies

### External (CDN)
- Tailwind CSS (utility classes only)
- Google Fonts: Montserrat, Inter, Material Symbols
- No framework dependencies (vanilla JS + ES6 modules)

### Internal (Local)
- `lib/api-client.js` - HTTP client (shared with Level 12)
- `scripts/progress-manager.js` - Progress logic (level-specific config)
- `styles/enhancements.css` - Complete design system

## 🔐 Security Notes

- User IDs are anonymized by default (`u_xxxxxxxx`)
- Progress data in `localStorage` is not encrypted (client-side only)
- API communication should use HTTPS in production
- Service Worker cache is isolated per level (`getunderway-maritime-l11-v1`)

## 🔄 Consistency with Level 12

This Level 11 implementation shares:
- ✅ Same file structure and component architecture
- ✅ Same `APIClient` and `ProgressManager` class structure
- ✅ Same accessibility patterns and ARIA implementation
- ✅ Same offline-first strategy and Service Worker pattern

Differences:
- 🎨 Color palette: Océano Clásico vs Costa Serena (Level 12)
- 📊 Progress keys: `maritime_progress_l11_*` vs `l12_*`
- 🔗 Prerequisite: Level 10 vs Level 11 (for Level 12)
- 🏷️ Cache name: `getunderway-maritime-l11-v1` vs `l12-v1`

---

**Last Updated**: May 2026  
**Version**: 1.0.1  
**Design Proposal**: Océano Clásico (Beach Color Palette)
