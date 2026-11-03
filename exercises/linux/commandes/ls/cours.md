# La commande `ls`

`ls` (pour *list*) affiche le contenu d'un dossier. C'est sans doute la commande que vous taperez le plus souvent dans un terminal Linux.

Vous êtes dans **`/root/projet`**, un petit projet fictif préparé pour cet exercice. Testez chaque commande à gauche : cliquez sur **Essayer** pour la copier dans le terminal, puis appuyez sur **Entrée**.

## 1. Lister un dossier

Sans argument, `ls` liste le dossier courant :

```bash
ls
```

On peut aussi lui donner le chemin d'un autre dossier :

```bash
ls src
```

Les noms affichés en **bleu** sont des dossiers et ceux en **vert** des fichiers exécutables. Le **cyan** signale un lien symbolique.

> **Défi** : combien de fichiers contient le dossier `docs` ?

<details><summary>Voir la réponse</summary>

`ls docs` affiche **3 fichiers** : `changelog.md`, `guide.md` et `schema.png`.
</details>

## 2. Le format long : `-l`

L'option `-l` affiche une ligne détaillée par élément :

```bash
ls -l
```

De gauche à droite :

| Colonne | Exemple | Signification |
|---|---|---|
| Type et droits | `-rw-r--r--` | `d` = dossier, `l` = lien, `-` = fichier |
| Liens | `1` | nombre de liens physiques |
| Propriétaire | `root` | utilisateur propriétaire |
| Groupe | `root` | groupe propriétaire |
| Taille | `52` | en octets |
| Date | `Jul 14 2024` | dernière modification |
| Nom | `README.md` | et, pour un lien, sa cible : `dernier.log -> logs/app.log` |

> **Défi** : quel est le seul fichier exécutable du dossier `scripts` ? À quoi le reconnaît-on ?

<details><summary>Voir la réponse</summary>

`ls -l scripts` affiche `deploy.sh` avec des droits `-rwxr-xr-x`. Le **`x`** signifie « exécutable ».
</details>

## 3. Les fichiers cachés : `-a`

Sous Linux, un fichier dont le nom commence par un **point** est caché. `ls` ne l'affiche pas par défaut ; `-a` (*all*) les montre tous :

```bash
ls -a
```

Deux entrées spéciales apparaissent toujours :
- `.` désigne le dossier courant ;
- `..` désigne le dossier parent.

> **Défi** : combien d'éléments cachés (hors `.` et `..`) contient `/root/projet` ?

<details><summary>Voir la réponse</summary>

**3** : `.config` (un dossier), `.env` et `.gitignore`.
</details>

## 4. Des tailles lisibles : `-h`

Avec `-l`, les tailles s'affichent en octets, ce qui devient vite illisible. Ajoutez `-h` (*human-readable*) :

```bash
ls -lh logs
```

`ls` affiche alors `K` pour kilo-octets, `M` pour méga-octets et `G` pour giga-octets.

> **Défi** : quelle est la taille de `logs/app.log` ?

<details><summary>Voir la réponse</summary>

Environ **5,0 M** (5 Mo), alors que `erreurs.log` ne fait que quelques octets.
</details>

## 5. Trier par date : `-t` et `-r`

`-t` trie du plus **récent** au plus **ancien** :

```bash
ls -lt
```

`-r` (*reverse*) inverse l'ordre de n'importe quel tri. Combiné à `-t`, il place le plus ancien en premier et le plus récent **en bas**, juste au-dessus de votre prochaine commande :

```bash
ls -ltr
```

> **Défi** : quel est le fichier le plus ancien à la racine du projet ?

<details><summary>Voir la réponse</summary>

**`notes.txt`**, modifié le 1er mars 2024 : il apparaît en tête de `ls -ltr`.
</details>

## 6. Les trois dates d'un fichier : `-tc` et `-tu`

En réalité, Linux enregistre **trois dates** pour chaque fichier :

| Nom | Ce qu'elle mesure | Elle change quand… | Option |
|---|---|---|---|
| **mtime** (*modification*) | dernière modification du **contenu** | on écrit dans le fichier | `-t` |
| **ctime** (*change*) | dernier changement des **métadonnées** : droits, propriétaire, nom, nombre de liens… | `chmod`, `chown`, `mv`… et aussi à chaque écriture | `-tc` |
| **atime** (*access*) | dernière **lecture** | on lit le fichier (`cat`, `less`…) | `-tu` |

Attention : le **c** de ctime veut dire *change*, pas *création*.

La commande `stat` affiche les trois dates d'un fichier : `Access` (atime), `Modify` (mtime) et `Change` (ctime). La ligne `Birth`, quand elle existe, est la vraie date de création.

```bash
stat README.md
```

Avec `-l`, l'option `-c` affiche la ctime à la place de la mtime, et `-u` affiche l'atime. Combinées à `-t`, elles **trient** aussi selon cette date :

```bash
ls -ltc
```

```bash
ls -ltu
```

