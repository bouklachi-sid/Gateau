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
| Publications du jour | 2 publiées, 8 en attente de conformité | Les visuels restants ne sont pas encore approuvés avec le numéro dans l’image | Bloquer Heartbeat jusqu’à validation manuelle de chaque visuel |
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

Le workflow est optimisé autour d’un seul mécanisme durable : le planificateur Heartbeat contrôle les créneaux sans dépendre d’un navigateur ouvert. Il n’envoie toutefois plus un contenu au seul motif qu’un créneau est dû : les contenus image restent en attente tant qu’un visuel réellement retouché n’a pas été contrôlé puis approuvé manuellement.

Les points à surveiller restent la première exécution qui traite effectivement un contenu approuvé, le remplacement des anciens visuels contenant le précédent numéro lorsque la capacité de génération d’image sera disponible, ainsi que les demandes d’autorisation auprès des communautés tierces. Aucune diffusion vers un groupe ou une autre Page ne doit être activée avant cet accord.

## État du planificateur

Les derniers cycles Heartbeat ont répondu avec le statut HTTP `200` et `processed: 0`. Ce résultat est attendu avant la première fenêtre de diffusion du jour : le premier contenu planifié est à 08:30, heure Algérie. La prochaine vérification doit confirmer le traitement d’un contenu à partir de ce créneau.

## Contrôle Heartbeat — 24 août 2026, avant le premier créneau

Le job `facebook-patisserie-1` est actif sur `/api/scheduled/publish-due-content` avec la fréquence `0 */5 * * * *`. La consultation de son historique montre 16 exécutions non manuelles réussies en HTTP 200, sans erreur, mais avec `{"ok":true,"processed":0}`. Cette observation confirme que le callback répond correctement ; elle ne constitue pas encore la preuve qu’un créneau de publication a été atteint. La validation `processed > 0`, d’un statut `published` et d’un `metaPostId` reste à effectuer après le premier créneau dû (08:30, heure d’Alger). Une lecture de contrôle en base confirme `enabled=1`, `limit=10`, `task=3DCrGL6y7NRS46RvYZsayG` et `stopped=null` ; la mention « en pause » observée dans une capture de chargement n’est donc pas l’état persistant du workflow.

## Réparation de l’authentification Heartbeat

Le job initial, lié à un cookie utilisateur, a commencé à répondre HTTP 403 avec `permission error for cron cookie`. Il est désormais désactivé. Le workflow est relié au job propriétaire `facebook-patisserie-owner-1` (`task_uid` `5jg4zEk5QqkKfiqL8HhENb`), activé à la cadence de cinq minutes. Son premier cycle a répondu HTTP 200 avec `{"ok":true,"processed":0}`, ce qui confirme le rétablissement de l’authentification et l’absence de contenu dû avant le premier créneau.

## Essai de publication avec photo — validé

Le visuel chargé `post-01_e8b84c07.jpeg` et sa légende arabe ont été publiés avec succès sur la Page `gâteau algérien`. Meta a retourné l’identifiant de publication `1313747908483475_122102618601447468` et l’identifiant média `122102618565447468`. Le contenu interne `30001` est enregistré au statut `published` avec cet identifiant, ce qui empêche sa republication automatique à 08:30.

La cause du premier refus HTTP 403 était l’utilisation directe d’un jeton utilisateur vers l’endpoint de publication. La logique applicative résout désormais le jeton spécifique de la Page à partir de `/me/accounts` avant chaque envoi ; les tests automatisés associés sont réussis.

La vérification visuelle sur Facebook confirme que la publication est visible sur la Page `gâteau algérien`, avec le titre arabe, la photo de pâtisseries, le numéro `0555 18 84 55` et les hashtags attendus.

Les passages suivants du job propriétaire restent réguliers et réussis (HTTP 200, `processed: 0`) tant qu’aucun nouveau créneau n’est dû, notamment à 03:09 et 03:14 UTC. Le mécanisme de planification est donc opérationnel ; la prochaine preuve attendue est un passage avec `processed > 0` sur une des neuf publications encore programmées.

## Demande d’autorisation de diffusion tierce — 24 août 2026

Une première demande d’autorisation a été envoyée via Messenger à **Fatiha Abbad**, administratrice vérifiée du groupe public **« Gâteau »** (`https://www.facebook.com/groups/474927960344250/`, 13,8 K membres observés). La demande en arabe sollicite explicitement le droit de partager une seule publication et confirme le respect des règles du groupe. Aucun contenu n’a été publié dans le groupe ; le statut reste **en attente de réponse et d’autorisation explicite**.

## Reprise confirmée après renouvellement Meta — 24 août 2026

Le jeton Meta renouvelé a été validé par un test live Graph API. Il s’agit d’un jeton de Page direct ; la logique et le script de publication acceptent désormais ce cas sans tenter l’endpoint `me/accounts` réservé à un jeton utilisateur. La publication programmée **« حلوى بيضاء لذوق ناعم »** a ensuite été envoyée avec succès sur la Page **« gâteau algérien »**, identifiant Meta `1313747908483475_122102637075447468`, puis vérifiée visuellement à l’adresse `https://www.facebook.com/61593424064482/posts/122102637075447468/`. Le contenu interne `30002` est enregistré avec le statut `published` afin d’empêcher toute republication automatique.

À ce stade, aucune autorisation tierce n’a encore été reçue. La publication est donc diffusée sur la Page propriétaire uniquement, conformément à la règle de consentement explicite.

