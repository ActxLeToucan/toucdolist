/**
 * CONTROLLERS
 * Le contrôleur ne doit pas agir directement sur les tâches des tableaux. Il doit appeler les méthodes de services.
 */


let lastDelClicked = null;
let nbClickDeleteCateg = 0;

myApp.controllers = {
  tabbarPage: (page) => {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
      document.querySelector("#default-category-list").querySelectorAll("ons-radio").forEach(radio => {
        radio.addEventListener("change", myApp.controllers.categories.set);
      });
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/new_task.html').then(() => {
          let categSelector = document.querySelector("#select-categ").querySelector("select");
          myApp.services.data.categories.forEach(categ => {
            let elemCateg = ons.createElement(`
              <option>${categ.name}</option>
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
    }
  },



  tasks: {
    add: (page) => {
      const titre = page.getElementById("titre").value.trim();
      const description = page.getElementById("description").value.trim();
      const categorie = page.querySelector("#select-categ").querySelector("select").value;
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
        created: Date.now()
      };
      myApp.services.tasks.add(newTask)
      myApp.controllers.affichage.updateLists();

      document.querySelector('ons-navigator').popPage();
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
      },
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
        console.log(task);
        myApp.services.tasks.edit.description(task.data, task.completed, newValue);
        myApp.controllers.affichage.updateLists()
      },

      echeance: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.echeance(task.data, task.completed, event.target.value);
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
      },
    },
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
      },
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

    delete: (event) => {
      let data = event.target.parentNode.parentNode.parentNode.parentNode.data;
      let res = event.target.parentNode.parentNode.querySelector('.res-button');

      if (nbClickDeleteCateg === 0) {
        res.innerText = "Cette action est irréversible. En continuant, les tâches de cette catégorie deviendront sans catégorie.\nAppuyez à nouveau sur le bouton \"Supprimer\" pour confirmer.";
        nbClickDeleteCateg = 1;
      } else {
        myApp.controllers.categories.edit.hideAlertDialog(event);
        myApp.services.categories.delete(data);
        myApp.controllers.setFilter(NO_FILTER);
        myApp.controllers.affichage.updateLists();
        myApp.controllers.affichage.updateCategories();
      }
    },

    set: (event) => {
      let categ = event.target.parentNode.parentNode.parentNode;
      if (categ.data) {
        myApp.controllers.setFilter(CATEG, categ.data.name);
      } else {

      }
    }
  },

  setFilter: (filter = NO_FILTER, categ = null) => {
    FILTER.type = filter;
    FILTER.category = categ;
    let defaultFilers = document.querySelector("#default-category-list");
    let categoryFilters = document.querySelector("#custom-category-list");
    switch (FILTER.type) {
      case NO_FILTER: {
        break;
      }
      case CATEG: {
        break;
      }
      case NO_CATEG: {
        defaultFilers.querySelector("#r-no").checked = true;
        break;
      }
      case ALL_CATEGS: {
        defaultFilers.querySelector("#r-all").checked = true;
        break;
      }
      case PLANNED: {
        defaultFilers.querySelector("#r-planned").checked = true;
        break;
      }
      case URGENT: {
        defaultFilers.querySelector("#r-urgent").checked = true;
        break;
      }
      case DAY: {
        defaultFilers.querySelector("#r-today").checked = true;
        break;
      }
    }
    myApp.controllers.affichage.updateLists();
  },
};
