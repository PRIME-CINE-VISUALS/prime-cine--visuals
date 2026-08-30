
(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Loader (iris/clip-path wipe — see #loader.done in styles.css) ---------- */
  var loader = document.getElementById('loader');
  var loaderPct = document.getElementById('loaderPct');
  var pct = 0;
  function finishLoad(){
    document.body.classList.add('loaded');
    loader.classList.add('done');
    // matches the 1.1s clip-path wipe + 0.6s fade (starting at 1.0s) defined in CSS
    setTimeout(function(){ loader.remove(); }, 1700);
  }
  if(document.readyState === 'complete'){
    loaderPct.textContent = 'LOADING 100%';
    setTimeout(finishLoad, 250);
  } else {
    var tick = setInterval(function(){
      pct = Math.min(pct + Math.random()*18, 100);
      loaderPct.textContent = 'LOADING ' + Math.floor(pct) + '%';
      if(pct >= 100) clearInterval(tick);
    }, 150);
    window.addEventListener('load', function(){
      clearInterval(tick);
      loaderPct.textContent = 'LOADING 100%';
      setTimeout(finishLoad, 300);
    });
    // Safety fallback in case the load event is delayed
    setTimeout(finishLoad, 4000);
  }

  /* ---------- Header background on scroll + scroll progress ---------- */
  var header = document.getElementById('siteHeader');
  var scrollBar = document.getElementById('scroll-progress');
  function onScroll(){
    header.classList.toggle('scrolled', window.scrollY > 40);
    var h = document.documentElement;
    var scrollPct = (h.scrollTop || document.body.scrollTop) / ((h.scrollHeight || document.body.scrollHeight) - h.clientHeight) * 100;
    scrollBar.style.width = scrollPct + '%';
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- Prime Cine Visuals Custom Cursor ---------- */

  /* ---------- Prime Cine Visuals Custom Cursor (Physics-based) ---------- */

  if(!isCoarsePointer && !reduceMotion){

    var dot = document.getElementById('cursorDot');
    var ring = document.querySelector('.cursor-ring');

    if(dot){
      // State
      var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      var dotPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      var ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      // Settings
      var dotSpeed = 1; // Instant for the dot
      var ringSpeed = 0.15; // Smooth trailing for the ring

      window.addEventListener('mousemove', function(e){
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });

      function renderCursor() {
        // Lerp function
        dotPos.x += (mouse.x - dotPos.x) * dotSpeed;
        dotPos.y += (mouse.y - dotPos.y) * dotSpeed;

        dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;

        if(ring){
          ringPos.x += (mouse.x - ringPos.x) * ringSpeed;
          ringPos.y += (mouse.y - ringPos.y) * ringSpeed;
          ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
        }

        requestAnimationFrame(renderCursor);
      }
      
      // Start loop
      requestAnimationFrame(renderCursor);

      /*
       * Interactive hover state
       */

      document
        .querySelectorAll('a, button, select, .magnetic, .gallery-card, .gallery-filter')
        .forEach(function(el){

          el.addEventListener('mouseenter', function(){
            dot.classList.add('cursor-active');
            if(ring){
              ring.classList.add('cursor-ring-active');
            }
          });

          el.addEventListener('mouseleave', function(){
            dot.classList.remove('cursor-active');
            if(ring){
              ring.classList.remove('cursor-ring-active');
            }
          });

        });
    }

  }

  /* ---------- Magnetic buttons ---------- */
  if(!isCoarsePointer && !reduceMotion){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var relX = e.clientX - r.left - r.width/2;
        var relY = e.clientY - r.top - r.height/2;
        btn.style.transform = 'translate(' + relX*0.18 + 'px,' + relY*0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }

  /* ---------- Click ripple (.btn — see .ripple in styles.css) ---------- */
  document.querySelectorAll('.btn').forEach(function(el){
    el.addEventListener('click', function(e){
      var r = el.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size/2) + 'px';
      span.style.top = (e.clientY - r.top - size/2) + 'px';
      el.appendChild(span);
      span.addEventListener('animationend', function(){ span.remove(); });
    });
  });

  /* ---------- Copy contact email ---------- */
  document.querySelectorAll('.copy-email').forEach(function(button){
    button.addEventListener('click', function(){
      var email = button.getAttribute('data-email');
      var label = button.querySelector('.copy-label');
      if(!email || !label) return;

      function showCopied(){
        label.textContent = 'Email Copied';
        button.classList.add('copied');
        setTimeout(function(){
          label.textContent = 'Copy Email';
          button.classList.remove('copied');
        }, 1800);
      }

      if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(email).then(showCopied);
        return;
      }

      var input = document.createElement('textarea');
      input.value = email;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      if(document.execCommand('copy')) showCopied();
      input.remove();
    });
  });

  /* ---------- Portfolio video previews and sound controls ---------- */
  var workVideos = document.querySelectorAll('.work-video');

  function resetVideo(video){
    video.pause();
    video.currentTime = 0;
  }

  function pauseOtherVideos(activeVideo){
    workVideos.forEach(function(video){
      if(video !== activeVideo) resetVideo(video);
    });
  }

  // A single observer keeps playback synchronized across desktop and mobile.
  var videoObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var video = entry.target;

      if(!entry.isIntersecting){
        resetVideo(video);
        return;
      }

      pauseOtherVideos(video);
      video.play().catch(function(){
        video.closest('.work-card').classList.add('video-autoplay-blocked');
      });
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.work-card').forEach(function(card){
    var video = card.querySelector('.work-video');
    var soundBtn = card.querySelector('.work-sound-btn');
    var iconMute = card.querySelector('.icon-mute');
    var iconUnmute = card.querySelector('.icon-unmute');
    var fallback = card.querySelector('.video-fallback');
    if(!video || !soundBtn || !iconMute || !iconUnmute) return;

    function showFallback(){
      card.classList.add('video-unavailable');
      if(soundBtn){ soundBtn.style.display = 'none'; }
      if(fallback){ fallback.textContent = 'Video unavailable in this browser'; }
    }

    function canPlayVideo(){
      if(!video.canPlayType) return false;
      var supportsMp4 = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      var supportsMov = video.canPlayType('video/quicktime');
      return supportsMp4 === 'probably' || supportsMp4 === 'maybe' || supportsMov === 'probably' || supportsMov === 'maybe';
    }

    if(!canPlayVideo()){
      showFallback();
      return;
    }

    video.addEventListener('error', function(){
      showFallback();
    });

    function updateSoundIcon(){
      iconMute.style.display = video.muted ? 'block' : 'none';
      iconUnmute.style.display = video.muted ? 'none' : 'block';
      soundBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    }

    soundBtn.addEventListener('click', function(event){
      event.stopPropagation();
      if(card.classList.contains('video-unavailable')) return;
      video.muted = !video.muted;
      updateSoundIcon();
      if(!video.paused){ return; }
      video.play().catch(function(){
        showFallback();
      });
    });

    updateSoundIcon();
    videoObserver.observe(video);
  });

  /* ---------- Ambient particles (.particle — opacity/position handled by the floatUp keyframes in CSS) ---------- */
  if(!reduceMotion){
    var field = document.getElementById('particles');
    var count = window.innerWidth < 700 ? 10 : 22;
    var frag = document.createDocumentFragment();
    for(var i=0; i<count; i++){
      var s = document.createElement('span');
      s.className = 'particle';
      if(i % 11 === 0) s.classList.add('core');
      else if(i % 7 === 0) s.classList.add('streak');
      else if(i % 6 === 0) s.classList.add('shard');
      else if(i % 5 === 0) s.classList.add('twinkle');
      s.style.left = Math.random()*100 + 'vw';
      s.style.animationDuration = (8 + Math.random()*10) + 's';
      s.style.animationDelay = (Math.random()*10) + 's';
      frag.appendChild(s);
    }
    field.appendChild(frag);
  }
})();
