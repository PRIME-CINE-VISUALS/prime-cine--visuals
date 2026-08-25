(function(){
  // Challenge card expand/collapse
  document.querySelectorAll('.challenge-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var card = btn.closest('.challenge-card');
      var isOpen = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.querySelector('.challenge-toggle-label').textContent = isOpen ? 'Hide Brief' : 'View Brief';
    });
  });
})();
