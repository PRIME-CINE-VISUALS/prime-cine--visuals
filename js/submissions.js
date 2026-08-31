/* ============================================================
   PRIME CINE VISUALS — ARTWORK SUBMISSION CONTROLLER
   ============================================================ */

(function (window) {
  'use strict';

  var PCV_Submissions = {
    createSubmission: async function (title, description, category, mediaUrl) {
      // 1. Auth check
      var currentUser = window.PCV_Auth.getCurrentUser();
      if (!currentUser) {
        return { error: "Authentication required. Please log in first." };
      }

      // 2. Input Validation
      if (!title || title.trim().length < 3) {
        return { error: "Please enter a work title (minimum 3 characters)." };
      }
      if (!description || description.trim().length < 10) {
        return { error: "Please provide a detailed description (minimum 10 characters)." };
      }
      if (!category) {
        return { error: "Please select a category." };
      }
      if (!mediaUrl || mediaUrl.trim().length < 4) {
        return { error: "Please provide a media URL or image link." };
      }

      var payload = {
        user_id: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        category: category,
        media_url: mediaUrl.trim(),
        status: "PENDING",
        admin_note: null,
        created_at: new Date().toISOString()
      };

      // 3. Real Supabase Flow
      if (window.PCV_DB.isRealSupabase()) {
        var supabase = window.PCV_DB.getSupabaseClient();
        var res = await supabase.from('submissions').insert([payload]).select().single();
        if (res.error) {
          return { error: res.error.message };
        }
        return { success: true, submission: res.data };
      }

      // 4. Fallback Engine Flow
      var submissions = window.PCV_DB.getLocalSubmissions();
      payload.id = "sub_" + Date.now();
      submissions.push(payload);
      window.PCV_DB.saveLocalSubmissions(submissions);

      return { success: true, submission: payload };
    }
  };

  window.PCV_Submissions = PCV_Submissions;
})(window);
