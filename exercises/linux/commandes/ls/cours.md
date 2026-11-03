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

## 6. Parcourir les sous-dossiers : `-R`

`-R` (*récursif*, avec un R **majuscule**) liste un dossier, puis chacun de ses sous-dossiers, et ainsi de suite :

```bash
ls -R
```

Pratique pour avoir une vue d'ensemble d'un petit projet. Sur un gros dossier, la sortie peut devenir très longue.

> **Défi** : dans quel dossier se trouve `convert.py` ?

<details><summary>Voir la réponse</summary>

Dans **`src`**. La sortie de `ls -R` contient une section `./src:` qui le liste.
</details>

## 7. Filtrer : motifs et `-d`

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

## 8. Combiner les options

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
