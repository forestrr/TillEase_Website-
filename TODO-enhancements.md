# Website Enhancements Implementation Plan

This document outlines the implementation plan for the remaining items on our website checklist: Sticky Mobile CTA, Loading States, Form Error States, Cookie Banner, and Analytics verification.

## Prerequisites / Open Questions

1. **Analytics ID Needed**: The Google Analytics `gtag` is currently installed on all pages, but it uses a placeholder Measurement ID (`G-XXXXXXXXXX`). You will need the actual GA4 Measurement ID to replace the placeholder.
2. **Cookie Banner Design**: Determine if you want a specific design preference for the Cookie Banner (e.g., bottom left floating box vs. full bottom width). A minimal floating banner at the bottom is recommended.

## Proposed Changes

### 1. Global UI Enhancements (Mobile CTA & Cookie Banner)

#### [MODIFY] `styles.css`
- Add CSS for the Sticky Mobile CTA, ensuring it is hidden on desktop (`@media (min-width: 769px)`) and fixed at the bottom on mobile screens.
- Add CSS classes for the Cookie Consent Banner (positioning, z-index, colors).
- Add CSS classes for Form Error states (e.g., `.form-error` with red borders, red error message text).
- Add CSS classes for Loading states (button spinner animation, disabled state for buttons).

#### [NEW] `cookie-banner.js`
- Create a new JavaScript file (`cookie-banner.js`) in the root directory.
- This script should dynamically inject the Cookie Consent Banner HTML into the `<body>`.
- Implement event listeners to handle "Accept" and "Reject" button clicks.
- Store the user's preference in the browser's `localStorage` so the banner doesn't reappear on subsequent visits.

#### [MODIFY] All HTML Pages (`index.html`, `retail.html`, `restaurant.html`, `contact.html`, `pricing.html`, `laundry.html`, `salon.html`, `404.html`, and `blog/*.html`)
- Include the new `<script src="/cookie-banner.js"></script>` at the bottom of the `<body>`.
- Add the Sticky Mobile CTA HTML block to the layout (hidden on desktop via CSS).
- Replace the `G-XXXXXXXXXX` placeholder in the Google Analytics snippet in the `<head>` with the real Analytics ID.

### 2. Form Enhancements (Loading & Error States)

#### [MODIFY] `contact.html`
- Replace the inline `onsubmit` handler (`onsubmit="event.preventDefault(); this.querySelector('.form-success').style.display='block';"`) with a dedicated JavaScript block.
- **Form Error States**: 
  - Implement validation logic to check for required fields (e.g., Name, Email) before submission. 
  - Add logic to display inline error messages and apply error CSS classes to invalid inputs.
- **Loading States**: 
  - On valid submission, prevent multiple clicks by disabling the submit button.
  - Show a loading spinner inside the button for a simulated duration (e.g., 2 seconds) or until an API response is received.
  - After loading, display the success message.

## Verification Checklist

- [ ] Resize the browser window to mobile width (<768px) and verify the Sticky Mobile CTA appears fixed at the bottom.
- [ ] Visit the site for the first time (or clear `localStorage`) to verify the Cookie Banner appears and dismisses correctly when clicked.
- [ ] Attempt to submit the Contact form with empty required fields to verify Error States highlight correctly.
- [ ] Submit the Contact form with valid data to verify the Loading State spinner appears on the button before the success message is shown.
- [ ] Inspect the page source to verify the correct Google Analytics Measurement ID is present in the `<head>`.
