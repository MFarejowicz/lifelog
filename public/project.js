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
}
