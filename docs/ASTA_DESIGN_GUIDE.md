# Asta Design System for unsu.com

## Overview

The Asta Design System is a **minimal, monospace UI framework** based on [anton.io/asta](https://anton.io/asta). It provides a clean, rhythmic, and intentional design language where every element aligns to a character grid.

### Design Philosophy

> "ASTA means love, bright star, and sometimes beautiful goddess"

The system embodies:
- **Simplicity**: Lightweight and performant
- **Precision**: Character-grid alignment
- **Minimalism**: Unapologetically minimal
- **Rhythm**: Visual harmony through consistent spacing

## Quick Start

### Installation

```html
<!-- Include Asta CSS -->
<link rel="stylesheet" href="css/asta-design.css">

<!-- Include Asta JS -->
<script src="js/asta-design.js" defer></script>

<!-- Optional: JetBrains Mono Font (recommended) -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;800&display=swap" rel="stylesheet">
```

### Basic Example

```html
<div class="asta-container">
    <h1>Welcome</h1>
    <button>Click Me</button>
</div>
```

## Typography

### Font Stack
- **Primary**: JetBrains Mono (monospace)
- **Fallback**: Courier New, monospace
- **Size**: 16px base (14px on mobile)
- **Line Height**: 1.5rem

### Headings

```html
<h1>Heading 1 (2rem)</h1>
<h2>Heading 2 (1.5rem)</h2>
<h3>Heading 3 (1.25rem)</h3>
<h4>Heading 4 (1rem, semibold)</h4>
<h5>Heading 5 (1rem)</h5>
```

### Text Styles

```html
<p>Regular paragraph text</p>
<strong>Bold text</strong>
<em>Italic text</em>
<code>Inline code</code>
```

## Spacing System

Spacing is based on character width (`1ch`):

| Class | Value | Characters |
|-------|-------|-----------|
| `--asta-space-xs` | 2ch | 2 characters |
| `--asta-space-sm` | 4ch | 4 characters |
| `--asta-space-md` | 8ch | 8 characters |
| `--asta-space-lg` | 12ch | 12 characters |
| `--asta-space-xl` | 16ch | 16 characters |

### Utility Classes

```html
<!-- Margin -->
<div class="asta-m-xs">Extra small margin</div>
<div class="asta-m-sm">Small margin</div>
<div class="asta-mt-md">Medium top margin</div>
<div class="asta-mb-lg">Large bottom margin</div>

<!-- Padding -->
<div class="asta-p-sm">Small padding</div>
<div class="asta-p-md">Medium padding</div>
```

## Color System

```css
--asta-bg: #ffffff         /* Background */
--asta-text: #000000       /* Text */
--asta-border: #000000     /* Borders */
--asta-accent: #ff6b35     /* Accent/Warning */
--asta-success: #2fbd6a    /* Success */
--asta-error: #E03853      /* Error */
--asta-gray: #E6EAF0       /* Gray background */
```

## Components

### Buttons

```html
<!-- Default button -->
<button>Default</button>

<!-- Button variants -->
<button class="btn-secondary">Secondary</button>
<button class="btn-danger">Danger</button>
<button class="btn-success">Success</button>

<!-- Disabled button -->
<button disabled>Disabled</button>
```

### Forms

All form elements are automatically styled:

```html
<form data-asta-validate>
    <label>
        Username
        <input type="text" placeholder="Enter username" required>
    </label>

    <label>
        Message
        <textarea placeholder="Your message"></textarea>
    </label>

    <label>
        <input type="checkbox" required>
        I agree to terms
    </label>

    <button type="submit">Submit</button>
</form>
```

**Form Validation**: Add `data-asta-validate` attribute for automatic validation.

### Modals

#### HTML Structure

```html
<div id="myModal" class="asta-modal">
    <div class="asta-modal-content">
        <div class="asta-modal-header">
            <h3 class="asta-modal-title">Title</h3>
            <button class="asta-modal-close">×</button>
        </div>
        <div class="asta-modal-body">
            <p>Modal content here</p>
        </div>
        <div class="asta-modal-footer">
            <button class="btn-secondary">Cancel</button>
            <button>Confirm</button>
        </div>
    </div>
</div>
```

#### JavaScript API

```javascript
// Open modal
Asta.modals.open('myModal');

// Close modal
Asta.modals.close('myModal');

// Close all modals
Asta.modals.closeAll();

// Create modal programmatically
Asta.createModal({
    id: 'dynamicModal',
    title: 'Dynamic Modal',
    body: '<p>Created with JavaScript!</p>',
    footer: '<button>OK</button>',
    type: 'success' // 'error', 'warning', or ''
});

// Confirm dialog (returns Promise)
const confirmed = await Asta.confirm('Delete this item?', 'Confirm Delete');
if (confirmed) {
    console.log('User confirmed');
}
```

#### Modal Triggers

```html
<!-- Trigger modal with data attribute -->
<button data-asta-modal="myModal">Open Modal</button>
```

#### Modal Variants

```html
<!-- Error modal -->
<div id="errorModal" class="asta-modal error">...</div>

<!-- Success modal -->
<div id="successModal" class="asta-modal success">...</div>

<!-- Warning modal -->
<div id="warningModal" class="asta-modal warning">...</div>
```

### Messages / Alerts

```html
<div class="asta-message">Info message</div>
<div class="asta-message success">Success message</div>
<div class="asta-message error">Error message</div>
<div class="asta-message warning">Warning message</div>
```

#### Toast Notifications

```javascript
// Show toast
Asta.toast.show('Message', 'info', 3000);

// Shortcuts
Asta.toast.success('Success!');
Asta.toast.error('Error occurred');
Asta.toast.warning('Warning!', 5000);
```

### Cards

```html
<div class="asta-card">
    <div class="asta-card-header">Card Title</div>
    <div class="asta-card-body">
        <p>Card content goes here.</p>
    </div>
</div>
```

### Tables

```html
<table>
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </tbody>
</table>
```

### Details / Collapsible

```html
<details>
    <summary>Click to expand</summary>
    <p>Hidden content revealed on click</p>
</details>
```

## Grid System

12-column flexbox grid:

```html
<div class="asta-container">
    <div class="asta-row">
        <div class="asta-col asta-col-6">Half width</div>
        <div class="asta-col asta-col-6">Half width</div>
    </div>

    <div class="asta-row">
        <div class="asta-col asta-col-4">One third</div>
        <div class="asta-col asta-col-4">One third</div>
        <div class="asta-col asta-col-4">One third</div>
    </div>

    <div class="asta-row">
        <div class="asta-col asta-col-3">Quarter</div>
        <div class="asta-col asta-col-9">Three quarters</div>
    </div>
</div>
```

**Column Classes**: `.asta-col-1` through `.asta-col-12`

**Responsive**: On mobile (<768px), all columns become full width.

## JavaScript API

### Core Methods

```javascript
// Initialize (auto-called on load)
Asta.init();

// Version
console.log(Asta.version); // '1.0.0'
```

### Modal Management

```javascript
Asta.modals.open('modalId');
Asta.modals.close('modalId');
Asta.modals.closeAll();
```

### Form Validation

```javascript
const form = document.querySelector('form');
const isValid = Asta.forms.validate(form);
Asta.forms.reset(form);
```

### Utilities

```javascript
// Smooth scroll
Asta.scrollTo('#section', 100); // element, offset

// Debounce
const debouncedFn = Asta.debounce(() => {
    console.log('Called after 300ms');
}, 300);

// Create element
const button = Asta.createElement('button', {
    className: 'btn-success'
}, ['Click me']);
```

### Events

```javascript
// Modal events
modal.addEventListener('asta:modal:opened', (e) => {
    console.log('Modal opened:', e.detail.modalId);
});

modal.addEventListener('asta:modal:closed', (e) => {
    console.log('Modal closed:', e.detail.modalId);
});

// Details events
details.addEventListener('asta:details:toggle', (e) => {
    console.log('Open:', e.detail.open);
});
```

## Utility Classes

### Display

```html
<div class="asta-hidden">Hidden</div>
<div class="asta-block">Block</div>
<div class="asta-inline">Inline</div>
<div class="asta-flex">Flex</div>
```

### Text Alignment

```html
<p class="asta-text-center">Centered</p>
<p class="asta-text-right">Right aligned</p>
```

### Borders

```html
<div class="asta-border">All borders</div>
<div class="asta-border-top">Top border</div>
<div class="asta-border-bottom">Bottom border</div>
```

### Animations

```html
<div class="asta-fade-in">Fades in</div>
```

### Loading Spinner

```html
<div class="asta-spinner"></div>
```

## Integration with unsu.com

### Option 1: Complete Replacement

Replace `style.css` with `asta-design.css`:

```html
<link rel="stylesheet" href="css/asta-design.css">
<script src="js/asta-design.js" defer></script>
```

### Option 2: Alongside Existing Styles

Use both stylesheets:

```html
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="css/asta-design.css">
```

Asta classes won't conflict with existing styles due to `.asta-` prefix.

### Example: Converting Modal

**Before (custom):**
```html
<div id="myModal" class="modal">
    <div class="modal-content">
        <p class="title-modal">Title</p>
        <img class="close-modal" onclick="closeAllModals()">
        <!-- content -->
    </div>
</div>
```

**After (Asta):**
```html
<div id="myModal" class="asta-modal">
    <div class="asta-modal-content">
        <div class="asta-modal-header">
            <h3 class="asta-modal-title">Title</h3>
            <button class="asta-modal-close">×</button>
        </div>
        <div class="asta-modal-body">
            <!-- content -->
        </div>
    </div>
</div>
```

## Customization

Override CSS variables in your own stylesheet:

```css
:root {
    --asta-accent: #3498db;      /* Change accent color */
    --asta-font-size: 18px;      /* Larger base font */
    --asta-border-width: 3px;    /* Thicker borders */
}
```

## Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest
- Mobile browsers: ✅ iOS Safari, Chrome Mobile

## File Size

- **asta-design.css**: ~10KB (unminified)
- **asta-design.js**: ~8KB (unminified)
- **Total**: ~18KB unminified, ~10KB gzipped

## Best Practices

1. **Use semantic HTML** - Asta styles work without utility classes
2. **Maintain grid alignment** - Use character-based spacing
3. **Keep it minimal** - Don't over-style
4. **Embrace monospace** - Install JetBrains Mono for best results
5. **Test responsively** - Check mobile layouts

## Examples

See `asta-example.html` for a complete working demo.

## Credits

Based on the [Asta Design System](https://anton.io/asta) by Anton.

## License

Same as parent project (unsu.com).
