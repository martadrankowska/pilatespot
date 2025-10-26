// Global function for scroll to top button
function scrollToTop() {
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
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  
  if(mobileMenuToggle && mobileMenuOverlay){
    mobileMenuToggle.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      const isOpen = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
      mobileMenuOverlay.classList.toggle('is-open');
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });
    
    // Close menu when clicking close button
    if(mobileCloseBtn){
      mobileCloseBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    }
    
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
      
      // Pobierz dane z formularza - spróbuj dwie metody
      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="message"]');
      
      const name = (nameInput?.value || '').trim();
      const email = (emailInput?.value || '').trim();
      const message = (messageInput?.value || '').trim();
      
      // Debug - zobacz w konsoli co się pobiera
      
      // Walidacja
      if(!name || name.length < 2){
        note.textContent='Imię musi mieć co najmniej 2 znaki.';
        note.style.color='#b00020';
        return;
      }
      
      if(!email || !email.includes('@')){
        note.textContent='Podaj prawidłowy adres email.';
        note.style.color='#b00020';
        return;
      }
      
      if(!message || message.length < 10){
        note.textContent='Wiadomość musi mieć co najmniej 10 znaków.';
        note.style.color='#b00020';
        return;
      }
      
      // Wszystko OK - przygotuj dane do wysłania
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('message', message);
      
      // Wysłanie formularza do send_mail.php
      const submitBtn = form.querySelector('button[type="submit"]');
      
      const spinner = form.querySelector('.form-spinner');
      
      if (!submitBtn) {
        note.textContent = 'Błąd: Przycisk nie znaleziony!';
        note.style.color = '#b00020';
        return;
      }
      
      const originalBtnText = submitBtn.textContent;
      
      // Disable button i pokaż loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wysyłam...';
      if(spinner) spinner.style.display = 'flex';
      note.textContent = '';
      
      // Zmień na pełną ścieżkę absolutną
      const fetchUrl = window.location.origin + '/send_mail.php';
      
      // Użyj zwykłego obiektu zamiast FormData
      const postData = {
        name: name,
        email: email,
        message: message
      };
      
      fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        
        const result = data;
        
        // Sukces
        if (result.success) {
          form.reset();
          note.textContent = result.message || 'Dziękujemy! Wiadomość została wysłana.';
          note.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#2f614d';
        } else {
          throw new Error(result.message || 'Coś poszło nie tak.');
        }
      })
      .catch(error => {
        // Błąd
        
        let errorMessage = 'Coś poszło nie tak. Spróbuj ponownie później.';
        
        if (error.response) {
          // Odpowiedź z serwera, ale ze statusem błędu
          
          // Loguj szczegóły błędów walidacji
          if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
            error.response.data.errors.forEach((err, idx) => {
            });
          }
          
          errorMessage = error.response.data?.message || `HTTP ${error.response.status}`;
        } else if (error.request) {
          // Request wysłany, ale brak odpowiedzi
          errorMessage = 'Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.';
        } else if (error.message) {
          // Inny błąd
          errorMessage = error.message;
        }
        
        note.textContent = errorMessage;
        note.style.color = '#b00020';
      })
      .finally(() => {
        // Przywróć przycisk do stanu normalnego
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        if(spinner) spinner.style.display = 'none';
      });
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
    const COOKIE_PERSISTENCE_ENABLED=true; // ✅ WŁĄCZONE - teraz będzie pamiętać
    const bar=document.getElementById('cookie-consent');
    const btn=document.getElementById('cookie-accept');
    const accepted=localStorage.getItem(COOKIE_KEY)==='1';
    if(bar){
      // Jeśli użytkownik już zaakceptował, ukryj pasek
      if(accepted){
        bar.hidden=true;
      } else {
        // Jeśli nie zaakceptował, pokaż pasek
        bar.hidden=false;
      }
      if(btn){
        btn.addEventListener('click',()=>{
          // Zapisz zgodę do localStorage
          if(COOKIE_PERSISTENCE_ENABLED){
            try{localStorage.setItem(COOKIE_KEY,'1');}catch(_e){}
          }
          // Ukryj pasek ciasteczek
          bar.hidden=true;
        });
      }
    }
  }catch(_e){/* ignore storage errors */}

  // Show/hide scroll-to-top button and header
  const scrollBtn = document.querySelector('.scroll-top-btn');
  const header = document.querySelector('.site-header');
  let lastScrollY = 0;
  
  const handleScroll = () => {
    const currentScrollY = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0;
    const scrollThreshold = 100;
    
    if(header){
      if(currentScrollY > scrollThreshold && currentScrollY > lastScrollY){
        // Scrolling down - hide header
        header.classList.add('hidden');
        if(scrollBtn){
          scrollBtn.classList.add('is-visible');
        }
      } else if(currentScrollY < lastScrollY || currentScrollY <= scrollThreshold){
        // Scrolling up or near top - show header
        header.classList.remove('hidden');
        if(scrollBtn){
          scrollBtn.classList.remove('is-visible');
        }
      }
    }
    
    lastScrollY = currentScrollY;
  };
  
  // Initialize scroll button functionality
  if(scrollBtn){
    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Try multiple scroll methods to ensure it works
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Add scroll listeners
  window.addEventListener('scroll', handleScroll, {passive: true});
  document.addEventListener('scroll', handleScroll, {passive: true});
  document.body.addEventListener('scroll', handleScroll, {passive: true});
  
  // Initial call with delay to ensure page is fully loaded
  setTimeout(() => {
    handleScroll();
  }, 100);

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

  // Thoughts cards scroll indicators
  const thoughtsCards = document.getElementById('thoughts-cards');
  const indicators = document.querySelectorAll('.indicator');
  
  if(thoughtsCards && indicators.length > 0){
    let currentIndex = 0;
    
    // Update indicators based on scroll position
    const updateIndicators = () => {
      const scrollLeft = thoughtsCards.scrollLeft;
      const cardWidth = thoughtsCards.querySelector('.thought-card').offsetWidth + 16; // width + margin
      const newIndex = Math.round(scrollLeft / cardWidth);
      
      if(newIndex !== currentIndex && newIndex >= 0 && newIndex < indicators.length){
        indicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === newIndex);
        });
        currentIndex = newIndex;
      }
    };
    
    // Listen for scroll events
    thoughtsCards.addEventListener('scroll', updateIndicators);
    
    // Click indicators to scroll to specific card
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        const cardWidth = thoughtsCards.querySelector('.thought-card').offsetWidth + 16;
        thoughtsCards.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        });
      });
    });
    
    // Initialize first indicator as active
    if(indicators.length > 0){
      indicators[0].classList.add('active');
    }
  }
});
