/**
 * CONTROLLERS
 * Le contrôleur ne doit pas agir directement sur les tâches des tableaux. Il doit appeler les méthodes de services.
 */

const NO_FILTER = "no_filter";
const CATEG = "categ";
const NO_CATEG = "no_categ";
const ALL_CATEGS = "all_categs";
const PLANNED = "with_echeance";
const URGENT = "urgent";
const MYDAY = "myday";
const SEARCH = "search";

let FILTER = {
  type: MYDAY,
  category: null,
  search: null
};

let lastDelClicked = null;
let nbClickDeleteCateg = 0;

function getDateInFormatYearMonthDate(date, separator = '-') {
  return `${date.getFullYear()}${separator}${(date.getMonth()+1).toString().padStart(2, '0')}${separator}${date.getDate().toString().padStart(2, '0')}`;
}

function getDateInFormatDateMonthYear(date, separator = '-') {
  return `${date.getDate().toString().padStart(2, '0')}${separator}${(date.getMonth()+1).toString().padStart(2, '0')}${separator}${date.getFullYear()}`;
}

myApp.controllers = {
  tabbarPage: (page) => {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();

      document.querySelector("#default-category-list").querySelectorAll("ons-radio").forEach(radio => {
        radio.onchange = myApp.controllers.filter.eventHandler;
      });
      document.querySelector("#search-input").oninput = () => myApp.controllers.filter.set(SEARCH);

      document.querySelector('#button-settings').onclick = () => {
        document.querySelector('#myNavigator').pushPage('html/settings.html').then(myApp.controllers.affichage.updateSettings);
      };
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/new_task.html').then(() => {
          // application des paramètres par défaut à partir du filtre courant
          let newTaskPage = document.querySelector('#newTaskPage');
          switch (FILTER.type) {
            case PLANNED: {
              // planification par défaut à la date du jour
              newTaskPage.querySelector('#echeance').value = getDateInFormatYearMonthDate(new Date());
              break;
            }
            case URGENT: {
              newTaskPage.querySelector('#urgent').checked = true;
              break;
            }
            case MYDAY: {
              newTaskPage.querySelector('#myday').checked = true;
              break;
            }
            default: {
              break;
            }
          }

          // insertion des catégories
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



  affichage: {
    updateLists: () => {
      myApp.services.tasks.show.pendingList();
      myApp.services.tasks.show.completedList();
    },

    updateCategories: () => {
      myApp.services.categories.show();
    },

    updateSettings: () => {
      document.querySelector('#stats-categs').querySelector(".stats-number").innerText = myApp.services.data.categories.length;
      document.querySelector('#stats-todo').querySelector(".stats-number").innerText = myApp.services.data.tasks.pending.length;
      document.querySelector('#stats-completed').querySelector(".stats-number").innerText = myApp.services.data.tasks.completed.length;
      document.querySelector('#stats-late').querySelector(".stats-number").innerText = myApp.services.tasks.late();
      let tasksInCategs = myApp.services.data.categories.reduce((prev, curr) => prev + myApp.services.categories.tasks(curr.name), 0);
      document.querySelector('#stats-avg-tasks-in-categs').querySelector(".stats-number").innerText = myApp.services.data.categories.length > 0 ? (tasksInCategs / myApp.services.data.categories.length).toFixed(1) : '0.0';
      let durations = myApp.services.data.tasks.completed.reduce((prev, curr) => prev + myApp.services.tasks.duration(curr), 0);
      document.querySelector("#stats-avg-time").querySelector(".stats-number").innerText = myApp.services.data.tasks.completed.length > 0 ? Math.ceil(durations / myApp.services.data.tasks.completed.length) : 0;

      document.querySelector('#button-delete-all-categs').onclick = myApp.controllers.categories.clear.createAlertDialog;
      document.querySelector('#button-delete-all-tasks').onclick = myApp.controllers.tasks.clear.createAlertDialog;
    }
  },



  tasks: {
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
        completed: ""
      };
      myApp.services.tasks.add(newTask)
      myApp.controllers.affichage.updateLists();

      document.querySelector('ons-navigator').popPage();
    },

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

    details: (event) => {
      let task = event.target.parentNode;
      document.querySelector('ons-navigator').pushPage('html/details_task.html').then(() =>
          myApp.services.tasks.generate.details(task.data, task.querySelector("ons-checkbox").checked)
      );
    },

    edit: {
      category: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;
        let newValue = (event.target.value === "aucune" ? "" : event.target.value);
        myApp.services.tasks.edit.category(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists();
      },

      description: (event, newValue) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.description(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists()
      },

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

      priority: (event) => {
        let task = event.target.parentNode.parentNode;
        myApp.services.tasks.edit.priority(task.data, task.completed);
        myApp.controllers.affichage.updateLists();
      },

      highlight: (event) => {
        let task = event.target.parentNode.parentNode;
        myApp.services.tasks.edit.highlight(task.data, task.completed);
        myApp.controllers.affichage.updateLists();
      },

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

      title: (event, newValue) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.title(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists();
      }
    }
  },



  categories: {
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
        res.innerText = "";
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

    delete: (event) => {
      let data = event.target.parentNode.parentNode.parentNode.parentNode.data;
      let res = event.target.parentNode.parentNode.querySelector('.res-button');

      if (nbClickDeleteCateg === 0) {
        res.innerText = "Cette action est irréversible. En continuant, les tâches de cette catégorie deviendront sans catégorie.\nAppuyez à nouveau sur le bouton \"Supprimer\" pour confirmer.";
        nbClickDeleteCateg = 1;
      } else {
        myApp.controllers.categories.edit.hideAlertDialog(event);
        myApp.services.categories.delete(data);
        myApp.controllers.filter.set(ALL_CATEGS);
        myApp.controllers.affichage.updateLists();
        myApp.controllers.affichage.updateCategories();
      }
    }
  },



  filter: {
    // onchange events handler
    eventHandler: (event) => {
      let categ = event.target.parentNode.parentNode.parentNode;
      if (categ.data) {
        myApp.controllers.filter.set(CATEG, categ.data.name);
      } else {
        switch (event.target.id) {
          case "r-myday": {
            myApp.controllers.filter.set(MYDAY);
            break;
          }
          case "r-urgent": {
            myApp.controllers.filter.set(URGENT);
            break;
          }
          case "r-planned": {
            myApp.controllers.filter.set(PLANNED);
            break;
          }
          case "r-all": {
            myApp.controllers.filter.set(ALL_CATEGS);
            break;
          }
          case "r-no": {
            myApp.controllers.filter.set(NO_CATEG);
            break;
          }
          default: {
            myApp.controllers.filter.set(NO_FILTER);
            break;
          }
        }
      }
    },

    set: (filter = NO_FILTER, categ = null) => {
      FILTER.type = filter;
      FILTER.category = categ;
      FILTER.search = null;
      let defaultFilers = document.querySelector("#default-category-list");
      let title = document.querySelector("#tabbarPage").querySelector(".center");
      switch (FILTER.type) {
        case NO_FILTER: {
          title.innerText = "À faire";
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case SEARCH: {
          FILTER.search = defaultFilers.parentNode.querySelector("#search-input").value;
          title.innerText = "Résultats de recherche";
          defaultFilers.parentNode.querySelector("#r-search").checked = true;
          break;
        }
        case CATEG: {
          title.innerText = categ;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case NO_CATEG: {
          title.innerText = "Sans catégorie";
          defaultFilers.querySelector("#r-no").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case ALL_CATEGS: {
          title.innerText = "Toutes les catégories";
          defaultFilers.querySelector("#r-all").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case PLANNED: {
          title.innerText = "📅 Planifié";
          defaultFilers.querySelector("#r-planned").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case URGENT: {
          title.innerText = "❗ Important";
          defaultFilers.querySelector("#r-urgent").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
        case MYDAY: {
          title.innerText = "🌞 Ma journée";
          defaultFilers.querySelector("#r-myday").checked = true;
          defaultFilers.parentNode.querySelector("#search-input").value = "";
          break;
        }
      }
      myApp.controllers.affichage.updateLists();
    }
  }
};