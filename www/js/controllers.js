/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

let lastDelClicked = null;
let lastPrioClicked = null;

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
  },

  // new task controller
  addTask: function (page) {
    const titre = page.getElementById("titre").value.trim();
    const description = page.getElementById("description").value.trim();
    const categorie = page.getElementById("categorie").value.trim();
    const highlight = page.querySelector('.highlight-checkbox').checked;
    const urgent = page.querySelector('.urgent-checkbox').checked;

    if (titre === "") return;

    const newTask = {
      title: titre,
      category: categorie,
      description: description,
      highlight: highlight,
      urgent: urgent
    };
    myApp.services.fixtures.push(newTask);
    myApp.controllers.updateAffichage();

    document.querySelector('ons-navigator').popPage();
  },

  createAlertDialog: function (event) {
    lastDelClicked = event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode;
    lastDelClicked.classList.add("task-del");

    let dialog = document.getElementById('my-alert-dialog');

    if (dialog) {
      dialog.show();
      dialog.childNodes[0].addEventListener("click", myApp.controllers.hideAlertDialog);
    } else {
      ons.createElement('delete-task.html', { append: true })
          .then(function (dialog) {
            dialog.show();
            dialog.childNodes[0].addEventListener("click", myApp.controllers.hideAlertDialog);
          });
    }
  },

  hideAlertDialog: function () {
    if (lastDelClicked) lastDelClicked.classList.remove("task-del");
    document.getElementById('my-alert-dialog').hide();
  },

  delete: function () {
    lastDelClicked.classList.add("animation-remove");
    this.hideAlertDialog();
    myApp.services.tasks.deleteTask(lastDelClicked.data, lastDelClicked.querySelector("ons-checkbox").checked);
  },

  changePriotity: function (event) {
    myApp.services.tasks.changePriority(event.target.parentNode.parentNode.parentNode.data);
    myApp.controllers.updateAffichage();
  },

  changeHighlight: (event) => {
    myApp.services.tasks.changeHighlight(event.target.parentNode.parentNode.parentNode.data);
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

  showTask: (event) => {
    let task = event.target.parentNode;
    document.querySelector('ons-navigator').pushPage('html/details_task.html').then(() =>
      myApp.services.tasks.showTask(task.data)
    );
  }
};
