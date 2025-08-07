import { products as initialProducts } from './data.js';

export let state = {
    isLoggedIn: false,
    isSeller: false,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
    addresses: JSON.parse(localStorage.getItem('addresses')) || [],
    activeFilters: { search: '', category: 'All', sort: 'default' },
    products: JSON.parse(localStorage.getItem('products')) || initialProducts
};

export function saveState() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('addresses', JSON.stringify(state.addresses));
    localStorage.setItem('products', JSON.stringify(state.products));
    localStorage.setItem('isLoggedIn', state.isLoggedIn);
    localStorage.setItem('isSeller', state.isSeller);
}
