/* ============================================================
   PRIME CINE VISUALS — DYNAMIC NAVIGATION CONTROLLER
   ============================================================ */

(function () {
  'use strict';

  function updateNavigation() {
    var navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    var currentUser = window.PCV_Auth ? window.PCV_Auth.getCurrentUser() : null;

    // Remove existing auth links if present
    var existingAuthItems = navLinks.querySelectorAll('.auth-nav-item');
    existingAuthItems.forEach(function (el) { el.remove(); });

    if (!currentUser) {
      // Logged Out
      var loginLi = document.createElement('li');
      loginLi.className = 'auth-nav-item';
      loginLi.innerHTML = '<a href="login.html" class="nav-link">Login</a>';

      var signupLi = document.createElement('li');
      signupLi.className = 'auth-nav-item';
      signupLi.innerHTML = '<a href="login.html?tab=signup" class="nav-link btn-nav-accent">Sign Up</a>';

      navLinks.appendChild(loginLi);
      navLinks.appendChild(signupLi);
    } else {
      // Logged In
      var profileLi = document.createElement('li');
      profileLi.className = 'auth-nav-item';
      profileLi.innerHTML = '<a href="profile.html" class="nav-link">Profile</a>';

      var submitLi = document.createElement('li');
      submitLi.className = 'auth-nav-item';
      submitLi.innerHTML = '<a href="submit.html" class="nav-link">Submit Work</a>';

      navLinks.appendChild(profileLi);
      navLinks.appendChild(submitLi);

      // Admin Dashboard link if user is admin
      if (currentUser.role === 'admin') {
        var adminLi = document.createElement('li');
        adminLi.className = 'auth-nav-item';
        adminLi.innerHTML = '<a href="admin.html" class="nav-link admin-nav-link"><span class="admin-badge-dot"></span>Admin Dashboard</a>';
        navLinks.appendChild(adminLi);
      }

      var logoutLi = document.createElement('li');
      logoutLi.className = 'auth-nav-item';
      logoutLi.innerHTML = '<a href="#" id="navLogoutBtn" class="nav-link text-muted">Logout</a>';
      navLinks.appendChild(logoutLi);

      // Attach logout listener
      setTimeout(function () {
        var btn = document.getElementById('navLogoutBtn');
        if (btn) {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.PCV_Auth) window.PCV_Auth.logout();
          });
        }
      }, 50);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
  } else {
    updateNavigation();
  }

})();
