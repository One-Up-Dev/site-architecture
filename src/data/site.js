// ─────────────────────────────────────────────────────────────
// TOUT LE CONTENU DU SITE EST ICI. Remplacez-le par le vôtre.
// ─────────────────────────────────────────────────────────────

export const brand = {
  // Logo texte sur deux lignes (remplaçable par une image : logoSrc)
  lines: ['V O T R E', 'M A R Q U E'],
  logoSrc: null,
}

export const navLinks = [
  { label: 'Catalogue', to: '/catalogue' },
  { label: 'À propos', to: '/a-propos' },
]

// ── Sujets du catalogue ─────────────────────────────────────
export const topics = [
  {
    slug: 'linux', name: 'Linux', color: '#ca8a04',
    summary: 'La ligne de commande et l’administration système.',
    description: 'Naviguez dans le système de fichiers, gérez utilisateurs et permissions, surveillez les processus et automatisez vos tâches en Bash.',
  },
  {
    slug: 'git', name: 'Git', color: '#ea580c',
    summary: 'Versionner son code et travailler à plusieurs.',
    description: 'Créez un dépôt, enregistrez des modifications, travaillez avec des branches et résolvez vos premiers conflits de fusion.',
  },
  {
    slug: 'python', name: 'Python', color: '#2563eb',
    summary: 'Scripts, environnements et data science.',
    description: 'Écrivez des scripts, gérez vos environnements virtuels avec uv et préparez une machine prête pour le machine learning.',
  },
  {
    slug: 'docker', name: 'Docker', color: '#0891b2',
    summary: 'Conteneuriser une application.',
    description: 'Comprenez les images et les conteneurs, lisez et écrivez un Dockerfile, et apprenez les bonnes pratiques de construction.',
  },
]

// ── Exercices (contenu de démonstration) ────────────────────
// Un exercice est lançable quand il a son dossier exercises/<slug>/ (cours, décor, image).
export const exercises = [
  { slug: 'linux-ls', topic: 'linux', title: 'La commande ls', summary: 'Lister un dossier, afficher les fichiers cachés, trier par date ou par taille, filtrer avec des motifs.', level: 'débutant', durationMin: 20, featured: true, popular: true },
  { slug: 'linux-navigation', topic: 'linux', title: 'Se repérer dans le système', summary: 'Parcourir l’arborescence, lire et rechercher des fichiers.', level: 'débutant', durationMin: 15, popular: true },
  { slug: 'linux-permissions', topic: 'linux', title: 'Permissions et utilisateurs', summary: 'Créer des utilisateurs, régler les droits et comprendre chmod / chown.', level: 'débutant', durationMin: 20 },
  { slug: 'linux-processus', topic: 'linux', title: 'Processus et services', summary: 'Observer, prioriser et arrêter des processus.', level: 'intermédiaire', durationMin: 25, popular: true },

  { slug: 'git-premier-depot', topic: 'git', title: 'Premier dépôt et branches', summary: 'Initialiser un dépôt, faire des commits et travailler avec des branches.', level: 'débutant', durationMin: 20, featured: true },
  { slug: 'git-conflits', topic: 'git', title: 'Résoudre un conflit de fusion', summary: 'Provoquer puis résoudre proprement un conflit entre deux branches.', level: 'intermédiaire', durationMin: 20, popular: true },

  { slug: 'python-ml-uv', topic: 'python', title: 'Environnement ML avec uv', summary: 'Créer un environnement virtuel avec uv et y ajouter les librairies d’un projet de machine learning.', level: 'intermédiaire', durationMin: 25, featured: true },
  { slug: 'python-scripts', topic: 'python', title: 'Premiers scripts', summary: 'Écrire et exécuter des scripts, lire des arguments et des fichiers.', level: 'débutant', durationMin: 15, popular: true },
  { slug: 'python-json', topic: 'python', title: 'Manipuler des données JSON', summary: 'Lire, transformer et écrire des fichiers JSON.', level: 'débutant', durationMin: 15 },

  { slug: 'docker-dockerfile', topic: 'docker', title: 'Lire un Dockerfile', summary: 'Comprendre chaque instruction d’un Dockerfile existant.', level: 'débutant', durationMin: 15, featured: true },
  { slug: 'docker-bonnes-pratiques', topic: 'docker', title: 'Bonnes pratiques d’image', summary: 'Réduire la taille d’une image et améliorer son cache de construction.', level: 'intermédiaire', durationMin: 20 },
]

export const topicBySlug = slug => topics.find(t => t.slug === slug)
export const exerciseBySlug = slug => exercises.find(e => e.slug === slug)
export const exercisesOf = slug => exercises.filter(e => e.topic === slug)

// ── Sections de la page d'accueil ───────────────────────────
export const sections = [
  { id: 'featured', label: 'À la une', exercises: exercises.filter(e => e.featured) },
  { id: 'popular', label: 'Populaires', exercises: exercises.filter(e => e.popular) },
]

export const footer = {
  links: [
    { label: 'Catalogue', to: '/catalogue' },
    { label: 'À propos', to: '/a-propos' },
    { label: 'Mentions légales', to: '/mentions-legales' },
  ],
  copyright: `© ${new Date().getFullYear()} Votre Marque`,
}

// ── Conversion en tuiles pour la grille ─────────────────────
export const topicTile = t => ({ kind: 'logo', name: t.name, color: t.color, caption: t.summary, to: `/catalogue/${t.slug}` })
export const exerciseTile = e => ({
  kind: 'content',
  title: e.title,
  text: e.summary,
  meta: `${topicBySlug(e.topic)?.name ?? ''} · ${e.durationMin} min · ${e.level}`,
  to: `/exercices/${e.slug}`,
})
