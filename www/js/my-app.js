// If we need to use custom DOM library, let's save it to $$ variable:

let page = 1;
let datos = {};
const baseUrl = 'https://api.themoviedb.org/3';
const apiKey = 'api_key=2dbec8d4e8d5af1a656020c0cd8f2403';
const imgUrl = 'https://image.tmdb.org/t/p/w500';
var $$ = Dom7;

var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: [
    {
      path: '/index/',
      url: 'index.html',
    },
    {
      name: 'config',
      path: '/config/',
      url: './config.html',
    },
    {
      name: 'about',
      path: '/about/',
      url: './about.html',
    },
    {
      path: '/register/',
      url: './register.html',
    },
    {
      path: '/forgot/',
      url: './forgotPassword.html',
    },
    {
      path: '/home/',
      url: './home.html',
    },
    {
      path: '/seasons/:season/',
      url: './season.html',
      name: 'season',
    },
  ],

  // ... other parameters
});

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
  console.log('Device is ready!');
});

// LOG IN START
$$(document).on('page:init', '.page[data-name="index"]', function (e) {
  const overlay = document.getElementById('overlay');
  {
    overlay && setModal();
    function setModal() {
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 2500);
      setTimeout(() => {
        overlay.remove();
      }, 3500);
    }
  }
  const signinForm = document.getElementById('loginForm');
  const googleLogin = document.getElementById('googleLogin');
  const guestLogin = document.getElementById('guestLogin');
  const errorText = document.getElementById('textError');
  //SignIn
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailLogin = document.getElementById('emailLogin');
    const passwordLogin = document.getElementById('passwordLogin');
    auth
      .signInWithEmailAndPassword(emailLogin.value, passwordLogin.value)
      .then((userCredential) => {
        console.log(
          `Usuario "${userCredential.user.displayName}" con el correo "${emailLogin.value}" se logueo correctamente`
        );
        datos.emailUser = emailLogin.value;
        datos.nameUser = userCredential.user.displayName;
        datos.imgUser = '1';
        localStorage.setItem('userData', JSON.stringify(datos));
        mainView.router.navigate('/home/');
      })
      .catch((err) => {
        signinForm.reset();
        errorMessage(err.code);
      });
  });

  //Google Login

  googleLogin.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth
      .signInWithPopup(provider)
      .then((result) => {
        console.log('google SignIN');
        mainView.router.navigate('/home/');
      })
      .catch((err) => {
        errorMessage(err.code);
      });
  });

  //Anonimous Login

  guestLogin.addEventListener('click', () => {
    auth
      .signInAnonymously()
      .then(() => {
        console.log('Usuario anonimo se logueo correctamente');
        datos.emailUser = '';
        datos.nameUser = 'Invitado';
        localStorage.setItem('userData', JSON.stringify(datos));
        mainView.router.navigate('/home/');
      })
      .catch((err) => {
        errorMessage(err.code);
      });
  });

  function errorMessage(error) {
    errorText.classList.add('blink-1');
    if (error == 'auth/user-not-found') {
      errorText.textContent = 'Error: El Usuario No Existe';
      console.log('El Usuario No Existe');
    } else if (error == 'auth/wrong-password') {
      errorText.textContent = 'Error: Contrase??a Incorrecta';
      console.log('Contrase??a Incorrecta');
    }
    setTimeout(() => {
      errorText.classList.remove('blink-1');
      errorText.classList.add('blink-2');
    }, 2000);
    setTimeout(() => {
      errorText.classList.remove('blink-2');
      errorText.textContent = '';
    }, 2600);
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('auth: iniciado');
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        mainView.router.navigate('/home/');
        return firebase.auth().signInWithEmailAndPassword(email, password);
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  } else {
    console.log('auth: cerrado');
  }
});

$$(document).on('page:init', '.page[data-name="register"]', function (e) {
  const registerForm = document.getElementById('registerForm');
  const textErrorRegister = document.getElementById('textErrorRegister');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('entro');
    const userName = document.getElementById('nombreUsuario');
    const email = document.getElementById('nombreRegistro');
    const password = document.getElementById('passwordRegistro');
    const password2 = document.getElementById('passwordRegistro2');
    if (password.value == password2.value) {
      console.log('Coinciden');
      auth
        .createUserWithEmailAndPassword(email.value, password.value)
        .then((userCredential) => {
          const user = firebase.auth().currentUser;
          datos.emailUser = email.value;
          datos.nameUser = userName.value;

          localStorage.setItem('userData', JSON.stringify(datos));
          console.log(
            `Usuario "${userName.value}" con el correo "${email.value}" se registro correctamente`
          );
          mainView.router.navigate('/home/');
          return user.updateProfile({
            displayName: userName.value,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      textErrorRegister.classList.add('blink-1');
      textErrorRegister.textContent = 'Error: Las contrase??as no coinciden';
      setTimeout(() => {
        textErrorRegister.classList.remove('blink-1');
        textErrorRegister.classList.add('blink-2');
      }, 2000);
      setTimeout(() => {
        textErrorRegister.classList.remove('blink-2');
        textErrorRegister.textContent = '';
      }, 2600);
    }
  });
});

$$(document).on('page:init', '.page[data-name="resetPassword"]', function (e) {
  const emailForgot = document.getElementById('forgotEmail');
  const forgotForm = document.getElementById('forgotForm');
  const textErrorForgot = document.getElementById('textErrorForgot');
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    firebase
      .auth()
      .sendPasswordResetEmail(emailForgot.value)
      .then(() => {
        textErrorForgot.setAttribute('style', 'background:green');
        textErrorForgot.textContent = 'Email enviado correctamente';
        textErrorForgot.classList.add('blink-1');
        setTimeout(() => {
          textErrorForgot.classList.remove('blink-1');
          textErrorForgot.classList.add('blink-2');
        }, 2000);
        setTimeout(() => {
          textErrorForgot.classList.remove('blink-2');
          textErrorForgot.textContent = '';
          forgotForm.reset();
        }, 2600);
      })
      .catch((error) => {
        textErrorForgot.classList.add('blink-1');
        textErrorForgot.textContent = 'Error: El Usuario No Existe';
        setTimeout(() => {
          textErrorForgot.classList.remove('blink-1');
          textErrorForgot.classList.add('blink-2');
        }, 2000);
        setTimeout(() => {
          textErrorForgot.classList.remove('blink-2');
          textErrorForgot.textContent = '';
          forgotForm.reset();
        }, 2600);
      });
  });
});
// LOG IN END

