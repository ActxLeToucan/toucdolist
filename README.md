# Touc-Do List
Application "To-Do List" avec Cordova, réalisée par Antoine Contoux.

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
Il est possible de créer, de modifier et de supprimer une tâche.
Une tâche contient :
* Un titre
* Une description
* Une catégorie
* Une date d'écéhance
* Des sous-tâches

Une tâche peut aussi être en évidence (sera affichée sur fond jaune clair et texte en gras), ou définie comme urgente (placée en haut de la liste avec un ❗ devant le titre).

Une tâche peut être dans deux états possibles, en attente ou terminéee.

## Sous-tâche
Chaque tâche peut avoir des sous-tâches. Ces sous-tâches peuvent être ajoutées, modifiées et supprimées depuis la tâche à laquelle elles appartiennent.

Le nombre de sous-tâches terminées est indiqué dans un cadre de la couleur de la tâche avec un fond blanc, ou dans un cadre avec un fond de la couleur de la tâche si toutes les sous-tâches sont terminées.

## Filtres
L'affichage des tâches fonctionne avec des filtres.

En créant une nouvelle tâche, celle-ci est pré-configurée avec les paramètres du filtre dans lequel vous vous trouvez (sélectionne la bonne catégorie, est définie comme urgente, ajoutée à ma journée...).
### Ma journée
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
Il est possible de créer, de modifier et de supprimer une catégorie.
Une catégorie est un filtre qui n'affichera que les tâches qui en font partie.

Lors de la suppression d'une catégorie, il est possible de choisir de supprimer les tâches de cette catégorie ou de les garder (elles seront dans ce cas simplement sans catégorie).

Une catégorie possède :
* Un nom (unique)
* Une couleur

La couleur s'appliquera à toutes les tâches de la catégorie.

## Recherche
La recherche permet de rechercher dans l'ensemble des tâches une chaîne de caractères, tout en gardant la séparation des tâches en attente et des tâches terminées. La recherche s'ffectue dans le titre des tâches, mais il est possible (à partir des [options](#options)) de demander à rechercher aussi dans la description et/ou dans le nom des sous-tâches.

## Ordre des tâches
Vous pouvez choisir l'ordre dans lequel les tâches vont s'afficher. Chaque ordre peut être inversé, et il est possible de placer les tâches urgentes en haut ou non.
### Ordres
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
Vous pouvez charger les données de démonstration. Attention, vous perdrez toutes vos données.

### Nettoyage
Vous pouvez supprimer toutes vos catégories et toutes vos tâches.

## Suppression
Que ce soit pour la suppression d'une tâche, d'une sous-tâche, ou d'une catégorie, il faut toujours confirmer l'action pour ne pas supprimer un élément par erreur.

## Stockage
Vos données sont sauvegardées dans votre appareil, vous ne perdrez rien en fermant la to-do list.