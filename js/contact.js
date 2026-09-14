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

  // ---- Préremplissage via ?devis=<slug>
  const DEVIS_TEMPLATES = {
    'site-basique':      { label: 'Site internet, formule Basique',              project: 'site' },
    'site-complet':      { label: 'Site internet, formule Complet',              project: 'site' },
    'site-optimise':     { label: 'Site internet, formule Optimisé',             project: 'site' },
    'app-cadrage':       { label: 'Application métier, audit et cadrage',        project: 'application' },
    'app-simple':        { label: 'Application métier, formule Simple',          project: 'application' },
    'app-complete':      { label: 'Application métier, formule Complète',        project: 'application' },
    'app-suivi':         { label: 'Application métier, maintenance et évolutions', project: 'application' },
    'photo-video':       { label: 'Photo, vidéo ou drone',                       project: 'combine' },
    'chef-de-projet':    { label: 'Chef de projet digital',                      project: 'chef-de-projet' },
    'option-reservation':{ label: 'Option : réservation ou commande intégrée',   project: 'site' },
    'option-redaction':  { label: 'Option : rédaction de textes',                project: 'site' },
    'option-page-supp':  { label: 'Option : page supplémentaire',                project: 'site' },
    'option-reprise':    { label: 'Option : reprise de contenus',                project: 'site' },
    'option-suivi':      { label: 'Option : suivi annuel',                       project: 'site' },
    'global':            { label: 'Chiffrage global (plusieurs prestations)',    project: 'combine' },
  };

  const prefillFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('devis');
    if (!slug || !DEVIS_TEMPLATES[slug]) return;
    const tpl = DEVIS_TEMPLATES[slug];

    if (form.project) {
      const opt = Array.from(form.project.options).find(o => o.value === tpl.project);
      if (opt) form.project.value = tpl.project;
    }
    if (form.message && !form.message.value.trim()) {
      form.message.value =
`Bonjour,

Je souhaite obtenir un devis gratuit pour : ${tpl.label}.

Voici quelques éléments sur mon projet :
`;
    }
    // Petit repère visuel : on scrolle sur le form et on focus le premier champ vide
    requestAnimationFrame(() => {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (!form.name.value.trim()) form.name.focus();
      }, 400);
    });
  };
  prefillFromQuery();

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
