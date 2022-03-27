/**
 * SERVICES
 * Gère les tâches dans les tableaux et peut générer les affichages à partir de ces derniers.
 * Seul le contrôleur doit appeler les méthodes de services. Donc lors d'un évènement, l'action est déclenchée dans le contrôleur.
 */

myApp.services = {
  /**
   * Gestion des données concernant les tâches
   */
  tasks: {
    /**
     * Ajout d'une tâche
     * @param data tâche à ajouter
     */
    add: (data) => {
      myApp.services.data.tasks.pending.push(data);
      myApp.services.storage.save.tasks();
    },

    /**
     * Suppression de toutes les tâches
     */
    clear: () => {
      myApp.services.data.tasks.pending = [];
      myApp.services.data.tasks.completed = [];
      myApp.services.storage.save.tasks();
    },

    /**
     * Suppression d'une tâche
     * @param data tâche à supprimer
     * @param taskCompleted état de la tâche à supprimer (true si terminé)
     */
    delete: (data, taskCompleted) => {
      let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      tab.splice(tab.indexOf(data), 1);
      myApp.services.storage.save.tasks();
    },

    /**
     * Calcul du temps pour effectuer une tâche
     * @param data tâche
     * @returns {number} résultat du calcul (en jours)
     */
    duration: (data) => {
      let task = myApp.services.data.tasks.completed.find(t => t === data);
      let dateCreated = new Date(task.created);
      let dateCompleted = new Date(task.completed);
      let diffTime = Math.abs(dateCompleted - dateCreated);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Edition d'une tâche
     */
    edit: {
      // Mise à jour de la catégorie d'une tâche
      category: (data, taskCompleted, newCateg) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).category = newCateg;
        myApp.services.storage.save.tasks();
      },

      // Mise  à jour de la description d'une tâche
      description: (data, taskCompleted, newDescription) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).description = newDescription;
        myApp.services.storage.save.tasks();
      },

      // Changement de la date d'échéance d'une tâche
      echeance: (data, taskCompleted, newEcheance) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).echeance = newEcheance;
        myApp.services.storage.save.tasks();
      },

      // Mise en évidence d'une tâche
      highlight: (data, taskCompleted) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).highlight = !data.highlight;
        myApp.services.storage.save.tasks();
      },

      // Ajout d'une tâche à 'Ma journée'
      myday: (data, taskCompleted, inMyDay) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).myday = (inMyDay ? getDateInFormatYearMonthDate(new Date()) : "");
        myApp.services.storage.save.tasks();
      },

      // Définir une tâche comme urgente
      priority: (data, taskCompleted) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).urgent = !data.urgent;
        myApp.services.storage.save.tasks();
      },

      // Gestion des sous-tâches d'une tâche
      subTasks: {
        // Ajout d'une sous-tâche
        add: (data, taskCompleted, subTask) => {
          let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
          tab.find(task => task === data).children.push(subTask);
          myApp.services.storage.save.tasks();
        },

        // Suppression d'une sous-tâche
        delete: (data, taskCompleted, subTask) => {
          let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
          tab.find(task => task === data).children.splice(tab.find(task => task === data).children.indexOf(subTask), 1);
          myApp.services.storage.save.tasks();
        },

        // Edition d'une sous-tâche
        edit: {
          name: (data, taskCompleted, subTask, newTitle) => {
            let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
            tab.find(task => task === data).children.find(s => s === subTask).title = newTitle;
            myApp.services.storage.save.tasks();
          }
        },

        // Changement de l'état (terminé ou non) d'une sous-tâche
        setState: (data, taskCompleted, subTask) => {
          let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
          tab.find(task => task === data).children.find(s => s === subTask).completed = !tab.find(task => task === data).children.find(s => s === subTask).completed;
          myApp.services.storage.save.tasks();
        }
      },

      // Changement du titre d'une tâche
      title: (data, taskCompleted, newTitle) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).title = newTitle;
        myApp.services.storage.save.tasks();
      },
    },

    /**
     * Génération des affichages
     */
    generate: {
      // Génération de l'affichage d'une tâche
      task: (data, taskCompleted) => {
        let subTasksCompleted = myApp.services.tasks.subTasksCompleted(data);
        let color = '#000000';
        if (data.category) {
          let categ = myApp.services.data.categories.find(categ => categ.name === data.category);
          if (categ) color = categ.color;
        }

        // Task item template.
        let taskItem = ons.createElement(`
          <ons-list-item tappable category="${data.category}" class="${data.highlight ? "highlight" : ""}">
            <label class="left">
              <ons-checkbox ${taskCompleted ? "checked" : ""}></ons-checkbox>
            </label>
            <div class="center" style="color: ${color}">
              <span class="task-title ${data.urgent ? "task-prio" : ""}">${data.title}</span>
              ${data.children.length > 0 ? `<span class="task-subtasks ${subTasksCompleted.completed ? "subtasks-completed" : ""}" style="${subTasksCompleted.completed ? `border-color: ${color}; background-color: ${color}` : `border-color: ${color}`}">${subTasksCompleted.stringRatio}</span>` : ''}
            </div>
            <div class="right">
              <ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>
            </div>
          </ons-list-item>
        `);

        // Store data within the element.
        taskItem.data = data;

        taskItem.querySelector(".right").addEventListener("click", myApp.controllers.tasks.delete.createAlertDialog);
        taskItem.querySelector("ons-checkbox").addEventListener("change", myApp.controllers.tasks.edit.state);
        taskItem.querySelector(".center").addEventListener("click", myApp.controllers.tasks.details);

        // Insert urgent tasks at the top and non urgent tasks at the bottom.
        let list = (taskCompleted ? document.querySelector('#completed-list') : document.querySelector('#pending-list'));
        list.insertBefore(taskItem, null);
      },

      // Génération de la page de détails d'une tâche
      details: (task, taskCompleted) => {
        let dateTime = new Date(task.created);
        let taskDate = getDateInFormatDateMonthYear(dateTime, '/');
        let dateFormatted = getDateInFormatYearMonthDate(new Date());

        let page = document.querySelector('#details-task-page-content');
        page.innerHTML = `
          <h1 id="title">
              <div id="title-show" class="show-task-field">
                  <span id="title-content">${task.title}</span>
                  <ons-button modifier="quiet" id="button-edit-title">Editer ✏️</ons-button>
              </div>
              <div id="title-edit" class="edit-task-field">
                  <ons-input id="title" modifier="underbar" placeholder="Titre" float></ons-input>
                  <ons-button modifier="quiet" id="button-validate-title">Valider ✅</ons-button>
              </div>
          </h1>
          <div id="descr">
              <div id="descr-show" class="show-task-field">
                  <span id="descr-title">Description</span>
                  <ons-button modifier="quiet" id="button-edit-descr">Editer ✏️</ons-button>
                  <br />
                  <span id="descr-content">${task.description}</span>
              </div>
              <div id="descr-edit" class="edit-task-field">
                  <ons-input id="descr" modifier="underbar" placeholder="Description" float></ons-input>
                  <ons-button modifier="quiet" id="button-validate-descr">Valider ✅</ons-button>
              </div>
          </div>
          <p>
              <label for="myday">🌞 Ajouter à ma journée </label>
              <ons-checkbox input-id="myday" class="myday-checkbox" ${task.myday === dateFormatted ? "checked" : ''}></ons-checkbox>
          </p>
          <div id="categ"  style="margin-top: 20px; margin-bottom: 20px">
              <span style="vertical-align: sub">Catégorie </span>
              <ons-select id="select-categ">
                  <option value="aucune">(Aucune)</option>
              </ons-select>
          </div>
          <p>
              <label for="highlight">Mettre en évidence </label>
              <ons-switch input-id="highlight" class="highlight-checkbox" ${task.highlight ? "checked" : ""}></ons-switch>
          </p>
          <p>
              <label for="urgent">Définir comme urgent </label>
              <ons-switch input-id="urgent" class="urgent-checkbox" ${task.urgent ? "checked" : ""}></ons-switch>
          </p>
          <p>
              <label for="echeance">Échéance </label>
              <ons-input input-id="echeance" class="echeance" type="date" modifier="underbar"></ons-input>
          </p>
          <div id="sub-tasks">
              <p>SOUS-TÂCHES</p>
          </div>
          <p class="task-created">Tâche créée le ${taskDate} à ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}.</p>
        `;
        page.querySelector(".echeance").value = task.echeance;


        page.data = task;
        page.completed = taskCompleted;

        // affichage categories
        let categSelector = page.querySelector("#select-categ").querySelector("select");
        myApp.services.data.categories.forEach(categ => {
          let elemCateg = ons.createElement(`
            <option ${task.category === categ.name ? "selected" : ""}>${categ.name}</option>
          `);

          elemCateg.data = categ;

          categSelector.insertBefore(elemCateg, null);
        });

        // affichage sous-tâches
        let subTasks = page.querySelector("#sub-tasks");
        task.children.forEach(subTask => {
          let elemSubTask = ons.createElement(`
            <ons-list-item class="sub-task-item">
              <div class="center">
                <ons-checkbox input-id="sub-task-item-${subTask.created}" class="sub-task-item-input" ${subTask.completed ? "checked" : ""}></ons-checkbox>
              </div>
              <label for="sub-task-item-${subTask.created}" class="center sub-task-item-label"> ${subTask.title}</label>
              <div class="right">
                <ons-icon style="color: grey; padding-left: 4px" icon="edit"></ons-icon>
              </div>
            </ons-list-item>
          `);
          elemSubTask.data = subTask;
          elemSubTask.querySelector("ons-checkbox").addEventListener("change", myApp.controllers.tasks.edit.subTasks.edit.state);
          elemSubTask.querySelector(".right").addEventListener("click", myApp.controllers.tasks.edit.subTasks.edit.createAlertDialog);
          subTasks.insertBefore(elemSubTask, null);
        });
        subTasks.insertBefore(ons.createElement(`<ons-button id="button-new-categ" onclick="myApp.controllers.tasks.edit.subTasks.add.createAlertDialog()">Ajouter une sous-tâche</ons-button>`), null);


        // modification du titre
        page.querySelector("#button-edit-title").addEventListener("click", (e) => {
          let affichage = e.target.parentNode;
          affichage.style.display = "none";
          let edition = e.target.parentNode.parentNode.querySelector(".edit-task-field");
          edition.style.display = "block";
          edition.querySelector("ons-input").value = affichage.querySelector("#title-content").innerText;
        });
        page.querySelector("#button-validate-title").addEventListener("click", (e) => {
          let edition = e.target.parentNode;
          edition.style.display = "none";
          let affichage = e.target.parentNode.parentNode.querySelector(".show-task-field");
          affichage.style.display = "block";
          let newValue = edition.querySelector("ons-input").value;
          affichage.querySelector("#title-content").innerText = newValue;
          myApp.controllers.tasks.edit.title(e, newValue);
        });
        // modification de la description
        page.querySelector("#button-edit-descr").addEventListener("click", (e) => {
          let affichage = e.target.parentNode;
          affichage.style.display = "none";
          let edition = e.target.parentNode.parentNode.querySelector(".edit-task-field");
          edition.style.display = "block";
          edition.querySelector("ons-input").value = affichage.querySelector("#descr-content").innerText;
        });
        page.querySelector("#button-validate-descr").addEventListener("click", (e) => {
          let edition = e.target.parentNode;
          edition.style.display = "none";
          let affichage = e.target.parentNode.parentNode.querySelector(".show-task-field");
          affichage.style.display = "block";
          let newValue = edition.querySelector("ons-input").value;
          affichage.querySelector("#descr-content").innerText = newValue;
          myApp.controllers.tasks.edit.description(e, newValue);
        });
        // modification ma journée
        page.querySelector(".myday-checkbox").addEventListener("change", myApp.controllers.tasks.edit.myday);
        // modification catégorie
        categSelector.addEventListener("change", myApp.controllers.tasks.edit.category);
        // modification surlignage
        page.querySelector(".highlight-checkbox").addEventListener("change", myApp.controllers.tasks.edit.highlight);
        // modification urgence
        page.querySelector(".urgent-checkbox").addEventListener("change", myApp.controllers.tasks.edit.priority);
        // modification echeance
        page.querySelector(".echeance").addEventListener("change", myApp.controllers.tasks.edit.echeance);
      }
    },

    /**
     * Compte le nombre de tâches en retard
     * @returns {number} nombre de tâches en retard
     */
    late: () => {
      let late = 0
      myApp.services.data.tasks.pending.forEach(task => {
        if (task.echeance && (new Date(task.echeance) < new Date())) late++;
      });
      myApp.services.data.tasks.completed.forEach(task => {
        if (task.echeance && (new Date(task.echeance) < new Date())) late++;
      });
      return late;
    },

    /**
     * Indique si une tâche correspond aux critères de recherche
     * @param data tâche
     * @returns {boolean|boolean}
     */
    search: (data) => {
      return FILTER.search
          && (data.title.toLowerCase().includes(FILTER.search.toLowerCase()))
          || (myApp.services.data.settings.search.includeDescription
              && data.description.toLowerCase().includes(FILTER.search.toLowerCase()))
          || (myApp.services.data.settings.search.includeSubTasks
              && data.children.reduce((prev, curr) => prev + curr.title.toLowerCase().includes(FILTER.search.toLowerCase()) ? 1 : 0, 0) > 0);
    },

    /**
     * Change l'état (terminé ou en attente) d'une tâche
     * @param data tâche
     * @param taskCompleted nouvel état de la tâche
     */
    setState: (data, taskCompleted) => {
      let tab1 = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      let tab2 = (!taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      data.completed = (taskCompleted ? getDateInFormatYearMonthDate(new Date()) : '');
      tab1.push(data);
      tab2.splice(tab2.indexOf(data), 1);
      myApp.services.storage.save.tasks();
    },

    /**
     * Affichage des tâches
     */
    show: {
      // Affichage des tâches en attente
      pendingList: () => {
        let pendingList = document.querySelector('#pending-list');
        pendingList.innerHTML = "";

        myApp.services.data.tasks.pending.sort(ORDER.type);
        if (!ORDER.croissant) myApp.services.data.tasks.pending.reverse();
        if (ORDER.urgentBefore) myApp.services.data.tasks.pending.sort(ORDER_URGENT);

        myApp.services.data.tasks.pending.forEach(function (data) {
          switch (FILTER.type) {
            case FILTER_NO: {
              myApp.services.tasks.generate.task(data, false);
              break;
            }
            case FILTER_CATEG: {
              if (FILTER.category && data.category === FILTER.category) myApp.services.tasks.generate.task(data, false);
              break;
            }
            case FILTER_NO_CATEG: {
              if (data.category === '') myApp.services.tasks.generate.task(data, false);
              break;
            }
            case FILTER_ALL_CATEGS: {
              if (data.category !== '') myApp.services.tasks.generate.task(data, false);
              break;
            }
            case FILTER_PLANNED: {
              if (data.echeance !== '') myApp.services.tasks.generate.task(data, false);
              break;
            }
            case FILTER_URGENT: {
              if (data.urgent) myApp.services.tasks.generate.task(data, false);
              break;
            }
            case FILTER_MYDAY: {
              /*
                Dans ma journée :
                 - tâches avec "ma journée" cochée aujourd'hui
                 - tâches qui ne sont pas finies avec "ma journée" cochée avant aujourd'hui
                 - tâches qui arrivent à échéance à aujourd'hui ou en retard
                 Equivalent de la fonctionnalité P2, mais en mieux. L'utilisation d'un onglet supplémentaire n'a pas d'intérêt.
               */
              let date = new Date();
              let dateFormatted = getDateInFormatYearMonthDate(date);

              if ((data.myday && (data.myday === dateFormatted || new Date(data.myday) < date)) || (data.echeance && (data.echeance === dateFormatted || new Date(data.echeance) < date))) {
                myApp.services.data.tasks.pending.find(t => t === data).myday = dateFormatted;
                myApp.services.tasks.generate.task(data, false);
              }
              break;
            }
            case FILTER_SEARCH: {
              if (myApp.services.tasks.search(data)) {
                myApp.services.tasks.generate.task(data, false);
              }
              break;
            }
          }
        });
      },

      // Affichage des tâches terminées
      completedList: () => {
        let completedTasksPage = document.querySelector('#completed-list');
        completedTasksPage.innerHTML = "";

        myApp.services.data.tasks.completed.sort(ORDER.type);
        if (!ORDER.croissant) myApp.services.data.tasks.completed.reverse();
        if (ORDER.urgentBefore) myApp.services.data.tasks.completed.sort(ORDER_URGENT);

        myApp.services.data.tasks.completed.forEach(function (data) {
          switch (FILTER.type) {
            case FILTER_NO: {
              myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_CATEG: {
              if (FILTER.category && data.category === FILTER.category) myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_NO_CATEG: {
              if (data.category === '') myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_ALL_CATEGS: {
              if (data.category !== '') myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_PLANNED: {
              if (data.echeance !== '') myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_URGENT: {
              if (data.urgent) myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_MYDAY: {
              let date = new Date();
              let dateFormatted = getDateInFormatYearMonthDate(date);

              if (data.myday === dateFormatted)
                myApp.services.tasks.generate.task(data, true);
              break;
            }
            case FILTER_SEARCH: {
              if (myApp.services.tasks.search(data)) {
                myApp.services.tasks.generate.task(data, true);
              }
            }
          }
        });
      },
    },

    /**
     * Résultats sur la complétion d'une tâche (à partir de ses sous-tâches)
     * @param task tâche
     * @returns {{stringRatio: string, completed: boolean, ratio: (number|number)}}
     */
    subTasksCompleted: (task) => {
      let completed = task.children.reduce((prev, curr) => prev + (curr.completed ? 1 : 0), 0);
      return {
        stringRatio: `${completed}/${task.children.length}`,
        completed: (task.children.length > 0 && completed === task.children.length),
        ratio: task.children.length > 0 ? completed / task.children.length : 0
      };
    }
  },


  /**
   * Gestion des données concernant les catégories
   */
  categories: {
    /**
     * Ajout d'une catégorie
     * @param name nom
     * @param color couleur
     */
    add: (name, color) => {
      myApp.services.data.categories.push({
        name: name,
        color: color,
        created: Date.now()
      });
      myApp.services.storage.save.categories();
    },

    /**
     * Suppression de toutes les catégories.
     * Ne supprime pas les tâches associées.
     */
    clear: () => {
      myApp.services.data.tasks.pending.forEach(task => task.category = '');
      myApp.services.data.tasks.completed.forEach(task => task.category = '');
      myApp.services.data.categories = [];
      myApp.services.storage.save.categories();
    },

    /**
     * Suppression d'une catégorie
     * @param data catégorie à supprimer
     * @param deleteTasks doit-on supprimer les tâches associées ?
     */
    delete: (data, deleteTasks) => {
      let tasks = myApp.services.categories.tasks(data.name);
      if (deleteTasks) {
        tasks.pending.forEach(t => myApp.services.tasks.delete(t, false));
        tasks.completed.forEach(t => myApp.services.tasks.delete(t, true));
      } else {
        tasks.pending.forEach(t => myApp.services.tasks.edit.category(t, false, ''));
        tasks.completed.forEach(t => myApp.services.tasks.edit.category(t, true, ''));
      }
      myApp.services.data.categories.splice(myApp.services.data.categories.indexOf(data), 1);
      myApp.services.storage.save.categories();
    },

    /**
     * Edition d'une catégorie
     * @param data catégorie à modifier
     * @param name nouveau nom
     * @param color nouvelle couleur
     */
    edit: (data, name, color) => {
      myApp.services.data.tasks.pending.forEach(task => {
        if (task.category === data.name) {
          task.category = name;
        }
      });
      myApp.services.data.tasks.completed.forEach(task => {
        if (task.category === data.name) {
          task.category = name;
        }
      });
      myApp.services.data.categories.find(categ => categ === data).name = name;
      myApp.services.data.categories.find(categ => categ === data).color = color;
      myApp.services.storage.save.categories();
    },

    /**
     * Génération de l'affichage d'une catégorie
     * @param data catégorie
     */
    generate: (data) => {
      let categ = ons.createElement(`
        <ons-list-item tappable category-id="${data.name}">
          <div class="left">
            <ons-radio name="categoryGroup" input-id="r-${data.name}" ${FILTER.category === data.name ? "checked" : ""}></ons-radio>
          </div>
          <label class="center" style="color: ${data.color}" for="r-${data.name}">${data.name}</label>
          <div class="right">
            <ons-icon style="color: grey; padding-left: 4px" icon="edit, material:md-edit"></ons-icon>
          </div>
        </ons-list-item>
      `);

      categ.data = data;

      categ.querySelector("ons-radio").addEventListener("change", myApp.controllers.filter.eventHandler);
      categ.querySelector(".right").addEventListener("click", myApp.controllers.categories.edit.createAlertDialog);

      let list = document.querySelector('#custom-category-list');
      list.insertBefore(categ, list.firstChild);
    },

    /**
     * Obtention d'une catégorie par son nom
     * @param name nom de la catégorie
     * @returns {*[]} tableau des catégories qui ont exactement le nom recherché (normalement de taille 0 ou 1)
     */
    getByName: (name) => {
      let tab = [];
      myApp.services.data.categories.forEach(categ => {
        if (categ.name === name) tab.push(categ);
      });
      return tab;
    },

    /**
     * Affichage des catégories
     */
    show: () => {
      let categs = document.querySelector('#custom-category-list');
      categs.innerHTML = `
          <ons-list-item>
            <ons-button id="button-new-categ" onclick="myApp.controllers.categories.add.createAlertDialog()">Nouvelle catégorie</ons-button>
          </ons-list-item>`;

      myApp.services.data.categories.forEach(categ => {
        myApp.services.categories.generate(categ);
      });
    },

    /**
     * Obtention des tâches associées à une catégorie
     * @param categoryName nom de la catégorie
     * @returns {{pending: *[], length: number, completed: *[]}}
     */
    tasks: (categoryName) => {
      let pendingTasks = myApp.services.data.tasks.pending.filter(t => t.category === categoryName);
      let completedTasks = myApp.services.data.tasks.completed.filter(t => t.category === categoryName);
      return {
        pending: pendingTasks,
        completed: completedTasks,
        length: pendingTasks.length + completedTasks.length
      };
    }
  },

  /**
   * Gestion des données concernant les réglages
   */
  settings: {
    /**
     * Réglages de la recherche
     */
    search: {
      // Change l'état de l'inclusion de la description pour la recherche
      changeIncludeDescription: () => {
        myApp.services.data.settings.search.includeDescription = !myApp.services.data.settings.search.includeDescription;
        myApp.services.storage.save.settings();
      },

      // Change l'état de l'inclusion des sous-tâches pour la recherche
      changeIncludeSubTasks: () => {
        myApp.services.data.settings.search.includeSubTasks = !myApp.services.data.settings.search.includeSubTasks;
        myApp.services.storage.save.settings();
      }
    },

    /**
     * Réglages du tri
     */
    order: {
      // Affiche les ordres de tris possibles
      show: () => {
        let orderBlock = document.querySelector('#order');

        let select = orderBlock.querySelector("#order-select").querySelector("select");
        select.innerHTML = "";
        ORDER.available.forEach(option => {
          let e = ons.createElement(`
            <option value="${option.name}" ${myApp.services.data.settings.order.type === option.name ? "selected" : ""}>${ORDER.getName(option)}</option>
          `);
          select.insertBefore(e, null);
        });
        select.onchange = myApp.controllers.order.eventHandler;

        let button = orderBlock.querySelector("#button-sens");
        orderBlock.querySelector("#croissant").classList.remove("order_sens_unselected");
        orderBlock.querySelector("#decroissant").classList.remove("order_sens_unselected");
        button.querySelector(!myApp.services.data.settings.order.croissant ? "#croissant" : "#decroissant").classList.add("order_sens_unselected");
        button.onclick = myApp.controllers.order.switch;

        let checkBox = orderBlock.querySelector(".urgent-before-checkbox");
        checkBox.checked = myApp.services.data.settings.order.urgentBefore;
        checkBox.onchange = myApp.controllers.order.urgentBefore;
      },

      // Change le sens de l'ordre de tri
      switch: () => {
        let orderBlock = document.querySelector('#order');
        orderBlock.querySelector("#croissant").classList.toggle("order_sens_unselected");
        orderBlock.querySelector("#decroissant").classList.toggle("order_sens_unselected");
        myApp.services.data.settings.order.croissant = !myApp.services.data.settings.order.croissant;
        myApp.services.storage.save.settings();
      },

      // Change la règle sur la priorité des tâches urgentes
      urgentBefore: (urgentBefore) => {
        myApp.services.data.settings.order.urgentBefore = urgentBefore;
        myApp.services.storage.save.settings();
      },

      // Changement de l'ordre de tri
      changeOrder: (order) => {
        myApp.services.data.settings.order.type = order.name;
        myApp.services.storage.save.settings();
      }
    }
  },

  /**
   * Chargement des données de démonstration
   */
  loadDemo: () => {
    myApp.services.data = JSON.parse(JSON.stringify(myApp.services.demoData));
    myApp.services.storage.save.tasks();
    myApp.services.storage.save.categories();
    myApp.services.storage.save.settings();
  },


  /**
   * Gestion de la persistance des données
   * Fonctionnalité P1
   */
  storage: {
    // Chargement depuis le stockage
    load: () => {
      myApp.services.data.tasks = JSON.parse(localStorage.getItem("tasks")) ?? {pending:[], completed:[]};
      myApp.services.data.categories = JSON.parse(localStorage.getItem("categories")) ?? [];
      myApp.services.data.settings = JSON.parse(localStorage.getItem("settings")) ?? {search: {includeDescription: false, includeSubTasks: false}, order: {type: ORDER_CREATION.name, croissant: true, urgentBefore: true}};
      ORDER.type = ORDER.available.find(f => f.name === myApp.services.data.settings.order.type);
      ORDER.urgentBefore = myApp.services.data.settings.order.urgentBefore;
      ORDER.croissant = myApp.services.data.settings.order.croissant;
    },

    // Sauvegarde des données dans le stockage
    save: {
      // Sauvegarde des tâches
      tasks: () => {
        localStorage.removeItem("tasks");
        localStorage.setItem("tasks", JSON.stringify(myApp.services.data.tasks));
      },

      // Sauvegarde des catégories
      categories: () => {
        localStorage.removeItem("categories");
        localStorage.setItem("categories", JSON.stringify(myApp.services.data.categories));
      },

      // Sauvegarde des paramètres
      settings: () => {
        localStorage.removeItem("settings");
        localStorage.setItem("settings", JSON.stringify(myApp.services.data.settings));
      }
    }
  },


  /**
   * Données en mémoire
   */
  data: {
    tasks: {
      pending: [],
      completed: []
    },
    categories: [],
    settings: {
      search: {
        includeDescription: false,
        includeSubTasks: false
      },
      order: {
        type: ORDER_CREATION.name,
        croissant: true,
        urgentBefore: true
      }
    }
  },


  /**
   * Données de démonstration
   */
  demoData: {
    tasks: {
      pending: [
        {
          title: 'Download OnsenUI',
          category: 'Programming',
          description: 'Some description.',
          highlight: false,
          urgent: false,
          echeance: "2022-05-13",
          myday: "",
          created: 1647077958676,
          completed: "",
          children: [
            {
              title: "sub task",
              completed: false,
              created: 1647087958676
            },
            {
              title: "another sub task",
              completed: true,
              created: 1647097958676
            }
          ]
        },
        {
          title: 'Install Monaca CLI',
          category: 'Programming',
          description: 'Some description.',
          highlight: true,
          urgent: true,
          echeance: "",
          myday: "2022-03-10",
          created: 1647077958677,
          completed: "",
          children: []
        },
        {
          title: 'Star Onsen UI repo on Github',
          category: 'Super important',
          description: 'Some description.',
          highlight: false,
          urgent: true,
          echeance: "",
          myday: "",
          created: 1647077958678,
          completed: "",
          children: []
        },
        {
          title: 'Register in the community forum',
          category: 'Super important',
          description: 'Some description.',
          highlight: true,
          urgent: false,
          echeance: "",
          myday: "",
          created: 1647077958679,
          completed: "",
          children: []
        },
        {
          title: 'Send donations to Fran and Andreas',
          category: 'Super important',
          description: 'Some description.',
          highlight: false,
          urgent: false,
          echeance: "",
          myday: "",
          created: 1647077958680,
          completed: "",
          children: []
        },
        {
          title: 'Profit',
          category: '',
          description: 'Some description.',
          highlight: false,
          urgent: false,
          echeance: "",
          myday: "",
          created: 1647077958681,
          completed: "",
          children: []
        },
        {
          title: 'Visit Japan',
          category: 'Travels',
          description: 'Some description.',
          highlight: false,
          urgent: false,
          echeance: "2022-03-12",
          myday: "",
          created: 1647077958682,
          completed: "",
          children: []
        },
        {
          title: 'Enjoy an Onsen with Onsen UI team',
          category: 'Personal',
          description: 'Some description.',
          highlight: false,
          urgent: false,
          echeance: "",
          myday: "2022-03-10",
          created: 1647077958683,
          completed: "",
          children: []
        }
      ],

      completed: [
        {
          title: 'Hey!',
          category: 'Personal',
          description: 'Some description.',
          highlight: false,
          urgent: false,
          echeance: "",
          myday: "2021-01-01",
          created: 1647000000000,
          completed: "2022-01-01",
          children: []
        }
      ]
    },

    categories: [
      {
        name: 'Programming',
        color: '#BC3BE7',
        created: 1647077958676
      },
      {
        name: 'Super important',
        color: '#ff0000',
        created: 1647077958677
      },
      {
        name: 'Travels',
        color: '#008cb7',
        created: 1647077958678
      },
      {
        name: 'Personal',
        color: "#00b725",
        created: 1647077958679
      }
    ],

    settings: {
      search: {
        includeDescription: false,
        includeSubTasks: false
      },
      order: {
        type: ORDER_CREATION.name,
        croissant: true,
        urgentBefore: true
      }
    }
  }
};


// Chargement des données depuis le stockage à la fin du chargement de ce fichier.
myApp.services.storage.load();
