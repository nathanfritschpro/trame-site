/* ============ TRAME · Formulaire contact (Formspree) ============ */

(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successBox = document.getElementById('form-success');
  const errorBox = document.getElementById('form-error');
  const submitBtn = form.querySelector('[type="submit"]');

  // ⚠️ Remplacer par le vrai Formspree endpoint (dans .env.local puis remplacé au build,
  // ou en dur ici après création du form, voir README)
  const FORMSPREE_ENDPOINT = form.dataset.endpoint || 'https://formspree.io/f/YOUR_FORMSPREE_ID';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('show');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi…';

    const data = new FormData(form);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.style.display = 'none';
        successBox.classList.add('show');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error('Réponse serveur non OK');
      }
    } catch (err) {
      errorBox.textContent = "L'envoi a échoué. Écris-nous directement à contact@trame.fr, on te répond dans la journée.";
      errorBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer';
    }
  });
})();
