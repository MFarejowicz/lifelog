function postUpdate(projectId) {
  const contentInput = document.getElementById('proj-update');
  const content = contentInput.value;
  axios.post('/postupdate', { projectId, content })
  .then((res) => {
    location.reload();
  })
  .catch((error) => {
    console.log(error);
  });
};

window.onload = () => {
  init();
}
