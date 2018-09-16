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
  if (name) {
    axios.post('/createproject', { name, desc, deadline })
    .then((res) => {
      if (res.data.redirect) {
        document.location.href = res.data.redirect;
      }
    })
    .catch((error) => {
      console.log(error);
    });
  } else {
    alert('You need to enter a project name at the least');
  }
};

window.onload = () => {
  init();
}
