 'use strict'

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

renderMovieList(movies)


dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  
  if (target.matches('.btn-show-movie')) {
    showMovieModal(target.dataset.id)
  } 
  else if (target.matches('.btn-remove-favorite')) {
    removeFromFavorite(target.dataset.id)
  }
})


function renderMovieList(movies) {

  let rawHTML = ''

  movies.forEach(movie => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="card h-100">
          <img
            src="${POSTER_URL + movie.image}"
            class="card-img-top" class="card-img-top img-fluid" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
          </div>
          <div class="card-footer">
            <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${movie.id}">More</button>
            <button type="button" class="btn btn-danger btn-remove-favorite" data-id=${movie.id}>x</button>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {

  const title = document.querySelector('#movie-modal-title')
  const info = document.querySelector('#movie-modal-info')

  title.textContent = ''
  info.innerHTML = ''

  axios.get(INDEX_URL + Number(id))
    .then(response => {
      const movie = response.data.results

      title.textContent = movie.title
      let rawHTML = `
              <div class="col-sm-8">
                <img src="${POSTER_URL + movie.image}" class="img-fluid" alt="movie poster">
              </div>
              <div class="col-sm-4">
                <p><em>release date: ${movie.release_date}</em></p>
                <p id="movie-modal-description">${movie.description}</p>
              </div>`
      info.innerHTML = rawHTML
    })
    .catch(error => console.log(error))
}


function removeFromFavorite(id) {
  if (!movies || !movies.length) return

  const movieIndex = movies.findIndex(movie => movie.id === Number(id))
  if (movieIndex === -1) return
  
  movies.splice(movieIndex,1)
  
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  
  renderMovieList(movies)
}