#!/bin/bash
# Décor de l'exercice « ls » : un petit projet fictif dans /root/projet
set -euo pipefail
P=/root/projet
rm -rf "$P"
mkdir -p "$P"/{src,docs,scripts,logs,.config}
cd "$P"

# Fichiers visibles
printf '# Projet météo\nPetit outil qui récupère et affiche la météo.\n' > README.md
printf 'Idées : ajouter des graphiques, exporter en CSV.\n' > notes.txt
printf 'acheter du café\nrelire le code\n' > todo.txt
printf 'print("bonjour")\n' > src/main.py
printf 'def celsius(f):\n    return (f - 32) * 5 / 9\n' > src/convert.py
printf '# Guide\nInstallation et usage.\n' > docs/guide.md
printf '# Changements\n- v1.0 : première version\n' > docs/changelog.md
head -c 2048 /dev/urandom > docs/schema.png
printf '#!/bin/bash\necho "Déploiement..."\n' > scripts/deploy.sh
chmod +x scripts/deploy.sh
head -c 5242880 /dev/zero | tr '\0' 'x' > logs/app.log          # ~5 Mo
printf 'erreur: disque presque plein\n' > logs/erreurs.log
ln -s logs/app.log dernier.log

# Fichiers cachés
printf 'API_KEY=a-remplacer\n' > .env
printf 'logs/\n.env\n' > .gitignore
printf 'theme=sombre\n' > .config/preferences

# Dates variées (pour ls -t / -r)
touch -d '2023-11-02 09:15' docs/changelog.md
touch -d '2024-03-01 14:00' notes.txt
touch -d '2024-07-14 10:30' README.md
touch -d '2025-01-20 08:45' todo.txt
touch -d '2025-06-05 17:20' src/main.py
touch -h -d '2025-09-10 12:00' dernier.log

# Ouvrir les shells dans le projet
grep -q 'cd /root/projet' /root/.bashrc 2>/dev/null || echo 'cd /root/projet 2>/dev/null' >> /root/.bashrc
