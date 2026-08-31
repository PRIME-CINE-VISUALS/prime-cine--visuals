/* ============================================================
   PRIME CINE VISUALS — SUPABASE CLIENT CONFIGURATION & STORAGE
   ============================================================ */

(function (window) {
  'use strict';

  // Default Supabase project configuration
  // Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project credentials
  var SUPABASE_URL = window.ENV_SUPABASE_URL || "https://xyzcompany.supabase.co";
  var SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey";

  var supabase = null;

  // Initialize real Supabase client if SDK is loaded and credentials are provided
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient && SUPABASE_URL && !SUPABASE_URL.includes("xyzcompany")) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Supabase client initialized successfully.");
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
    }
  }

  // Fallback Local Storage Engine for seamless offline / zero-config demo mode
  var LOCAL_AUTH_KEY = "pcv_auth_session";
  var LOCAL_USERS_KEY = "pcv_db_users";
  var LOCAL_SUBMISSIONS_KEY = "pcv_db_submissions";

  // Initial seed data for fallback mode
  function seedDefaultData() {
    if (!localStorage.getItem(LOCAL_USERS_KEY)) {
      var seedUsers = [
        {
          id: "usr_admin_001",
          email: "admin@primecine.com",
          password_hash: "admin123", // For fallback check only
          name: "Studio Admin",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          bio: "Lead Creative Director at Prime Cine Visuals.",
          social_links: { twitter: "@primecine", instagram: "@primecinevisuals", artstation: "primecine" },
          role: "admin",
          is_disabled: false,
          created_at: new Date().toISOString()
        },
        {
          id: "usr_artist_001",
          email: "alex@artist.com",
          password_hash: "artist123",
          name: "Alex Rivera",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
          bio: "3D Generalist & Motion Designer specializing in hyper-realistic product CGI.",
          social_links: { twitter: "@alexrivera3d", artstation: "alexrivera" },
          role: "user",
          is_disabled: false,
          created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(seedUsers));
    }

    if (!localStorage.getItem(LOCAL_SUBMISSIONS_KEY)) {
      var seedSubmissions = [
        {
          id: "sub_001",
          user_id: "usr_artist_001",
          title: "Cybernetic Chrono Watch",
          description: "Photorealistic 3D product commercial for a futuristic titanium timepiece rendered in Octane.",
          category: "Product Visualization",
          media_url: "perfume-ad.mp4",
          status: "APPROVED",
          admin_note: null,
          created_at: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: "sub_002",
          user_id: "usr_artist_001",
          title: "Neon Horizon Supercar",
          description: "Full CGI auto showreel exploring volumetric fog and ray-traced reflections.",
          category: "CGI Commercial",
          media_url: "cinematic-car-showreel.mp4",
          status: "PENDING",
          admin_note: null,
          created_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(seedSubmissions));
    }
  }

  seedDefaultData();

  window.PCV_DB = {
    isRealSupabase: function () {
      return supabase !== null;
    },
    getSupabaseClient: function () {
      return supabase;
    },
    // Session utilities
    getSession: function () {
      try {
        var raw = localStorage.getItem(LOCAL_AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    setSession: function (userObj) {
      if (userObj) {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(userObj));
      } else {
        localStorage.removeItem(LOCAL_AUTH_KEY);
      }
    },
    // Users DB helpers (Fallback)
    getLocalUsers: function () {
      return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    },
    saveLocalUsers: function (users) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    },
    // Submissions DB helpers (Fallback)
    getLocalSubmissions: function () {
      return JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY) || "[]");
    },
    saveLocalSubmissions: function (submissions) {
      localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
    }
  };

})(window);
