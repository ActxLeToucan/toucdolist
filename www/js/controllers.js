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


  // new task controller
  addTask: function(page) {
    const titre = page.getElementById("titre").value.trim();
    const description = page.getElementById("description").value.trim();

    if (titre === "") return;

    const newTask = {
      title: titre,
      category: 'Programming',
      description: description,
      highlight: false,
      urgent: false
    };
    myApp.services.fixtures.push(newTask);
    myApp.services.tasks.create(newTask);

    document.querySelector('ons-navigator').popPage();
  },

  createAlertDialog: function(event) {
    lastDelClicked = event.target.localName === "ons-icon" ? event.target.parentNode.parentNode : event.target.parentNode;
    lastDelClicked.classList.add("task-del");

    let dialog = document.getElementById('my-alert-dialog');

    if (dialog) {
      dialog.show();
    } else {
      ons.createElement('delete-task.html', { append: true })
          .then(function(dialog) {
            dialog.show();
          });
    }
  },

  hideAlertDialog: function() {
    if (lastDelClicked) lastDelClicked.classList.remove("task-del");
    document.getElementById('my-alert-dialog').hide();
  },

  delete: function() {
    myApp.services.tasks.deleteTask(lastDelClicked.data);
    this.hideAlertDialog();
  },

  changePriotity: function() {
    myApp.services.tasks.changePriority(lastPrioClicked.data);
  }
};
