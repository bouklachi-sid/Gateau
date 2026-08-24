# Modèles gratuits pour la retouche des photos de Douceur Studio

## Besoin prioritaire

La tâche est une **retouche localisée** : remplacer l’ancien numéro de téléphone par `0555 18 84 55` sans modifier le gâteau, le décor, le cadrage ou la lumière. Elle exige donc à la fois une bonne fidélité au produit et une restitution fiable des chiffres.

| Modèle | Gratuité / accès | Atout établi | Limite pratique | Adéquation au besoin |
|---|---|---|---|---|
| **Qwen-Image-Edit-2511** | Poids sous licence Apache-2.0 ; démonstration publique et exécution locale possibles | Édition d’apparence ciblée, rendu textuel avancé et mode image-à-image amélioré | Le modèle est lourd et une GPU adaptée est nécessaire pour un usage local fluide | **Choix recommandé** pour remplacer le numéro tout en préservant le gâteau |
| FLUX.1 Kontext Dev | Version open source utilisable localement dans ComfyUI | Éditions ciblées, conservation de composition et de style | Le flux de travail ComfyUI est plus technique ; la documentation précise un prompt en anglais | Bon second choix, surtout pour la cohérence visuelle, moins prioritaire pour les chiffres exacts |

## Décision proposée

Pour Douceur Studio, privilégier **Qwen-Image-Edit-2511**. La raison déterminante est la combinaison, dans un même éditeur, de l’édition localisée et de l’attention portée au rendu de texte. Employer une instruction courte et contrôlée, avec une seule modification par image : remplacer le numéro, préserver complètement le gâteau et vérifier visuellement les chiffres.

La démo Hugging Face officielle est référencée, mais l’interface n’était pas chargée lors du contrôle et indiquait une exécution sur infrastructure « Zero ». Elle ne doit donc pas être considérée comme un canal de production garanti ; l’exécution locale ou un accès disponible à Qwen Chat reste préférable pour une série de sept images.

Qwen Chat affiche l’éditeur mais demande une connexion ou une inscription avant l’envoi d’une image. Cette option gratuite reste possible avec le compte de l’utilisateur, mais nécessite une connexion manuelle avant toute retouche.

## Alternatives sans CAPTCHA

| Solution locale | Gratuité et accès | Adaptation au besoin |
|---|---|---|
| **IOPaint + AnyText** | Apache-2.0, auto-hébergé, fonctionne localement sur CPU, GPU ou Apple Silicon ; aucune connexion ni CAPTCHA | La meilleure alternative immédiate pour sélectionner seulement la zone du numéro, effacer l’ancien texte puis écrire le nouveau. La qualité des chiffres reste à valider sur chaque rendu. |
| **Krita + AI Diffusion** | GPL-3.0, local et open source ; aucun compte requis | Excellente solution de contrôle manuel avec sélection de zone et inpainting, mais une GPU avec au moins 6 Go de VRAM est recommandée pour un usage confortable. |
| **Qwen-Image-Edit-2511 local** | Apache-2.0, exécution locale possible | Le meilleur modèle de retouche IA pour la fidélité du produit et du texte, mais lourd (20B paramètres) : adapté si une GPU performante est disponible. |

Pour un ordinateur sans GPU dédiée, **IOPaint** est le choix le plus praticable : il permet d’effacer proprement l’ancien numéro localement, sans CAPTCHA ; le nouveau numéro peut ensuite être ajouté dans une zone limitée. Pour conserver le meilleur rendu de texte directement dans l’image, **Qwen local** reste le meilleur choix, mais il est nettement plus exigeant.

### Sources complémentaires

