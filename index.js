'use strict'

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PRE_PAGE = 12 
let currentPage = 1 //存放最後點擊的分頁頁碼，讓切換顯示模式還是呈現同一分頁的資訊
let currentDisplayMode = 'card' //存放當前的顯示模式，預設卡片模式

const movies = [] //存放對index api發送請求回傳的電影清單
let filteredMovies = [] //存放篩選後的電影清單

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')
const displayMode = document.querySelector('#display-mode')


// 設定監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  
  if (target.matches('.btn-show-movie')) {
    showMovieModal(target.dataset.id)
  } 
  else if (target.matches('.btn-add-favorite')) {
    addToFavorite(target.dataset.id)
  }
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()

  const searchInput = document.querySelector('#search-input')
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => {
    return movie.title.toLowerCase().includes(keyword)
  })

  if (!filteredMovies.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})


displayMode.addEventListener('click', function onDisplayModeClicked(event) {
  const target = event.target
  if (target.tagName === 'I') {
    currentDisplayMode = target.matches('#display-mode-card') ? 'card' : 'list' //如果不是點擊顯示卡片模式，就是顯示列表模式
  }
  renderMovieList(getMoviesByPage(currentPage))
})


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName === 'A') {
    currentPage = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(currentPage))
  }
})


// 對index api發送電影清單請求
axios.get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
  })
  .catch(error => console.log(error))


function renderMovieList(movies) {

  if (currentDisplayMode === 'list') {
    dataPanel.innerHTML = listRawHTML(movies)
  } else {
    dataPanel.innerHTML = cardRawHTML(movies)
  }
}


function cardRawHTML(movies) {
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
            <button type="button" class="btn btn-info btn-add-favorite" data-id=${movie.id}>+</button>
          </div>
        </div>
      </div>`
  })
  return rawHTML
}


function listRawHTML(movies) {
  let rawHTML = ''
  movies.forEach(movie => {
    rawHTML += `
      <div class="row border-top py-3">
        <div class="col d-flex align-items-center">${movie.title}</div>
        <div class="col d-flex justify-content-end">
          <button type="button" class="btn btn-primary btn-show-movie mx-3" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${movie.id}">More</button>
          <button type="button" class="btn btn-info btn-add-favorite" data-id=${movie.id}>+</button>
        </div>
      </div>`
  })
  return rawHTML
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


function addToFavorite(id) {

  const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  
  const movie = movies.find(movie => movie.id === Number(id)) 
  
  if (favoriteMovies.some(movie => movie.id === Number(id))) {
    return alert("電影已經在收藏清單內！")
  }

  favoriteMovies.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))
}


function getMoviesByPage(page) {
  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // page 3 -> movies 24 - 35
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * 12

  return data.slice(startIndex, startIndex + MOVIES_PRE_PAGE)
}


function renderPaginator(amount) {
  const pages = Math.ceil(amount / MOVIES_PRE_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= pages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}