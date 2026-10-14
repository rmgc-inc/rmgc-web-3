/* RM General Contractor Inc — interactions
   Sticky header · mobile nav · scrollspy · reveal-on-scroll ·
   project filters · estimate questionnaire · mobile call bar  */
(function () {
  'use strict';

  function init() {
  var d = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  var header = d.getElementById('siteHeader');
  var lastY = 0;
  var ticking = false;

  function onScroll() {
    lastY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-stuck', lastY > 24);
        updateCallbar(lastY);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = d.getElementById('burger');
  var navLinks = d.getElementById('navLinks');
  var scrim = d.getElementById('navScrim');

  function setNav(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('is-open', open);
    scrim.hidden = !open;
    // allow transition after unhide
    window.requestAnimationFrame(function () {
      scrim.classList.toggle('is-open', open);
    });
    d.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', function () {
    setNav(burger.getAttribute('aria-expanded') !== 'true');
  });
  scrim.addEventListener('click', function () { setNav(false); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      setNav(false);
      burger.focus();
    }
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });

  /* ---------- Scrollspy ---------- */
  var spyLinks = Array.prototype.slice.call(d.querySelectorAll('.nav__link'));
  var sections = spyLinks
    .map(function (a) { return d.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        spyLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = d.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- Project filters ---------- */
  var filterBtns = d.querySelectorAll('.filter');
  var projects = d.querySelectorAll('.proj');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      projects.forEach(function (p) {
        var show = f === 'all' || p.getAttribute('data-cat') === f;
        p.classList.toggle('is-hidden', !show);
        if (show) p.classList.add('is-in'); // don't re-hide revealed cards
      });
    });
  });

  /* ---------- Project photo galleries ---------- */
  var gallery = d.getElementById('gallery');
  var projectLightbox = d.getElementById('projectLightbox');
  var projectGallery = d.getElementById('projectGallery');
  var projectLightboxTitle = d.getElementById('projectLightboxTitle');
  var projectLightboxMeta = d.getElementById('projectLightboxMeta');
  var projectGalleryClose = projectLightbox
    ? projectLightbox.querySelector('[data-project-gallery-close].project-lightbox__close')
    : null;
  var projectLightboxPanel = projectLightbox
    ? projectLightbox.querySelector('.project-lightbox__panel')
    : null;
  var lastProjectCard = null;
  var projectGalleryCloseTimer = null;
  var lastTouchProjectCard = null;
  var lastTouchProjectTime = 0;
  var projectGallerySlides = [];
  var projectGalleryIndex = 0;

  function projectGalleryClosePanel() {
    if (!projectLightbox || projectLightbox.hidden) return;
    projectLightbox.classList.remove('is-open');
    if (projectGalleryCloseTimer) window.clearTimeout(projectGalleryCloseTimer);
    projectGalleryCloseTimer = window.setTimeout(function () {
      projectLightbox.hidden = true;
      projectGalleryCloseTimer = null;
    }, reduceMotion ? 0 : 180);
    d.body.style.overflow = '';
    if (lastProjectCard) lastProjectCard.focus();
  }

  function projectGalleryPhoto(photo, title, number, slideIndex) {
    var figure = d.createElement('figure');
    figure.className = 'project-gallery__photo';
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', 'View project photo ' + number + ' as the featured photo');
    figure.setAttribute('data-project-gallery-photo', '');
    figure.setAttribute('data-project-gallery-index', String(slideIndex));
    var image = d.createElement('img');
    image.src = photo.image;
    image.alt = photo.imageAlt || title;
    image.loading = 'lazy';
    var caption = d.createElement('figcaption');
    caption.textContent = photo.caption || photo.imageAlt || 'Project photo ' + number;
    figure.append(image, caption);
    return figure;
  }

  function showProjectGallerySlide(index) {
    if (!projectGallery || !projectGallerySlides.length) return;
    var featured = projectGallery.querySelector('.project-gallery__featured');
    var featuredImage = featured ? featured.querySelector('img') : null;
    var featuredCaption = featured ? featured.querySelector('figcaption') : null;
    if (!featuredImage) return;

    projectGalleryIndex = (index + projectGallerySlides.length) % projectGallerySlides.length;
    var slide = projectGallerySlides[projectGalleryIndex];
    featuredImage.src = slide.image;
    featuredImage.alt = slide.imageAlt;
    if (featuredCaption) featuredCaption.textContent = slide.caption;
    projectGallery.querySelectorAll('[data-project-gallery-photo]').forEach(function (photo) {
      var selected = Number(photo.getAttribute('data-project-gallery-index')) === projectGalleryIndex;
      photo.classList.toggle('is-selected', selected);
      photo.setAttribute('aria-current', selected ? 'true' : 'false');
    });

    [-1, 1].forEach(function (offset) {
      var adjacent = projectGallerySlides[
        (projectGalleryIndex + offset + projectGallerySlides.length) % projectGallerySlides.length
      ];
      if (adjacent) {
        var preload = new Image();
        preload.src = adjacent.image;
      }
    });
  }

  function projectGallerySelectPhoto(photoFigure) {
    if (!photoFigure) return;
    showProjectGallerySlide(Number(photoFigure.getAttribute('data-project-gallery-index')));
    projectGallery.querySelector('.project-gallery__featured').scrollIntoView({
      block: 'start', behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  function openProjectGallery(card) {
    if (!projectLightbox || !projectGallery) return;
    if (projectGalleryCloseTimer) {
      window.clearTimeout(projectGalleryCloseTimer);
      projectGalleryCloseTimer = null;
    }
    var image = card.querySelector('.proj__media img');
    var title = card.querySelector('.proj__title');
    var location = card.querySelector('.proj__loc');
    var category = card.querySelector('.proj__pill');
    if (!image || !title) return;

    lastProjectCard = card;
    projectLightboxTitle.textContent = title.textContent;
    projectLightboxMeta.textContent = (category ? category.textContent + ' · ' : '') +
      (location ? location.textContent : '');
    projectGallery.replaceChildren();

    var photos = card.projectContent && Array.isArray(card.projectContent.gallery)
      ? card.projectContent.gallery.filter(function (photo) { return photo && photo.image; }).slice(0, 30)
      : [];
    projectGallerySlides = [{
      image: image.currentSrc || image.src,
      imageAlt: image.alt || title.textContent,
      caption: image.alt || 'Featured project photo'
    }];
    photos.forEach(function (photo, index) {
      var absolutePhoto = new URL(photo.image, window.location.href).href;
      var existingSlide = projectGallerySlides.find(function (slide) {
        return new URL(slide.image, window.location.href).href === absolutePhoto;
      });
      if (existingSlide) {
        existingSlide.imageAlt = photo.imageAlt || existingSlide.imageAlt;
        existingSlide.caption = photo.caption || photo.imageAlt || existingSlide.caption;
        return;
      }
      projectGallerySlides.push({
        image: photo.image,
        imageAlt: photo.imageAlt || title.textContent,
        caption: photo.caption || photo.imageAlt || 'Project photo ' + String(index + 2).padStart(2, '0')
      });
    });
    projectGalleryIndex = 0;

    var featured = d.createElement('figure');
    featured.className = 'project-gallery__featured';
    var featuredMedia = d.createElement('div');
    featuredMedia.className = 'project-gallery__featured-media';
    var featuredImage = d.createElement('img');
    featuredImage.src = projectGallerySlides[0].image;
    featuredImage.alt = projectGallerySlides[0].imageAlt;
    featuredImage.loading = 'eager';
    featuredMedia.appendChild(featuredImage);
    if (projectGallerySlides.length > 1) {
      [
        { direction: -1, label: 'Previous project photo', symbol: '‹', className: 'project-gallery__arrow--previous' },
        { direction: 1, label: 'Next project photo', symbol: '›', className: 'project-gallery__arrow--next' }
      ].forEach(function (control) {
        var button = d.createElement('button');
        button.type = 'button';
        button.className = 'project-gallery__arrow ' + control.className;
        button.setAttribute('aria-label', control.label);
        button.setAttribute('data-project-gallery-direction', String(control.direction));
        button.innerHTML = '<span aria-hidden="true">' + control.symbol + '</span>';
        featuredMedia.appendChild(button);
      });
    }
    featured.append(featuredMedia, d.createElement('figcaption'));
    featured.querySelector('figcaption').textContent = projectGallerySlides[0].caption;
    projectGallery.appendChild(featured);

    projectGallerySlides.slice(1).forEach(function (photo, index) {
      var number = String(index + 2).padStart(2, '0');
      projectGallery.appendChild(projectGalleryPhoto(photo, title.textContent, number, index + 1));
    });

    projectLightbox.hidden = false;
    d.body.style.overflow = 'hidden';
    if (projectLightboxPanel) projectLightboxPanel.scrollTop = 0;
    window.requestAnimationFrame(function () {
      projectLightbox.classList.add('is-open');
    });
    if (projectGalleryClose) projectGalleryClose.focus();
  }

  function activateProjectCard(card, event) {
    if (!card) return;
    if (event.type === 'pointerup' && event.pointerType === 'touch') {
      event.preventDefault();
      lastTouchProjectCard = card;
      lastTouchProjectTime = Date.now();
      openProjectGallery(card);
      return;
    }
    if (
      event.type === 'click' &&
      card === lastTouchProjectCard &&
      Date.now() - lastTouchProjectTime < 800
    ) {
      event.preventDefault();
      return;
    }
    openProjectGallery(card);
  }

  if (gallery) {
    gallery.addEventListener('pointerup', function (event) {
      if (event.pointerType !== 'touch') return;
      var card = event.target.closest ? event.target.closest('.proj') : null;
      if (card && gallery.contains(card)) activateProjectCard(card, event);
    });
    gallery.addEventListener('click', function (event) {
      var card = event.target.closest ? event.target.closest('.proj') : null;
      if (card && gallery.contains(card)) activateProjectCard(card, event);
    });
    gallery.addEventListener('keydown', function (e) {
      var card = e.target.closest('.proj');
      if (!card || !gallery.contains(card)) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectGallery(card);
      }
    });
  }
  if (projectLightbox && projectGallery) {
    projectGallery.addEventListener('click', function (e) {
      var arrow = e.target.closest ? e.target.closest('[data-project-gallery-direction]') : null;
      if (arrow && projectGallery.contains(arrow)) {
        showProjectGallerySlide(projectGalleryIndex + Number(arrow.getAttribute('data-project-gallery-direction')));
        return;
      }
      var photo = e.target.closest ? e.target.closest('[data-project-gallery-photo]') : null;
      if (photo && projectGallery.contains(photo)) projectGallerySelectPhoto(photo);
    });
    projectGallery.addEventListener('keydown', function (e) {
      var photo = e.target.closest ? e.target.closest('[data-project-gallery-photo]') : null;
      if (!photo || !projectGallery.contains(photo)) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        projectGallerySelectPhoto(photo);
      }
    });
    projectLightbox.addEventListener('click', function (e) {
      var closeTarget = e.target.closest
        ? e.target.closest('[data-project-gallery-close]')
        : null;
      if (closeTarget && projectLightbox.contains(closeTarget)) projectGalleryClosePanel();
    });
    d.addEventListener('keydown', function (e) {
      if (projectLightbox.hidden) return;
      if (e.key === 'Escape') projectGalleryClosePanel();
      if (e.key === 'ArrowLeft' && projectGallerySlides.length > 1) {
        e.preventDefault();
        showProjectGallerySlide(projectGalleryIndex - 1);
      }
      if (e.key === 'ArrowRight' && projectGallerySlides.length > 1) {
        e.preventDefault();
        showProjectGallerySlide(projectGalleryIndex + 1);
      }
    });
  }

  /* ---------- Hero estimate questionnaire ---------- */
  var quiz = d.getElementById('quizForm');
  if (quiz) {
    var formspreeEndpoint = 'https://formspree.io/f/mrpgnjol';
    var qSteps = Array.prototype.slice.call(quiz.querySelectorAll('.quiz__step'));
    var qBar = d.getElementById('quizBar');
    var qCount = d.getElementById('quizCount');
    var qErr = d.getElementById('quizErr');
    var qStatus = d.getElementById('quizStatus');
    var qPrev = d.getElementById('quizPrev');
    var qFwd = d.getElementById('quizFwd');
    var qNext = d.getElementById('quizNext');
    var qCur = 0;
    var qSubmitting = false;
    var qSubmitted = false;

    function qShow(i) {
      qSteps.forEach(function (s, idx) {
        s.hidden = idx !== i;
        s.classList.toggle('is-active', idx === i);
      });
      qBar.style.width = ((i + 1) / qSteps.length * 100) + '%';
      qCount.textContent = 'Step ' + (i + 1) + ' of ' + qSteps.length;
      qPrev.disabled = i === 0;
      qNext.textContent = i === qSteps.length - 1 ? 'Get my estimate' : 'Next';
      quiz.classList.toggle('is-final-step', i === qSteps.length - 1);
      qErr.hidden = true;
      qCur = i;
    }

    function qFail(msg) {
      qErr.textContent = msg;
      qErr.hidden = false;
      return false;
    }

    function qValidate(i) {
      var step = qSteps[i];
      var checks = step.querySelectorAll('input[type="checkbox"]');
      if (checks.length) {
        var any = Array.prototype.some.call(checks, function (c) { return c.checked; });
        return any || qFail('Please select at least one option.');
      }
      var name = step.querySelector('#quizName');
      if (name) {
        return name.value.trim().length >= 2 || qFail('Please enter your name.');
      }
      var email = step.querySelector('#quizEmail');
      if (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) || qFail('Please enter a valid email address.');
      }
      var phone = step.querySelector('#quizPhone');
      if (phone) {
        var digits = phone.value.replace(/\D/g, '');
        return (digits.length >= 10 && digits.length <= 11) || qFail('Please enter a valid phone number.');
      }
      return true; // notes step is optional
    }

    function qAdvance() {
      if (!qValidate(qCur)) return;
      if (qCur < qSteps.length - 1) {
        qShow(qCur + 1);
        var focusable = qSteps[qCur].querySelector('input,textarea');
        if (focusable) focusable.focus();
      } else {
        qFinish();
      }
    }

    function qVals(nm) {
      return Array.prototype.filter.call(quiz.elements[nm] || [], function (c) { return c.checked; })
        .map(function (c) { return c.value; }).join(', ') || '—';
    }

    function qFinish() {
      if (qSubmitting || qSubmitted) return;
      var name = quiz.querySelector('#quizName').value.trim();
      var subject = 'Estimate request — ' + qVals('spaces') + ' — ' + name;
      var email = quiz.querySelector('#quizEmail').value.trim();
      var formData = new FormData();

      formData.append('_subject', subject);
      formData.append('_replyto', email);
      formData.append('Spaces', qVals('spaces'));
      formData.append('Approximate size', qVals('size'));
      formData.append('Timeline', qVals('timeline'));
      formData.append('Name', name);
      formData.append('Email', email);
      formData.append('Phone', quiz.querySelector('#quizPhone').value.trim());
      formData.append('Project details', quiz.querySelector('#quizNotes').value.trim() || '—');

      qSubmitting = true;
      qStatus.textContent = 'Sending your request…';
      qStatus.classList.remove('is-ok');
      qNext.disabled = true;
      qFwd.disabled = true;
      qPrev.disabled = true;

      fetch(formspreeEndpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) {
          return response.json().catch(function () { return {}; }).then(function (data) {
            throw new Error(data.error || 'Form submission failed.');
          });
        }
        qSubmitted = true;
        qStatus.textContent = 'Thanks, ' + name.split(' ')[0] + '! Your estimate request has been sent.';
        qStatus.classList.add('is-ok');
        qNext.textContent = 'Sent';
      }).catch(function () {
        qStatus.textContent = 'We couldn’t send your request. Please try again or call (647) 865-8009.';
        qStatus.classList.remove('is-ok');
        qNext.disabled = false;
        qFwd.disabled = false;
        qPrev.disabled = false;
      }).then(function () {
        qSubmitting = false;
      });
    }

    qNext.addEventListener('click', function (e) { e.preventDefault(); qAdvance(); });
    qFwd.addEventListener('click', qAdvance);
    qPrev.addEventListener('click', function () { if (qCur > 0) qShow(qCur - 1); });
    quiz.addEventListener('submit', function (e) { e.preventDefault(); qAdvance(); });
    // Enter inside text inputs advances
    quiz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        qAdvance();
      }
    });
    qShow(0);
  }

  /* ---------- Mobile call bar ---------- */
  var callbar = d.getElementById('callbar');
  var hero = d.getElementById('home');
  var contact = d.getElementById('contact');

  function updateCallbar(y) {
    if (!callbar) return;
    var pastHero = y > (hero ? hero.offsetHeight * 0.6 : 400);
    var beforeContact = contact
      ? y + window.innerHeight < contact.offsetTop + contact.offsetHeight * 0.5
      : true;
    callbar.classList.toggle('is-visible', pastHero && beforeContact);
  }

  /* ---------- Footer year ---------- */
  var yr = d.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
  }

  var contentReady = window.siteContentReady;
  if (contentReady && typeof contentReady.then === 'function') {
    contentReady.then(init, init);
  } else {
    init();
  }
}());
