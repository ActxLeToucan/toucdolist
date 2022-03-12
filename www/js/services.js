/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

/**
 * SERVICES
 * Gère les tâches dans les tableaux et peut générer les affichages à partir de ces derniers.
 * Seul le contrôleur doit appeler les méthodes de services. Donc lors d'un évènement, l'action est déclenchée dans le contrôleur.
 */

myApp.services = {
  tasks: {
    add: (data) => {
      myApp.services.data.tasks.pending.push(data);
    },

    delete: (data, taskCompleted) => {
      let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      tab.splice(tab.indexOf(data), 1);
    },

    edit: {
      category: (data, taskCompleted, newCateg) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).category = newCateg;
      },

      description: (data, taskCompleted, newDescription) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).description = newDescription;
      },

      echeance: (data, taskCompleted, newEcheance) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).echeance = newEcheance;
      },

      highlight: (data, taskCompleted) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).highlight = !data.highlight;
      },

      priority: (data, taskCompleted) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).urgent = !data.urgent;
      },

      title: (data, taskCompleted, newTitle) => {
        let tab = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
        tab.find(task => task === data).title = newTitle;
      },
    },

    generate: {
      task: (data, taskCompleted) => {
        let color = '#000000';
        if (data.category) {
          let categ = myApp.services.data.categories.find(categ => categ.name === data.category);
          if (categ) color = categ.color;
        }

        // Task item template.
        let taskItem = ons.createElement(`
          <ons-list-item tappable category="${data.category}" class="${data.highlight ? "highlight" : ""}">
            <label class="left">
              <ons-checkbox ${taskCompleted ? "checked" : ""}></ons-checkbox>
            </label>
            <div class="center ${data.urgent ? "task-prio" : ""}" style="color: ${color}">
              ${data.title}
            </div>
            <div class="right">
              <ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>
            </div>
          </ons-list-item>
        `);

        // Store data within the element.
        taskItem.data = data;

        taskItem.querySelector(".right").addEventListener("click", myApp.controllers.tasks.delete.createAlertDialog);
        taskItem.querySelector("ons-checkbox").addEventListener("change", myApp.controllers.tasks.edit.state);
        taskItem.querySelector(".center").addEventListener("click", myApp.controllers.tasks.details);

        // Insert urgent tasks at the top and non urgent tasks at the bottom.
        let list = (taskCompleted ? document.querySelector('#completed-list') : document.querySelector('#pending-list'));
        list.insertBefore(taskItem, taskItem.data.urgent ? list.firstChild : null);
      },

      details: (task, taskCompleted) => {
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
          <div id="categ"  style="margin-top: 20px; margin-bottom: 20px">
              <span style="vertical-align: sub">Catégorie</span>
              <ons-select id="select-categ">
                  <option value="aucune">(Aucune)</option>
              </ons-select>
          </div>
          <p>
              <ons-switch input-id="highlight" class="highlight-checkbox" ${task.highlight ? "checked" : ""}></ons-switch><label for="highlight"> Mettre en évidence</label>
          </p>
          <p>
              <ons-switch input-id="urgent" class="urgent-checkbox" ${task.urgent ? "checked" : ""}></ons-switch><label for="urgent"> Définir comme urgent</label>
          </p>
          <p>
              </ons-input><label for="echeance">Échéance</label>
              <ons-input input-id="echeance" class="echeance" type="date" modifier="underbar">
          </p>
        `;
        page.querySelector(".echeance").value = task.echeance;


        page.data = task;
        page.completed = taskCompleted;


        let categSelector = page.querySelector("#select-categ").querySelector("select");
        myApp.services.data.categories.forEach(categ => {
          let elemCateg = ons.createElement(`
            <option ${task.category === categ.name ? "selected" : ""}>${categ.name}</option>
          `);

          elemCateg.data = categ;

          categSelector.insertBefore(elemCateg, null);
        });

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
        categSelector.addEventListener("change", myApp.controllers.tasks.edit.category);
        // modification surlignage
        page.querySelector(".highlight-checkbox").addEventListener("change", myApp.controllers.tasks.edit.highlight);
        // modification urgence
        page.querySelector(".urgent-checkbox").addEventListener("change", myApp.controllers.tasks.edit.priority);
        // modification echeance
        page.querySelector(".echeance").addEventListener("change", myApp.controllers.tasks.edit.echeance);
      }
    },

    setState: (data, taskCompleted) => {
      let tab1 = (taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);
      let tab2 = (!taskCompleted ? myApp.services.data.tasks.completed : myApp.services.data.tasks.pending);

      tab1.push(data);
      tab2.splice(tab2.indexOf(data), 1);
    },

    show: {
      pendingList: () => {
        let pendingList = document.querySelector('#pending-list');
        pendingList.innerHTML = "";

        myApp.services.data.tasks.pending.forEach(function (data) {
          myApp.services.tasks.generate.task(data, false);
        });
      },

      completedList: () => {
        let completedTasksPage = document.querySelector('#completed-list');
        completedTasksPage.innerHTML = "";

        myApp.services.data.tasks.completed.forEach(function (data) {
          myApp.services.tasks.generate.task(data, true);
        });
      },
    },
  },

  categories: {
    add: (name, color) => {
      myApp.services.data.categories.push({
        name: name,
        color: color,
        created: Date.now()
      });
    },

    delete: (data) => {
      myApp.services.data.tasks.pending.forEach(task => {
        if (task.category === data.name) {
          task.category = '';
        }
      });
      myApp.services.data.tasks.completed.forEach(task => {
        if (task.category === data.name) {
          task.category = '';
        }
      });
      myApp.services.data.categories.splice(myApp.services.data.categories.indexOf(data), 1);
    },

    edit: (data, name, color) => {
      myApp.services.data.tasks.pending.forEach(task => {
        if (task.category === data.name) {
          task.category = name;
        }
      });
      myApp.services.data.tasks.completed.forEach(task => {
        if (task.category === data.name) {
          task.category = name;
        }
      });
      myApp.services.data.categories.find(categ => categ === data).name = name;
      myApp.services.data.categories.find(categ => categ === data).color = color;
    },

    generate: (data) => {
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

    getByName: (name) => {
      let tab = [];
      myApp.services.data.categories.forEach(categ => {
        if (categ.name === name) tab.push(categ);
      });
      return tab;
    },

    show: () => {
      let categs = document.querySelector('#custom-category-list');
      categs.innerHTML = `
          <ons-list-item>
            <ons-button id="button-new-categ" onclick="myApp.controllers.categories.add.createAlertDialog()">Nouvelle catégorie</ons-button>
          </ons-list-item>`;

      myApp.services.data.categories.forEach(categ => {
        myApp.services.categories.generate(categ);
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
        created: 1647077958676
      },
      {
        name: 'Super important',
        color: '#ff0000',
        created: 1647077958677
      },
      {
        name: 'Travels',
        color: '#008cb7',
        created: 1647077958678
      },
      {
        name: 'Personal',
        color: "#00b725",
        created: 1647077958679
      }
    ]
  },
};
