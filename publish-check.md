# Contrôle de disponibilité publié

Le 24 août 2026, le domaine `https://gateauxfb-wp7fggme.manus.space` a été ouvert depuis le navigateur. Le déploiement est signalé comme réussi, mais la page rendue est restée blanche après deux vérifications. La prévisualisation de développement fonctionne et les vérifications TypeScript sont sans erreur. Les journaux de production confirment le démarrage du serveur sans erreur d’application ; ils indiquent seulement l’absence de cookie de session dans le navigateur de contrôle. La console navigateur ne contient aucune erreur. Une vérification dans la session authentifiée du propriétaire est nécessaire avant d’activer l’automatisation.

La requête `GET /me/accounts` a ensuite été exécutée dans la session Meta authentifiée. Elle liste la Page « gâteau algérien » avec l’identifiant réel `1313747908483475` et les tâches `CREATE_CONTENT`, `MANAGE`, `MODERATE`, `MESSAGING`, `ANALYZE` et `ADVERTISE`. L’identifiant `61593424064482` utilisé auparavant provenait du lien Facebook partagé, mais ne correspond pas à l’objet Page exposé par l’API. La plateforme doit être reconfigurée avec le bon identifiant et le jeton présent sur la ligne de cette Page.

L’outil Graph API Explorer authentifié affiche encore uniquement `pages_show_list` et `pages_read_engagement` parmi les permissions sélectionnées. Les différents jetons fournis permettent de lire la bonne Page, mais l’essai de publication `POST /1313747908483475/feed` échoue avec le code Meta `#200`, qui exige `pages_manage_posts` avec `pages_read_engagement`. La configuration d’autorisation de l’application Meta doit donc être complétée avant toute publication automatisée.

Le tableau de bord Meta confirme que l’application « Gâteau algérien » (ID `4565841493701403`) est en mode Développement. La suite du diagnostic consiste à vérifier le cas d’utilisation Pages API et les permissions de cette application avant de générer un nouveau jeton.

Dans le sélecteur des cas d’utilisation de l’application, les options actuellement visibles concernent Threads et WhatsApp ; le cas d’utilisation Pages API n’apparaît pas dans la première vue. Meta indique qu’une nouvelle application peut être nécessaire lorsque le cas d’utilisation recherché n’est pas compatible avec l’application existante. Une vérification de la catégorie « Gestion du contenu » est requise avant de modifier la configuration.

La catégorie « Gestion du contenu » expose le cas d’utilisation « Tout gérer sur votre Page », correspondant à l’API Pages. Cette option a été sélectionnée après confirmation explicite. Une sélection Instagram a aussi été activée par erreur durant la navigation et sera retirée avant l’enregistrement ; aucune configuration n’a encore été enregistrée.

La sélection Instagram a été retirée et seul le cas d’utilisation « Tout gérer sur votre Page » est resté sélectionné. La configuration a été enregistrée après confirmation explicite. La prochaine étape est de régénérer un jeton de Page avec les permissions Pages API désormais disponibles, puis de répéter le test de publication.

Une tentative d’ouverture de la demande OAuth officielle pour les permissions Pages API est refusée par Meta : l’URL de redirection `https://www.facebook.com/connect/login_success.html` n’est pas inscrite dans les domaines ou redirections OAuth valides de l’application. La configuration Facebook Login for Business doit ajouter un domaine et une URI de redirection valides avant l’autorisation de `pages_manage_posts`.

Après l’enregistrement, le tableau de bord de l’application affiche bien « Personnaliser le cas d’utilisation Tout gérer sur votre Page », correspondant à `PAGES_API`. Le cas d’utilisation requis est donc actif ; l’obstacle restant est la configuration OAuth de Facebook Login for Business, nécessaire pour régénérer un jeton comportant les permissions de publication.

La permission `pages_manage_posts` a été ajoutée au cas d’utilisation Pages API avec le statut « Prête pour le test ». Avec `pages_read_engagement` et `pages_show_list` déjà prêtes pour le test, la prochaine action consiste à régénérer un jeton utilisateur, puis à récupérer le jeton de la Page « gâteau algérien ».

Graph API Explorer expose désormais `pages_manage_posts` dans son sélecteur d’autorisations. L’option a été ajoutée à la demande de jeton, qui inclut maintenant `pages_show_list`, `pages_read_engagement` et `pages_manage_posts`. La génération d’un nouveau jeton nécessitera l’approbation du propriétaire dans Meta avant tout test de publication.

La génération du nouveau jeton a ouvert le consentement Meta. Le mode d’accès aux Pages a été limité aux éléments actuels, plutôt qu’aux Pages futures. Les trois Pages existantes sont pré-sélectionnées par Meta ; seules la Page « gâteau algérien » (ID `1313747908483475`) doit rester sélectionnée avant de finaliser le consentement.

Les deux Pages non concernées ont été retirées de la sélection. Le consentement ne couvre désormais que « gâteau algérien » (ID `1313747908483475`), conformément au principe du moindre privilège. L’étape finale de consentement délivrera le nouveau jeton avec les trois permissions Pages nécessaires.

Le consentement Meta a été validé : le profil administrateur a été associé à l’application « Gâteau algérien » avec le droit de créer et gérer le contenu de la seule Page sélectionnée. Le nouveau jeton utilisateur peut maintenant être utilisé pour récupérer le jeton de Page mis à jour.

Meta a délivré le nouveau jeton utilisateur après le consentement. Sa valeur n’est pas consignée dans ce fichier ; elle sera utilisée uniquement pour obtenir le jeton de Page et valider la publication autorisée.

Graph API Explorer charge maintenant le nouveau jeton utilisateur et confirme que les trois autorisations sélectionnées sont `pages_show_list`, `pages_read_engagement` et `pages_manage_posts`. La requête `GET /me/accounts` est préparée pour récupérer le jeton de la Page ciblée.
