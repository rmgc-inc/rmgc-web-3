(function () {
  'use strict';

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function localMediaUrl(value) {
    if (!value) return value;
    try {
      var url = new URL(value, window.location.href);
      var marker = '/RM-General-Contractor-2.0/main/assets/uploads/';
      var markerIndex = url.pathname.indexOf(marker);
      if (url.hostname === 'raw.githubusercontent.com' && markerIndex !== -1) {
        return '/assets/uploads/' + url.pathname.slice(markerIndex + marker.length);
      }
    } catch (error) {
      return value;
    }
    return value;
  }

  function setText(id, value) {
    var node = byId(id);
    if (node && value !== undefined) node.textContent = value;
  }

  function setImage(id, value) {
    var node = byId(id);
    if (node && value) node.src = value;
  }

  function setEyebrow(id, value) {
    var node = byId(id);
    if (!node || !value) return;
    node.replaceChildren(element('span', 'eyebrow__dot'), document.createTextNode(' ' + value));
    node.firstChild.setAttribute('aria-hidden', 'true');
  }

  function setHeading(id, title, emphasis) {
    var node = byId(id);
    if (!node || !title) return;
    node.replaceChildren(document.createTextNode(title + (emphasis ? ' ' : '')));
    if (emphasis) node.appendChild(element('em', '', emphasis));
  }

  function serviceCard(service, index) {
    var card = element('article', 'service reveal');
    card.style.setProperty('--d', (index * 0.1) + 's');

    var media = element('div', 'service__media');
    var image = element('img');
    image.src = service.image;
    image.alt = service.imageAlt || service.title || '';
    image.width = 1200;
    image.height = 800;
    image.loading = 'lazy';
    var chip = element('span', 'service__chip', String(index + 1));
    chip.setAttribute('aria-hidden', 'true');
    media.append(image, chip);

    var body = element('div', 'service__body');
    body.append(
      element('p', 'service__index', service.category || ''),
      element('h3', 'service__title', service.title || ''),
      element('p', 'service__desc', service.description || '')
    );
    var list = element('ul', 'service__list');
    (service.bullets || []).forEach(function (item) {
      list.appendChild(element('li', '', item));
    });
    var link = element('a', 'link-arrow', service.buttonLabel || 'Request a free estimate →');
    link.href = '#estimate';
    body.append(list, link);
    card.append(media, body);
    return card;
  }

  function projectCard(project, index) {
    var card = element('article', 'proj reveal');
    card.projectContent = project;
    card.dataset.cat = project.category || 'residential';
    card.style.setProperty('--d', (index * 0.06) + 's');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', 'View photos for ' + (project.title || 'this project'));

    var media = element('div', 'proj__media');
    var image = element('img');
    image.src = localMediaUrl(project.image);
    image.alt = project.imageAlt || project.title || '';
    image.width = 1600;
    image.height = 1200;
    image.loading = 'lazy';
    media.append(image, element('span', 'proj__pill', project.category || 'Project'));

    var meta = element('div', 'proj__meta');
    meta.append(
      element('h3', 'proj__title', project.title || ''),
      element('p', 'proj__loc', project.location || '')
    );
    card.append(media, meta);
    return card;
  }

  function renderServices(services) {
    var container = byId('servicesCards');
    if (!container || !Array.isArray(services) || !services.length) return;
    container.replaceChildren.apply(container, services.map(serviceCard));
  }

  function renderProjects(projects) {
    var container = byId('gallery');
    if (!container || !Array.isArray(projects) || !projects.length) return;
    projects.forEach(function (project) {
      project.image = localMediaUrl(project.image);
      (project.gallery || []).forEach(function (photo) {
        photo.image = localMediaUrl(photo.image);
      });
    });
    container.replaceChildren.apply(container, projects.map(projectCard));
  }

  function renderFaq(items) {
    var container = byId('faqList');
    if (!container || !Array.isArray(items) || !items.length) return;
    var nodes = items.map(function (item, index) {
      var details = element('details');
      if (index === 0) details.open = true;
      details.append(element('summary', '', item.question || ''), element('p', '', item.answer || ''));
      return details;
    });
    container.replaceChildren.apply(container, nodes);
  }

  function applyBusiness(business) {
    if (!business) return;
    if (business.name) {
      document.querySelectorAll('.business-name').forEach(function (node) {
        node.textContent = business.name;
      });
    }
    if (business.tagline) {
      document.querySelectorAll('.business-tagline').forEach(function (node) {
        node.textContent = business.tagline;
      });
    }
    document.querySelectorAll('[data-business-logo]').forEach(function (node) {
      if (business.logo) node.src = business.logo;
    });
    document.querySelectorAll('[data-brand-link]').forEach(function (node) {
      if (business.name) node.setAttribute('aria-label', business.name + ' — home');
    });
    document.querySelectorAll('[data-phone-text]').forEach(function (node) {
      node.textContent = business.phoneDisplay || node.textContent;
    });
    document.querySelectorAll('[data-phone-link]').forEach(function (node) {
      if (business.phoneTel) node.href = 'tel:' + business.phoneTel;
    });

    setText('topbarHours', business.topbarHours);
    setText('weekHours', business.weekdayHours);
    setText('sundayHours', business.sundayHours);
    setText('footerHours', business.footerHours);
    setText('serviceArea', business.serviceArea);
    setText('insuranceLiability', business.liabilityInsurance);
    setText('insuranceWsib', business.wsibInsurance);
  }

  function applyExternalLink(id, url, placeholder) {
    var link = byId(id);
    if (!link) return;
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.classList.remove('social-link--placeholder');
      link.removeAttribute('aria-disabled');
      return;
    }
    if (placeholder) {
      link.href = '#contact';
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.classList.add('social-link--placeholder');
      link.setAttribute('aria-disabled', 'true');
    }
  }

  function applyContent(content) {
    applyBusiness(content.business);
    var about = content.about;
    if (about) {
      var section = byId('about');
      var eyebrow = section.querySelector('.eyebrow');
      if (about.eyebrow !== undefined) {
        eyebrow.replaceChildren(element('span', 'eyebrow__dot'), document.createTextNode(' ' + about.eyebrow));
      }
      if (about.title !== undefined) {
        var heading = section.querySelector('h2');
        heading.replaceChildren(document.createTextNode(about.title + ' '));
        if (about.emphasis) heading.appendChild(element('em', '', about.emphasis));
      }
      var aboutImage = section.querySelector('.about__media img');
      if (about.image) aboutImage.src = about.image;
      if (about.imageAlt !== undefined) aboutImage.alt = about.imageAlt;
      if (Array.isArray(about.paragraphs)) {
        section.querySelector('.about__text').replaceChildren.apply(
          section.querySelector('.about__text'),
          about.paragraphs.map(function (text) { return element('p', '', text); })
        );
      }
      if (Array.isArray(about.credentials)) {
        var credentials = section.querySelector('.about__creds');
        var icon = credentials.querySelector('svg');
        var items = about.credentials.map(function (credential) {
          var item = element('li');
          if (icon) item.appendChild(icon.cloneNode(true));
          var text = element('span');
          text.append(element('strong', '', credential.title), document.createTextNode(' ' + credential.text));
          item.appendChild(text);
          return item;
        });
        credentials.replaceChildren.apply(credentials, items);
      }
      if (about.buttonLabel !== undefined) section.querySelector('.about__cta .btn--dark').textContent = about.buttonLabel;
    }

    var hero = content.hero || {};
    setEyebrow('heroEyebrow', hero.eyebrow);
    setHeading('heroTitle', hero.title, hero.emphasis);
    setText('heroLead', hero.lead);
    setImage('heroBackground', hero.backgroundImage);

    var servicesSection = content.servicesSection || {};
    setEyebrow('servicesEyebrow', servicesSection.eyebrow);
    setHeading('servicesTitle', servicesSection.title, servicesSection.emphasis);
    setText('servicesLead', servicesSection.lead);
    renderServices(content.services);

    var projectsSection = content.projectsSection || {};
    setEyebrow('projectsEyebrow', projectsSection.eyebrow);
    setHeading('projectsTitle', projectsSection.title, projectsSection.emphasis);
    setText('projectsLead', projectsSection.lead);
    renderProjects(content.projects);

    var faq = content.faq || {};
    setEyebrow('faqEyebrow', faq.eyebrow);
    setHeading('faqTitle', faq.title, faq.emphasis);
    renderFaq(faq.items);

    var contact = content.contact || {};
    setEyebrow('contactEyebrow', contact.eyebrow);
    setHeading('contactTitle', contact.title, contact.emphasis);
    setText('contactLead', contact.lead);
    var social = contact.social || {};
    applyExternalLink('xiaohongshuLink', social.xiaohongshuUrl, false);
    setText('xiaohongshuLabel', social.xiaohongshuLabel);
    applyExternalLink('instagramLink', social.instagramUrl, true);
    setText('instagramLabel', social.instagramLabel);
    setImage('wechatQr', social.wechatQr);

    var footer = content.footer || {};
    setText('footerBlurb', footer.blurb);
  }

  function finishContentLoad() {
    document.documentElement.classList.remove('content-pending');
    document.documentElement.classList.add('content-ready');
  }

  var requiredContentVersion = 3;
  var contentSource = 'content/site.json?v=stable-build-5';

  function loadContent() {
    return fetch(contentSource, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Unable to load website content.');
        return response.json();
      })
      .then(function (content) {
        if (Number(content.contentVersion || 0) < requiredContentVersion) {
          throw new Error('Website content uses an older schema.');
        }
        return content;
      });
  }

  window.siteContentReady = loadContent()
    .then(function (content) {
      applyContent(content);
      finishContentLoad();
    })
    .catch(function (error) {
      console.warn('Website content could not be loaded; using the built-in copy.', error);
      finishContentLoad();
    });
}());