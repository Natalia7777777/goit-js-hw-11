import './sass/index.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
// import CardsApiService from './js/api';
import axios from "axios";

const API_URL = 'https://pixabay.com/api';
const API_KEY = '28423849-c8b594ea004961bd1459fecfa';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchForm.addEventListener("submit", onSearch);
loadMoreBtn.addEventListener("click", onLoadMore);
gallery.addEventListener("click", onGalleryClick);

loadMoreBtn.style.display = "none";

class CardsApiService {
  constructor() {
    this.searchQuery = "";
    this.page = 1;
    this.per_page = 40;
  }

  async fetchCards() {
    const searchParams = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: this.page,
      per_page: this.per_page,
    });
    
    const url = `${API_URL}/?${searchParams}`;
    
    try {
      const response = await axios.get(url);
      const result = await response.data;
      const card = await result.hits;

      this.incrementPage();

      if (result.totalHits != 0 && this.page === 2) {
          Notify.success(`Hooray! We found ${result.totalHits} images.`);
      }
      
      const lastPage = Math.round(result.totalHits / this.per_page);
      console.log(lastPage);
      console.log(this.page);

      if (lastPage < this.page) {
        loadMoreBtn.style.display = "none";
        Notify.info(`We're sorry, but you've reached the end of search results.`);
      }

      return card;
    }
    catch (error) {
      console.log(error);
    }
  }

  incrementPage() {
      this.page += 1;
  }

  resetPage() {
      this.page = 1;
  }
}

const cardsApiService = new CardsApiService();

function onSearch(e) {
  e.preventDefault();

  cardsApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
  
  if (cardsApiService.searchQuery === '') {
    clearCards();
    return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }

  cardsApiService.resetPage();
  cardsApiService.fetchCards()
    .then(hits => {
      clearCards();
      renderCardList(hits);

      if (hits.length === 0) {
        loadMoreBtn.style.display = "none";
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        return;
      }
      loadMoreBtn.style.display = "block";
      searchForm.reset();
    });
}

function onLoadMore() {
  cardsApiService.fetchCards()
    .then(hits => {
      renderCardList(hits);
      skrollGallery();
    });
}

function renderCardList(hits) {
  const markupList = hits
  .map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => {
    return `
      <div class="photo-card">
        <a class="gallery__item" href="${largeImageURL}">
              <img
              class="gallery__image"
              src="${webformatURL}"
              alt="${tags}"
              loading="lazy"
              />
          </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>${downloads}
          </p>
        </div>
      </div>`;
  })
      .join('');
  gallery.insertAdjacentHTML('beforeend', markupList);
}

function onGalleryClick(e) {
  e.preventDefault();

  const galleryModal = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: '250ms',
  });
  galleryModal.refresh();
  galleryModal.close();
}

function clearCards() {
  gallery.innerHTML = '';
}

function skrollGallery() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3,
    behavior: "smooth",
  });
}
