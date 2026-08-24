from pathlib import Path
import re

source = Path('/home/ubuntu/atelier-gateaux-algerie/research/facebook-diffusion-options.md')
target = Path('/home/ubuntu/atelier-gateaux-algerie/research/facebook-directory-100.md')
text = source.read_text(encoding='utf-8')

sections = []
current_section = 'Non classé'
for line in text.splitlines():
    if line.startswith('### '):
        current_section = line[4:].strip()
    for name, url in re.findall(r'\[([^\]]+)\]\((https?://[^)]+)\)', line):
        sections.append((name.replace('|', '/'), url, current_section))

unique = []
seen = set()
for name, url, section in sections:
    if url not in seen:
        seen.add(url)
        unique.append((name, url, section))

local_terms = ('alger', 'tipaza', 'fouka', 'koléa', 'kolea', 'cherchell', 'hadjout', 'bou ismaïl', 'bousmaïl', 'staoueli', 'ouled fayet', 'birkhadem', 'boumerdès', 'boumerdes', 'el harrach', 'hussein dey', 'zéralda', 'zeralda', 'ain benian', 'aïn el benian', 'kouba', 'baba hassen', 'draria', 'ben aknoun', 'el biar', 'bordj el bahri', 'dar el beïda', 'dar el beida', 'birtouta', 'blida', 'gouraya')

def classify(section, name, url):
    haystack = f'{section} {name} {url}'.lower()
    locality = 'Alger–Tipaza / commune proche' if any(term in haystack for term in local_terms) else 'Autre wilaya ou localisation à confirmer'
    kind = 'Groupe' if '/groups/' in url else 'Page/profil'
    if 'instagram' in url:
        kind = 'Hors Facebook'
    return locality, kind

rows = []
for idx, (name, url, section) in enumerate(unique, 1):
    locality, kind = classify(section, name, url)
    rows.append(f'| {idx} | {name} | {url} | {locality} | {kind} | Autorisation à obtenir | À qualifier individuellement ; aucun partage automatique |')

local_count = sum('Alger–Tipaza / commune proche' in row for row in rows)
content = '''# Répertoire Facebook — inventaire structuré\n\nCe document reprend les liens Facebook uniques repérés dans les recherches publiques. **Le statut par défaut de chaque entrée est « Autorisation à obtenir »** : aucun espace tiers n’est autorisé pour la publication automatique. Les nombres d’abonnés ou d’interactions ne sont indiqués que lorsqu’ils ont été observés dans les sources de recherche ; aucune audience n’est inventée.\n\n## Inventaire des liens uniques\n\n| N° | Espace | URL | Zone détectée | Type | Statut d’autorisation | Décision opérationnelle |\n|---:|---|---|---|---|---|---|\n''' + '\n'.join(rows) + f'''\n\n**Total dédoublonné : {len(unique)} liens.** Candidats détectés comme Alger–Tipaza ou communes proches par les intitulés et sections : **{local_count}**. Ce classement automatique doit être relu avant toute prise de contact.\n\n## Règle de diffusion\n\nLa seule destination configurée pour la publication automatique est la Page Facebook **« gâteau algérien »**. Les 100 entrées ci-dessus sont un répertoire de recherche et de prospection ; elles ne constituent pas une autorisation de publier. Toute diffusion vers une Page ou un groupe tiers exige un accord explicite de son propriétaire ou de ses administrateurs, et les groupes qui interdisent la publicité restent exclus.\n\n## Limite de qualification\n\nLe total de 100 liens ne signifie pas que 100 espaces ont une audience comparable ni qu’ils sont tous situés à Alger ou Tipaza. Les entrées marquées « Autre wilaya ou localisation à confirmer » doivent rester hors du ciblage local jusqu’à vérification.\n'''
target.write_text(content, encoding='utf-8')
print(f'liens_uniques={len(unique)} local_detectes={local_count} fichier={target}')
