/* ============================================================
   PRIME CINE VISUALS — ADMIN DASHBOARD & MANAGEMENT CONTROLLER
   ============================================================ */

(function (window) {
  'use strict';

  var PCV_Admin = {
    // Load all users and submissions for Admin Dashboard
    loadAdminData: async function () {
      var currentUser = window.PCV_Auth.requireAdmin();
      if (!currentUser) return null;

      var users = [];
      var submissions = [];

      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        
        var uRes = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (uRes.data) users = uRes.data;

        var sRes = await supabase.from('submissions').select('*, profiles(name, email, avatar_url)').order('created_at', { ascending: false });
        if (sRes.data) {
          submissions = sRes.data.map(function(item){
            if (item.profiles) {
              item.artist_name = item.profiles.name;
              item.artist_email = item.profiles.email;
              item.artist_avatar = item.profiles.avatar_url;
            }
            return item;
          });
        }
      } else {
        // Fallback Engine
        users = window.PCV_DB.getLocalUsers().map(function(u){
          var copy = Object.assign({}, u);
          delete copy.password_hash;
          return copy;
        });

        var allSubs = window.PCV_DB.getLocalSubmissions();
        submissions = allSubs.map(function(s){
          var artist = users.find(function(u){ return u.id === s.user_id; });
          s.artist_name = artist ? artist.name : "Unknown Artist";
          s.artist_email = artist ? artist.email : "";
          s.artist_avatar = artist ? artist.avatar_url : "";
          return s;
        });
      }

      // Calculate stats
      var totalUsers = users.length;
      var totalSubmissions = submissions.length;
      var pendingCount = submissions.filter(function (s) { return s.status === 'PENDING'; }).length;
      var approvedCount = submissions.filter(function (s) { return s.status === 'APPROVED'; }).length;
      var rejectedCount = submissions.filter(function (s) { return s.status === 'REJECTED'; }).length;

      return {
        stats: {
          totalUsers: totalUsers,
          totalSubmissions: totalSubmissions,
          pendingCount: pendingCount,
          approvedCount: approvedCount,
          rejectedCount: rejectedCount
        },
        users: users,
        submissions: submissions
      };
    },

    // Approve Submission
    approveSubmission: async function (submissionId) {
      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.from('submissions').update({
          status: 'APPROVED',
          admin_note: null,
          updated_at: new Date().toISOString()
        }).eq('id', submissionId);

        if (res.error) return { error: res.error.message };
        return { success: true };
      }

      // Fallback
      var subs = window.PCV_DB.getLocalSubmissions();
      var idx = subs.findIndex(function (s) { return s.id === submissionId; });
      if (idx !== -1) {
        subs[idx].status = 'APPROVED';
        subs[idx].admin_note = null;
        subs[idx].updated_at = new Date().toISOString();
        window.PCV_DB.saveLocalSubmissions(subs);
        return { success: true };
      }

      return { error: "Submission not found." };
    },

    // Reject Submission with Admin Note
    rejectSubmission: async function (submissionId, adminNote) {
      if (!adminNote || adminNote.trim().length < 3) {
        return { error: "Please provide a valid rejection reason/note for the artist." };
      }

      var noteText = adminNote.trim();

      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.from('submissions').update({
          status: 'REJECTED',
          admin_note: noteText,
          updated_at: new Date().toISOString()
        }).eq('id', submissionId);

        if (res.error) return { error: res.error.message };
        return { success: true };
      }

      // Fallback
      var subs = window.PCV_DB.getLocalSubmissions();
      var idx = subs.findIndex(function (s) { return s.id === submissionId; });
      if (idx !== -1) {
        subs[idx].status = 'REJECTED';
        subs[idx].admin_note = noteText;
        subs[idx].updated_at = new Date().toISOString();
        window.PCV_DB.saveLocalSubmissions(subs);
        return { success: true };
      }

      return { error: "Submission not found." };
    },

    // Update User Role (Admin / User)
    updateUserRole: async function (userId, newRole) {
      if (['user', 'admin'].indexOf(newRole) === -1) {
        return { error: "Invalid user role." };
      }

      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.from('profiles').update({
          role: newRole,
          updated_at: new Date().toISOString()
        }).eq('id', userId);

        if (res.error) return { error: res.error.message };
        return { success: true };
      }

      // Fallback
      var users = window.PCV_DB.getLocalUsers();
      var idx = users.findIndex(function (u) { return u.id === userId; });
      if (idx !== -1) {
        users[idx].role = newRole;
        users[idx].updated_at = new Date().toISOString();
        window.PCV_DB.saveLocalUsers(users);
        return { success: true };
      }

      return { error: "User not found." };
    },

    // Toggle User Active / Disabled state
    toggleUserDisabled: async function (userId, isDisabled) {
      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.from('profiles').update({
          is_disabled: isDisabled,
          updated_at: new Date().toISOString()
        }).eq('id', userId);

        if (res.error) return { error: res.error.message };
        return { success: true };
      }

      // Fallback
      var users = window.PCV_DB.getLocalUsers();
      var idx = users.findIndex(function (u) { return u.id === userId; });
      if (idx !== -1) {
        users[idx].is_disabled = isDisabled;
        users[idx].updated_at = new Date().toISOString();
        window.PCV_DB.saveLocalUsers(users);
        return { success: true };
      }

      return { error: "User not found." };
    }
  };

  window.PCV_Admin = PCV_Admin;
})(window);
