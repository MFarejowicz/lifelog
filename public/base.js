function clearSearch() {
  const dropdown = document.getElementById('search-dropdown');
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
}

function populateSearch(results) {
  const dropdown = document.getElementById('search-dropdown');
  clearSearch();

  if (results.length > 0) {
    results.forEach((el) => {
      const ddDiv = document.createElement('div');
      ddDiv.setAttribute('class', 'collab-dropdown-item');
      if (el.type === 'project') {
        ddDiv.appendChild(document.createTextNode(el.data.name));
        ddDiv.onclick = () => document.location.href = `/project/${el.data.projectId}`;
      } else {
        ddDiv.appendChild(document.createTextNode(el.data.userName));
        ddDiv.onclick = () => document.location.href = `/user/${el.data.userId}`;
      }
      dropdown.appendChild(ddDiv);
    })
  } else {
    const ddDiv = document.createElement('div');
    ddDiv.setAttribute('class', 'search-dropdown-empty');
    ddDiv.appendChild(document.createTextNode('No results found'));
    dropdown.appendChild(ddDiv);
  }
}

function search() {
  const searchInput = document.getElementById('search');
  const search = searchInput.value;
  if (search) {
    axios.post('/search', { search })
    .then((res) => {
      populateSearch(res.data);
    })
    .catch((error) => {
      console.log(error);
    })
  } else {
    clearSearch();
  }
}

function init() {
  const superTitle = document.getElementById('super-title');
  superTitle.onclick = () => {
    document.location.href = '/';
  }
};
