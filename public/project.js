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

window.onload = () => {
  init();
}
