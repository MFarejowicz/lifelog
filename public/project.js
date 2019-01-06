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

function postProjectComment(projectId) {
  const projectCommentInput = document.getElementById('proj-comment');
  const projectComment = projectCommentInput.value;
  if (projectComment) {
    axios.post('/postprojectcomment', { projectId, projectComment })
    .then((res) => {
      location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
  }
};

function parseDate(s) {
  const b = s.split(/\D/);
  const d = new Date(b[0], --b[1], b[2]);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
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
        })
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
