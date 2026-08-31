/* ============================================================
   PRIME CINE VISUALS — USER & ADMIN AUTHENTICATION CONTROLLER
   ============================================================ */

(function (window) {
  'use strict';

  var PCV_Auth = {
    // Input Validation Helpers
    validateEmail: function (email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    },

    validatePassword: function (password) {
      if (!password || password.length < 6) {
        return "Password must be at least 6 characters long.";
      }
      return null;
    },

    // User Signup
    signup: async function (name, email, password, confirmPassword) {
      // 1. Validation
      if (!name || name.trim().length < 2) {
        return { error: "Please enter a valid full name." };
      }
      if (!this.validateEmail(email)) {
        return { error: "Please enter a valid email address." };
      }
      var passErr = this.validatePassword(password);
      if (passErr) return { error: passErr };
      if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
      }

      var formattedEmail = email.trim().toLowerCase();

      // 2. Real Supabase Flow
      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.auth.signUp({
          email: formattedEmail,
          password: password,
          options: {
            data: {
              name: name.trim(),
              role: 'user'
            }
          }
        });

        if (res.error) {
          return { error: res.error.message };
        }

        var user = res.data.user;
        if (!user) {
          return { error: "Signup succeeded. Please check your email for confirmation." };
        }

        // Fetch or wait for profile
        var userSession = {
          id: user.id,
          email: user.email,
          name: name.trim(),
          avatar_url: "",
          bio: "",
          social_links: {},
          role: "user",
          created_at: new Date().toISOString()
        };

        window.PCV_DB.setSession(userSession);
        return { success: true, user: userSession };
      }

      // 3. Fallback Engine Flow
      var users = window.PCV_DB.getLocalUsers();
      var existing = users.find(function (u) { return u.email === formattedEmail; });
      if (existing) {
        return { error: "An account with this email address already exists." };
      }

      var newUser = {
        id: "usr_" + Date.now(),
        email: formattedEmail,
        password_hash: password, // In fallback mode
        name: name.trim(),
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        bio: "Artist & Visual Creator at Prime Cine Visuals.",
        social_links: { twitter: "", instagram: "", artstation: "", website: "" },
        role: "user",
        is_disabled: false,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      window.PCV_DB.saveLocalUsers(users);

      // Save session (excluding password)
      var sessionObj = Object.assign({}, newUser);
      delete sessionObj.password_hash;
      window.PCV_DB.setSession(sessionObj);

      return { success: true, user: sessionObj };
    },

    // User Login
    login: async function (email, password) {
      if (!this.validateEmail(email)) {
        return { error: "Please enter a valid email address." };
      }
      if (!password) {
        return { error: "Please enter your password." };
      }

      var formattedEmail = email.trim().toLowerCase();

      // Real Supabase Auth
      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.auth.signInWithPassword({
          email: formattedEmail,
          password: password
        });

        if (res.error) {
          return { error: res.error.message };
        }

        var user = res.data.user;
        // Fetch profile
        var profRes = await supabase.from('profiles').select('*').eq('id', user.id).single();
        var profile = profRes.data || {
          id: user.id,
          email: user.email,
          name: user.user_metadata.name || formattedEmail.split('@')[0],
          role: 'user'
        };

        if (profile.is_disabled) {
          await supabase.auth.signOut();
          return { error: "Your account has been deactivated by an admin." };
        }

        window.PCV_DB.setSession(profile);
        return { success: true, user: profile };
      }

      // Fallback Mode
      var users = window.PCV_DB.getLocalUsers();
      var userMatch = users.find(function (u) {
        return u.email === formattedEmail && u.password_hash === password;
      });

      if (!userMatch) {
        return { error: "Invalid email or password. Please try again." };
      }

      if (userMatch.is_disabled) {
        return { error: "Your account has been deactivated by an admin." };
      }

      var sessionObj = Object.assign({}, userMatch);
      delete sessionObj.password_hash;
      window.PCV_DB.setSession(sessionObj);

      return { success: true, user: sessionObj };
    },

    // User Logout
    logout: async function () {
      if (window.PCV_DB.isRealSupabase()) {
        try {
          await window.PCV_DB.getSupabaseClient().auth.signOut();
        } catch (e) {}
      }
      window.PCV_DB.setSession(null);
      window.location.href = "login.html";
    },

    // Current Session & Profile Provider
    getCurrentUser: function () {
      return window.PCV_DB.getSession();
    },

    // Route Security Guards
    requireAuth: function () {
      var user = this.getCurrentUser();
      if (!user) {
        window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname);
        return null;
      }
      return user;
    },

    requireAdmin: function () {
      var user = this.requireAuth();
      if (!user) return null;
      if (user.role !== 'admin') {
        alert("Access Denied: Admin authorization required.");
        window.location.href = "profile.html";
        return null;
      }
      return user;
    }
  };

  window.PCV_Auth = PCV_Auth;
})(window);
