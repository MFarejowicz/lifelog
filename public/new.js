function bindCreate() {
  const createButton = document.getElementById('create');
  createButton.onclick = () => {
    const nameInput = document.getElementById('proj-name');
    const name = nameInput.value;
    const descInput = document.getElementById('proj-desc');
    const desc = descInput.value;
    const deadlineInput = document.getElementById('proj-deadline');
    const deadline = deadlineInput.value;
    axios.post('/createproject', { name, desc, deadline })
    .then((res) => {
      if (res.data.redirect) {
        document.location.href = res.data.redirect;
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
};

window.onload = () => {
  init();
  bindCreate();
}
