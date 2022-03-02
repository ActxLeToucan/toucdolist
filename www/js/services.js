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
        myApp.services.tasks.create(data);
      });

      console.log(myApp.services.fixtures)
    },

    // Creates a new task and attaches it to the pending task list.
    create: function (data) {
      // Task item template.
      let taskItem = ons.createElement(
        //'<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category)+ '">' +
        `<ons-list-item tappable category="${data.category}">
          <label class="left">
            <ons-checkbox></ons-checkbox>
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

      taskItem.querySelector(".right").addEventListener("click", myApp.controllers.createAlertDialog)

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      let pendingList = document.querySelector('#pending-list');
      pendingList.insertBefore(taskItem, taskItem.data.urgent ? pendingList.firstChild : null);
    },

    deleteTask: (data) => {
      myApp.services.fixtures.splice(myApp.services.fixtures.indexOf(data), 1);
      myApp.services.tasks.showPendingList();
    },

    changePriority: (data) => {
      myApp.services.fixtures.find(task => task === data).urgent = !data.urgent;
      myApp.services.tasks.showPendingList();
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
  ]
};
