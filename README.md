# Trame — site vitrine du duo

Site vitrine + portfolio du duo Nathan & Manon Fritsch. HTML + CSS + JS vanilla, zéro framework, hébergé sur Vercel.

## Stack

- HTML statique + CSS (design tokens) + JS vanilla
- Google Fonts : Newsreader + Inter
- Formulaire : Formspree (endpoint à définir)
- Hébergement : Vercel (Hobby)
- Domaine : à déterminer (trame.fr est pris, cf notes)

## Démarrage local

Aucun build. Un simple serveur statique suffit :

```bash
cd site-trame
python3 -m http.server 4200
# ou : npx serve -l 4200 .
```

Puis ouvre `http://localhost:4200/`.

## Structure

```
site-trame/
├── index.html                homepage
├── portfolio.html            galerie complète
├── contact.html              formulaire Formspree
├── mentions-legales.html
├── projets/                  5 pages case study
├── css/                      tokens, base, composants, pages
├── js/                       main, contact
├── assets/                   grain, logo, images projets
└── favicon/
```

## Formulaire de contact (Formspree)

1. Créer un formulaire sur https://formspree.io (gratuit, 50 soumissions/mois)
2. Copier l'URL fournie (format `https://formspree.io/f/xyzabcde`)
3. Renseigner l'endpoint de deux manières possibles :
   - **Simple (recommandé)** : éditer `contact.html`, ajouter l'attribut `data-endpoint="https://formspree.io/f/xyzabcde"` sur `<form id="contact-form">`
   - **Ou** : remplacer la constante `FORMSPREE_ENDPOINT` dans `js/contact.js`

Ne pas commit l'endpoint réel : soit tu le mets seulement en prod, soit tu le mets et c'est OK — Formspree est côté client, pas de secret sensible, juste une ligne à changer si tu changes de fournisseur.

## Déploiement Vercel

1. Aller sur https://vercel.com/new
2. Importer le repo `nathanfritschpro/trame-site`
3. Framework preset : **Other** (rien à build)
4. Root directory : laisser vide
5. Cliquer **Deploy**

Vercel te donne une URL du type `trame-site-xxxx.vercel.app`. Une fois le domaine choisi, l'ajouter dans **Settings → Domains**.

## Domaine

`trame.fr` est déjà pris (Hexanet, exp. mai 2027). Alternatives à vérifier chez OVH ou Gandi :
- `trame.studio`
- `trame.co`
- variantes avec "atelier", "duo", "studio"

Une fois le domaine acquis, dans Vercel : Settings → Domains → Add, suivre les DNS.

## OG images

Pour l'instant, les meta `og:image` pointent vers les images de projet (ou vers `/assets/og/og-home.jpg` qui n'existe pas encore). À faire : créer les OG images 1200×630 avec le logo Trame et un visuel par page, puis les mettre dans `/assets/og/`.

## À faire avant mise en ligne publique

- [ ] Renseigner statut juridique dans `mentions-legales.html`
- [ ] Créer et brancher l'endpoint Formspree
- [ ] Créer OG images 1200×630
- [ ] Acquérir le domaine et configurer Vercel
- [ ] Retirer `noindex` (aucun `noindex` sur ce site — bien vérifier avant mise en ligne)
- [ ] Vérifier tous les liens vers les previews Vercel des clients (déjà OK)

## Notes design

Direction visuelle : **Grain** — lin brut, vert forêt, laiton doux.
- Fond `#EFE8DA`, texte `#1E2E24`, accent `#C9A87A`, sauge `#7A8B7C`
- Typographies : Newsreader (display italique) + Inter (texte)
- Grain SVG en overlay fixed sur toutes les pages
- Curseur custom discret desktop uniquement
