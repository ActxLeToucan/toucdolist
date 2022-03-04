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

      console.log(myApp.services.fixtures);
      console.log(myApp.services.completedTasks);
    },

    showCompletedList: () => {
      let completedTasksPage = document.querySelector('#completed-list');
      completedTasksPage.innerHTML = "";

      myApp.services.completedTasks.forEach(function (data) {
        myApp.services.tasks.create(data, true);
      });
    },

    // Creates a new task and attaches it to the pending task list.
    create: function (data, taskCompleted) {
      // Task item template.
      let taskItem = ons.createElement(
        //'<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category)+ '">' +
        `<ons-list-item tappable category="${data.category}">
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

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      let list = (taskCompleted ? document.querySelector('#completed-list') : document.querySelector('#pending-list'));
      console.log(list);
      list.insertBefore(taskItem, taskItem.data.urgent ? list.firstChild : null);
    },

    deleteTask: (data) => {
      myApp.services.fixtures.splice(myApp.services.fixtures.indexOf(data), 1);
      myApp.services.tasks.showPendingList();
    },

    changePriority: (data) => {
      myApp.services.fixtures.find(task => task === data).urgent = !data.urgent;
      myApp.services.tasks.showPendingList();
    },

    setState: (data, taskCompleted) => {
      if (taskCompleted) {
        myApp.services.completedTasks.push(data);
        myApp.services.fixtures.splice(myApp.services.fixtures.indexOf(data), 1);
      } else {
        myApp.services.fixtures.push(data);
        myApp.services.completedTasks.splice(myApp.services.completedTasks.indexOf(data), 1);
      }
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
      highlight: false,
      urgent: false
    },
    {
      title: 'Install Monaca CLI',
      category: 'Programming',
      description: 'Some description.',
      highlight: false,
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
