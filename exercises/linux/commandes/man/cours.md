# La commande `man`

`man` (pour *manual*) affiche le **manuel** d'une commande. C'est la documentation de référence, installée sur la machine elle-même : elle fonctionne sans Internet, comme dans cet environnement.

Savoir lire le manuel, c'est pouvoir apprendre seul n'importe quelle commande. Testez chaque commande à gauche : cliquez sur **Essayer**, puis appuyez sur **Entrée**.

## 1. Ouvrir une page

Donnez à `man` le nom d'une commande :

```bash
man ls
```

La page s'ouvre dans un **lecteur** (le programme `less`). Le terminal est alors occupé par la page, jusqu'à ce que vous la quittiez :

| Touche | Action |
|---|---|
| `↓` `↑` ou `j` `k` | descendre / monter d'une ligne |
| `Espace` / `b` | page suivante / page précédente |
| `g` / `G` | aller au début / à la fin |
| `h` | aide du lecteur (toutes les touches) |
| `q` | **quitter** et retrouver le terminal |

> **Défi** : ouvrez la page de `man` lui-même. Qu'écrivez-vous ?

<details><summary>Voir la réponse</summary>

```bash
man man
```

Eh oui : `man` a son propre manuel. Appuyez sur `q` pour le quitter.
</details>

## 2. La structure d'une page

Toutes les pages suivent le même plan, avec des titres en majuscules :

| Section | Contenu |
|---|---|
| `NAME` | le nom et une description en une ligne |
| `SYNOPSIS` | la **syntaxe** : comment écrire la commande |
| `DESCRIPTION` | l'explication détaillée, puis la liste des options |
| `EXAMPLES` | des exemples (pas toujours présente) |
| `SEE ALSO` | les pages voisines à consulter |

Le `SYNOPSIS` utilise une notation à connaître :
- `[ … ]` : ce qui est entre crochets est **facultatif** ;
- `…` : l'élément peut être **répété** ;
- `MAJUSCULES` : à **remplacer** par votre valeur.

Ainsi, `ls [OPTION]... [FILE]...` se lit : « `ls`, suivi de zéro, une ou plusieurs options, puis de zéro, un ou plusieurs fichiers ».

```bash
man cp
```

> **Défi** : combien de formes d'utilisation le `SYNOPSIS` de `cp` propose-t-il ? Que signifie la deuxième ?

<details><summary>Voir la réponse</summary>

**3 formes**. La deuxième, `cp [OPTION]... SOURCE... DIRECTORY`, copie **un ou plusieurs** fichiers source dans un dossier. Le `...` après `SOURCE` indique qu'on peut en donner plusieurs.
</details>

## 3. Chercher dans une page

Une page de manuel peut être longue : celle de `ls` fait plus de 200 lignes. Inutile de tout faire défiler, le lecteur sait chercher :

| Touche | Action |
|---|---|
| `/motif` puis `Entrée` | chercher `motif` vers le bas |
| `n` | occurrence suivante |
| `N` | occurrence précédente |
| `?motif` | chercher vers le haut |

Ouvrez la page de `ls`, tapez `/-S` puis `Entrée`, et appuyez sur `n` jusqu'à tomber sur la description de l'option :

```bash
man ls
```

> **Défi** : que fait l'option `-S` de `ls` ?

<details><summary>Voir la réponse</summary>

Elle trie par **taille de fichier, du plus gros au plus petit** (*sort by file size, largest first*).

Astuce : la recherche accepte les expressions régulières. Avec `/^ +-S`, vous tombez directement sur la ligne qui décrit l'option, car elle commence par des espaces suivis de `-S`.
</details>

## 4. Les sections du manuel

Le manuel est découpé en **sections numérotées**. Les plus utiles :

| N° | Contenu | Exemple |
|---|---|---|
| **1** | commandes utilisateur | `ls`, `cp`, `passwd` |
| **5** | formats de fichiers de configuration | `/etc/passwd`, `/etc/fstab` |
| **7** | conventions et sujets divers | `regex`, `ascii` |
| **8** | commandes d'administration (souvent pour root) | `useradd`, `mount` |

