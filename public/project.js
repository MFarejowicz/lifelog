var addedCollab = new Set();

function postUpdate(projectId) {
  const contentInput = document.getElementById('proj-update');
  const content = contentInput.value;
  if (content) {
    axios.post('/postupdate', { projectId, content })
    .then((res) => {
      location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
  }
};

function postComment(projectId) {
  const projectCommentInput = document.getElementById('proj-comment');
  const comment = projectCommentInput.value;
  if (comment) {
    axios.post('/postcomment', { projectId, comment })
    .then((res) => {
      location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
  }
};

function postCommentReply(projectId, commentId) {
  const replyInput = document.getElementById(commentId + '-reply');
  const comment = replyInput.value;
  if (comment) {
    axios.post('/postcomment', { projectId, comment, commentId })
    .then((res) => {
      location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

function parseDate(s) {
  const b = s.split(/\D/);
  const d = new Date(b[0], --b[1], b[2]);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function createCollabListEl(collab, id) {
  const collabList = document.getElementById('owner-list');

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

  collabList.appendChild(collabListEl);
  document.getElementById('owner-input').value = "";
  clearDropdown();
}

function addCollab() {
  const collabInput = document.getElementById('owner-input')
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

function clearOwners() {
  const ul = document.getElementById('owner-list');
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
}

function clearDropdown() {
  const dropdown = document.getElementById('owner-dropdown');
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
}

function populateDropdown(users) {
  const dropdown = document.getElementById('owner-dropdown');
  clearDropdown();

  if (users.length > 0) {
    users.forEach((el) => {
      console.log(el);
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
  const ownerInput = document.getElementById('owner-input')
  const search = ownerInput.value;
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

var lastClicked;

window.onload = () => {
  init();

  const modal = document.getElementById('modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    document.getElementById('close-modal').onclick = () => {
      modal.style.display = 'none';
    }

    const deletes = document.getElementsByClassName('update-card-delete');
    for (i = 0; i < deletes.length; i++) {
      let id = deletes[i].getAttribute('data-id');
      deletes[i].onclick = () => {
        lastClicked = id;
        modal.style.display = 'block';
      }
    }

    document.getElementById('delete-yes').onclick = () => {
      axios.post('/deleteupdate', { updateId: lastClicked })
      .then((res) => {
        location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
    }

    document.getElementById('delete-no').onclick = () => {
      modal.style.display = 'none';
    }
  }

  const nameEdit = document.getElementById('name-edit');
  const nameSave = document.getElementById('name-save');
  const nameCancel = document.getElementById('name-cancel');
  const nameInput = document.getElementById('name-input');
  if (nameEdit) {
    nameEdit.onclick = () => {
      document.getElementById('project-title').style.display = 'none';
      nameInput.style.display = 'block';
      nameSave.style.display = 'block';
      nameCancel.style.display = 'block';
      nameEdit.style.display = 'none';
    }

    nameSave.onclick = () => {
      const newName = nameInput.value;
      const projectId = nameInput.getAttribute('data-id');
      if (newName) {
        axios.post('/changename', { newName, projectId })
        .then((res) => {
          location.reload();
        })
        .catch((error) => {
          console.log(error);
        })
      } else {
        alert("Need a name!")
      }
    }

    nameCancel.onclick = () => {
      document.getElementById('project-title').style.display = 'block';
      nameInput.style.display = 'none';
      nameSave.style.display = 'none';
      nameCancel.style.display = 'none';
      nameEdit.style.display = 'initial';
    }
  }

  const ownerEdit = document.getElementById('owner-edit');
  const ownerAdd = document.getElementById('owner-add');
  const ownerList = document.getElementById('owner-list')
  const ownerSave = document.getElementById('owner-save');
  const ownerCancel = document.getElementById('owner-cancel');
  const ownerInput = document.getElementById('owner-input');
  if (ownerEdit) {
    ownerEdit.onclick = () => {
      document.getElementById('owner-span').style.display = 'none';
      ownerInput.style.display = 'inline';
      ownerAdd.style.display = 'inline';
      ownerList.style.display = 'block';
      ownerSave.style.display = 'block';
      ownerCancel.style.display = 'block';
      ownerEdit.style.display = 'none';
      const projectId = ownerInput.getAttribute('data-id');
      axios.get(`/owners/${projectId}`)
      .then((res) => {
        res.data.forEach((el) => {
          createCollabListEl(el.fkUserName, el.fkUserId);
          addedCollab.add(el.fkUserName);
        });
      })
      .catch((err) => {
        console.log(err);
      });
    }

    ownerSave.onclick = () => {
      const collabList = document.getElementById('owner-list').getElementsByTagName("li");
      const collab = [];
      for (const li of collabList) {
        const person = {};
        person.name = li.firstChild.firstChild.innerText;
        person.id = li.firstChild.firstChild.getAttribute('data-id');
        collab.push(person);
      }
      const projectId = document.getElementById('owner-list').getAttribute('data-id');

      axios.post('/changeowner', { collab, projectId })
      .then((res) => {
        console.log(res);
        location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
    }

    ownerCancel.onclick = () => {
      document.getElementById('owner-span').style.display = 'block';
      ownerInput.style.display = 'none';
      ownerAdd.style.display = 'none';
      ownerList.style.display = 'none';
      ownerSave.style.display = 'none';
      ownerCancel.style.display = 'none';
      ownerEdit.style.display = 'initial';
      clearOwners();
      addedCollab = new Set();
    }
  }

  const descEdit = document.getElementById('desc-edit');
  const descSave = document.getElementById('desc-save');
  const descCancel = document.getElementById('desc-cancel');
  const descInput = document.getElementById('desc-input');
  if (descEdit) {
    descEdit.onclick = () => {
      document.getElementById('desc-span').style.display = 'none';
      descInput.style.display = 'block';
      descSave.style.display = 'block';
      descCancel.style.display = 'block';
      descEdit.style.display = 'none';
    }

    descSave.onclick = () => {
      const newDesc = descInput.value;
      const projectId = descInput.getAttribute('data-id');
      if (newDesc) {
        axios.post('/changedesc', { newDesc, projectId })
        .then((res) => {
          location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
      } else {
        alert("Need a desc!")
      }
    }

    descCancel.onclick = () => {
      document.getElementById('desc-span').style.display = 'block';
      descInput.style.display = 'none';
      descSave.style.display = 'none';
      descCancel.style.display = 'none';
      descEdit.style.display = 'initial';
    }
  }

  const deadlineEdit = document.getElementById('deadline-edit');
  const deadlineSave = document.getElementById('deadline-save');
  const deadlineCancel = document.getElementById('deadline-cancel');
  const deadlineInput = document.getElementById('deadline-input');
  if (deadlineEdit) {
    deadlineEdit.onclick = () => {
      document.getElementById('deadline-span').style.display = 'none';
      deadlineInput.style.display = 'block';
      deadlineSave.style.display = 'block';
      deadlineCancel.style.display = 'block';
      deadlineEdit.style.display = 'none';
    }

    deadlineSave.onclick = () => {
      const newDeadline = deadlineInput.value ? parseDate(deadlineInput.value) : '';
      const projectId = deadlineInput.getAttribute('data-id');
      if (newDeadline) {
        axios.post('/changedeadline', { newDeadline, projectId })
        .then((res) => {
          location.reload();
        })
        .catch((error) => {
          console.log(error);
        })
      } else {
        alert("Need a deadline!")
      }
    }

    deadlineCancel.onclick = () => {
      document.getElementById('deadline-span').style.display = 'block';
      deadlineInput.style.display = 'none';
      deadlineSave.style.display = 'none';
      deadlineCancel.style.display = 'none';
      deadlineEdit.style.display = 'initial';
    }
  }

}
