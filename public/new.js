var addedCollab = new Set();

function createProgListEl(prog) {
  const progList = document.getElementById('prog-list');

  const progListEl = document.createElement('li');
  progListEl.setAttribute('class', 'prog-list-el');
  const progListElDiv = document.createElement('div');
  progListElDiv.setAttribute('class', 'prog-list-el-div');
  progListEl.appendChild(progListElDiv);

  const progListText = document.createElement('span');
  progListText.appendChild(document.createTextNode(prog));
  progListElDiv.appendChild(progListText);

  const removeProg = document.createElement('div');
  removeProg.setAttribute('class', 'remove-prog');
  removeProg.onclick = () => {
    progListEl.parentElement.removeChild(progListEl);
  }
  removeProg.appendChild(document.createTextNode('X'));
  progListElDiv.appendChild(removeProg);

  progList.insertBefore(progListEl, progList.firstChild);
}

function createCollabListEl(collab, id) {
  const collabList = document.getElementById('collab-list');

  const collabListEl = document.createElement('li');
  collabListEl.setAttribute('class', 'collab-list-el');
  const collabListElDiv = document.createElement('div');
  collabListElDiv.setAttribute('class', 'collab-list-el-div');
  collabListEl.appendChild(collabListElDiv);

  const collabListText = document.createElement('span');
  if (id) {
    collabListText.setAttribute('data-id', id);
  }
  collabListText.appendChild(document.createTextNode(collab));
  addedCollab.add(collab);
  collabListElDiv.appendChild(collabListText);

  const removeCollab = document.createElement('div');
  removeCollab.setAttribute('class', 'remove-collab');
  removeCollab.onclick = () => {
    collabListEl.parentElement.removeChild(collabListEl);
    addedCollab.delete(collab);
  }
  removeCollab.appendChild(document.createTextNode('X'));
  collabListElDiv.appendChild(removeCollab);

  collabList.insertBefore(collabListEl, collabList.firstChild);
  document.getElementById('proj-collab-input').value = "";
  clearDropdown();
}

function addProgress() {
  const progInput = document.getElementById('proj-prog');
  const prog = progInput.value;
  if (prog) {
    createProgListEl(prog);
    progInput.value = "";
  } else {
    alert('Progress field empty.')
  }
}

function clearDropdown() {
  const dropdown = document.getElementById('collab-dropdown');
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
}

function populateDropdown(users) {
  const dropdown = document.getElementById('collab-dropdown');
  clearDropdown();

  if (users.length > 0) {
    users.forEach((el) => {
      const ddDiv = document.createElement('div');
      ddDiv.setAttribute('class', 'collab-dropdown-item');
      ddDiv.appendChild(document.createTextNode(el.userName));
      ddDiv.onclick = () => createCollabListEl(el.userName, el.userId);
      dropdown.appendChild(ddDiv);
    })
  } else {
    const ddDiv = document.createElement('div');
    ddDiv.setAttribute('class', 'collab-dropdown-empty');
    ddDiv.appendChild(document.createTextNode('No user with that name found. Click "Add" to add a custom collaborator.'));
    dropdown.appendChild(ddDiv);
  }
}

function updateData() {
  const collabInput = document.getElementById('proj-collab-input')
  const search = collabInput.value;
  if (search) {
    axios.post('/searchusers', { search })
    .then((res) => {
      const filteredData = res.data.filter((el) => {
        return !addedCollab.has(el.userName)
      });
      populateDropdown(filteredData);
    })
    .catch((error) => {
      console.log(error);
    });
  } else {
    clearDropdown();
  }
}

function addCollab() {
  const collabInput = document.getElementById('proj-collab-input')
  const collab = collabInput.value;
  if (collab) {
    if (!addedCollab.has(collab)) {
      createCollabListEl(collab);
    } else {
      alert('Duplicate collaborator');
    }
  } else {
    alert('Collab field empty.')
  }
}

function parseDate(s) {
  const b = s.split(/\D/);
  const d = new Date(b[0], --b[1], b[2]);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function createProject() {
  const nameInput = document.getElementById('proj-name');
  const name = nameInput.value;

  const descInput = document.getElementById('proj-desc');
  const desc = descInput.value;

  const deadlineInput = document.getElementById('proj-deadline');
  const deadline = deadlineInput.value ? parseDate(deadlineInput.value) : '';

  const progList = document.getElementById('prog-list').getElementsByTagName("li");
  const progress = [];
  for (const li of progList) {
    progress.push(li.firstChild.firstChild.innerText);
  }
  progress.reverse();

  const collabList = document.getElementById('collab-list').getElementsByTagName("li");
  const collab = [];
  for (const li of collabList) {
    const person = {};
    person.name = li.firstChild.firstChild.innerText;
    person.id = li.firstChild.firstChild.getAttribute('data-id');
    collab.push(person);
  }
  collab.reverse();
  
  if (name) {
    axios.post('/createproject', { name, desc, deadline, progress, collab })
    .then((res) => {
      if (res.data.redirect) {
        document.location.href = res.data.redirect;
      }
    })
    .catch((error) => {
      console.log(error);
    });
  } else {
    alert('A project name is required.');
  }
};

window.onload = () => {
  init();
}
