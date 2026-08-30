(function(){

  /* ---------- Live countdown ---------- */
  var countdownEl = document.getElementById('hackCountdown');
  if(countdownEl){
    var target = new Date(countdownEl.getAttribute('data-target')).getTime();
    var dEl = document.getElementById('cdDays');
    var hEl = document.getElementById('cdHours');
    var mEl = document.getElementById('cdMins');
    var sEl = document.getElementById('cdSecs');
    var noteEl = document.getElementById('countdownNote');

    function pad(n){ return String(n).padStart(2,'0'); }

    function tick(){
      var now = Date.now();
      var diff = target - now;

      if(diff <= 0){
        dEl.textContent = '00'; hEl.textContent = '00'; mEl.textContent = '00'; sEl.textContent = '00';
        if(noteEl) noteEl.textContent = 'Registrations are now closing — good luck to everyone who signed up.';
        clearInterval(interval);
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);

      dEl.textContent = pad(days);
      hEl.textContent = pad(hours);
      mEl.textContent = pad(mins);
      sEl.textContent = pad(secs);
    }

    tick();
    var interval = setInterval(tick, 1000);
  }

  /* ---------- Sticky sub-nav active state on scroll ---------- */
  var subnavLinks = document.querySelectorAll('.hack-subnav a');
  if(subnavLinks.length && 'IntersectionObserver' in window){
    var sections = [];
    subnavLinks.forEach(function(link){
      var id = link.getAttribute('href').replace('#','');
      var section = document.getElementById(id);
      if(section) sections.push(section);
    });

    var subnavObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.id;
          subnavLinks.forEach(function(link){
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin:'-40% 0px -50% 0px', threshold:0 });

    sections.forEach(function(section){ subnavObserver.observe(section); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ---------- Registration form ---------- */
  var regForm = document.getElementById('hackRegisterForm');
  if(regForm){
    var regSuccess = document.getElementById('hackFormSuccess');
    var regBtn = regForm.querySelector('.form-submit');
    var regBtnLabel = regBtn ? regBtn.textContent : 'Submit Registration';

    regForm.addEventListener('submit', function(e){
      e.preventDefault();

      var action = regForm.getAttribute('action') || '';
      if(action.indexOf('YOUR_HACK_FORM_ID') !== -1){
        console.warn('Hackathon registration form: replace YOUR_HACK_FORM_ID in the form action with a real Formspree endpoint before this goes live.');
      }

      regBtn.disabled = true;
      regBtn.textContent = 'Submitting…';

      fetch(action, {
        method: 'POST',
        body: new FormData(regForm),
        headers: { 'Accept': 'application/json' }
      })
      .then(function(res){
        if(res.ok){
          regForm.reset();
          regForm.style.display = 'none';
          if(regSuccess) regSuccess.classList.add('is-visible');
        } else {
          throw new Error('Submit failed');
        }
      })
      .catch(function(){
        regBtn.disabled = false;
        regBtn.textContent = regBtnLabel;
        alert('Something went wrong submitting your registration — please email primecinevisuals@gmail.com directly instead.');
      });
    });
  }

})();
