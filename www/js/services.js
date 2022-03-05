/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

myApp.services = {

  /////////////////
  // Task Service //
  /////////////////
  tasks: {
    showPendingList: () => {
      let pendingList = document.querySelector('#pending-list');
      pendingList.innerHTML = "";

      myApp.services.fixtures.forEach(function (data) {
        myApp.services.tasks.create(data, false);
      });
    },

    showCompletedList: () => {
      let completedTasksPage = document.querySelector('#completed-list');
      completedTasksPage.innerHTML = "";

      myApp.services.completedTasks.forEach(function (data) {
        myApp.services.tasks.create(data, true);
      });
    },

    showTask: (task) => {
      let page = document.querySelector('#details-task-page-content');
      page.innerHTML = `
        <h1>${task.title}</h1>
        <p>Description : ${task.description}</p>
        <p>Catégorie : ${task.category}</p>
        <p>
          <ons-checkbox input-id="highlight" class="highlight-checkbox" ${task.highlight ? "checked" : ""}></ons-checkbox><label for="highlight"> Mettre en évidence</label>
        </p>
        <p>
          <ons-checkbox input-id="urgent" class="urgent-checkbox" ${task.urgent ? "checked" : ""}></ons-checkbox><label for="urgent"> Définir comme urgent</label>
        </p>
      `;

      page.data = task;

      page.querySelector(".highlight-checkbox").addEventListener("change", myApp.controllers.changeHighlight);
      page.querySelector(".urgent-checkbox").addEventListener("change", myApp.controllers.changePriotity);
    },

    // Creates a new task and attaches it to the pending task list.
    create: function (data, taskCompleted) {
      // Task item template.
      let taskItem = ons.createElement(
        //'<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category)+ '">' +
        `<ons-list-item tappable category="${data.category}" class="${data.highlight ? "highlight" : ""}">
          <label class="left">
            <ons-checkbox ${taskCompleted ? "checked" : ""}></ons-checkbox>
          </label>
          <div class="center ${data.urgent ? "task-prio" : ""}">
            ${data.title}
          </div>
          <div class="right">
            <ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>
          </div>
        </ons-list-item>`
      );

      // Store data within the element.
      taskItem.data = data;

      taskItem.querySelector(".right").addEventListener("click", myApp.controllers.createAlertDialog);
      taskItem.querySelector("ons-checkbox").addEventListener("change", myApp.controllers.changeState);
      taskItem.querySelector(".center").addEventListener("click", myApp.controllers.showTask);

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      let list = (taskCompleted ? document.querySelector('#completed-list') : document.querySelector('#pending-list'));
      list.insertBefore(taskItem, taskItem.data.urgent ? list.firstChild : null);
    },

    deleteTask: (data, taskCompleted) => {
      let tab = (taskCompleted ? myApp.services.completedTasks : myApp.services.fixtures);
      tab.splice(tab.indexOf(data), 1);
    },

    changePriority: (data) => {
      myApp.services.fixtures.find(task => task === data).urgent = !data.urgent;
    },

    changeHighlight: (data) => {
      myApp.services.fixtures.find(task => task === data).highlight = !data.highlight;
    },

    setState: (data, taskCompleted) => {
      let tab1 = (taskCompleted ? myApp.services.completedTasks : myApp.services.fixtures);
      let tab2 = (!taskCompleted ? myApp.services.completedTasks : myApp.services.fixtures);

      tab1.push(data);
      tab2.splice(tab2.indexOf(data), 1);
    }
  },

  ////////////////////////
  // Initial Data Service //
  ////////////////////////
  fixtures: [
    {
      title: 'Download OnsenUI',
      category: 'Programming',
      description: 'Some description.',
      highlight: true,
      urgent: false
    },
    {
      title: 'Install Monaca CLI',
      category: 'Programming',
      description: 'Some description.',
      highlight: true,
      urgent: true
    },
    {
      title: 'Star Onsen UI repo on Github',
      category: 'Super important',
      description: 'Some description.',
      highlight: false,
      urgent: true
    },
    {
      title: 'Register in the community forum',
      category: 'Super important',
      description: 'Some description.',
      highlight: false,
      urgent: false
    },
    {
      title: 'Send donations to Fran and Andreas',
      category: 'Super important',
      description: 'Some description.',
      highlight: false,
      urgent: false
    },
    {
      title: 'Profit',
      category: '',
      description: 'Some description.',
      highlight: false,
      urgent: false
    },
    {
      title: 'Visit Japan',
      category: 'Travels',
      description: 'Some description.',
      highlight: false,
      urgent: false
    },
    {
      title: 'Enjoy an Onsen with Onsen UI team',
      category: 'Personal',
      description: 'Some description.',
      highlight: false,
      urgent: false
    }
  ],

  completedTasks: [
    {
      title: 'Hey!',
      category: 'Personal',
      description: 'Some description.',
      highlight: false,
      urgent: false
    }
  ]
};