## Verrou de conformité visuelle — ajouté le 24 août 2026

Chaque nouvelle publication doit désormais être au format image. Le job Heartbeat bloque sans appel à Meta tout contenu qui ne satisfait pas toutes les conditions suivantes : une image est associée depuis la médiathèque avec le statut persistant **`retouched`** ; cette référence de média n’est pas déjà approuvée pour un autre post ; elle a été validée manuellement ; le gâteau d’origine est confirmé comme préservé ; le numéro exact **0555 18 84 55** est confirmé lisible à l’intérieur de l’image ; les cinq composantes de la mise en scène — décor, éclairage, angle, accessoires et ambiance — sont renseignées et aucune ne reprend une valeur déjà approuvée pour une autre publication. Un média déclaré `original` reste refusé par la route d’association, par la validation et par le runner, même si un client tente de le présenter comme retouché. Un blocage conserve le statut programmé, explique le correctif attendu dans le journal et n’est pas compté comme une publication échouée.

L’interface Contenus permet d’associer un visuel de la médiathèque et d’exécuter cette checklist. Cette validation est volontairement humaine : l’application ne prétend ni détecter automatiquement le texte dans l’image ni certifier par IA que le gâteau a été préservé. Les visuels déjà chargés sont tous considérés **en attente de contrôle** ; aucun ancien visuel n’est rétroactivement approuvé.

La préparation du visuel de remplacement de la dernière publication a été tentée avec la démo gratuite en ligne **Qwen Image Edit** : la photo source et la consigne commerciale ont été acceptées, mais l’exécution a été refusée par la démo avec l’erreur `ZeroGPU illegal duration` (240 secondes demandées au-delà de la durée maximale autorisée). Aucun rendu n’a donc été créé, certifié, associé ou publié. Un futur rendu ne sera associé, approuvé puis publié qu’après vérification visuelle du gâteau, de la scène commerciale distincte et du numéro exact.

## Essai Gemini — nouvelle publication en cours de contrôle

La photo source `post-03.jpeg` a été importée dans Gemini avec une consigne de décor noyer clair, fond sable, lumière latérale de fin d’après-midi, branches d’olivier, tasse dorée et numéro exact `0555 18 84 55` en bas à droite. Gemini a produit un premier rendu. Ce rendu reste **non associé, non certifié et non publié** tant que la comparaison avec le fichier source ne confirme pas que chaque gâteau et le plateau restent inchangés, et que le numéro est réellement lisible et exact.

Le fichier de rendu a été téléchargé localement sous le nom `Gemini_Generated_Image_hxt2v4hxt2v4hxt2.jpeg` uniquement pour contrôle. Il ne doit pas être importé dans la médiathèque tant que les critères de préservation et de numéro ne sont pas vérifiés.

Après la modification de la règle métier, une seconde génération Gemini a été demandée avec le texte exact `للطلبات: 0555188455`, plus grand et contrasté. Le second rendu doit être téléchargé puis inspecté en pleine résolution ; il reste **non associé, non certifié et non publié** tant que le texte exact et la préservation des gâteaux n’ont pas été confirmés.

Le second fichier a été téléchargé sous le nom `Gemini_Generated_Image_502svm502svm502s.jpeg` pour ce seul contrôle.

Contrôle visuel effectué : le second rendu conserve le plateau et les gâteaux visibles dans la photo source, applique une scène commerciale noyer/sable avec café doré et feuillage d’olivier, et affiche en grand, sur cartouche ivoire contrasté, l’appel `للطلبات: 0555188455`. Il reste néanmoins en attente d’import et d’approbation dans l’espace privé, car aucune validation ne doit contourner la checklist applicative.

Après connexion à l’espace privé, un nouveau contenu local commercial intitulé `دعوة للطلب بنعومة الشوكولا` a été ajouté au calendrier du 25 août 2026 à 10:15. Aucune image n’est encore associée, aucune checklist n’est validée et aucune requête de publication Facebook n’a été envoyée.

Un premier choix de fichier a été détecté dans le formulaire d’un contenu antérieur lors de l’interface très longue ; il n’a pas été soumis, n’a créé aucun média et n’a modifié aucune publication. L’import définitif doit cibler exclusivement le formulaire du nouveau contenu du 25 août.

Le rendu Gemini a ensuite été importé dans la médiathèque comme média retouché certifié, associé uniquement au nouveau contenu du 25 août, puis validé dans la checklist applicative. Les cinq attributs déclarés sont : table noyer/fond sable ; lumière douce de fin d’après-midi à gauche ; vue verticale légèrement en plongée ; tasse dorée et branche d’olivier ; ambiance féminine, chaleureuse et élégante. La validation confirme aussi le numéro `0555188455` et l’appel visible `للطلبات: 0555188455`. Le contenu est toujours **scheduled** pour le 25 août à 10:15 et aucune requête Facebook n’a été effectuée.

Après confirmation explicite du propriétaire, le contenu a été envoyé à la Page `gâteau algérien`. Meta a retourné le post ID `1313747908483475_122102671251447468` et le média ID `122102671227447468`; le statut applicatif est passé à `published` afin d’empêcher tout doublon. L’ouverture de la publication Facebook a confirmé sa présence sur la Page. L’aperçu Facebook recadre l’image dans la fenêtre observée ; la conformité du cartouche de commande reste fondée sur le contrôle du fichier Gemini en pleine résolution réalisé avant l’import.
