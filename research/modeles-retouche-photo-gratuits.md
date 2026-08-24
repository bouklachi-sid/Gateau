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

## Sources

1. [Annonce officielle Qwen-Image-Edit](https://qwen.ai/blog?id=qwen-image-edit)
2. [Dépôt officiel Qwen-Image — licence, versions et démos](https://github.com/QwenLM/Qwen-Image)
3. [Documentation ComfyUI de FLUX.1 Kontext Dev](https://docs.comfy.org/tutorials/flux/flux-1-kontext-dev)
