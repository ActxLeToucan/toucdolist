/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

/**
 * CONTROLLERS
 * Le contrôleur ne doit pas agir directement sur les tâches des tableaux. Il doit appeler les méthodes de services.
 */


let lastDelClicked = null;

myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: function(page) {
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
    myApp.services.tasks.showPendingList();
    myApp.services.tasks.showCompletedList();
    myApp.services.tasks.showCategs();
  },

  // new task controller
  addTask: function (page) {
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
    myApp.services.tasks.addTask(newTask)
    myApp.controllers.updateAffichage();

    document.querySelector('ons-navigator').popPage();
  },

  createAlertDialogDeleteTask: function (event) {
    lastDelClicked = event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode;
    lastDelClicked.classList.add("task-del");

    let dialog = document.getElementById('alert-dialog-delete-task');

    if (dialog) {
      dialog.show();
      dialog.childNodes[0].addEventListener("click", myApp.controllers.hideAlertDialogDeleteTask);
    } else {
      ons.createElement('delete-task.html', { append: true })
          .then(function (dialog) {
            dialog.show();
            dialog.childNodes[0].addEventListener("click", myApp.controllers.hideAlertDialogDeleteTask);
          });
    }
  },

  hideAlertDialogDeleteTask: function () {
    if (lastDelClicked) lastDelClicked.classList.remove("task-del");
    document.getElementById('alert-dialog-delete-task').hide();
  },

  deleteTask: function () {
    lastDelClicked.classList.add("animation-remove");
    myApp.controllers.hideAlertDialogDeleteTask();
    myApp.services.tasks.deleteTask(lastDelClicked.data, lastDelClicked.querySelector("ons-checkbox").checked);
  },

  changePriotity: function (event) {
    myApp.services.tasks.changePriority(event.target.parentNode.parentNode.data);
    myApp.controllers.updateAffichage();
  },

  changeHighlight: (event) => {
    myApp.services.tasks.changeHighlight(event.target.parentNode.parentNode.data);
    myApp.controllers.updateAffichage();
  },

  changeState: function (event) {
    let task = event.target.parentNode.parentNode.parentNode;

    if (event.target.checked) {
      task.classList.add("animation-swipe-right");
      myApp.services.tasks.setState(task.data, true);
    } else {
      task.classList.add("animation-swipe-left");
      myApp.services.tasks.setState(task.data, false);
    }
  },

  changeTitle: (event, newValue) => {
    myApp.services.tasks.changeTitle(event.target.parentNode.parentNode.parentNode.data, newValue);
    myApp.controllers.updateAffichage();
  },

  changeDescription: (event, newValue) => {
    myApp.services.tasks.changeDescription(event.target.parentNode.parentNode.parentNode.data, newValue);
    myApp.controllers.updateAffichage();
  },

  changeCategory: (event, newValue) => {
    myApp.services.tasks.changeCategory(event.target.parentNode.parentNode.parentNode.data, newValue);
    myApp.controllers.updateAffichage();
  },

  changeEcheance: (event) => {
    console.log(event.target.value)
    myApp.services.tasks.changeEcheance(event.target.parentNode.parentNode.parentNode.data, event.target.value);
  },

  showTask: (event) => {
    let task = event.target.parentNode;
    document.querySelector('ons-navigator').pushPage('html/details_task.html').then(() =>
      myApp.services.tasks.showTask(task.data)
    );
  },

  createAlertDialogNewCateg: () => {
    let dialog = document.getElementById('alert-dialog-new-categ');

    if (dialog) {
      dialog.show();
      dialog.childNodes[0].addEventListener("click", myApp.controllers.hideAlertDialogNewCateg);
      dialog.querySelector('#button-cancel-categ').addEventListener('click', myApp.controllers.hideAlertDialogNewCateg);
      dialog.querySelector('#button-alert-new-categ').addEventListener('click', myApp.controllers.createCateg);
    } else {
      ons.createElement('new-categ.html', { append: true })
          .then(function (dialog) {
            dialog.show();
            dialog.childNodes[0].addEventListener("click", myApp.controllers.hideAlertDialogNewCateg);
            dialog.querySelector('#button-cancel-categ').addEventListener('click', myApp.controllers.hideAlertDialogNewCateg);
            dialog.querySelector('#button-alert-new-categ').addEventListener('click', myApp.controllers.createCateg);
          });
    }
  },

  hideAlertDialogNewCateg: (event) => {
    document.getElementById('alert-dialog-new-categ').hide();
    let input = event.target.parentNode.parentNode.querySelector('#input-new-categ');
    let res = event.target.parentNode.parentNode.querySelector('.res-button');
    input.value = "";
    res.innerText = "";
  },

  createCateg: (event) => {
    let input = event.target.parentNode.parentNode.querySelector('#input-new-categ');
    let res = event.target.parentNode.parentNode.querySelector('.res-button');
    let name = input.value;

    if (name && !myApp.services.tasks.categoryExist(name)) {
      myApp.controllers.hideAlertDialogNewCateg(event);
      myApp.services.tasks.addCateg(name);
      myApp.services.tasks.showCategs();
    } else {
      res.innerText = "Nom de catégorie invalide.";
    }
    console.log(myApp.services.categories);
  }
};
