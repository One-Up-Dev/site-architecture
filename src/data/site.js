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
    // Rubriques thématiques : le niveau reste une étiquette de l'exercice
    categories: [
      {
        slug: 'commandes', name: 'Commandes',
        summary: 'Une commande par exercice, de ses options courantes à ses pièges.',
        description: 'Chaque fiche est consacrée à une seule commande : ce qu’elle fait, ses options utiles au quotidien, et des défis à résoudre dans un terminal préparé.',
      },
      {
        slug: 'fondamentaux', name: 'Fondamentaux',
        summary: 'Les notions qui font fonctionner un système Linux.',
        description: 'Arborescence, utilisateurs, permissions, processus : les concepts à comprendre pour être à l’aise sur n’importe quelle machine Linux.',
      },
    ],
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
// Identifiant = chemin : <topic>/[<category>/]<slug>. C'est aussi le dossier
// exercises/<id>/ (cours, décor, image) qui rend l'exercice lançable, et l'URL /catalogue/<id>.
// `command` (facultatif) : nom affiché dans l'index des commandes.
export const levels = ['débutant', 'intermédiaire', 'avancé']

export const exercises = [
  { topic: 'linux', category: 'commandes', slug: 'ls', command: 'ls', title: 'La commande ls', summary: 'Lister un dossier, afficher les fichiers cachés, trier par date ou par taille, filtrer avec des motifs.', level: 'débutant', durationMin: 20, featured: true, popular: true },
  { topic: 'linux', category: 'commandes', slug: 'man', command: 'man', title: 'La commande man', summary: 'Lire le manuel, comprendre un SYNOPSIS, chercher dans une page, choisir une section, trouver une commande avec apropos.', level: 'débutant', durationMin: 15 },
  { topic: 'linux', category: 'fondamentaux', slug: 'navigation', title: 'Se repérer dans le système', summary: 'Parcourir l’arborescence, lire et rechercher des fichiers.', level: 'débutant', durationMin: 15, popular: true },
  { topic: 'linux', category: 'fondamentaux', slug: 'permissions', title: 'Permissions et utilisateurs', summary: 'Créer des utilisateurs, régler les droits et comprendre chmod / chown.', level: 'débutant', durationMin: 20 },
  { topic: 'linux', category: 'fondamentaux', slug: 'processus', title: 'Processus et services', summary: 'Observer, prioriser et arrêter des processus.', level: 'intermédiaire', durationMin: 25, popular: true },

  { topic: 'git', slug: 'premier-depot', title: 'Premier dépôt et branches', summary: 'Initialiser un dépôt, faire des commits et travailler avec des branches.', level: 'débutant', durationMin: 20, featured: true },
  { topic: 'git', slug: 'conflits', title: 'Résoudre un conflit de fusion', summary: 'Provoquer puis résoudre proprement un conflit entre deux branches.', level: 'intermédiaire', durationMin: 20, popular: true },

  { topic: 'python', slug: 'ml-uv', title: 'Environnement ML avec uv', summary: 'Créer un environnement virtuel avec uv et y ajouter les librairies d’un projet de machine learning.', level: 'intermédiaire', durationMin: 25, featured: true },
  { topic: 'python', slug: 'scripts', title: 'Premiers scripts', summary: 'Écrire et exécuter des scripts, lire des arguments et des fichiers.', level: 'débutant', durationMin: 15, popular: true },
  { topic: 'python', slug: 'json', title: 'Manipuler des données JSON', summary: 'Lire, transformer et écrire des fichiers JSON.', level: 'débutant', durationMin: 15 },

  { topic: 'docker', slug: 'dockerfile', title: 'Lire un Dockerfile', summary: 'Comprendre chaque instruction d’un Dockerfile existant.', level: 'débutant', durationMin: 15, featured: true },
  { topic: 'docker', slug: 'bonnes-pratiques', title: 'Bonnes pratiques d’image', summary: 'Réduire la taille d’une image et améliorer son cache de construction.', level: 'intermédiaire', durationMin: 20 },
]

export const exerciseId = e => [e.topic, e.category, e.slug].filter(Boolean).join('/')
export const exercisePath = e => `/catalogue/${exerciseId(e)}`

export const topicBySlug = slug => topics.find(t => t.slug === slug)
export const categoryOf = (topic, slug) => topicBySlug(topic)?.categories?.find(c => c.slug === slug)
export const exerciseById = id => exercises.find(e => exerciseId(e) === id)
export const exercisesOf = topic => exercises.filter(e => e.topic === topic)
export const exercisesIn = (topic, category) => exercises.filter(e => e.topic === topic && e.category === category)

/** /catalogue/:topic/:a/:b? → rubrique ou exercice (null si rien ne correspond). */
export function resolveCatalog(topic, a, b) {
  const t = topicBySlug(topic)
  if (!t) return null
  const category = categoryOf(topic, a)
  if (category && !b) return { kind: 'category', topic: t, category }
  const exercise = exerciseById([topic, a, b].filter(Boolean).join('/'))
  if (exercise) return { kind: 'exercise', topic: t, category: category ?? null, exercise }
  return null
}

/** Fil d'Ariane : [{ label, to }], le dernier élément est la page courante. */
export function breadcrumb(topic, category, exercise) {
  const items = [{ label: 'Catalogue', to: '/catalogue' }]
  if (topic) items.push({ label: topic.name, to: `/catalogue/${topic.slug}` })
  if (category) items.push({ label: category.name, to: `/catalogue/${topic.slug}/${category.slug}` })
  if (exercise) items.push({ label: exercise.command ?? exercise.title, to: exercisePath(exercise) })
  return items
}

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
export const categoryTile = (t, c) => {
  const n = exercisesIn(t.slug, c.slug).length
  return { kind: 'content', title: c.name, text: c.summary, meta: `${n} exercice${n > 1 ? 's' : ''}`, to: `/catalogue/${t.slug}/${c.slug}` }
}
export const exerciseTile = e => {
  const where = [topicBySlug(e.topic)?.name, categoryOf(e.topic, e.category)?.name].filter(Boolean).join(' › ')
  return { kind: 'content', title: e.title, text: e.summary, meta: `${where} · ${e.durationMin} min · ${e.level}`, to: exercisePath(e) }
}
