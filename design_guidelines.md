# Design Guidelines: IFRS 15 Contract Management System

## Design Approach

**Selected System:** Carbon Design System (IBM)  
**Justification:** Enterprise financial compliance application requiring precision data display, complex tables, audit trails, and professional workflows. Carbon excels at data-heavy interfaces with clear information hierarchy and robust component patterns for financial applications.

**Key Principles:**
- Clarity over decoration - financial data must be immediately comprehensible
- Consistent information density across all data views
- Professional, trustworthy aesthetic appropriate for auditors and finance teams
- Scannable layouts for quick data verification

---

## Core Design Elements

### A. Typography

**Font Stack:** IBM Plex Sans (Carbon's native typeface)

**Hierarchy:**
- Page Headers: 32px, Semibold (font-semibold)
- Section Headers: 24px, Semibold
- Subsection/Card Headers: 18px, Medium (font-medium)
- Body Text: 14px, Regular
- Data Tables: 14px, Regular
- Labels/Metadata: 12px, Regular
- Fine Print/Timestamps: 11px, Regular

**Usage Patterns:**
- Contract amounts and financial figures: Tabular numbers, Medium weight
- Status indicators: 12px, Medium, uppercase
- Form labels: 12px, Medium
- Error messages: 14px, Regular

### B. Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16**

**Common Patterns:**
- Component padding: `p-6` or `p-8`
- Section margins: `mb-8` or `mb-12`
- Card spacing: `space-y-6`
- Form field gaps: `gap-4`
- Table cell padding: `px-4 py-2`
- Page container: `max-w-7xl mx-auto px-6`

**Grid Structure:**
- Dashboard: 12-column grid (`grid-cols-12`)
- Data tables: Full-width with horizontal scroll when needed
- Forms: 2-column layout for efficiency (`grid-cols-2 gap-6`)
- Reports: Single column, `max-w-5xl` for readability

---

## C. Component Library

### Navigation

**Top Navigation Bar:**
- Fixed header with logo left, main navigation center, user menu/notifications right
- Height: `h-16`
- Includes: Subscription status indicator, license count badge
- Persistent breadcrumb trail below header for deep navigation

**Sidebar (Optional Secondary Nav):**
- Left sidebar for module switching (Contracts, IFRS Engine, Licenses, Reports, Billing)
- Width: `w-64`, collapsible to icon-only `w-16`
- Module icons with labels

### Core UI Elements

**Cards:**
- Container: Bordered panel with `rounded-lg border p-6`
- Header with action buttons in opposite corner
- Sections within cards separated by horizontal dividers

**Data Tables:**
- Striped rows for scannability (`even:bg-gray-50`)
- Sticky headers for long scrolls
- Sortable columns with clear indicators
- Row actions in rightmost column (icon buttons)
- Pagination footer with items-per-page selector
- Expandable rows for nested details (contract lines, revenue schedules)

**Badges/Status Indicators:**
- Pill-shaped, `px-3 py-1 rounded-full text-xs font-medium`
- Subscription status: Active, Past Due, Canceled, Suspended
- License status: Active, In Use, Expired, Revoked
- Contract status: Draft, Active, Modified, Terminated

### Forms

**Input Fields:**
- Standard height: `h-10`
- Label above input: `text-sm font-medium mb-1`
- Helper text below: `text-xs text-gray-500 mt-1`
- Error state: Border highlight + error message below
- Required indicator: Asterisk in label

**Form Layouts:**
- Group related fields in sections with subtle dividers
- Inline fields for related data (e.g., currency + amount)
- Date range pickers for period selection
- Multi-step forms with progress indicator for contract creation

**Specialized Inputs:**
- Currency selector + amount (inline)
- Customer search with autocomplete dropdown
- Revenue recognition method selector (radio cards with descriptions)
- IP address display (monospace font, read-only field)

### Data Displays

**Financial Data Cards:**
- Large metric display: 28px, Semibold
- Label above: 12px, Medium, uppercase
- Delta/change indicator with icon
- Layout: 4-column grid on desktop (`grid-cols-4 gap-6`)

**Contract Summary Panel:**
- Two-column layout: Key details left, timeline/status right
- Collapsible sections for contract lines, amendments
- Version comparison view (side-by-side diff)

**Revenue Schedule Table:**
- Monthly/period columns
- Recognized vs. deferred amounts
- Running totals row (sticky footer)
- Expandable to show calculation details

**Audit Trail Log:**
- Timeline-style list with timestamps
- User avatar + action description
- Filterable by date range, user, action type
- Expandable entries for full change details

### Reports & Dashboards

**Dashboard Layout:**
- Top row: Key metrics (4 cards)
- Second row: Active subscriptions table + license usage gauge
- Third row: Revenue recognition chart (line/area chart)
- Widgets: Pending actions, recent contracts, upcoming renewals

**IFRS 15 Disclosure Reports:**
- Print-optimized layouts
- Structured sections matching disclosure requirements
- Tables with totals and subtotals
- Export buttons (PDF, Excel) in top-right
- Disaggregation tables with hierarchical grouping

**License Management View:**
- Active sessions list with IP, timestamp, user
- License utilization gauge
- Quick actions: Force release, extend grace period
- Session history timeline per license

### Overlays

**Modal Dialogs:**
- Standard size: `max-w-2xl`
- Large modals for contract creation: `max-w-4xl`
- Header with title and close button
- Body with `max-h-96 overflow-y-auto` for long content
- Footer with action buttons right-aligned

**Notifications/Toasts:**
- Top-right position, stack vertically
- Auto-dismiss after 5 seconds (info/success)
- Persistent for errors/warnings
- Icons for status type

**Drawers:**
- Right-side panel for quick views (contract details, license info)
- Width: `w-96` or `w-1/3`
- Overlay backdrop with click-to-close

---

## D. Animations

**Minimal Motion:**
- Table row hover: Subtle background transition
- Modal entry: Fade + slight scale (0.95 → 1)
- Notification slide-in from right
- Loading spinners for async operations only
- No decorative animations

---

## Images

No hero images - this is a data-focused enterprise application. All visual emphasis on clear data presentation and functional efficiency.