$$(document).on('page:init', '.page[data-name="home"]', function (e) {
  const currentUserInit = document.getElementById('currentUserInit');
  const currentUserProfile = document.getElementById('currentUserProfile');
  const emailUser = document.getElementById('emailUser');
  const userData = localStorage.getItem('userData');
  const data = JSON.parse(userData);
  currentUserProfile.textContent = data.nameUser;
  currentUserInit.textContent = data.nameUser;
  emailUser.textContent = data.emailUser;

  const apiUrlCount =
    baseUrl + '/discover/movie?' + apiKey + '&page=1&sort_by=vote_count.desc&';

  const apiUrlPopup = baseUrl + '/trending/tv/week?' + apiKey;

  const apiUrlSellers = baseUrl + '/trending/all/week?' + apiKey;

  const searchUrl = baseUrl + '/search/movie?' + apiKey;

  const pageContent = document.getElementById('pageContent');
  const swiperWrapper = document.getElementById('swiperWrapper');
  const cardCount = document.getElementById('cardCount');
  const searchFilm = document.getElementById('searchFilm');
  const cardPopup = document.getElementById('cardPopu');

  const imagePopup = document.getElementById('imagePopup');

  const divFilm = document.getElementById('divFilm');

  const clearButton = document.getElementById('clearBtn');

  const film = document.getElementById('searchInput');

  const prev = document.getElementById('btnPrev');

  const next = document.getElementById('btnNext');

  const spanPag = document.getElementById('spanPag');

  setTimeout(() => {
    new Swiper('.swiper', {
      speed: 400,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
    });
  }, 1000);

  getSellers(apiUrlSellers);

  async function getSellers(url) {
    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        getTrending(data.results);
      });
  }

  function getTrending(data) {
    data.map((movie) => {
      const { poster_path } = movie;

      const swiperSlide = document.createElement('div');
      swiperSlide.classList.add('swiper-slide');

      swiperSlide.innerHTML = `
   
        <div class="imgSwiper" style="background-image: linear-gradient( rgba(26, 33, 64, 0) 70%, rgba(26, 33, 64, 1) 100% ), url('${imgUrl}${poster_path}')">
     
        </div>

      `;
      swiperWrapper.appendChild(swiperSlide);
    });
  }

  searchFilm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (film.value !== '') {
      searchGenrer.innerHTML = '';
      divFilm.innerHTML = '';
      const url =
        baseUrl + '/search/multi?' + apiKey + `&page=1&query=${film.value}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const { results } = data;

          if (results.length == 0) {
            divFilm.innerHTML = '';
            const searchResults = document.createElement('a');
            searchResults.innerHTML = `
            <div>
            <p>No hay pel??culas que coincidan con tu consulta. Por favor, sea mas detallado o vuelva al <a onclick='window.location.reload()'>inicio</a>.</p>
            </div>
          `;
            divFilm.appendChild(searchResults);
          } else {
            results.map((search) => {
              const searchResults = document.createElement('a');
              searchResults.setAttribute('id', search.id);
              searchResults.classList.add('game-card');
              searchResults.classList.add('scroll-block-item');

              divFilm.classList.add('block');
              divFilm.classList.add('game-cards');
              divFilm.classList.add('scroll-block');

              searchResults.addEventListener('click', function () {
                let TRAILER = [];
                let GENRES = [];
                let WATCHES = [];
                imagePopup.innerHTML = '';
                if (search.media_type === 'movie') {
                  const idUrl =
                    baseUrl +
                    '/movie/' +
                    search.id +
                    '?' +
                    apiKey +
                    '&language=es&append_to_response=credits';
                  const viewUrl =
                    baseUrl +
                    '/movie/' +
                    search.id +
                    '/watch/' +
                    'providers' +
                    '?' +
                    apiKey;
                  const trailerUrl =
                    baseUrl + '/movie/' + search.id + '/videos?' + apiKey;
                  getIdUrl(idUrl, viewUrl, trailerUrl);
                } else {
                  const idUrl =
                    baseUrl +
                    '/tv/' +
                    search.id +
                    '?' +
                    apiKey +
                    '&language=es&append_to_response=credits';
                  const viewUrl =
                    baseUrl +
                    '/tv/' +
                    search.id +
                    '/watch/' +
                    'providers' +
                    '?' +
                    apiKey;
                  const trailerUrl =
                    baseUrl + '/tv/' + search.id + '/videos?' + apiKey;
                  getIdUrl(idUrl, viewUrl, trailerUrl);
                }

                async function getIdUrl(url, url2, url3) {
                  await fetch(url)
                    .then((res) => res.json())
                    .then(async (data) => {
                      console.log(data);
                      const movieEl = document.createElement('div');
                      movieEl.classList.add('view');
                      movieEl.classList.add('view-init');

                      if (search.media_type === 'movie') {
                        movieEl.innerHTML = `
                      <div class="page">
                        <div class="page-content">
                          <div class="marginCard">
                            <a class="popup-close" href="#">
                              <i class="iconX f7-icons">multiply</i>
                            </a>
                          </div>
                          <div class="card demo-card-header-pic">
                            <div style="background-image:url(${
                              imgUrl + data.backdrop_path
                            });min-height:300px" class="card-header align-items-flex-end"> data.release_date
                                })</p>
                            </div>
                            <div class="card-content card-content-padding">
                              <p>${data.tagline}</p>
                              <p>${data.overview}</p>
                              <h3 class="noStyle">Generos:</h3>
                              <div class="genreDiv" id="genreDiv"></div>
                              <h3 class="creditsH3">Reparto:</h3>
                              <div class="block game-cards scroll-block creditsDiv" id="creditsDiv"></div>
                              <h3 class="noStyle">Donde ver:</h3>
                              <div class="divWatch" id="watchDiv"></div>
                              <h3 class="creditsH3">Trailers:</h3>
                      
                              <div class="block game-cards scroll-block trailersDiv" id="trailersDiv"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      `;
                      } else {
                        movieEl.innerHTML = `
                      <div class="page">
                        <div class="page-content">
                          <div class="marginCard">
                            <a class="popup-close" href="#">
                              <i class="iconX f7-icons">multiply</i>
                            </a>
                          </div>
                          <div class="card demo-card-header-pic">
                            <div style="background-image:url(${
                              imgUrl + data.backdrop_path
                            });min-height:300px" class="card-header align-items-flex-end">
                                                                     data.first_air_date
                                })</p>
                            </div>
                            <div class="card-content card-content-padding">
                              <p>${data.tagline}</p>
                              <p>${data.overview}</p>
                              <div class="containerGenre">
                                <h3 class="noStyle">Generos:</h3>
                                <div class="genreDiv" id="genreDiv"></div>
                              </div>
                              <h3 class="creditsH3">Reparto:</h3>
                              <div class="block game-cards scroll-block creditsDiv" id="creditsDiv"></div>
                              <h3 class="noStyle">Donde ver:</h3>
                              <div class="divWatch" id="watchDiv"></div>
                              <h3 class="creditsH3">Trailers:</h3>
                      
                              <div class="block game-cards scroll-block trailersDiv" id="trailersDiv"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      `;
                      }

                      imagePopup.appendChild(movieEl);

                      if (data.genres.length > 0) {
                        const genreDiv = document.getElementById('genreDiv');
                        data.genres.map((generos) => {
                          const genre = document.createElement('h3');
                          genre.classList.add('textGenres');
                          GENRES.push(generos.name);
                          genre.innerHTML = `
                          ${GENRES[0]}
                          `;
                          GENRES = [];
                          genreDiv.appendChild(genre);
                        });
                      } else {
                        const genreDiv = document.getElementById('genreDiv');
                        const genre = document.createElement('span');
                        genre.innerHTML = `No existen generos`;
                        genreDiv.appendChild(genre);
                      }

                      if (data.credits.cast.length > 0) {
                        const creditsDiv =
                          document.getElementById('creditsDiv');
                        data.credits.cast.map((credit) => {
                          const reparto = document.createElement('a');
                          reparto.setAttribute('id', credit.id);
                          reparto.classList.add('game-card');
                          reparto.classList.add('scroll-block-item');
                          reparto.innerHTML = `
                      <div class="game-card-image popup-open" data-popup=".popup-about">
                         <img src="${
                           credit.profile_path
                             ? imgUrl + credit.profile_path
                             : '../img/user.png'
                         }"
                          alt="${credit.name}">
                            </div>
                        <div id="name" class="game-card-name">${
                          credit.name
                        }</div>
                        <div class="game-card-tagline">${credit.character}</div>
                        `;
                          if (
                            imgUrl + credit.profile_path ===
                            'https://image.tmdb.org/t/p/w500null'
                          ) {
                            reparto.innerHTML = `
                        <div class="game-card-image popup-open" data-popup=".popup-about">
                        <img src="../img/user.png"
                        alt="${credit.name}">
                              </div>
                          <div id="name" class="game-card-name">${credit.name}</div>
                          <div class="game-card-tagline">${credit.character}</div>
                          `;
                          }
                          creditsDiv.appendChild(reparto);
                        });
                      } else {
                        const creditsDiv =
                          document.getElementById('creditsDiv');
                        const reparto = document.createElement('span');
                        reparto.innerHTML = `No existe reparto`;
                        creditsDiv.appendChild(reparto);
                        console.log('No existe reparto');
                      }
                    });

                  await fetch(url2)
                    .then((res) => res.json())
                    .then((data) => {
                      const { results } = data;
                      const { AR } = results;
                      if (AR.flatrate !== undefined) {
                        const watchDiv = document.getElementById('watchDiv');
                        AR.flatrate.map((watches) => {
                          const watch = document.createElement('div');
                          WATCHES.push(watches.logo_path);
                          WATCHES.push(watches.provider_name);
                          watch.innerHTML = `
                          <img class="iconWatch" src="${
                            imgUrl + WATCHES[0]
                          }" alt="${WATCHES[1]}">
                          <h3>${WATCHES[1]}</h3>
                    `;
                          WATCHES = [];
                          watchDiv.appendChild(watch);
                        });
                      } else {
                        const watchDiv = document.getElementById('watchDiv');
                        const watch = document.createElement('span');
                        watch.innerHTML = `No existe donde verla`;
                        watchDiv.appendChild(watch);
                      }
                    });

                  await fetch(url3)
                    .then((res) => res.json())
                    .then(async (data) => {
                      const { results } = data;
                      results.map((trailer) => {
                        if (trailer.type === 'Trailer') {
                          if (trailer.type.length > 0) {
                            const trailersDiv =
                              document.getElementById('trailersDiv');
                            const video = document.createElement('div');
                            video.classList.add('game-card');
                            video.classList.add('scroll-block-item');
                            video.classList.add('trailerDiv');

                            TRAILER.push(
                              `  <iframe src="https://www.youtube-nocookie.com/embed/${trailer.key}" title="${trailer.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                            );
                            video.innerHTML = `${TRAILER[0]}`;
                            TRAILER = [];
                            trailersDiv.appendChild(video);
                          }
                        }
                      });
                    });
                }
              });

              if (search.media_type === 'movie') {
                searchResults.innerHTML = `
              <div class="game-card-image popup-open" data-popup=".popup-about">
                  <img src="
                  ${
                    search.poster_path
                      ? imgUrl + search.poster_path
                      : '../img/film.png'
                  }"
                      alt="${search.title}">
              </div>
              <div id="name" class="game-card-name">${search.title}</div>
              <div class="game-card-tagline tagline">${
                search.release_date
              }</div>
            `;
              } else {
                searchResults.innerHTML = `
                  <div class="game-card-image popup-open" data-popup=".popup-about">
                      <img src="
                      ${
                        search.poster_path
                          ? imgUrl + search.poster_path
                          : '../img/film.png'
                      }"
                          alt="${search.name}">
                  </div>
                  <div id="name" class="game-card-name">${search.name}</div>
                  <div class="game-card-tagline tagline">${
                    search.first_air_date
                  }</div>
                `;
              }

              divFilm.appendChild(searchResults);
            });
          }
        });
    } else {
      divFilm.innerHTML = '';
      const searchResults = document.createElement('div');
      searchResults.innerHTML = `
  
      <p>No hay pel??culas que coincidan con tu consulta. Por favor, sea mas detallado o vuelva al <a onclick='window.location.reload()'>inicio</a>.</p>
  
    `;
      divFilm.appendChild(searchResults);
    }
  });

  const genres = [
    {
      id: 28,
      name: 'Action',
    },
    {
      id: 12,
      name: 'Adventure',
    },
    {
      id: 16,
      name: 'Animation',
    },
    {
      id: 35,
      name: 'Comedy',
    },
    {
      id: 80,
      name: 'Crime',
    },
    {
      id: 99,
      name: 'Documentary',
    },
    {
      id: 18,
      name: 'Drama',
    },
    {
      id: 10751,
      name: 'Family',
    },
    {
      id: 14,
      name: 'Fantasy',
    },
    {
      id: 36,
      name: 'History',
    },
    {
      id: 27,
      name: 'Horror',
    },
    {
      id: 10402,
      name: 'Music',
    },
    {
      id: 9648,
      name: 'Mystery',
    },
    {
      id: 10749,
      name: 'Romance',
    },
    {
      id: 878,
      name: 'Science/Fiction',
    },
    {
      id: 10770,
      name: 'TV/Movie',
    },
    {
      id: 53,
      name: 'Thriller',
    },
    {
      id: 10752,
      name: 'War',
    },
    {
      id: 37,
      name: 'Western',
    },
  ];

  const searchGenrer = document.getElementById('searchGenrer');
  let selectedGenre = [];

  setGenre();

  function setGenre() {
    searchGenrer.innerHTML = '';

    genres.forEach((genre) => {
      const t = document.createElement('div');
      t.classList.add('tag');
      t.id = genre.id;
      t.innerText = genre.name;
      t.addEventListener('click', () => {
        if (selectedGenre.length == 0) {
          selectedGenre.push(genre.id);
        } else {
          if (selectedGenre.includes(genre.id)) {
            selectedGenre.forEach((id, idx) => {
              if (id == genre.id) {
                selectedGenre.splice(idx, 1);
              }
            });
          } else {
            selectedGenre.push(genre.id);
          }
        }
        console.log(selectedGenre);
        getMoviesCount(
          apiUrlCount + '&with_genres=' + encodeURI(selectedGenre.join(','))
        );
        highlightSelection();
      });
      searchGenrer.append(t);
    });
  }

  function highlightSelection() {
    spanPag.innerHTML = '1';
    page = 1;
    const tags = document.querySelectorAll('.tag');
    tags.forEach((tag) => {
      tag.classList.remove('highlight');
    });
    clearBtn();
    if (selectedGenre.length != 0) {
      selectedGenre.forEach((id) => {
        const hightlightedTag = document.getElementById(id);
        hightlightedTag.classList.add('highlight');
      });
    }
  }

  function clearBtn() {
    if (selectedGenre.length >= 1) {
      let clearBtn = document.getElementById('clear');
      if (clearBtn) {
        clearBtn.classList.add('highlight');
      } else {
        let clear = document.createElement('div');
        clear.classList.add('tag', 'highlight');
        clear.id = 'clear';
        clear.innerText = 'Clear x';
        clear.addEventListener('click', () => {
          selectedGenre = [];
          setGenre();
          getMoviesCount(apiUrlCount);
          clearButton.innerHTML = '';
        });
        clearButton.append(clear);
      }
    } else {
      clearButton.innerHTML = '';
    }
  }

  getMoviesCount(apiUrlCount);

  function getMoviesCount(url) {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        getMoviesByVoteCount(data.results);
      });
  }

  const getMoviesByVoteCount = (data) => {
    let GENRES = [];
    let WATCHES = [];
    let TRAILER = [];
    cardCount.innerHTML = '';
    data.forEach((movie) => {
      const voteCount = movie.vote_average.toFixed(1);

      const movieEl = document.createElement('a');

      movieEl.setAttribute('id', movie.id);
      movieEl.classList.add('game-card');
      movieEl.classList.add('scroll-block-item');

      movieEl.addEventListener('click', function () {
        imagePopup.innerHTML = '';
        const idUrl =
          baseUrl +
          '/movie/' +
          movie.id +
          '?' +
          apiKey +
          '&language=es&append_to_response=credits,trailers';
        const viewUrl =
          baseUrl +
          '/movie/' +
          movie.id +
          '/watch/' +
          'providers' +
          '?' +
          apiKey;
        getIdUrl(idUrl, viewUrl);
        async function getIdUrl(url, url2) {
          await fetch(url)
            .then((res) => res.json())
            .then(async (data) => {
              results = data;
              console.log(results);
              const {
                title,
                backdrop_path,
                tagline,
                overview,
                genres,
                homepage,
                credits,
                trailers,
                runtime,
              } = results;

              function toHoursAndMinutes(runtime) {
                const hours = Math.floor(runtime / 60);
                const minutes = runtime % 60;
                return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
              }

              const movieEl = document.createElement('div');
              movieEl.classList.add('view');
              movieEl.classList.add('view-init');

              movieEl.innerHTML = `
              <div class="page">
                <div class="page-content">
                  <div class="marginCard">
                    <a class="popup-close" href="#">
                      <i class="iconX f7-icons">multiply</i>
                    </a>
                  </div>
                  <div class="card demo-card-header-pic">
                    <div style="background-image:url(${
                      imgUrl + backdrop_path
                    });min-height:300px" class="card-header align-items-flex-end">
                   </div>
                    <div class="card-content card-content-padding">
                      <div class="divFlex">
                      <h1 class="noStyle">${title}${
                homepage && `<a class="external" href=${homepage}>(Ir)</a>`
              }</h1>
                      <h4 class="noStyle">Duracion: ${toHoursAndMinutes(
                        runtime
                      )}</h4>
                      </div>
                      <p>${tagline}</p>
                      <p>${overview}</p>
                      <div class="containerGenre">
                         <h3 class="noStyle">Generos:</h3>
                         <div class="genreDiv" id="genreDiv"></div>
                      </div>
                      <h3 class="creditsH3">Reparto:</h3>
                      <div class="block game-cards scroll-block creditsDiv" id="creditsDiv"></div>
                      <h3 class="noStyle">Donde ver:</h3>
                      <div class="divWatch" id="watchDiv"></div>
  
                      <h3 class="creditsH3">Trailers:</h3>
                      
                      <div class="trailersDiv" id="trailersDiv"></div>
                    </div>
                  </div>
                </div>
              </div>
              `;

              imagePopup.appendChild(movieEl);
              if (genres.length > 0) {
                const genreDiv = document.getElementById('genreDiv');
                genres.map((generos) => {
                  const genre = document.createElement('h3');
                  genre.classList.add('textGenres');
                  GENRES.push(generos.name);
                  genre.innerHTML = `
                    ${GENRES[0]}
                    `;
                  GENRES = [];
                  genreDiv.appendChild(genre);
                });
              } else {
                const genreDiv = document.getElementById('genreDiv');
                const genre = document.createElement('span');
                genre.innerHTML = `No existen generos`;
                genreDiv.appendChild(genre);
              }

              if (credits.cast.length > 0) {
                const creditsDiv = document.getElementById('creditsDiv');
                credits.cast.map((credit) => {
                  const reparto = document.createElement('a');
                  reparto.setAttribute('id', credit.id);
                  reparto.classList.add('game-card');
                  reparto.classList.add('scroll-block-item');
                  reparto.classList.add('external');
                  reparto.setAttribute(
                    'href',
                    `https://www.themoviedb.org/person/${credit.id}`
                  );
                  reparto.innerHTML = `
                <div class="game-card-image popup-open" data-popup=".popup-about">
                   <img src="${
                     credit.profile_path
                       ? imgUrl + credit.profile_path
                       : './img/user.png'
                   }"
                    alt="${credit.name}">
                      </div>
                  <div id="name" class="game-card-name">${credit.name}</div>
                  <div class="game-card-tagline">${credit.character}</div>
                  `;

                  creditsDiv.appendChild(reparto);
                });
              } else {
                const creditsDiv = document.getElementById('creditsDiv');
                const reparto = document.createElement('span');
                reparto.innerHTML = `No existe reparto`;
                creditsDiv.appendChild(reparto);
                console.log('No existe reparto');
              }

              if (trailers.youtube.length > 0) {
                const trailersDiv = document.getElementById('trailersDiv');
                trailers.youtube.map((cortos) => {
                  const trailer = document.createElement('div');
                  trailer.classList.add('game-card');
                  trailer.classList.add('scroll-block-item');
                  trailer.classList.add('trailerDiv');

                  TRAILER.push(
                    `  <iframe src="https://www.youtube-nocookie.com/embed/${cortos.source}" title="${cortos.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                  );
                  trailer.innerHTML = `${TRAILER[0]}`;
                  TRAILER = [];
                  trailersDiv.appendChild(trailer);
                });
              }
            });
          await fetch(url2)
            .then((res) => res.json())
            .then((data) => {
              const { results } = data;
              const { AR } = results;
              if (AR.flatrate !== undefined) {
                const watchDiv = document.getElementById('watchDiv');
                AR.flatrate.map((watches) => {
                  const watch = document.createElement('div');
                  WATCHES.push(watches.logo_path);
                  WATCHES.push(watches.provider_name);
                  watch.innerHTML = `
                    <img class="iconWatch" src="${imgUrl + WATCHES[0]}" alt="${
                    WATCHES[1]
                  }">
                    <h3>${WATCHES[1]}</h3>
              `;
                  WATCHES = [];
                  watchDiv.appendChild(watch);
                });
              } else {
                const watchDiv = document.getElementById('watchDiv');
                const watch = document.createElement('span');
                watch.innerHTML = `No existe donde verla`;
                watchDiv.appendChild(watch);
              }
            });
        }
      });

      movieEl.innerHTML = `
  
                  <div class="game-card-image popup-open" data-popup=".popup-about">
                      <img src="${imgUrl + movie.poster_path}"
                          alt="${movie.title}">
                          <div class="vote">
                            <h4>${voteCount}</h4>
                          </div>
                  </div>
             
                  <div id="name" class="game-card-name">${movie.title}</div>
                  <div class="game-card-tagline tagline">${
                    movie.release_date
                  }</div>
     
                `;

      cardCount.appendChild(movieEl);
    });
  };

  getMoviesPop(apiUrlPopup);

  function getMoviesPop(url) {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        getMoviesByPopup(data.results);
      });
  }

  const getMoviesByPopup = (data) => {
    let TRAILER = [];
    let GENRES = [];
    let WATCHES = [];
    cardPopup.innerHTML = '';
    data.forEach((movie) => {
      const voteCount = movie.vote_average.toFixed(1);
      const movieEl = document.createElement('a');

      movieEl.setAttribute('id', movie.id);
      movieEl.classList.add('game-card');
      movieEl.classList.add('scroll-block-item');
      movieEl.addEventListener('click', function () {
        imagePopup.innerHTML = '';
        const idUrl =
          baseUrl +
          '/tv/' +
          movie.id +
          '?' +
          apiKey +
          '&language=es&append_to_response=credits';
        const viewUrl =
          baseUrl + '/tv/' + movie.id + '/watch/' + 'providers' + '?' + apiKey;
        const trailerUrl = baseUrl + '/tv/' + movie.id + '/videos?' + apiKey;
        getIdUrl(idUrl, viewUrl, trailerUrl);
        async function getIdUrl(url, url2, url3) {
          await fetch(url)
            .then((res) => res.json())
            .then(async (data) => {
              results = data;
              console.log(results);
              const {
                name,
                backdrop_path,
                tagline,
                overview,
                genres,
                homepage,
                credits,
                seasons,
              } = results;
              // function toHoursAndMinutes(runtime) {
              //   const hours = Math.floor(runtime / 60);
              //   const minutes = runtime % 60;
              //   return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
              // }
              const movieEl = document.createElement('div');
              movieEl.classList.add('view');
              movieEl.classList.add('view-init');
              movieEl.innerHTML = `
              <div class="page">
                <div class="page-content">
                  <div class="marginCard">
                    <a class="popup-close" href="#">
                      <i class="iconX f7-icons">multiply</i>
                    </a>
                  </div>
                  <div class="card demo-card-header-pic">
                    <div style="background-image:url(${
                      imgUrl + backdrop_path
                    });min-height:300px" class="card-header align-items-flex-end">
                                   
                    </div>
                    
                    <div class="card-content card-content-padding">
                    <h1 class="noStyle">${name}${
                homepage && `<a class="external" href=${homepage}>(Ir)</a>`
              }</h1>
                      <p>${tagline}</p>
                      <p>${overview}</p>
                      <div class="containerGenre">
                         <h3 class="noStyle">Generos:</h3>
                         <div class="genreDiv" id="genreDiv"></div>
                      </div>
                      <h3 class="noStyle">Temporadas:</h3>
                      <div id="seasonsDiv"></div>
                      <h3 class="creditsH3">Reparto:</h3>
                      <div class="block game-cards scroll-block creditsDiv" id="creditsDiv"></div>
                      
                      <h3 class="noStyle">Donde ver:</h3>
                      <div class="divWatch" id="watchDiv"></div>
                      <h3 class="creditsH3">Trailers:</h3>
                      
                      <div class="trailersDiv" id="trailersDiv"></div>
                    </div>
                  </div>
                </div>
              </div>
              `;
              imagePopup.appendChild(movieEl);

              const genreDiv = document.getElementById('genreDiv');
              genres.map((generos) => {
                const genre = document.createElement('h3');
                genre.classList.add('textGenres');
                GENRES.push(generos.name);
                genre.innerHTML = `
                  ${GENRES[0]}
                  `;
                GENRES = [];
                genreDiv.appendChild(genre);
              });

              const seasonsDiv = document.getElementById('seasonsDiv');
              seasons.map((season) => {
                const seasonUrl =
                  baseUrl +
                  '/tv/' +
                  movie.id +
                  '/season/' +
                  season.season_number +
                  '?' +
                  apiKey +
                  '&language=es';
                fetch(seasonUrl)
                  .then((res) => res.json())
                  .then((data) => {
                    const { name, episodes, air_date } = data;
                    const seasonDiv = document.createElement('div');
                    seasonDiv.classList.add('popup-close');
                    seasonDiv.classList.add('cardSeason');
                    seasonDiv.innerHTML = `
   
                    <div class="card-header">
                    <h3>${name}</h3>
                    <p>${
                      episodes.length > 0
                        ? episodes.length + ' episodios'
                        : 'No se agregaron episodios'
                    }</p> <span> ${
                      air_date !== null ? air_date : 'No hay fecha registrada'
                    }</span>
                  
                    </div>
                    <div class="card-content card-content-padding">${
                      episodes.length > 0
                        ? episodes[0].overview !== ''
                          ? episodes[0].overview
                          : 'No hay descripcion'
                        : 'No hay descripcion'
                    }</div>

                `;

                    seasonDiv.addEventListener('click', () => {
                      mainView.router.navigate(`/seasons/${String(movie.id)}/`);
                    });
                    seasonsDiv.appendChild(seasonDiv);
                  });
              });

              if (credits.cast.length > 0) {
                const creditsDiv = document.getElementById('creditsDiv');
                credits.cast.map((credit) => {
                  const reparto = document.createElement('a');
                  reparto.setAttribute('id', credit.id);
                  reparto.classList.add('game-card');
                  reparto.classList.add('scroll-block-item');
                  reparto.classList.add('external');
                  reparto.setAttribute(
                    'href',
                    `https://www.themoviedb.org/person/${credit.id}`
                  );
                  reparto.innerHTML = `
                  <div class="game-card-image popup-open" data-popup=".popup-about">
                     <img src="${
                       credit.profile_path
                         ? imgUrl + credit.profile_path
                         : './img/user.png'
                     }"
                      alt="${credit.name}">
                        </div>
                    <div id="name" class="game-card-name">${credit.name}</div>
                    <div class="game-card-tagline">${credit.character}</div>
                    `;

                  creditsDiv.appendChild(reparto);
                });
              } else {
                const creditsDiv = document.getElementById('creditsDiv');
                const reparto = document.createElement('span');
                reparto.innerHTML = `No existe reparto`;
                creditsDiv.appendChild(reparto);
                creditsDiv.style.height = '25px';
                console.log('No existe reparto');
              }
            });
          await fetch(url2)
            .then((res) => res.json())
            .then((data) => {
              const { results } = data;
              const { AR } = results;
              const watchDiv = document.getElementById('watchDiv');
              AR.flatrate.map((watches) => {
                const watch = document.createElement('div');
                WATCHES.push(watches.logo_path);
                WATCHES.push(watches.provider_name);
                watch.innerHTML = `
                    <img class="iconWatch" src="${imgUrl + WATCHES[0]}" alt="${
                  WATCHES[1]
                }">
                    <h3>${WATCHES[1]}</h3>
              `;
                WATCHES = [];
                watchDiv.appendChild(watch);
              });
            });

          await fetch(url3)
            .then((res) => res.json())
            .then(async (data) => {
              const { results } = data;
              results.map((trailer) => {
                if (trailer.type === 'Trailer') {
                  if (trailer.type.length > 0) {
                    const trailersDiv = document.getElementById('trailersDiv');
                    const video = document.createElement('div');
                    video.classList.add('game-card');
                    video.classList.add('scroll-block-item');
                    video.classList.add('trailerDiv');

                    TRAILER.push(
                      `  <iframe src="https://www.youtube-nocookie.com/embed/${trailer.key}" title="${trailer.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                    );
                    video.innerHTML = `${TRAILER[0]}`;
                    TRAILER = [];
                    trailersDiv.appendChild(video);
                  }
                }
              });
            });
        }
      });
      movieEl.innerHTML = `
                  <div class="game-card-image popup-open" data-popup=".popup-about">
                      <img src="${imgUrl + movie.poster_path}"
                          alt="${movie.title}">
                          <div class="vote">
                          <h4>${voteCount}</h4>
                          </div>
                  </div>
                  <div id="name" class="game-card-name">${movie.name}</div>
                  <div class="game-card-tagline tagline">${
                    movie.first_air_date
                  }</div>
                `;

      cardPopup.appendChild(movieEl);
    });
  };

  prev.addEventListener('click', () => {
    if (page > 1) {
      page--;
      spanPag.innerHTML = page;
      if (selectedGenre.length >= 1) {
        getMoviesCount(
          apiUrlCount +
            '&with_genres=' +
            encodeURI(selectedGenre.join(',') + `&page=${page}`)
        );
      } else {
        getMoviesCount(
          baseUrl +
            '/discover/movie?' +
            apiKey +
            `&page=${page}&sort_by=vote_count.desc&`
        );
      }
    }
  });

  next.addEventListener('click', () => {
    if (page < 50) {
      page++;
      spanPag.innerHTML = page;
      if (selectedGenre.length >= 1) {
        getMoviesCount(
          apiUrlCount +
            '&with_genres=' +
            encodeURI(selectedGenre.join(',') + `&page=${page}`)
        );
      } else {
        getMoviesCount(
          baseUrl +
            '/discover/movie?' +
            apiKey +
            `&page=${page}&sort_by=vote_count.desc&`
        );
      }
    }
  });

  const imgProfiles = [
    {
      img: '1.png',
    },
    {
      img: '2.png',
    },
    {
      img: '3.png',
    },
    {
      img: '4.png',
    },
    {
      img: '5.png',
    },
    {
      img: '6.png',
    },
    {
      img: '7.png',
    },
    {
      img: '8.png',
    },
    {
      img: '9.png',
    },
    {
      img: '10.png',
    },
    {
      img: '11.png',
    },
    {
      img: '12.png',
    },
    {
      img: '13.png',
    },
    {
      img: '14.png',
    },
    {
      img: '15.png',
    },
    {
      img: '16.png',
    },
  ];

  const imgProfile = document.getElementById('imgProfile');
  const borderProfile = document.getElementById('borderProfile');
  function rand(n) {
    return Math.floor(Math.random() * n + 1);
  }
  if (data.nameUser === 'Invitado') {
    imgProfile.setAttribute(
      'src',
      `./img/imgProfiles/${imgProfiles[rand(16) - 1].img}`
    );
  } else {
    imgProfile.setAttribute('src', `./img/imgProfiles/${data.imgUser}.png`);
    imgProfile.classList.add('popup-open');
    imgProfile.setAttribute('data-popup', '.popup-selectImg');
  }
});

function signOut() {
  auth.signOut().then(() => {
    localStorage.removeItem('userData');
    mainView.router.navigate('/index/');
  });
}
function setImgProfile(id) {
  const imgProfile = document.getElementById('imgProfile');
  const userData = localStorage.getItem('userData');
  const data = JSON.parse(userData);
  data.imgUser = id;
  localStorage.setItem('userData', JSON.stringify(data));
  imgProfile.setAttribute('src', `./img/imgProfiles/${id}.png`);
}

$$(document).on('page:init', '.page[data-name="config"]', function (e) {
  // console.log('otra pagina');
});
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
  // console.log('otra pagina');
});
$$(document).on('page:init', '.page[data-name="season"]', function (e) {
  let cont = 0;
  const page = e.detail;
  var season = page.route.params.season;
  // alert('La jornada es ' + season);
  const idUrl =
    baseUrl +
    '/tv/' +
    season +
    '?' +
    apiKey +
    '&language=es&append_to_response=credits';
  fetch(idUrl)
    .then((res) => res.json())
    .then(async (data) => {
      results = data;
      const { seasons } = results;

      const seasonsDiv = document.getElementById('seasonsDiv');

      seasons.map((SEASON) => {
        console.log(SEASON);
        const seasonUrl =
          baseUrl +
          '/tv/' +
          season +
          '/season/' +
          SEASON.season_number +
          '?' +
          apiKey +
          '&language=es';
        fetch(seasonUrl)
          .then((res) => res.json())
          .then((data) => {
            cont++;
            const { name, episodes, air_date } = data;

            const seasonDiv = document.createElement('li');

            seasonDiv.classList.add('accordion-item');
            seasonDiv.innerHTML = `
            <a class="item-content item-link" href="#">
              <div class="item-inner">
                  <div class="item-title">
                     <h2>${name}</h2>
                     <p>${
                       air_date === null
                         ? 'No existe fecha registrada'
                         : air_date
                     }</p>
                     <p>${episodes.length} episodios</p>
                  </div>
              </div>
            </a>
            <div class="accordion-item-content">
              <div class="list accordion-list">
                  <ul id="episodesDiv${cont}">
                 
                  </ul>
              </div>
            </div>
            
        `;

            seasonsDiv.appendChild(seasonDiv);

            const episodesDiv = document.getElementById('episodesDiv' + cont);
            console.log(episodes);
            episodes.map((episode) => {
              const episodeDiv = document.createElement('li');
              episodeDiv.classList.add('accordion-item');
              episodeDiv.innerHTML = `
                  <a class="item-content item-link" href="#">
                    <div class="item-inner">
                      <div class="item-title">${episode.name}</div>
                    </div>
                  </a>
                  <div class="accordion-item-content">
                      <div class="block">
                      <h4>${episode.air_date}</h4>
                      <p>${
                        episode.overview === ''
                          ? 'No hay descripcion'
                          : episode.overview
                      }</p>
                      <img src="${imgUrl + episode.still_path}"/>
                      </div>
                  </div>
             `;
              episodesDiv.appendChild(episodeDiv);
            });
          });
      });
    });
});
