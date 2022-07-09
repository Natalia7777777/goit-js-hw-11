import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const API_URL = 'https://pixabay.com/api';
const API_KEY = '28423849-c8b594ea004961bd1459fecfa';

export default class CardsApiService {
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