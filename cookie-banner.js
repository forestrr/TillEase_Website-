document.addEventListener("DOMContentLoaded", function() {
  // Check if user has already made a choice
  if (localStorage.getItem("cookieConsent")) {
    return;
  }

  // Create banner HTML
  const bannerHTML = `
    <div class="cookie-banner" id="cookieBanner">
      <p>We use cookies to improve your experience and for analytics. By continuing to use this site, you agree to our use of cookies.</p>
      <div class="cookie-actions">
        <button class="btn btn-ghost" id="cookieReject">Reject</button>
        <button class="btn btn-lime" id="cookieAccept">Accept</button>
      </div>
    </div>
  `;

  // Inject into body
  document.body.insertAdjacentHTML("beforeend", bannerHTML);

  const banner = document.getElementById("cookieBanner");
  const btnAccept = document.getElementById("cookieAccept");
  const btnReject = document.getElementById("cookieReject");

  // Show the banner
  // A slight delay ensures CSS transition (if any) can apply, 
  // but we are just using display: flex via the 'show' class.
  setTimeout(() => {
    banner.classList.add("show");
  }, 100);

  // Handle Accept
  btnAccept.addEventListener("click", function() {
    localStorage.setItem("cookieConsent", "accepted");
    banner.classList.remove("show");
  });

  // Handle Reject
  btnReject.addEventListener("click", function() {
    localStorage.setItem("cookieConsent", "rejected");
    banner.classList.remove("show");
  });
});
