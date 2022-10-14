# Projet de MA-VI

This is an academic project for the "Visualization" course from MSE HES-SO.
It aims to contribute to the Tournesol project by providing an interactive view
of user data and comparisons.

The contribution will be made at the end of the project by selecting what's
worth keeping and sharing with the Tournesol team.

The following is written in french as it is only relevant to our course.

## 14.10.2022 - Première réunion

### Plan

- Constitution de l'équipe de projet
- Choix de la thématique, source de données
- Définition du public cible et de l'objectif
- Maquettes
- Choix des technologies
- Planification, partage des tâches
- Inscription sur le wiki du cours
- Création forge et début dév

### Thématique / source de données

Contribuer au projet Tournesol et proposant une visualisation intéressante de leurs données.

### Définition du public cible et de l'objectif

**Idée à discuter :** Améliorer l'attrait du projet pour le grand public et/ou les data scientists.

### Brainstorming

- Tag / sujets
  - Arborescence
- Map
  - Streaming francophone: Sujet vs popularité
    - Changement de sujet => trait
- Leaderboard
  - Voisinage d'un pseudo
- Plot (stats "dures")
  - Contributions

### Maquettes

L'utilisateur peut chercher un pseudo pour changer le "point de vue" de l'affichage.

Une liste de vidéos recommandées à comparer est affichée sur la gauche. Des vidéos spécifiques peuvent être ajoutées via le champs de recherche en haut. En sélectionnant une vidéo à gauche, la vue de droite se déplace pour la centrer. En sélectionnant une deuxième vidéo, la vue de droite ajoute un lien entre elles et recentre la vue sur le lien. Le zoom est aussi ajusté lors des déplacements de la vue.

Sur la partie de droite, on peut voir l'historique des comparaisons faites par l'utilisateur sélectionné (à l'aide de son pseudo). Cette vue représente les comparaisons entres les vidéos sous la forme de liens. Les recommandations sont ajoutées pour permettre de d'apprécier l'apport potentiel d'une contribution. En sélectionnant une vidéo ou un lien dans la vue de droite, les vidéos associées à gauche sont aussi sélectionnées. Les liens existants entre deux vidéos déjà comparées de manière isolée (et donc déjà visionnées et faciles à comparer) sont aussi présentées. Un code couleur permet de rapidement différencier une comparaison déjà effectuée d'un lien auquel on peut contribuer.

![image-20221014152346014](images/mockup-draft.png)

### Choix des technologies

[Streamlit](https://streamlit.io/) : Il s'agit d'un framework de visualisation de donnée simple et performant qui est déjà utilisé par l'équipe de Tournesol.

Notre travail pour ainsi facilement s'intégrer à ce qu'ils ont déjà fait et aura plus de chance d'être accepté et utile.

### Planification, partage des tâches

#### Cahier des charges

- Vraie(s) maquette(s)
- Diagrammes UML
  - Use case
  - Composants (séparation logique VS graphique)
- Review avec ou sans le prof
- Proof of Concept
  1. Partage des tâches
- Review avec ou sans le prof
- Polish
  1. Partage des tâches