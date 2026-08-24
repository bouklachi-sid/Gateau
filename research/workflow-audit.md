# Audit du workflow de publication

## État opérationnel constaté

Preuve visuelle conservée : `/home/ubuntu/webdev-static-assets/preuve-dashboard-automatisation-active.png`.

Vérification textuelle exécutée : `pageName = "gâteau algérien"`, `connectionStatus = "connected"`, `automationEnabled = true`, `maxPostsPerDay = 10`.

| Élément | État | Vérification disponible | Action d’optimisation |
|---|---|---|---|
| Page de destination | Connectée : `gâteau algérien` | Test Meta réussi et carte « Connexion Meta : OK » | Conserver cette Page comme unique destination automatique |
| Automatisation | Active | Carte « Automatisation active » du tableau de bord | Conserver l’interrupteur d’arrêt immédiat comme garde-fou |
| Plafond quotidien | 10 publications | Carte « 10/10 » et limite affichée à 10 | Ne pas créer de publication supplémentaire aujourd’hui |
| Créneaux actifs | 10 | Tableau de bord filtré sur `isActive = 1` | Garder les créneaux inactifs hors du calendrier affiché |
| Publications du jour | 10 contenus arabes prêts | Photos téléversées et contenus planifiés | Laisser Heartbeat les traiter à leurs créneaux |
| Partages tiers | Non activés | Aucune permission tierce enregistrée | Demander une autorisation avant tout ajout de destination |

## Les dix créneaux actifs — heure Algérie

| Heure | Libellé | Types privilégiés |
|---|---|
| 08:30 | Douceur du matin | traditionnel, produit |
| 09:00 | Matin traditionnel | traditionnel, produit |
| 10:15 | Sélection raffinée | produit, engagement |
| 11:30 | Offre de midi | offre, commercial |
| 13:00 | Coffret gourmand | produit, commercial |
| 14:30 | Création moderne | produit, engagement |
| 16:00 | Pause élégante | traditionnel, produit |
| 17:30 | Visuel gourmand | produit, commercial |
| 19:00 | Cadeau et réception | offre, engagement |
| 20:30 | Rappel de commande | commercial, produit |

## Priorités de fonctionnement

Le workflow est optimisé autour d’un seul mécanisme durable : le planificateur Heartbeat contrôle les créneaux sans dépendre d’un navigateur ouvert. Les publications d’aujourd’hui sont déjà préparées en arabe avec des photos téléversées, ce qui évite une génération d’image au moment de la diffusion.

Les points à surveiller restent la première exécution qui traite effectivement un contenu, le remplacement des anciens visuels contenant le précédent numéro lorsque la capacité de génération d’image sera disponible, ainsi que les demandes d’autorisation auprès des communautés tierces. Aucune diffusion vers un groupe ou une autre Page ne doit être activée avant cet accord.

## État du planificateur

Les derniers cycles Heartbeat ont répondu avec le statut HTTP `200` et `processed: 0`. Ce résultat est attendu avant la première fenêtre de diffusion du jour : le premier contenu planifié est à 08:30, heure Algérie. La prochaine vérification doit confirmer le traitement d’un contenu à partir de ce créneau.

## Contrôle Heartbeat — 24 août 2026, avant le premier créneau

Le job `facebook-patisserie-1` est actif sur `/api/scheduled/publish-due-content` avec la fréquence `0 */5 * * * *`. La consultation de son historique montre 16 exécutions non manuelles réussies en HTTP 200, sans erreur, mais avec `{"ok":true,"processed":0}`. Cette observation confirme que le callback répond correctement ; elle ne constitue pas encore la preuve qu’un créneau de publication a été atteint. La validation `processed > 0`, d’un statut `published` et d’un `metaPostId` reste à effectuer après le premier créneau dû (08:30, heure d’Alger). Une lecture de contrôle en base confirme `enabled=1`, `limit=10`, `task=3DCrGL6y7NRS46RvYZsayG` et `stopped=null` ; la mention « en pause » observée dans une capture de chargement n’est donc pas l’état persistant du workflow.