4. [IOPaint — dépôt officiel](https://github.com/Sanster/lama-cleaner)
5. [Krita AI Diffusion — dépôt officiel](https://github.com/Acly/krita-ai-diffusion)

## Modèle gratuit le plus performant — sélection finale

**Qwen-Image-Edit-2511** est le choix prioritaire pour ce projet. Ses poids sont sous licence Apache-2.0, il est explicitement conçu pour l’édition image-à-image et il améliore la cohérence visuelle et la limitation de la dérive par rapport à la version précédente. Ces deux derniers critères sont essentiels pour modifier le numéro sans altérer la texture ou la forme des gâteaux.

| Critère décisif | Qwen-Image-Edit-2511 | IOPaint | Krita AI Diffusion |
|---|---|---|---|
| Préservation d’un produit photographié | Très élevée, grâce à la cohérence améliorée | Bonne pour effacer, dépend du modèle choisi | Bonne à très bonne, dépend du modèle et de la sélection |
| Remplacement de chiffres ou texte | Le plus adapté de cette sélection | Nécessite généralement une étape d’ajout de texte séparée | Possible mais moins spécialisé pour la typographie |
| Licence | Apache-2.0 | Apache-2.0 | GPL-3.0 |
| Accès local sans CAPTCHA | Oui, avec une GPU performante | Oui, même sur CPU mais lent | Oui, avec GPU recommandée |

La recommandation d’exécution est donc : **Qwen-Image-Edit-2511 local** lorsque l’objectif est la meilleure qualité ; **IOPaint local** lorsque l’objectif est l’absence de compte et la compatibilité CPU. Le modèle Qwen est lourd (20 milliards de paramètres en BF16) et ne sera pas performant sur le serveur actuel sans GPU.

Contrôle opérationnel : la session web Qwen n’est pas active dans le navigateur au moment de préparer une nouvelle publication. La voie en ligne nécessite donc une connexion réussie ; elle ne peut pas être utilisée de manière autonome tant que celle-ci n’est pas persistante.

## Modèle sans CAPTCHA retenu pour l’exécution locale

Pour une publication immédiate sans compte, le modèle retenu est **LaMa (Large Mask Inpainting)**, utilisé par **IOPaint**. Il est conçu pour reconstituer une zone masquée et se comporte bien sur des images de grande résolution ; IOPaint permet de l’exécuter intégralement sur CPU, GPU ou Apple Silicon. Il servira à retirer seulement l’ancien bloc de texte ou à nettoyer une zone de composition, puis le nouveau numéro sera composé de façon déterministe afin d’éviter toute déformation de chiffres.

Cette solution ne recrée pas le gâteau : elle préserve le produit source et limite son intervention à la zone masquée. Elle répond donc au besoin de contrôle, de gratuité et d’absence de CAPTCHA ; elle ne remplace pas la mise en scène sémantique avancée de Qwen.

8. [LaMa — dépôt officiel](https://github.com/advimman/lama)

## Option en ligne validée sans CAPTCHA

La démo publique [IOPaint-LaMa sur Hugging Face](https://huggingface.co/spaces/Sanster/iopaint-lama) est actuellement active. Son interface propose directement le dépôt d’un fichier image et n’a demandé ni inscription, ni connexion, ni CAPTCHA lors du contrôle. Elle est donc l’option en ligne gratuite utilisable immédiatement pour nettoyer une zone contenant un ancien numéro. Le nouveau contact doit ensuite être ajouté avec une police contrôlée afin d’éviter les erreurs de chiffres.

### Sources de sélection

6. [Qwen — annonce officielle de Qwen-Image-Edit-2511](https://qwen.ai/blog?id=qwen-image-edit-2511)
7. [Qwen-Image-Edit-2511 — fiche officielle et licence Apache-2.0](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)

## Sources

1. [Annonce officielle Qwen-Image-Edit](https://qwen.ai/blog?id=qwen-image-edit)
2. [Dépôt officiel Qwen-Image — licence, versions et démos](https://github.com/QwenLM/Qwen-Image)
3. [Documentation ComfyUI de FLUX.1 Kontext Dev](https://docs.comfy.org/tutorials/flux/flux-1-kontext-dev)
