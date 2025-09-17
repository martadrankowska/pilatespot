document.addEventListener('DOMContentLoaded',()=>{
  const yearEl=document.getElementById('year');
  if(yearEl){yearEl.textContent=new Date().getFullYear();}

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
      note.style.color='#2f614d';
    });
  }
});



