(function(){
  var form = document.getElementById('quoteForm');
  if(!form) return;

  var successEl = document.getElementById('formSuccess');
  var submitBtn = form.querySelector('.form-submit');
  var submitLabel = submitBtn ? submitBtn.textContent : 'Send Request';

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var action = form.getAttribute('action') || '';
    if(action.indexOf('YOUR_FORM_ID') !== -1){
      // Endpoint not configured yet — tell the developer, not the visitor.
      console.warn('Quote form: replace YOUR_FORM_ID in the form action with a real Formspree endpoint before this goes live.');
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(function(res){
      if(res.ok){
        form.reset();
        form.style.display = 'none';
        if(successEl) successEl.classList.add('is-visible');
      } else {
        throw new Error('Submit failed');
      }
    })
    .catch(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
      alert('Something went wrong sending the request — please email primecinevisuals@gmail.com directly instead.');
    });
  });
})();
