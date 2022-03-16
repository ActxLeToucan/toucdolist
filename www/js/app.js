// App logic.
window.myApp = {};

document.addEventListener('init', function(event) {
  myApp.services.storage.load();
  let page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  if (page.id === 'menuPage' || page.id === 'pendingTasksPage' || page.id === 'completedTasksPage') {
    myApp.services.categories.show();
    if (document.querySelector('#menuPage')
      && document.querySelector('#pendingTasksPage')
      && !document.querySelector('#pendingTasksPage ons-list-item')
    ) {
      myApp.services.tasks.show.pendingList();
    } else if (document.querySelector('#menuPage')
        && document.querySelector('#completedTasksPage')
        && !document.querySelector('#completedTasksPage ons-list-item')
    ) {
      myApp.services.tasks.show.completedList();
    }
  }
});
