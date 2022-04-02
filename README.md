# Touc-Do List
Application "To-Do List" avec Cordova, réalisée par Antoine Contoux, projet du module "Developpement Mobile" (DUT Informatique, 2<sup>ème</sup> année).

*Pour la naviagtion dans les fichiers, il est fortement recommandée d'uiliser la **structure** des fichiers pour ne pas se perdre, ou de suivre les liens présents sur cette page.*


# Fonctionnalités du sujet implémentées
Liste des fonctionnalités du sujet qui ont été implémentées dans cette application. Pour de plus amples informations sur une de ces fonctionnalités, un lien est toujours présent pour la voir dans le code (des commentaires sont parfois présents, notamment pour détailler une différence avec le sujet). Si la fonctionnalité est détaillée dans cette documentation, un lien "En savoir plus" est présent.

Je n'ai pas réalisé les fonctionnalités en fonction du sujet, mais plus sur ce qui me paraissait utile à ajouter (je travaillais encore sans lire le sujet). Il y a donc des différences sur le fonctionnements de certaines.

* Obligatoires :
  * O2 : Mettre son nom sur une page | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/html/menu.html#L63)
  * O3 : Ajouter une icone personnalisée | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/config.xml#L11)
* Prioritaires :
  * P1 : Persistance des données | [En savoir plus](#stockage) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L729)
  * P2 : Ajouter un état "en cours" | [En savoir plus](#ma-journée) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L414)
  * P3 : Suppression de toutes les tâches | [En savoir plus](#nettoyage) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L286)
  * P4 : Présence d'une liste des catégorie lors de la création d'une tâche | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L126)
* Supplémentaires :
  * S1 : Possibilité d'ajouter une *deadline* | [En savoir plus](#tâche) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/html/new_task.html#L41)
  * S2 : Tri des tâches | [En savoir plus](#ordre-des-tâches) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L23)
  * S4 : Supprimer toutes les tâches d'une catégorie et supprimer cette dernière | [En savoir plus](#catégorie) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L739)
  * S5 : Modifier le CSS (je n'ai pas tout changé, juste modifié qqs détails pour rendre l'app plus aggréable) | [Voir dans le code](https://github.com/ActxLeToucan/toucdolist/blob/master/www/monCss.css)

# Fonctionnalités
* [Tâche](#tâche)
* [Sous-tâche](#sous-tâche)
* [Filtres](#filtres)
  * [Ma journée](#ma-journée)
  * [Important](#important)
  * [Plannifié](#planifié)
  * [Toutes les catégories](#toutes-les-catégories)
  * [Sans catégorie](#sans-catégorie)
  * [Filtres spéciaux](#filtres-spéciaux)
* [Catégorie](#catégorie)
* [Recherche](#recherche)
* [Ordre des tâches](#ordre-des-tâches)
  * [Ordres](#ordres)
* [Options avancées](#options-avancées)
  * [Statistiques](#statistiques)
  * [Recherche](#recherche-1)
  * [Bug](#bug)
  * [Nettoyage](#nettoyage)
* [Suppression](#suppression)
* [Stockage](#stockage)


## Tâche
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L11)
* [➡️ Voir dans le code (contrôleur)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L250)

Il est possible de créer, de modifier et de supprimer une tâche.
Une tâche contient :
* Un titre
* Une description
* Une catégorie
* Une date d'échéance
* Des sous-tâches

Une tâche peut aussi être en évidence (sera affichée sur fond jaune clair et texte en gras), ou définie comme urgente (placée en haut de la liste avec un ❗ devant le titre).

Une tâche peut être dans deux états possibles, en attente ou terminéee.

## Sous-tâche
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L101)
* [➡️ Voir dans le code (contrôleur)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L442)

Chaque tâche peut avoir des sous-tâches. Ces sous-tâches peuvent être ajoutées, modifiées et supprimées depuis la tâche à laquelle elles appartiennent.

Le nombre de sous-tâches terminées est indiqué dans un cadre de la couleur de la tâche avec un fond blanc, ou dans un cadre avec un fond de la couleur de la tâche si toutes les sous-tâches sont terminées.

## Filtres
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L383)
* [➡️ Voir dans le code (contrôleur)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L760)

L'affichage des tâches fonctionne avec des filtres.

En créant une nouvelle tâche, celle-ci est pré-configurée avec les paramètres du filtre dans lequel vous vous trouvez (sélectionne la bonne catégorie, est définie comme urgente, ajoutée à ma journée...).
### Ma journée
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L408)

Les tâches qui s'affichent sont les tâches qui ont la case "ma journée" cochée dans leurs détails, ou qui sont en retard ou ayant une échéance ce jour.

Dans ces deux derniers cas, il est impossible de retirer la tâche de Ma journée.

### Important
Les tâches qui s'affichent sont celles qui sont marquées comme urgentes.

### Planifié
Les tâches qui s'affichent sont celles qui ont une date d'échéance.

### Toutes les catégories
Toutes les tâches qui sont dans une catégorie s'affichent.

### Sans catégorie
Les tâches ne faisant partie d'aucune catégorie s'affichent.

### Filtres spéciaux
D'autres fonctionnalités se basant sur les filtres existent.

Voir [Catégorie](#cat%C3%A9gorie) et [Recherche](#recherche).

## Catégorie
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L507)
* [➡️ Voir dans le code (contrôleur)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L582)

Il est possible de créer, de modifier et de supprimer une catégorie.
Une catégorie est un filtre qui n'affichera que les tâches qui en font partie.

Lors de la suppression d'une catégorie, il est possible de choisir de supprimer les tâches de cette catégorie ou de les garder (elles seront dans ce cas simplement sans catégorie).

Une catégorie possède :
* Un nom (unique)
* Une couleur

La couleur s'appliquera à toutes les tâches de la catégorie.

## Recherche
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L346)
* [➡️ Voir dans le code (vue)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/html/menu.html#L2)

La recherche permet de rechercher dans l'ensemble des tâches une chaîne de caractères, tout en gardant la séparation des tâches en attente et des tâches terminées. La recherche s'ffectue dans le titre des tâches, mais il est possible (à partir des [options](#options)) de demander à rechercher aussi dans la description et/ou dans le nom des sous-tâches.

## Ordre des tâches
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L378)
* [➡️ Voir dans le code (contrôleur)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L863)

Vous pouvez choisir l'ordre dans lequel les tâches vont s'afficher. Chaque ordre peut être inversé, et il est possible de placer les tâches urgentes en haut ou non.
### Ordres
* [➡️ Voir dans le code (contrôleur)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/controllers.js#L22)
* Alphabétique
* Taux de complétion (aucune sous-tâche = 0%)
* Date de création (par défaut)
* Date d'échéance (tâches sans date = échéance ♾️)

## Options avancées
### Statistiques
Les statistiques vous donnent un apperçu de votre utilisation de la to-do list avec par exemple votre nombre de catégories, de tâches terminées, ou encore le nombre moyen de jours pour effctuer une tâche.

### Recherche
Vous pouvez configurer la recherche (voir [Recherche](#recherche)).

### Bug
Vous pouvez signaler un bug au développeur sur GitHub si vous pensez avoir trouvé un bug.

### Mode démo
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L717)
Vous pouvez charger les données de démonstration. Attention, vous perdrez toutes vos données.

### Nettoyage
Vous pouvez supprimer toutes vos catégories et toutes vos tâches.

## Suppression
Que ce soit pour la suppression d'une tâche, d'une sous-tâche, ou d'une catégorie, il faut toujours confirmer l'action pour ne pas supprimer un élément par erreur.

## Stockage
* [➡️ Voir dans le code (modèle)](https://github.com/ActxLeToucan/toucdolist/blob/master/www/js/services.js#L728)

Vos données sont sauvegardées dans votre appareil, vous ne perdrez rien en fermant la to-do list.
