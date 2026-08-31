/* ============================================================
   PRIME CINE VISUALS — USER & ARTIST PROFILE CONTROLLER
   ============================================================ */

(function (window) {
  'use strict';

  var PCV_Profile = {
    // Fetch profile and user submissions
    loadProfileData: async function (user) {
      if (!user) return null;

      var profile = user;
      var submissions = [];

      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        
        // Refresh profile from DB
        var profRes = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profRes.data) {
          profile = profRes.data;
          window.PCV_DB.setSession(profile);
        }

        // Fetch user's submissions
        var subRes = await supabase.from('submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (subRes.data) {
          submissions = subRes.data;
        }
      } else {
        // Fallback engine
        var users = window.PCV_DB.getLocalUsers();
        var match = users.find(function (u) { return u.id === user.id; });
        if (match) {
          profile = Object.assign({}, match);
          delete profile.password_hash;
          window.PCV_DB.setSession(profile);
        }

        var allSubs = window.PCV_DB.getLocalSubmissions();
        submissions = allSubs.filter(function (s) { return s.user_id === user.id; });
        submissions.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      }

      return { profile: profile, submissions: submissions };
    },

    // Update profile metadata
    updateProfile: async function (userId, name, avatarUrl, bio, socialLinks) {
      if (!name || name.trim().length < 2) {
        return { error: "Please enter a valid full name." };
      }

      var updatePayload = {
        name: name.trim(),
        avatar_url: avatarUrl ? avatarUrl.trim() : "",
        bio: bio ? bio.trim() : "",
        social_links: socialLinks || {},
        updated_at: new Date().toISOString()
      };

      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.from('profiles').update(updatePayload).eq('id', userId).select().single();
        if (res.error) {
          return { error: res.error.message };
        }
        window.PCV_DB.setSession(res.data);
        return { success: true, profile: res.data };
      }

      // Fallback Engine
      var users = window.PCV_DB.getLocalUsers();
      var idx = users.findIndex(function (u) { return u.id === userId; });
      if (idx !== -1) {
        users[idx].name = updatePayload.name;
        users[idx].avatar_url = updatePayload.avatar_url;
        users[idx].bio = updatePayload.bio;
        users[idx].social_links = updatePayload.social_links;
        users[idx].updated_at = updatePayload.updated_at;
        window.PCV_DB.saveLocalUsers(users);

        var updatedSession = Object.assign({}, users[idx]);
        delete updatedSession.password_hash;
        window.PCV_DB.setSession(updatedSession);

        return { success: true, profile: updatedSession };
      }

      return { error: "User profile not found." };
    }
  };

  window.PCV_Profile = PCV_Profile;
})(window);