Les sections 2 et 3 décrivent les fonctions du noyau et des bibliothèques ; elles servent surtout aux programmeurs et ne sont pas installées ici.

Un même nom peut exister dans plusieurs sections. `man -f` (identique à `whatis`) liste toutes les pages d'un nom :

```bash
man -f passwd
```

Sans précision, `man` ouvre la première section trouvée. Pour en choisir une, donnez son numéro **avant** le nom :

```bash
man 5 passwd
```

C'est pour cela que la documentation écrit souvent `passwd(5)` : la page `passwd` de la section 5.

> **Défi** : `crontab` est à la fois une commande et un fichier de configuration. Quelle commande ouvre la page qui décrit le **format du fichier** ?

<details><summary>Voir la réponse</summary>

`man -f crontab` montre `crontab (1)` (la commande) et `crontab (5)` (le format des tables). Il faut donc :

```bash
man 5 crontab
```
</details>

## 5. Trouver une commande dont on ignore le nom

`man -k` (identique à `apropos`) cherche un mot dans les **descriptions** de toutes les pages :

```bash
man -k cpu
```

Chaque ligne donne le nom, la section et la description d'une page. La recherche accepte les expressions régulières : `man -k '^ls'` liste les pages dont le nom commence par `ls`.

Avec plusieurs mots, ajoutez `-a` pour ne garder que les pages qui contiennent **tous** les mots :

```bash
apropos -a list directory
```

> **Défi** : quelle commande affiche des informations sur l'architecture du processeur ?

<details><summary>Voir la réponse</summary>

**`lscpu`**, d'après `man -k cpu` : *display information about the CPU architecture*. Essayez-la !
</details>

> **Défi** : trouvez les deux commandes qui mesurent l'espace disque utilisé (*space usage*).

<details><summary>Voir la réponse</summary>

```bash
apropos "space usage"
```

Résultat : **`df`** (espace utilisé par système de fichiers) et **`du`** (espace occupé par des fichiers et des dossiers).
</details>

## 6. Les commandes sans page : les commandes internes

Essayez :

```bash
man cd
```

Réponse : `No manual entry for cd`. `cd` n'est pas un programme, c'est une commande **interne** (*builtin*) du shell. `type` permet de le savoir :

```bash
type cd ls
```

Pour la documentation des commandes internes, utilisez `help` :

```bash
help cd
```

> **Défi** : `echo` est-il un programme ou une commande interne du shell ?

<details><summary>Voir la réponse</summary>

`type echo` répond `echo is a shell builtin` : c'est une commande interne, donc la doc qui s'applique est `help echo`.

Piège : `man echo` fonctionne aussi, mais décrit le programme `/usr/bin/echo`, qui existe en parallèle et dont les options peuvent différer légèrement.
</details>

## 7. Raccourcis utiles

La plupart des commandes affichent aussi une **aide courte** avec `--help`, sans ouvrir de lecteur :

```bash
ls --help
```

Quand la sortie de `man` est envoyée à une autre commande, elle s'affiche d'un bloc, sans lecteur. On peut donc la filtrer avec `grep` :

```bash
man ls | grep -- -h
```

(Le `--` indique à `grep` que `-h` est le motif cherché, et non une option de `grep`.)

Enfin, `man -w` donne l'emplacement du fichier de la page :

```bash
man -w ls
```

### Mémo

| Commande | Effet |
|---|---|
| `man cmd` | ouvrir le manuel de `cmd` (`q` pour quitter) |
| `/motif`, `n`, `N` | chercher dans la page |
| `man 5 nom` | ouvrir la page `nom` de la section 5 |
| `man -f nom` / `whatis nom` | lister les pages qui portent ce nom |
| `man -k mot` / `apropos mot` | chercher un mot dans toutes les descriptions |
| `type cmd` | programme ou commande interne ? |
| `help cmd` | aide d'une commande interne du shell |
| `cmd --help` | aide courte de la plupart des commandes |

**Bravo : vous savez maintenant trouver seul la documentation de n'importe quelle commande !**