> **Défi** : d'après `ls -l`, `README.md` a été modifié le 14 juillet 2024. Quand a-t-il été **lu** pour la dernière fois ? (Répondez sans l'ouvrir !)

<details><summary>Voir la réponse</summary>

`ls -lu README.md` affiche **le 1er octobre 2025** : le fichier a été lu après sa dernière modification.
</details>

> **Défi** : pourquoi `ls -ltc` affiche-t-il la date d'aujourd'hui pour presque tous les fichiers ?

<details><summary>Voir la réponse</summary>

Parce que la ctime **ne peut pas être réglée à la main**. Le système la met à l'heure courante à chaque changement de métadonnées. Les dates anciennes de ce projet ont été posées avec `touch` au lancement de l'environnement, ce qui a justement mis la ctime à jour à ce moment-là. C'est pour cela que la ctime sert aux outils de sauvegarde et aux enquêtes de sécurité : elle est plus difficile à falsifier que la mtime.
</details>

### Expérience : faire bouger chaque date

**1. Changer les droits** de `notes.txt` (seules les métadonnées changent) :

```bash
chmod 600 notes.txt
```

Comparez les deux tris :

```bash
ls -lt
```

```bash
ls -ltc
```

`notes.txt` reste **en bas** de `ls -lt`, puisque son contenu n'a pas changé. En revanche, il passe **en tête** de `ls -ltc`.

**2. Lire** `todo.txt` :

```bash
cat todo.txt
```

```bash
ls -ltu
```

`todo.txt` passe en tête : son atime vient d'être mise à jour. Sa mtime et sa ctime n'ont pas bougé.

**3. Écrire** dans `todo.txt` :

```bash
echo "tester le déploiement" >> todo.txt
```

```bash
ls -lt
```

`todo.txt` est maintenant en tête de `ls -lt` **et** de `ls -ltc` : écrire change le contenu (mtime), donc aussi la taille, qui fait partie des métadonnées (ctime).

> **Bon à savoir** : la plupart des systèmes utilisent l'option de montage `relatime`. L'atime n'est alors mise à jour à la lecture que si elle est plus ancienne que la mtime, ou si la dernière lecture date de plus de 24 h. Cela évite une écriture sur le disque à chaque lecture, mais il ne faut pas se fier à l'atime à la seconde près.

> **Défi** : quelle commande liste les fichiers du **moins récemment lu** au **plus récemment lu**, le dernier lu tout en bas ?

<details><summary>Voir la réponse</summary>

```bash
ls -ltur
```

`-u` trie par date de lecture et `-r` inverse l'ordre.
</details>

## 7. Parcourir les sous-dossiers : `-R`

`-R` (*récursif*, avec un R **majuscule**) liste un dossier, puis chacun de ses sous-dossiers, et ainsi de suite :

```bash
ls -R
```

Pratique pour avoir une vue d'ensemble d'un petit projet. Sur un gros dossier, la sortie peut devenir très longue.

> **Défi** : dans quel dossier se trouve `convert.py` ?

<details><summary>Voir la réponse</summary>

Dans **`src`**. La sortie de `ls -R` contient une section `./src:` qui le liste.
</details>

## 8. Filtrer : motifs et `-d`

Le shell remplace `*` par « n'importe quelle suite de caractères ». Pour ne lister que les fichiers texte :

```bash
ls *.txt
```

Pour lister **uniquement les dossiers**, on combine le motif `*/` et l'option `-d`, qui affiche le dossier lui-même plutôt que son contenu :

```bash
ls -d */
```

> **Défi** : comment lister tous les fichiers Markdown (`.md`) du dossier `docs` ?

<details><summary>Voir la réponse</summary>

```bash
ls docs/*.md
```

Résultat : `docs/changelog.md` et `docs/guide.md`.
</details>

## 9. Combiner les options

Les options courtes se regroupent derrière un seul tiret. Ces deux commandes sont équivalentes :

```bash
ls -l -a -h -t -r
```

```bash
ls -lahtr
```

### Mémo

| Commande | Effet |
|---|---|
| `ls` | contenu du dossier courant |
| `ls chemin` | contenu d'un autre dossier |
| `ls -l` | format long (droits, taille, date) |
| `ls -a` | inclure les fichiers cachés |
| `ls -h` | tailles lisibles (avec `-l`) |
| `ls -t` | trier par date (récent en premier) |
| `ls -ltc` | trier par ctime (changement des métadonnées) |
| `ls -ltu` | trier par atime (dernière lecture) |
| `ls -r` | inverser le tri |
| `ls -R` | parcourir les sous-dossiers |
| `ls -d */` | seulement les dossiers |
| `ls *.txt` | seulement les fichiers qui correspondent au motif |

Pour aller plus loin, toutes les options sont décrites dans le manuel :

```bash
man ls
```

(Appuyez sur `q` pour quitter le manuel.)

**Bravo, vous maîtrisez l'essentiel de `ls` !**
