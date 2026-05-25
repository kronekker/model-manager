# Skill: UI Styling & Standard Components

## Constraint Context
This project enforces a premium dark glassmorphism design aesthetic. All core UI elements (cards, buttons, inputs, banners, badges) use standardized classes prefixed with `kbp-` (Kronekker Boilerplate Prefix) defined globally in `frontend/src/styles.css`.

## Instructions for AI Agents
When a user asks you to create a new Angular component, page, or UI feature:
1. **Never generate custom CSS** for layout or basic UI elements. Rely exclusively on the pre-defined `kbp-` classes.
2. **Global Layout & Structure**:
   - Page Wrapper: `.kbp-page-container`
   - Sections & Rows: `.kbp-section`, `.kbp-row`
   - Grids: `.kbp-grid-3`
3. **Typography**:
   - Headers: `.kbp-section-title-wrapper`, `.kbp-section-title`, `.kbp-section-header`
   - Subtitles: `.kbp-subtitle`
4. **UI Components**:
   - Containers/Cards: `.kbp-glass-panel`, `.kbp-card-content`
   - Hero Modules: `.kbp-hero-card`, `.kbp-hero-actions`
   - Buttons: `.kbp-btn` alongside `.kbp-btn-primary`, `.kbp-btn-secondary`, or `.kbp-btn-danger`
   - Inputs/Selects: `.kbp-input`, `.kbp-select`, `.kbp-textarea`
   - Badges: `.kbp-badge` alongside `.kbp-badge-done`, `.kbp-badge-inprogress`, `.kbp-badge-todo`, or `.kbp-badge-danger`
   - Banners/Alerts: `.kbp-banner` (with `.banner-warning`, `.banner-danger`)
   - Navigation: `.kbp-nav`
   - Icons: `.kbp-icon-box`
5. Before writing any HTML, review the exact markup patterns found in `frontend/src/app/style/style.html`. 
4. The global background is animated and handles its own layout. Rely on `kbp-glass-panel` to provide the required semi-transparent background to ensure readability.
