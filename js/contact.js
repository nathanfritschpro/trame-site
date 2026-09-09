/* ============ Vera Studio · Formulaire contact (Formspree + validation) ============ */

(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successBox = document.getElementById('form-success');
  const errorBox = document.getElementById('form-error');
  const submitBtn = form.querySelector('[type="submit"]');
  const submitBtnLabel = submitBtn.querySelector('.btn-label') || submitBtn;
  const newFormBtn = document.getElementById('new-form-btn');
  const FORMSPREE_ENDPOINT = form.dataset.endpoint || 'https://formspree.io/f/YOUR_FORMSPREE_ID';

  // Regex email raisonnable (bloque les cas grossièrement invalides)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const showError = (message, focusField = null) => {
    errorBox.textContent = message;
    errorBox.classList.add('show');
    if (focusField) {
      focusField.classList.add('is-invalid');
      focusField.focus();
    }
  };

  const clearErrors = () => {
    errorBox.classList.remove('show');
    errorBox.textContent = '';
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  };

  // Retire l'état invalide dès que l'utilisateur retape
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('is-invalid'));
    el.addEventListener('change', () => el.classList.remove('is-invalid'));
  });

  const validate = () => {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const project = form.project.value.trim();
    const message = form.message.value.trim();

    if (!name) {
      showError('Merci d\'indiquer votre nom.', form.name);
      return false;
    }
    if (!email) {
      showError('Merci d\'indiquer votre email pour qu\'on puisse vous répondre.', form.email);
      return false;
    }
    if (!EMAIL_RE.test(email)) {
      showError('Cet email ne semble pas valide. Vérifiez le format, par exemple : vous@exemple.fr', form.email);
      return false;
    }
    if (!project) {
      showError('Merci de choisir un type de projet.', form.project);
      return false;
    }
    if (!message) {
      showError('Merci d\'écrire un petit message pour qu\'on comprenne votre besoin.', form.message);
      return false;
    }
    return true;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtnLabel.textContent = 'Envoi…';

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
      showError('L\'envoi a échoué. Écris-nous directement à contact@verastudio.fr, on te répond dans la journée.');
      submitBtn.disabled = false;
      submitBtnLabel.textContent = 'Envoyer';
    }
  });

  // ---- Réinitialiser le formulaire pour envoyer un nouveau message
  if (newFormBtn) {
    newFormBtn.addEventListener('click', () => {
      form.reset();
      clearErrors();
      form.style.display = '';
      successBox.classList.remove('show');
      submitBtn.disabled = false;
      submitBtnLabel.textContent = 'Envoyer';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Petit focus sur le premier champ pour la fluidité
      setTimeout(() => form.name.focus(), 400);
    });
  }
})();
