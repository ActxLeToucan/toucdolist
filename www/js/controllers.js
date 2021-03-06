/**
 * CONTROLLERS
 * Le contrôleur ne doit pas agir directement sur les tâches des tableaux. Il doit appeler les méthodes de services.
 */

// Création des filtres
const FILTER_NO = "no_filter";
const FILTER_CATEG = "categ";
const FILTER_NO_CATEG = "no_categ";
const FILTER_ALL_CATEGS = "all_categs";
const FILTER_PLANNED = "with_echeance";
const FILTER_URGENT = "urgent";
const FILTER_MYDAY = "myday";
const FILTER_SEARCH = "search";

let FILTER = {
  type: FILTER_MYDAY,
  category: null,
  search: null
};

// Création des méthodes de tri
// Fonctionnalité S2
const ORDER_ALPHA = (e1, e2) => {
  return e1.title.localeCompare(e2.title);
};
const ORDER_CREATION = (e1, e2) => {
  if (e1.created === e2.created) return ORDER_ALPHA(e1, e2);
  return (e1.created < e2.created) ? -1 : 1;
};
const ORDER_ECHEANCE = (e1, e2) => {
  if (e1.echeance === e2.echeance) return ORDER_ALPHA(e1, e2);
  if (e1.echeance === '') return 1;
  if (e2.echeance === '') return -1;
  return e1.echeance.localeCompare(e2.echeance);
};
const ORDER_COMPLETION = (e1, e2) => {
  let res1 = myApp.services.tasks.subTasksCompleted(e1).ratio;
  let res2 = myApp.services.tasks.subTasksCompleted(e2).ratio;
  if (res1 === res2) return ORDER_ALPHA(e1, e2);
  return (res1 < res2) ? -1 : 1;
};
const ORDER_URGENT = (e1, e2) => {
  if (e1.urgent !== e2.urgent) {
    if (e1.urgent) return -1;
    if (e2.urgent) return 1;
  }
  return 0;
}

let ORDER = {
  type: ORDER_CREATION,
  croissant: true,
  urgentBefore: true,
  available: [
      ORDER_ALPHA,
      ORDER_COMPLETION,
      ORDER_CREATION,
      ORDER_ECHEANCE
  ],
  getName(order) {
    switch (order) {
      case ORDER_ALPHA: return "Alphabétique";
      case ORDER_COMPLETION: return "Taux de complétion";
      case ORDER_CREATION: return "Date de création";
      case ORDER_ECHEANCE: return "Date d'échéance";
      default: return "invalid";
    }
  }
};


let lastDelClicked = null;
let nbClickDeleteCateg = 0;
let nbClickDeleteSubtask = 0;
let nbClickLoadDemo = 0;

function getDateInFormatYearMonthDate(date, separator = '-') {
  return `${date.getFullYear()}${separator}${(date.getMonth()+1).toString().padStart(2, '0')}${separator}${date.getDate().toString().padStart(2, '0')}`;
}

function getDateInFormatDateMonthYear(date, separator = '-') {
  return `${date.getDate().toString().padStart(2, '0')}${separator}${(date.getMonth()+1).toString().padStart(2, '0')}${separator}${date.getFullYear()}`;
}


