// ─────────────────────────────────────────────────────────────
// TOUT LE CONTENU DU SITE EST ICI. Remplacez-le par le vôtre.
// ─────────────────────────────────────────────────────────────

export const brand = {
  // Logo texte sur deux lignes (remplaçable par une image : logoSrc)
  lines: ['V O T R E', 'M A R Q U E'],
  logoSrc: null,
}

export const socials = [
  { label: 'X', href: '#', icon: 'x' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
  { label: 'Discord', href: '#', icon: 'discord' },
]

export const navLinks = [
  { label: 'Catalogue', to: '/catalogue' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Tarifs', to: '/tarifs' },
  { label: 'Équipes', to: '/equipes' },
  { label: 'Auteurs', to: '/auteurs' },
  { label: 'Étudiants', to: '/etudiants' },
]
export const loginLink = { label: 'Connexion', to: '/connexion' }

// Grille principale : cartes texte (sombres) puis tuiles « logo »
export const highlights = [
  { kind: 'text', title: 'Bacs à sable', text: 'Des environnements vierges prêts à l’emploi', to: '/bacs-a-sable' },
  { kind: 'text', title: 'Exemples', text: 'Découvrez ce que vous pouvez créer', to: '/exemples' },
]

const palette = ['#2563eb', '#16a34a', '#db2777', '#ea580c', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626']
const topics = [
  'Kubernetes', 'Linux', 'Docker', 'Git', 'Terraform', 'Ansible', 'Python', 'Réseau',
  'Sécurité', 'Observabilité', 'Bases de données', 'CI / CD', 'Cloud', 'Go', 'Rust', 'Bash',
  'Nginx', 'Monitoring', 'Service mesh', 'GitOps', 'Stockage', 'Serverless', 'Messagerie', 'IAM',
  'Conteneurs', 'Edge', 'Data', 'IA appliquée', 'Web', 'API', 'Tests', 'Performance',
  'Systèmes', 'Scripting', 'DevSecOps', 'Automatisation', 'Virtualisation', 'Backup', 'DNS',
]
export const topicTiles = topics.map((name, i) => ({
  kind: 'logo',
  name,
  color: palette[i % palette.length],
  caption: i % 5 === 0 ? `${name} — certification` : null,
  author: i % 7 === 3 ? 'par Auteur Exemple' : null,
  to: `/catalogue/${i + 1}`,
}))

// Sections de cartes de contenu (titre + description)
const lorem = [
  'Une série d’exercices pratiques pour progresser pas à pas.',
  'Des scénarios courts pour réviser avant un examen.',
  'Parcours complet, de la découverte aux usages avancés, avec des laboratoires guidés et des corrigés détaillés à chaque étape.',
  'Mettez les mains dans le moteur : cassez, réparez, recommencez.',
  'Ateliers conçus par la communauté.',
]
const makeCards = (prefix, n) => Array.from({ length: n }, (_, i) => ({
  kind: 'content',
  title: `${prefix} ${i + 1}`,
  text: lorem[i % lorem.length],
  to: `/parcours/${prefix.toLowerCase()}-${i + 1}`,
}))

export const sections = [
  { id: 'featured', label: 'À la une', cards: makeCards('Parcours', 6), addTile: true },
  { id: 'popular', label: 'Populaires', cards: makeCards('Atelier', 40), pageSize: 25 },
]

export const footer = {
  columns: [
    { title: null, links: [
      { label: 'À propos', to: '/a-propos' }, { label: 'Explorer', to: '/catalogue' },
      { label: 'Auteurs', to: '/auteurs' }, { label: 'Étudiants', to: '/etudiants' },
      { label: 'Contribuer', to: '/contribuer' }, { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'Confidentialité', to: '/confidentialite' }, { label: 'CGU', to: '/cgu' },
    ] },
    { title: 'Contenu', links: [
      { label: 'Offre Plus', to: '/plus' }, { label: 'FAQ', to: '/faq' },
      { label: 'Tarifs', to: '/tarifs' }, { label: 'Équipes', to: '/equipes' },
      { label: 'Presse', to: '/presse' }, { label: 'Sécurité', to: '/securite' },
      { label: 'Support', to: '/support' },
    ] },
    { title: 'Liens', links: [
      { label: 'Projet partenaire', href: '#' }, { label: 'Comparatif', href: '#' },
      { label: 'Le fondateur', href: '#' },
    ], socials: true },
  ],
}

export const cookieNotice = {
  text: 'Nous utilisons des cookies pour améliorer votre expérience sur ce site.',
  button: 'OK',
}
