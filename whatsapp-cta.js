(function() {
  document.addEventListener("DOMContentLoaded", function() {
    // Avoid double injection
    if (document.getElementById("tillease-wa-cta")) return;

    // Detect page context for tailored WhatsApp greeting
    const path = window.location.pathname.toLowerCase();
    let msg = "Hi TillEase, I would like to know more about your POS solutions!";
    
    if (path.includes("restaurant")) {
      msg = "Hi TillEase, I'm looking for a Restaurant POS system for my business. Can we chat?";
    } else if (path.includes("retail") || path.includes("supermarket") || path.includes("grocery")) {
      msg = "Hi TillEase, I'm looking for a Retail & Supermarket POS solution in the UAE. Can we chat?";
    } else if (path.includes("salon") || path.includes("spa")) {
      msg = "Hi TillEase, I'm interested in the Salon & Spa POS software. Can we chat?";
    } else if (path.includes("laundry")) {
      msg = "Hi TillEase, I'm looking for Laundry POS software in the UAE. Can we chat?";
    } else if (path.includes("pricing")) {
      msg = "Hi TillEase, I'd like to get a quote and pricing details for your POS system.";
    } else if (path.includes("blog")) {
      msg = "Hi TillEase, I read your article and want to learn more about your POS software.";
    }

    const waPhone = "971526713477";
    const waUrl = "https://wa.me/" + waPhone + "?text=" + encodeURIComponent(msg);

    const ctaHTML = `
      <aside id="tillease-wa-cta" class="wa-floating-cta" aria-label="Chat on WhatsApp">
        <!-- Floating conversation bubbles on hover -->
        <div class="wa-convo-popup" aria-hidden="true">
          <div class="wa-bubble wa-bubble-1">
            <span class="wa-bubble-badge">👋</span>
            <span class="wa-bubble-msg">Need a quick POS demo?</span>
          </div>
          <div class="wa-bubble wa-bubble-2">
            <span class="wa-bubble-msg">⚡ Online now • Let's talk!</span>
          </div>
        </div>

        <!-- Rounded Rectangle CTA Button -->
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="wa-rect-btn" id="waCtaLink">
          <div class="wa-icon-container">
            <svg class="wa-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.83 7.35C8.61 7.35 8.24 7.43 7.94 7.76C7.64 8.09 6.8 8.87 6.8 10.47C6.8 12.07 7.97 13.61 8.13 13.83C8.3 14.05 10.38 17.27 13.62 18.53C16.31 19.58 16.86 19.36 17.44 19.31C18.03 19.25 19.32 18.54 19.59 17.78C19.85 17.03 19.85 16.38 19.77 16.25C19.69 16.12 19.5 16.05 19.21 15.9C18.91 15.75 17.44 15.02 17.17 14.92C16.89 14.82 16.7 14.77 16.5 15.07C16.31 15.37 15.76 16.02 15.59 16.22C15.42 16.41 15.26 16.44 14.96 16.29C14.67 16.14 13.72 15.83 12.59 14.82C11.71 14.03 11.12 13.06 10.95 12.77C10.78 12.47 10.93 12.31 11.08 12.16C11.21 12.03 11.37 11.82 11.52 11.65C11.67 11.47 11.72 11.35 11.82 11.15C11.92 10.95 11.87 10.78 11.8 10.63C11.72 10.48 11.13 9.03 10.89 8.44C10.65 7.86 10.41 7.94 10.23 7.93C10.06 7.92 9.86 7.92 9.67 7.92C9.47 7.92 9.15 7.99 8.83 8.35L8.83 7.35Z"/>
            </svg>
            <span class="wa-dot-beacon"></span>
          </div>
          
          <span class="wa-btn-text">Chat</span>

          <div class="wa-btn-icon-arrow" aria-hidden="true">
            <svg class="wa-arrow" viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
              <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z"/>
            </svg>
          </div>
        </a>
      </aside>
    `;

    document.body.insertAdjacentHTML("beforeend", ctaHTML);

    const cta = document.getElementById("tillease-wa-cta");
    const link = document.getElementById("waCtaLink");

    // Smooth entry after brief delay
    setTimeout(function() {
      if (cta) cta.classList.add("wa-active");
    }, 400);

    // Track analytics event if gtag is available
    if (link) {
      link.addEventListener("click", function() {
        if (typeof gtag === "function") {
          gtag("event", "click_whatsapp_cta", {
            event_category: "Engagement",
            event_label: path
          });
        }
      });
    }
  });
})();
