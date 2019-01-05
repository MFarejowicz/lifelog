var lastClicked;

window.onload = () => {
  init();

  const modal = document.getElementById('modal');
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  document.getElementById('close-modal').onclick = () => {
    modal.style.display = 'none';
  }

  const deletes = document.getElementsByClassName('proj-card-delete');
  for (i = 0; i < deletes.length; i++) {
    let id = deletes[i].getAttribute('data-id');
    deletes[i].onclick = () => {
      lastClicked = id;
      modal.style.display = 'block';
    }
  }

  document.getElementById('delete-yes').onclick = () => {
    axios.post('/deleteproject', { projectId: lastClicked })
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