myApp.controllers = {
  /**
   * Génération de la page 'tabbarPage'
   * Ajout des listeners
   */
  tabbarPage: (page) => {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/new_task.html').then(() => {
          // application des paramètres par défaut à partir du filtre courant
          let newTaskPage = document.querySelector('#newTaskPage');
          switch (FILTER.type) {
            case FILTER_PLANNED: {
              // planification par défaut à la date du jour
              newTaskPage.querySelector('#echeance').value = getDateInFormatYearMonthDate(new Date());
              break;
            }
            case FILTER_URGENT: {
              newTaskPage.querySelector('#urgent').checked = true;
              break;
            }
            case FILTER_MYDAY: {
              newTaskPage.querySelector('#myday').checked = true;
              break;
            }
            default: {
              break;
            }
          }

          /**
           * Insertion des catégories sur la page de création d'une tâche
           * La catégorie présélectionnée est celle dans laquelle on se trouve.
           * Fonctionnalité P4
           */
          let categSelector = newTaskPage.querySelector("#select-categ").querySelector("select");
          myApp.services.data.categories.forEach(categ => {
            let elemCateg = ons.createElement(`
              <option ${categ.name === FILTER.category ? "selected" : ""}>${categ.name}</option>
            `);

            elemCateg.data = categ;

            categSelector.insertBefore(elemCateg, null);
          });
        });
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });
  },

  /**
   * Génération de la page 'menuPage'
   * Ajout des listeners
   */
  menuPage: (page) => {
    page.querySelector("#default-category-list").querySelectorAll("ons-radio").forEach(radio => {
      radio.onchange = myApp.controllers.filter.eventHandler;
    });
    page.querySelector("#search-input").oninput = () => myApp.controllers.filter.set(FILTER_SEARCH);

    page.querySelector('#button-settings').onclick = () => {
      document.querySelector('#myNavigator').pushPage('html/settings.html').then(myApp.controllers.affichage.updateSettings);
    };
  },


  /**
   * Gestion de l'affichage
   */
  affichage: {
    /**
     * Mise à jour des listes "en attente" et "terminées"
     */
    updateLists: () => {
      myApp.services.tasks.show.pendingList();
      myApp.services.tasks.show.completedList();
    },

    /**
     * Mise à jour des catégories
     */
    updateCategories: () => {
      myApp.services.categories.show();
    },

    /**
     * Mise à jour de la page des options avancées
     */
    updateSettings: () => {
      // stats
      document.querySelector('#stats-categs').querySelector(".stats-number").innerText = myApp.services.data.categories.length;
      document.querySelector('#stats-todo').querySelector(".stats-number").innerText = myApp.services.data.tasks.pending.length;
      document.querySelector('#stats-completed').querySelector(".stats-number").innerText = myApp.services.data.tasks.completed.length;
      document.querySelector('#stats-late').querySelector(".stats-number").innerText = myApp.services.tasks.late();
      let tasksInCategs = myApp.services.data.categories.reduce((prev, curr) => prev + myApp.services.categories.tasks(curr.name).length, 0);
      document.querySelector('#stats-avg-tasks-in-categs').querySelector(".stats-number").innerText = myApp.services.data.categories.length > 0 ? (tasksInCategs / myApp.services.data.categories.length).toFixed(1) : '0.0';
      let durations = myApp.services.data.tasks.completed.reduce((prev, curr) => prev + myApp.services.tasks.duration(curr), 0);
      document.querySelector("#stats-avg-time").querySelector(".stats-number").innerText = myApp.services.data.tasks.completed.length > 0 ? Math.ceil(durations / myApp.services.data.tasks.completed.length) : 0;

      // search
      let includeDescr = document.querySelector("#search-include-descr");
      let includeSubTasks = document.querySelector("#search-include-subtasks");
      includeDescr.checked = myApp.services.data.settings.search.includeDescription;
      includeSubTasks.checked = myApp.services.data.settings.search.includeSubTasks;
      includeDescr.onchange = () => {
        myApp.services.settings.search.changeIncludeDescription();
        myApp.controllers.affichage.updateLists();
      }
      includeSubTasks.onchange = () => {
        myApp.services.settings.search.changeIncludeSubTasks();
        myApp.controllers.affichage.updateLists();
      }

      // mode demo
      document.querySelector('#button-demo').onclick = () => {
        if (nbClickLoadDemo === 0) {
          nbClickLoadDemo = 1;
          document.querySelector('#demo').insertBefore(ons.createElement("<p id='confirm-load-demo'>Cliquez à nouveau sur le bouton pour confirmer.</p>"), document.querySelector('#button-demo'));
        } else {
          nbClickLoadDemo = 0;
          document.querySelector('#demo #confirm-load-demo').remove();
          myApp.services.loadDemo();
          myApp.controllers.affichage.updateOrder();
          myApp.controllers.affichage.updateLists();
          myApp.controllers.affichage.updateCategories();
          myApp.controllers.affichage.updateSettings();
        }
      }

      // clear
      document.querySelector('#button-delete-all-categs').onclick = myApp.controllers.categories.clear.createAlertDialog;
      document.querySelector('#button-delete-all-tasks').onclick = myApp.controllers.tasks.clear.createAlertDialog;
    },

    /**
     * Affiche les détails de la tâche
     * @param data tâche
     * @param completed indique si la tâche est terminée ou non
     */
    updateDetails: (data, completed) => {
      myApp.services.tasks.generate.details(data, completed);
    },

    /**
     * Affiche / Met à jour la sélection du tri des tâches
     */
    updateOrder: () => {
      myApp.services.settings.order.show();
    }
  },


  /**
   * Gestion des évènements sur les tâches
   */
  tasks: {
    /**
     * Ajout d'une tâche
     * @param page page contenant le formulaire d'ajout
     */
    add: (page) => {
      const titre = page.getElementById("titre").value.trim();
      const description = page.getElementById("description").value.trim();
      const myday = page.getElementById('myday').checked;
      const categorie = page.querySelector("#select-categ").querySelector("select").value === "aucune" ? "" : page.querySelector("#select-categ").querySelector("select").value;
      const highlight = page.querySelector('.highlight-checkbox').checked;
      const urgent = page.querySelector('.urgent-checkbox').checked;
      const echeance = page.querySelector('.echeance').value;

      if (titre === "") return;

      const newTask = {
        title: titre,
        category: categorie,
        description: description,
        highlight: highlight,
        urgent: urgent,
        echeance: echeance,
        myday: (myday ? getDateInFormatYearMonthDate(new Date()) : ""),
        created: Date.now(),
        completed: "",
        children: []
      };
      myApp.services.tasks.add(newTask)
      myApp.controllers.affichage.updateLists();

      document.querySelector('ons-navigator').popPage();
    },

    /**
     * Suppression de toutes les tâches
     * Fonctionnalité P3
     */
    clear: {
      createAlertDialog: () => {
        let dialog = document.getElementById('alert-dialog-clear-tasks');

        if (dialog) {
          myApp.controllers.tasks.clear.showDialog(dialog);
        } else {
          ons.createElement('clear-tasks.html', { append: true })
              .then(function (dialog) {
                myApp.controllers.tasks.clear.showDialog(dialog);
              });
        }
      },

      showDialog: (dialog) => {
        dialog.show();
        dialog.childNodes[0].addEventListener("click", myApp.controllers.tasks.clear.hideAlertDialog);
      },

      hideAlertDialog: () => {
        document.getElementById('alert-dialog-clear-tasks').hide();
      },

      clear: () => {
        myApp.controllers.tasks.clear.hideAlertDialog();
        myApp.services.tasks.clear();
        myApp.controllers.affichage.updateSettings();
        myApp.controllers.affichage.updateLists();
      }
    },

    /**
     * Suppression d'une tâche
     */
    delete: {
      createAlertDialog: (event) => {
        lastDelClicked = event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode;
        lastDelClicked.classList.add("task-del");

        let dialog = document.getElementById('alert-dialog-delete-task');

        if (dialog) {
          myApp.controllers.tasks.delete.showDialog(dialog);
        } else {
          ons.createElement('delete-task.html', { append: true })
              .then(function (dialog) {
                myApp.controllers.tasks.delete.showDialog(dialog);
              });
        }
      },

      showDialog: (dialog) => {
        dialog.show();
        dialog.childNodes[0].addEventListener("click", myApp.controllers.tasks.delete.hideAlertDialog);
      },

      hideAlertDialog: () => {
        if (lastDelClicked) lastDelClicked.classList.remove("task-del");
        document.getElementById('alert-dialog-delete-task').hide();
      },

      delete: () => {
        lastDelClicked.classList.add("animation-remove");
        myApp.controllers.tasks.delete.hideAlertDialog();
        myApp.services.tasks.delete(lastDelClicked.data, lastDelClicked.querySelector("ons-checkbox").checked);
        myApp.controllers.affichage.updateSettings();
      }
    },

    /**
     * Affiche les détails de la tâche sur laquelle on clique
     * @param event évènement déclencheur
     */
    details: (event) => {
      let task = (event.target.localName === "div" ? event.target.parentNode : event.target.parentNode.parentNode);
      document.querySelector('ons-navigator').pushPage('html/details_task.html').then(() =>
          myApp.controllers.affichage.updateDetails(task.data, task.querySelector("ons-checkbox").checked)
      );
    },

    /**
     * Modification d'une tâche
     */
    edit: {
      // Changement de la catégorie d'une tâche
      category: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;
        let newValue = (event.target.value === "aucune" ? "" : event.target.value);
        myApp.services.tasks.edit.category(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists();
      },

      // Changement de la description d'une tâche
      description: (event, newValue) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.description(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists()
      },

      // Définition de l'échéance d'une tâche
      echeance: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.echeance(task.data, task.completed, event.target.value);

        // une tache non terminée qui arrive à échéance aujourd'hui ou en retard est forcément dans "ma journée"
        let date = new Date();
        if (!task.completed && (task.data.echeance && (task.data.echeance === getDateInFormatYearMonthDate(date)) || new Date(task.data.echeance) < date)) {
          task.querySelector('.myday-checkbox').checked = true;
        }

        myApp.controllers.affichage.updateLists();
      },

      // Définition d'une tâche comme urgente
      priority: (event) => {
        let task = event.target.parentNode.parentNode;
        myApp.services.tasks.edit.priority(task.data, task.completed);
        myApp.controllers.affichage.updateLists();
      },

      // Mise en évidence d'une tâche
      highlight: (event) => {
        let task = event.target.parentNode.parentNode;
        myApp.services.tasks.edit.highlight(task.data, task.completed);
        myApp.controllers.affichage.updateLists();
      },

      // Ajout ou retrait d'une tâche à 'Ma journée'
      myday: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;

        // une tache non terminée qui arrive à échéance aujourd'hui ou en retard est forcément dans "ma journée"
        let date = new Date();
        if (!task.completed && (task.data.echeance && (task.data.echeance === getDateInFormatYearMonthDate(date)) || new Date(task.data.echeance) < date)) {
          event.target.checked = true;
        }

        myApp.services.tasks.edit.myday(task.data, task.completed, event.target.checked);
        myApp.controllers.affichage.updateLists();
      },

      // Changement de l'état (terminé ou en attente) d'une tâche
      state: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;
        if (event.target.checked) {
          task.classList.add("animation-swipe-right");
          myApp.services.tasks.setState(task.data, true);
        } else {
          task.classList.add("animation-swipe-left");
          myApp.services.tasks.setState(task.data, false);
        }
      },

      // Gestion des sous-tâches d'une tâche
      subTasks: {
        // Ajout d'une sous-tâche
        add: {
          createAlertDialog: () => {
            let dialog = document.getElementById('alert-dialog-new-subtask');

            if (dialog) {
              myApp.controllers.tasks.edit.subTasks.add.showDialog(dialog);
            } else {
              ons.createElement('new-subtask.html', { append: true })
                  .then(function (dialog) {
                    myApp.controllers.tasks.edit.subTasks.add.showDialog(dialog);
                  });
            }
          },

          showDialog: (dialog) => {
            dialog.show();
            dialog.childNodes[0].addEventListener("click", myApp.controllers.tasks.edit.subTasks.add.hideAlertDialog);
            dialog.querySelector('#button-cancel-new-subtask').addEventListener('click', myApp.controllers.tasks.edit.subTasks.add.hideAlertDialog);
            dialog.querySelector('#button-alert-new-subtask').addEventListener('click', myApp.controllers.tasks.edit.subTasks.add.add);
          },

          hideAlertDialog: (event) => {
            document.getElementById('alert-dialog-new-subtask').hide();
            let input = event.target.parentNode.parentNode.querySelector('#input-new-subtask');
            input.value = "";
          },

          add: (event) => {
            let input = event.target.parentNode.parentNode.querySelector('#input-new-subtask');
            let name = input.value.trim();
            let task = document.querySelector("#details-task-page-content");

            if (name) {
              let subTask = {
                title: name,
                completed: false,
                created: Date.now()
              };
              myApp.controllers.tasks.edit.subTasks.add.hideAlertDialog(event);
              myApp.services.tasks.edit.subTasks.add(task.data, task.completed, subTask);
              myApp.controllers.affichage.updateLists();
              myApp.controllers.affichage.updateDetails(task.data, task.completed);
            }
          }
        },

        // Edition d'une sous-tâche
        edit: {
          // Changement de l'état (terminé ou non) d'une sous-tâche
          state: (event) => {
            let subTask = event.target.parentNode.parentNode.parentNode;
            let task = subTask.parentNode.parentNode;
            myApp.services.tasks.edit.subTasks.setState(task.data, task.completed, subTask.data);
            myApp.controllers.affichage.updateLists();
          },

          createAlertDialog: (event) => {
            let dialog = document.getElementById('alert-dialog-edit-subtask');

            let data = (event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode).data;

            if (dialog) {
              myApp.controllers.tasks.edit.subTasks.edit.showDialog(dialog, data);
            } else {
              ons.createElement('edit-subtask.html', { append: true })
                  .then(function (dialog) {
                    myApp.controllers.tasks.edit.subTasks.edit.showDialog(dialog, data);
                  });
            }
          },

          showDialog: (dialog, data) => {
            dialog.show();
            dialog.childNodes[0].addEventListener("click", myApp.controllers.tasks.edit.subTasks.edit.hideAlertDialog);

            dialog.data = data;

            dialog.querySelector('#input-edit-subtask').value = data.title;

            dialog.querySelector('#button-alert-edit-subtask').addEventListener('click', myApp.controllers.tasks.edit.subTasks.edit.title);
            dialog.querySelector('#button-alert-delete-subtask').addEventListener('click', myApp.controllers.tasks.edit.subTasks.delete);
          },

          hideAlertDialog: (event) => {
            document.getElementById('alert-dialog-edit-subtask').hide();
            let res = event.target.parentNode.parentNode.querySelector('.res-button');
            res.innerText = "";
            nbClickDeleteSubtask = 0;
          },

          // Changement du titre d'une sous-tâche
          title: (event) => {
            let task = document.querySelector("#details-task-page-content");
            let data = event.target.parentNode.parentNode.parentNode.parentNode.data;

            let input = event.target.parentNode.parentNode.querySelector('#input-edit-subtask');
            let name = input.value.trim();

            if (name) {
              myApp.controllers.tasks.edit.subTasks.edit.hideAlertDialog(event);
              myApp.services.tasks.edit.subTasks.edit.name(task.data, task.completed, data, name);
              myApp.controllers.affichage.updateLists();
              myApp.controllers.affichage.updateDetails(task.data, task.completed);
            }
          }
        },

        // Suppression d'une sous-tâche
        delete: (event) => {
          let task = document.querySelector("#details-task-page-content");
          let data = event.target.parentNode.parentNode.parentNode.parentNode.data;
          let res = event.target.parentNode.parentNode.querySelector('.res-button');

          if (nbClickDeleteSubtask === 0) {
            res.innerText = "Cette action est irréversible.\nAppuyez à nouveau sur le bouton \"Supprimer\" pour confirmer.";
            nbClickDeleteSubtask = 1;
          } else {
            myApp.controllers.tasks.edit.subTasks.edit.hideAlertDialog(event);
            myApp.services.tasks.edit.subTasks.delete(task.data, task.completed, data);
            myApp.controllers.affichage.updateLists();
            myApp.controllers.affichage.updateDetails(task.data, task.completed);
          }
        }
      },

      // Changement du titre d'une tâche
      title: (event, newValue) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.title(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists();
      }
    }
  },


  /**
   * Gestion des catégories
   */
  categories: {
    /**
     * Ajout d'une nouvelle catégorie
     */
    add: {
      createAlertDialog: () => {
        let dialog = document.getElementById('alert-dialog-new-categ');

        if (dialog) {
          myApp.controllers.categories.add.showDialog(dialog);
        } else {
          ons.createElement('new-categ.html', { append: true })
              .then(function (dialog) {
                myApp.controllers.categories.add.showDialog(dialog);
              });
        }
      },

      showDialog: (dialog) => {
        dialog.show();
        dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.add.hideAlertDialog);
        dialog.querySelector('#button-cancel-categ').addEventListener('click', myApp.controllers.categories.add.hideAlertDialog);
        dialog.querySelector('#button-alert-new-categ').addEventListener('click', myApp.controllers.categories.add.add);
      },

      hideAlertDialog: (event) => {
        document.getElementById('alert-dialog-new-categ').hide();
        let input = event.target.parentNode.parentNode.querySelector('#input-new-categ');
        let color = event.target.parentNode.parentNode.querySelector('#input-new-categ-color');
        let res = event.target.parentNode.parentNode.querySelector('.res-button');
        input.value = "";
        res.innerText = "";
        color.value = "000000";
      },

      add: (event) => {
        let input = event.target.parentNode.parentNode.querySelector('#input-new-categ');
        let res = event.target.parentNode.parentNode.querySelector('.res-button');
        let color = event.target.parentNode.parentNode.querySelector('#input-new-categ-color').value;
        let name = input.value.trim();

        let categs = myApp.services.categories.getByName(name);

        if (name && categs.length === 0) {
          myApp.controllers.categories.add.hideAlertDialog(event);
          myApp.services.categories.add(name, color);
          myApp.controllers.affichage.updateLists();
          myApp.controllers.affichage.updateCategories();
        } else {
          res.innerText = "Nom de catégorie invalide.";
        }
      }
    },

    /**
     * Modification d'une catégorie
     */
    edit: {
      createAlertDialog: (event) => {
        let dialog = document.getElementById('alert-dialog-edit-categ');

        let data = (event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode).data;

        if (dialog) {
          myApp.controllers.categories.edit.showDialog(dialog, data);
        } else {
          ons.createElement('edit-categ.html', { append: true })
              .then(function (dialog) {
                myApp.controllers.categories.edit.showDialog(dialog, data);
              });
        }
      },

      showDialog: (dialog, data) => {
        dialog.show();
        dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.edit.hideAlertDialog);

        dialog.data = data;

        dialog.querySelector('#input-edit-categ').value = data.name;
        dialog.querySelector('#input-edit-categ-color').value = data.color;

        dialog.querySelector('#button-alert-edit-categ').addEventListener('click', myApp.controllers.categories.edit.edit);
        dialog.querySelector('#button-alert-delete-categ').addEventListener('click', myApp.controllers.categories.delete);
      },

      hideAlertDialog: (event) => {
        document.getElementById('alert-dialog-edit-categ').hide();
        let res = event.target.parentNode.parentNode.querySelector('.res-button');
        let checkBoxBlock = event.target.parentNode.parentNode.querySelector('#remove-categ-tasks-block');
        res.innerText = "";
        if (!checkBoxBlock.classList.contains('block-hidden')) checkBoxBlock.classList.add('block-hidden');
        nbClickDeleteCateg = 0;
      },

      edit: (event) => {
        let data = event.target.parentNode.parentNode.parentNode.parentNode.data;

        let input = event.target.parentNode.parentNode.querySelector('#input-edit-categ');
        let res = event.target.parentNode.parentNode.querySelector('.res-button');
        let color = event.target.parentNode.parentNode.querySelector('#input-edit-categ-color').value;
        let name = input.value.trim();

        let categs = myApp.services.categories.getByName(name);

        if (name && ((categs.length === 0) || (categs.length === 1 && categs[0] === data))) {
          myApp.controllers.categories.edit.hideAlertDialog(event);
          myApp.services.categories.edit(data, name, color);
          myApp.controllers.affichage.updateLists();
          myApp.controllers.affichage.updateCategories();
        } else {
          res.innerText = "Nom de catégorie invalide.";
        }
      }
    },

    /**
     * Suppression de toutes les catégories
     */
    clear: {
      createAlertDialog: () => {
        let dialog = document.getElementById('alert-dialog-clear-categories');

        if (dialog) {
          myApp.controllers.categories.clear.showDialog(dialog);
        } else {
          ons.createElement('clear-categories.html', { append: true })
              .then(function (dialog) {
                myApp.controllers.categories.clear.showDialog(dialog);
              });
        }
      },

      showDialog: (dialog) => {
        dialog.show();
        dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.clear.hideAlertDialog);
      },

      hideAlertDialog: () => {
        document.getElementById('alert-dialog-clear-categories').hide();
      },

      clear: () => {
        myApp.controllers.categories.clear.hideAlertDialog();
        myApp.services.categories.clear();
        myApp.controllers.affichage.updateSettings();
        myApp.controllers.affichage.updateCategories();
        myApp.controllers.affichage.updateLists();
      }
    },

    /**
     * Suppression d'une catégorie
     */
    delete: (event) => {
      let data = event.target.parentNode.parentNode.parentNode.parentNode.data;
      let res = event.target.parentNode.parentNode.querySelector('.res-button');
      // Fonctionnalité S4
      let checkBoxBlock = event.target.parentNode.parentNode.querySelector('#remove-categ-tasks-block');

      if (nbClickDeleteCateg === 0) {
        checkBoxBlock.classList.remove('block-hidden');
        res.innerText = "Cette action est irréversible.\nAppuyez à nouveau sur le bouton \"Supprimer\" pour confirmer.";
        nbClickDeleteCateg = 1;
      } else {
        myApp.controllers.categories.edit.hideAlertDialog(event);
        myApp.services.categories.delete(data, checkBoxBlock.querySelector("#remove-categ-tasks").checked);
        myApp.controllers.filter.set(FILTER_ALL_CATEGS);
        myApp.controllers.affichage.updateLists();
        myApp.controllers.affichage.updateCategories();
      }
    }
  },


  /**
   * Gestion des filtres
   */
  filter: {
    // onchange events handler
    eventHandler: (event) => {
      let categ = event.target.parentNode.parentNode.parentNode;
      if (categ.data) {
        myApp.controllers.filter.set(FILTER_CATEG, categ.data.name);
      } else {
        switch (event.target.id) {
          case "r-myday": {
            myApp.controllers.filter.set(FILTER_MYDAY);
            break;
          }
          case "r-urgent": {
            myApp.controllers.filter.set(FILTER_URGENT);
            break;
          }
          case "r-planned": {
            myApp.controllers.filter.set(FILTER_PLANNED);
            break;
          }
          case "r-all": {
            myApp.controllers.filter.set(FILTER_ALL_CATEGS);
            break;
          }
          case "r-no": {
            myApp.controllers.filter.set(FILTER_NO_CATEG);
            break;
          }
          default: {
            myApp.controllers.filter.set(FILTER_NO);
            break;
          }
        }
      }
    },

    /**
     * Application d'un filtre
     * @param filter filtre à appliquer
     * @param categ nom de la catégorie courante (si existe)
     */
    set: (filter = FILTER_NO, categ = null) => {
      FILTER.type = filter;
      FILTER.category = categ;
      FILTER.search = null;
      let defaultFilers = document.querySelector("#default-category-list");
      let title = document.querySelector("#tabbarPage").querySelector(".center");
      switch (FILTER.type) {
        case FILTER_NO: {
          title.innerText = "À faire";
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case FILTER_SEARCH: {
          FILTER.search = defaultFilers.parentNode.querySelector("#search-input").value;
          title.innerText = "Résultats de recherche";
          defaultFilers.parentNode.querySelector("#r-search").checked = true;
          break;
        }
        case FILTER_CATEG: {
          title.innerText = categ;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case FILTER_NO_CATEG: {
          title.innerText = "Sans catégorie";
          defaultFilers.querySelector("#r-no").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case FILTER_ALL_CATEGS: {
          title.innerText = "Toutes les catégories";
          defaultFilers.querySelector("#r-all").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case FILTER_PLANNED: {
          title.innerText = "📅 Planifié";
          defaultFilers.querySelector("#r-planned").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case FILTER_URGENT: {
          title.innerText = "❗ Important";
          defaultFilers.querySelector("#r-urgent").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case FILTER_MYDAY: {
          title.innerText = "🌞 Ma journée";
          defaultFilers.querySelector("#r-myday").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
      }
      myApp.controllers.affichage.updateLists();
    }
  },


  /**
   * Gestion du tri
   */
  order: {
    // onchange events handler
    eventHandler: (event) => {
      myApp.controllers.order.set(ORDER.available.find(f => f.name === event.target.value));
      myApp.services.settings.order.changeOrder(ORDER.type);
    },

    /**
     * Changement du sens
     */
    switch: () => {
      ORDER.croissant = !ORDER.croissant;
      myApp.services.settings.order.switch();
      myApp.controllers.affichage.updateLists();
    },

    /**
     * Définition de la règle sur les tâches urgentes
     * @param event évènement déclencheur
     */
    urgentBefore: (event) => {
      let checked = event.target.checked;
      ORDER.urgentBefore = checked;
      myApp.services.settings.order.urgentBefore(checked);
      myApp.controllers.affichage.updateLists();
    },

    /**
     * Application d'un ordre de tri
     * @param order ordre de tri à appliquer (par défaut : ordre de création)
     * @param croissant sens (par défaut : le sens courant)
     * @param urgentBefore placer les tâches urgentes avant (par défaut : la règle courante)
     */
    set: (order = ORDER_CREATION, croissant = ORDER.croissant, urgentBefore = ORDER.urgentBefore) => {
      ORDER.type = order;
      ORDER.croissant = croissant;
      ORDER.urgentBefore = urgentBefore;
      myApp.controllers.affichage.updateLists();
    }
  }
};