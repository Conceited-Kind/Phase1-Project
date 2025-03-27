document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sections = {
      home: document.getElementById('home-section'),
      preferences: document.getElementById('preferences-section'),
      recommendations: document.getElementById('recommendations-section'),
      watchlist: document.getElementById('watchlist-section'),
      community: document.getElementById('community-section')
    };
  
    const navButtons = {
      home: document.getElementById('home-btn'),
      recommendations: document.getElementById('recommendations-btn'),
      watchlist: document.getElementById('watchlist-btn'),
      community: document.getElementById('community-btn')
    };
  
    let currentUser = {
      preferences: {
        genres: []
      },
      watchlist: []
    };
  
    document.getElementById('get-started-btn').addEventListener('click', () => {
      showSection('preferences');
    });
  
    document.getElementById('preferences-form').addEventListener('submit', handlePreferencesSubmit);
  
    Object.keys(navButtons).forEach(section => {
      navButtons[section].addEventListener('click', () => showSection(section));
    });
  
    showSection('home');
    fetchAnimeData();

    function showSection(sectionName) {
      Object.values(sections).forEach(section => {
        section.classList.add('hidden');
      });
      sections[sectionName].classList.remove('hidden');
    }
  
    async function fetchAnimeData() {
      try {
        const response = await fetch('http://localhost:3000/animes');
        const data = await response.json();
        displayAnimes(data);
      } catch (error) {
        console.error('Error fetching anime data:', error);
      }
    }
  
    function displayAnimes(animes) {
      const container = document.getElementById('anime-container');
      container.innerHTML = animes.map(anime => `
        <div class="anime-card" data-id="${anime.id}">
          <img src="${anime.image}" alt="${anime.title}">
          <div class="anime-card-content">
            <h3>${anime.title}</h3>
            <p>${anime.genre.join(', ')}</p>
            <p>Rating: ${anime.rating}/10</p>
            <p>Year: ${anime.year}</p>
            <p>Episodes: ${anime.episodes}</p>
            <p>Status: ${anime.status}</p>
            <div class ="streaming-platforms">
              <span>Available on:</span>
              ${anime.streaming.map((platform, index) => {
                const platformLinks = {
                  'Crunchyroll': 'https://www.crunchyroll.com',
                  'Funimation': 'https://www.funimation.com',
                  'Hulu': 'https://www.hulu.com',
                  'HBO Max': 'https://www.hbomax.com',
                  'Netflix': 'https://www.netflix.com'
                };
               `<a href="${platformLinks[platform]}" target=" _blank" class="streaming-link ${platform.toLowerCase().replace(' ', '-')}"${platform}</a>`;               
                }).join('')}
              </div>
            <p class ="synopsis">${anime.synopsis}</p>
            <button class="add-watchlist">Add to Watchlist</button>
          </div>
        </div>
      `).join('');
      document.querySelectorAll('.add-watchlist').forEach(button => {
        button.addEventListener('click', (e) => {
          const animeId = parseInt(e.target.closest('.anime-card').dataset.id);
          addToWatchlist(animeId);
        });
      });
    }
  
    function handlePreferencesSubmit(e) {
      e.preventDefault();
      const genreSelect = document.getElementById('favorite-genres');
      const selectedGenres = Array.from(genreSelect.selectedOptions).map(option => option.value);
      
      currentUser.preferences.genres = selectedGenres;
      showSection('recommendations');
      getRecommendations();
    }
  
    function getRecommendations() {
      fetch('http://localhost:3000/animes')
        .then(response => response.json())
        .then(animes => {
          const recommended = animes.filter(anime => 
            anime.genre.some(genre => currentUser.preferences.genres.includes(genre))
          );
          displayAnimes(recommended);
        });
    }
  
    function addToWatchlist(animeId) {
      fetch(`http://localhost:3000/animes/${animeId}`)
        .then(response => response.json())
        .then(anime => {
          console.log("Adding anime:", anime); 
          currentUser.watchlist.push(anime);
          console.log("Current watchlist:", currentUser.watchlist); 
          updateWatchlistDisplay();
        });
    }
    
    function updateWatchlistDisplay() {
      const container = document.getElementById('watchlist-container');
      console.log("Watchlist container:", container); 
      console.log("Rendering watchlist:", currentUser.watchlist); 

      if(!container) {
        console.log("Container does not exist");
        return;
      }

      document.getElementById('watchlist-btn').addEventListener('click', () => {
        showSection('watchlist');
        updateWatchlistDisplay();
      });

      container.innerHTML = currentUser.watchlist.map(anime => `
        <div class="anime-card" data-id="${anime.id}">
          <img src="${anime.image}" alt="${anime.title}">
          <div class="anime-card-content">
            <h3>${anime.title}</h3>
            <p>${anime.genre.join(', ')}</p>
            <p>Rating: ${anime.rating}/10</p>
            <p>Year: ${anime.year}</p>
            <P>Episodes: ${anime.episodes}</p>
            <p>Status: ${anime.status}</p>
            <div class ="streaming-platforms">
              <span>Available on:</span>
             ${anime.streaming.map((platform, index) => {
            const platformLinks = {
              'Crunchyroll': 'https://www.crunchyroll.com',
              'Funimation': 'https://www.funimation.com',
              'Hulu': 'https://www.hulu.com',
              'HBO Max': 'https://www.hbomax.com',
              'Netflix': 'https://www.netflix.com'
            };
            return `<a href="${platformLinks[platform]}" target="_blank" class="streaming-link ${platform.toLowerCase().replace(' ', '-')}">${platform}</a>`;
          }).join(' ')}
        </div>
            <p class ="synopsis">${anime.synopsis}</p>
            <button class="remove-watchlist">Remove</button>
            </div>
           </div>
        `).join('');

      document.getElementByID('watchlist-btn').addEventListener('click', () => {
        showSection('watchlist');
        updateWatchlistDisplay();
      });
      document.querySelectorAll('.remove-watchlist').forEach(button => {
        button.addEventListener('click', (e) => {
          const animeId = parseInt(e.target.closest('.anime-card').dataset.id);
          removeFromWatchlist(animeId);
        });
      });
    }
  
    function removeFromWatchlist(animeId) {
      console.log('Removing anime ID:', animeId);
      console.log('Before removal:', currentUser.watchlist);
      currentUser.watchlist = currentUser.watchlist.filter(anime => anime.id !== animeId);

         console.log('After removal:', currentUser.watchlist);
      localStorage.setItem('watchlist', JSON.stringify(currentUser.watchlist)); 
      updateWatchlistDisplay();
    }
});
