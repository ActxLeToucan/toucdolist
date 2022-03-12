/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

/**
 * CONTROLLERS
 * Le contrôleur ne doit pas agir directement sur les tâches des tableaux. Il doit appeler les méthodes de services.
 */


let lastDelClicked = null;
let nbClickDeleteCateg = 0;

myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: (page) => {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/new_task.html');
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });
  },

  updateAffichage: () => {
    myApp.services.tasks.show.pendingList();
    myApp.services.tasks.show.completedList();
    myApp.services.categories.show();
  },

  tasks: {
    add: (page) => {
      const titre = page.getElementById("titre").value.trim();
      const description = page.getElementById("description").value.trim();
      const categorie = page.getElementById("categorie").value.trim();
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
        echeance: echeance
      };
      myApp.services.tasks.add(newTask)
      myApp.controllers.updateAffichage();

      document.querySelector('ons-navigator').popPage();
    },

    delete: {
      createAlertDialog: (event) => {
        lastDelClicked = event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode;
        lastDelClicked.classList.add("task-del");

        let dialog = document.getElementById('alert-dialog-delete-task');

        if (dialog) {
          dialog.show();
          dialog.childNodes[0].addEventListener("click", myApp.controllers.tasks.delete.hideAlertDialog);
        } else {
          ons.createElement('delete-task.html', { append: true })
              .then(function (dialog) {
                dialog.show();
                dialog.childNodes[0].addEventListener("click", myApp.controllers.tasks.delete.hideAlertDialog);
              });
        }
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
        myApp.controllers.updateAffichage();
      },

      description: (event, newValue) => {
        let task = event.target.parentNode.parentNode.parentNode;
        console.log(task);
        myApp.services.tasks.edit.description(task.data, task.completed, newValue);
        myApp.controllers.updateAffichage();
      },

      echeance: (event) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.echeance(task.data, task.completed, event.target.value);
      },

      priority: (event) => {
        let task = event.target.parentNode.parentNode;
        myApp.services.tasks.edit.priority(task.data, task.completed);
        myApp.controllers.updateAffichage();
      },

      highlight: (event) => {
        let task = event.target.parentNode.parentNode;
        myApp.services.tasks.edit.highlight(task.data, task.completed);
        myApp.controllers.updateAffichage();
      },

      title: (event, newValue) => {
        let task = event.target.parentNode.parentNode.parentNode;
        myApp.services.tasks.edit.title(task.data, task.completed, newValue);
        myApp.controllers.updateAffichage();
      },
    },
  },

  categories: {
    add: {
      createAlertDialog: () => {
        let dialog = document.getElementById('alert-dialog-new-categ');

        if (dialog) {
          dialog.show();
          dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.add.hideAlertDialog);
          dialog.querySelector('#button-cancel-categ').addEventListener('click', myApp.controllers.categories.add.hideAlertDialog);
          dialog.querySelector('#button-alert-new-categ').addEventListener('click', myApp.controllers.categories.add.add);
        } else {
          ons.createElement('new-categ.html', { append: true })
              .then(function (dialog) {
                dialog.show();
                dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.add.hideAlertDialog);
                dialog.querySelector('#button-cancel-categ').addEventListener('click', myApp.controllers.categories.add.hideAlertDialog);
                dialog.querySelector('#button-alert-new-categ').addEventListener('click', myApp.controllers.categories.add.add);
              });
        }
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
          myApp.services.categories.show();
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
          dialog.show();
          dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.edit.hideAlertDialog);

          dialog.data = data;

          dialog.querySelector('#input-edit-categ').value = data.name;
          dialog.querySelector('#input-edit-categ-color').value = data.color;

          dialog.querySelector('#button-alert-edit-categ').addEventListener('click', myApp.controllers.categories.edit.edit);
          dialog.querySelector('#button-alert-delete-categ').addEventListener('click', myApp.controllers.categories.delete);
        } else {
          ons.createElement('edit-categ.html', { append: true })
              .then(function (dialog) {
                dialog.show();
                dialog.childNodes[0].addEventListener("click", myApp.controllers.categories.edit.hideAlertDialog);

                dialog.data = data;

                dialog.querySelector('#input-edit-categ').value = data.name;
                dialog.querySelector('#input-edit-categ-color').value = data.color;

                dialog.querySelector('#button-alert-edit-categ').addEventListener('click', myApp.controllers.categories.edit.edit);
                dialog.querySelector('#button-alert-delete-categ').addEventListener('click', myApp.controllers.categories.delete);
              });
        }
      },

      hideAlertDialog: () => {
        document.getElementById('alert-dialog-edit-categ').hide();
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
          myApp.controllers.categories.edit.hideAlertDialog();
          myApp.services.categories.edit(data, name, color);
          myApp.services.categories.show();
        } else {
          res.innerText = "Nom de catégorie invalide.";
        }
      }
    },

    delete: (event) => {
      let data = event.target.parentNode.parentNode.parentNode.parentNode.data;
      let res = event.target.parentNode.parentNode.querySelector('.res-button');

      if (nbClickDeleteCateg === 0) {
        res.innerText = "Cette action est irréversible. Appuyez à nouveau sur le bouton \"Supprimer\" pour confirmer.";
        nbClickDeleteCateg = 1;
      } else {
        myApp.controllers.categories.edit.hideAlertDialog();
        myApp.services.categories.delete(data);
        myApp.services.categories.show();
      }
    }
  },
};
