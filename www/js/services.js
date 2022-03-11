/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

/**
 * SERVICES
 * Gère les tâches dans les tableaux et peut générer les affichages à partir de ces derniers.
 * Seul le contrôleur doit appeler les méthodes de services. Donc lors d'un évènement, l'action est déclenchée dans le contrôleur.
 */

myApp.services = {

  /////////////////
  // Task Service //
  /////////////////
  tasks: {
    showPendingList: () => {
      let pendingList = document.querySelector('#pending-list');
      pendingList.innerHTML = "";

      myApp.services.data.tasks.pending.forEach(function (data) {
        myApp.services.tasks.createTask(data, false);
      });
    },

    showCompletedList: () => {
      let completedTasksPage = document.querySelector('#completed-list');
      completedTasksPage.innerHTML = "";

      myApp.services.data.tasks.completed.forEach(function (data) {
        myApp.services.tasks.createTask(data, true);
      });
    },

    showTask: (task) => {
      let page = document.querySelector('#details-task-page-content');
      page.innerHTML = `
        <h1 id="title">
            <div id="title-show" class="show-task-field">
                <span id="title-content">${task.title}</span>
                <ons-button modifier="quiet" id="button-edit-title">Editer ✏️</ons-button>
            </div>
            <div id="title-edit" class="edit-task-field">
                <ons-input id="title" modifier="underbar" placeholder="Titre" float></ons-input>
                <ons-button modifier="quiet" id="button-validate-title">Valider ✅</ons-button>
            </div>
        </h1>
        <div id="descr">
            <div id="descr-show" class="show-task-field">
                <span id="descr-title">Description</span>
                <ons-button modifier="quiet" id="button-edit-descr">Editer ✏️</ons-button>
                <br />
                <span id="descr-content">${task.description}</span>
            </div>
            <div id="descr-edit" class="edit-task-field">
                <ons-input id="descr" modifier="underbar" placeholder="Description" float></ons-input>
                <ons-button modifier="quiet" id="button-validate-descr">Valider ✅</ons-button>
            </div>
        </div>
        <div id="categ">
            <div id="categ-show" class="show-task-field">
                <span id="categ-title">Catégorie</span>
                <ons-button modifier="quiet" id="button-edit-categ">Editer ✏️</ons-button>
                <br />
                <span id="categ-content">${task.category}</span>
            </div>
            <div id="categ-edit" class="edit-task-field">
                <ons-input id="categ" modifier="underbar" placeholder="Catégorie" float></ons-input>
                <ons-button modifier="quiet" id="button-validate-categ">Valider ✅</ons-button>
            </div>
        </div>
        <p>
            <ons-switch input-id="highlight" class="highlight-checkbox" ${task.highlight ? "checked" : ""}></ons-switch><label for="highlight"> Mettre en évidence</label>
        </p>
        <p>
            <ons-switch input-id="urgent" class="urgent-checkbox" ${task.urgent ? "checked" : ""}></ons-switch><label for="urgent"> Définir comme urgent</label>
        </p>
        <p>
            </ons-input><label for="echeancve">Échéance</label>
            <ons-input input-id="echeance" class="echeance" type="date" modifier="underbar">
        </p>
      `;
      page.querySelector(".echeance").value = task.echeance;


      page.data = task;

      // modification du titre
      page.querySelector("#button-edit-title").addEventListener("click", (e) => {
        let affichage = e.target.parentNode;
        affichage.style.display = "none";
        let edition = e.target.parentNode.parentNode.querySelector(".edit-task-field");
        edition.style.display = "block";
        edition.querySelector("ons-input").value = affichage.querySelector("#title-content").innerText;
      });
      page.querySelector("#button-validate-title").addEventListener("click", (e) => {
        let edition = e.target.parentNode;
        edition.style.display = "none";
        let affichage = e.target.parentNode.parentNode.querySelector(".show-task-field");
        affichage.style.display = "block";
        let newValue = edition.querySelector("ons-input").value;
        affichage.querySelector("#title-content").innerText = newValue;
        myApp.controllers.tasks.edit.title(e, newValue);
      });
      // modification de la description
      page.querySelector("#button-edit-descr").addEventListener("click", (e) => {
        let affichage = e.target.parentNode;
        affichage.style.display = "none";
        let edition = e.target.parentNode.parentNode.querySelector(".edit-task-field");
        edition.style.display = "block";
        edition.querySelector("ons-input").value = affichage.querySelector("#descr-content").innerText;
      });
      page.querySelector("#button-validate-descr").addEventListener("click", (e) => {
        let edition = e.target.parentNode;
        edition.style.display = "none";
        let affichage = e.target.parentNode.parentNode.querySelector(".show-task-field");
        affichage.style.display = "block";
        let newValue = edition.querySelector("ons-input").value;
        affichage.querySelector("#descr-content").innerText = newValue;
        myApp.controllers.tasks.edit.description(e, newValue);
      });
      // modification de la catégorie
      page.querySelector("#button-edit-categ").addEventListener("click", (e) => {
        let affichage = e.target.parentNode;
        affichage.style.display = "none";
        let edition = e.target.parentNode.parentNode.querySelector(".edit-task-field");
        edition.style.display = "block";
        edition.querySelector("ons-input").value = affichage.querySelector("#categ-content").innerText;
      });
      page.querySelector("#button-validate-categ").addEventListener("click", (e) => {
        let edition = e.target.parentNode;
        edition.style.display = "none";
        let affichage = e.target.parentNode.parentNode.querySelector(".show-task-field");
        affichage.style.display = "block";
        let newValue = edition.querySelector("ons-input").value;
        affichage.querySelector("#categ-content").innerText = newValue;
        myApp.controllers.tasks.edit.category(e, newValue);
      });
      // modification surlignage
      page.querySelector(".highlight-checkbox").addEventListener("change", myApp.controllers.tasks.edit.highlight);
      // modification urgence
      page.querySelector(".urgent-checkbox").addEventListener("change", myApp.controllers.tasks.edit.priority);
      // modification echeance
      page.querySelector(".echeance").addEventListener("change", myApp.controllers.tasks.edit.echeance);
    },

    addTask: (data) => {
      myApp.services.data.tasks.pending.push(data);
    },

    // Creates a new task and attaches it to the pending task list.
    createTask: function (data, taskCompleted) {
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

      taskItem.querySelector(".right").addEventListener("click", myApp.controllers.tasks.delete.createAlertDialog);
      taskItem.querySelector("ons-checkbox").addEventListener("change", myApp.controllers.tasks.changeState);
      taskItem.querySelector(".center").addEventListener("click", myApp.controllers.tasks.details);

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      let list = (taskCompleted ? document.querySelector('#completed-list') : document.querySelector('#pending-list'));
      list.insertBefore(taskItem, taskItem.data.urgent ? list.firstChild : null);
    },

    deleteTask: (data, taskCompleted) => {
      let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      tab.splice(tab.indexOf(data), 1);
    },

    changePriority: (data) => {
      myApp.services.data.tasks.pending.find(task => task === data).urgent = !data.urgent;
    },

    changeHighlight: (data) => {
      myApp.services.data.tasks.pending.find(task => task === data).highlight = !data.highlight;
    },

    changeTitle: (data, newTitle) => {
      myApp.services.data.tasks.pending.find(task => task === data).title = newTitle;
    },

    changeDescription: (data, newDescription) => {
      myApp.services.data.tasks.pending.find(task => task === data).description = newDescription;
    },

    changeCategory: (data, newCateg) => {
      myApp.services.data.tasks.pending.find(task => task === data).category = newCateg;
    },

    changeEcheance: (data, newEcheance) => {
      console.log(newEcheance)
      myApp.services.data.tasks.pending.find(task => task === data).echeance = newEcheance;
    },

    setState: (data, taskCompleted) => {
      let tab1 = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      let tab2 = (!taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);

      tab1.push(data);
      tab2.splice(tab2.indexOf(data), 1);
    },

    categoryExist: (name) => {
      let existeDeja = false;
      myApp.services.data.categories.forEach(categ => {
        if (categ.name === name) existeDeja = true;
      });
      return existeDeja;
    },

    addCateg: (name, color) => {
      myApp.services.data.categories.push({
        name: name,
        color: color,
        children: []
      });
    },

    createCateg: (data) => {
      let categ = ons.createElement(`
        <ons-list-item tappable category-id="${data.name}">
          <div class="left">
            <ons-radio name="categoryGroup" input-id="r-${data.name}"></ons-radio>
          </div>
          <label class="center" style="color: ${data.color}" for="r-${data.name}">${data.name}</label>
          <div class="right">
            <ons-icon style="color: grey; padding-left: 4px" icon="edit, material:md-edit"></ons-icon>
          </div>
        </ons-list-item>
      `);

      categ.data = data;

      categ.querySelector(".right").addEventListener("click", myApp.controllers.categories.edit.createAlertDialog);

      let list = document.querySelector('#custom-category-list');
      list.insertBefore(categ, list.firstChild);
    },

    showCategs: () => {
      let categs = document.querySelector('#custom-category-list');
      categs.innerHTML = `
          <ons-list-item>
            <ons-button id="button-new-categ" onclick="myApp.controllers.categories.add.createAlertDialog()">Nouvelle catégorie</ons-button>
          </ons-list-item>`;

      myApp.services.data.categories.forEach(categ => {
        myApp.services.tasks.createCateg(categ);
      });
    }
  },

  data: {
    tasks: {
      pending: [
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

      completed: [
        {
          title: 'Hey!',
          category: 'Personal',
          description: 'Some description.',
          highlight: false,
          urgent: false
        }
      ]
    },

    categories: [
      {
        name: 'Programming',
        color: '#BC3BE7',
        children: []
      }
    ]
  },
};
