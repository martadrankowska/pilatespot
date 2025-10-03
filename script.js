// Global function for scroll to top button
function scrollToTop() {
  console.log('Scroll to top clicked');
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Make function available globally
window.scrollToTop = scrollToTop;

// Force scroll to top immediately when script loads
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

document.addEventListener('DOMContentLoaded',()=>{
  // Force scroll to top again after DOM is loaded
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 0);
  
  // Prevent default anchor scrolling behavior
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
  
  const yearEl=document.getElementById('year');
  if(yearEl){yearEl.textContent=new Date().getFullYear();}

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  
  if(mobileMenuToggle && mobileMenuOverlay){
    mobileMenuToggle.addEventListener('click', ()=>{
      const isOpen = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
      mobileMenuOverlay.classList.toggle('is-open');
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });
    
    // Close menu when clicking on links
    const mobileNavLinks = mobileMenuOverlay.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', ()=>{
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu when clicking outside
    mobileMenuOverlay.addEventListener('click', (e)=>{
      if(e.target === mobileMenuOverlay){
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  const form=document.querySelector('.contact-form');
  const note=document.querySelector('.form-note');
  // Booking URL wiring
  const bookingMeta=document.querySelector('meta[name="pilatespot:booking-url"]');
  const bookingUrl=bookingMeta?bookingMeta.content:'';
  document.querySelectorAll('[data-booking]')
    .forEach((el)=>{
      el.addEventListener('click',(e)=>{
        e.preventDefault();
        if(bookingUrl){
          window.open(bookingUrl,'_blank','noopener');
        }
      });
    });
  if(form){
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const data=new FormData(form);
      const name=(data.get('name')||'').toString().trim();
      const email=(data.get('email')||'').toString().trim();
      const message=(data.get('message')||'').toString().trim();
      if(!name||!email||!message){
        note.textContent='Proszę wypełnić wszystkie pola.';
        note.style.color='#b00020';
        return;
      }
      // Placeholder success state. Integrate with backend or form service later.
      form.reset();
      note.textContent='Dziękujemy! Wiadomość została wysłana.';
      note.style.color=getComputedStyle(document.documentElement).getPropertyValue('--accent')||'#2f614d';
    });
  }

  // Reveal on scroll with stagger per section
  const sections = Array.from(document.querySelectorAll('.section'));

  const collectTargetsForSection = (section)=>{
    if(section.classList.contains('hero')){
      return Array.from(section.querySelectorAll('.hero-media, .hero-copy'));
    }
    if(section.classList.contains('classes')){
      return [
        ...Array.from(section.querySelectorAll('#classes-title, .section-intro')),
        ...Array.from(section.querySelectorAll('.cards .card')),
      ];
    }
    if(section.classList.contains('booking')){
      return Array.from(section.querySelectorAll('.booking-inner > *'));
    }
    if(section.classList.contains('contact')){
      return Array.from(section.querySelectorAll('.contact-grid > *'));
    }
    return Array.from(section.children);
  };

  const allTargets = [];
  sections.forEach((section)=>{
    const targets = collectTargetsForSection(section);
    targets.forEach((el, idx)=>{
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(idx * 120, 600)}ms`;
      allTargets.push(el);
    });
  });

  const observer = new IntersectionObserver((entries, obs)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  },{root:null,rootMargin:'0px 0px -10% 0px',threshold:0.15});

  allTargets.forEach((el)=>observer.observe(el));

  // Cookie consent
  try{
    const COOKIE_KEY='pilatespot_cookie_accepted';
    const COOKIE_PERSISTENCE_ENABLED=false; // tymczasowo wyłączone zapisywanie zgody
    const bar=document.getElementById('cookie-consent');
    const btn=document.getElementById('cookie-accept');
    const accepted=localStorage.getItem(COOKIE_KEY)==='1';
    if(bar){
      if(!accepted){
        bar.hidden=false;
      }
      if(btn){
        btn.addEventListener('click',()=>{
          if(COOKIE_PERSISTENCE_ENABLED){
            try{localStorage.setItem(COOKIE_KEY,'1');}catch(_e){}
          }
          bar.hidden=true;
        });
      }
    }
  }catch(_e){/* ignore storage errors */}

  // Show/hide scroll-to-top button and header
  const scrollBtn = document.querySelector('.scroll-top-btn');
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  console.log('=== SCROLL TEST ===');
  console.log('Button:', scrollBtn);
  console.log('Header:', header);
  console.log('Initial scroll:', lastScrollY);
  
  const toggleScrollElements = ()=>{
    const currentScrollY = window.scrollY;
    const scrollThreshold = 100; // Pikseli od góry strony
    
    // Ukryj menu gdy przewijamy w dół po przekroczeniu progu
    if(header){
      if(currentScrollY > scrollThreshold && currentScrollY > lastScrollY){
        // Przewijanie w dół - ukryj menu, pokaż przycisk
        header.classList.add('hidden');
        if(scrollBtn){
          scrollBtn.classList.add('is-visible');
        }
      } else if(currentScrollY <= scrollThreshold || currentScrollY < lastScrollY){
        // Przewijanie w górę lub jesteśmy blisko góry - pokaż menu, ukryj przycisk
        header.classList.remove('hidden');
        if(scrollBtn){
          scrollBtn.classList.remove('is-visible');
        }
      }
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  };
  
  // Throttle scroll events for better performance
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(toggleScrollElements);
      ticking = true;
    }
  };
  
  // Initialize scroll button functionality
  if(scrollBtn){
    // Add click event listener
    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Initialize state and add scroll listener
  toggleScrollElements();
  
  // Simple scroll test
  window.addEventListener('scroll', function() {
    console.log('SCROLL EVENT FIRED! Y:', window.scrollY);
  });
  
  window.addEventListener('scroll', handleScroll, {passive: true});

  // Typografia: zamiana spacji po jednoliterowych słowach na twarde spacje (sierotki)
  const fixWidows = (root)=>{
    const selectors = [
      'p', '.section-intro', '.lede',
      'h1','h2','h3','h4','h5','h6',
      'li', 'label', '.pricing-info', '.feature p'
    ];
    const re = /\b([AIaIoOuUwWzZ])\s+/g;
    const els = root.querySelectorAll(selectors.join(','));
    els.forEach((el)=>{
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      while(walker.nextNode()){
        nodes.push(walker.currentNode);
      }
      nodes.forEach((node)=>{
        const t = node.nodeValue;
        if(t && /\S/.test(t)){
          node.nodeValue = t.replace(re, (_, m)=> m + '\u00A0');
        }
      });
    });
  };

  fixWidows(document);
});



