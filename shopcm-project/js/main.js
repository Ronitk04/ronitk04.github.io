import { state, saveState } from './state.js';
import { callGemini, searchUnsplashImages } from './api.js';
import * as templates from './templates.js';
import {
    renderPage,
    renderUserActions,
    renderCart,
    renderProductModal,
    renderModalTab,
    renderSidebar,
    showToast,
    renderAddresses
} from './ui.js';

// --- DOM ELEMENTS ---
const productModal = document.getElementById('product-modal');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const cartSlider = document.getElementById('cart-slider');
const cartPanel = document.getElementById('cart-panel');

// --- EVENT HANDLERS ---
document.body.addEventListener('click', async e => {
    const target = e.target.closest('button, img, a, input[type="checkbox"]');
    if (!target) return;

    const action = target.dataset.action || target.id;

    // AI Actions
    if (action === 'generate-description-btn') {
        const form = document.getElementById('add-product-form');
        const productName = form.querySelector('[name="name"]').value;
        const keywords = form.querySelector('[name="description"]').value;
        if (!productName || !keywords) {
            showToast("Please enter a product name and some keywords first.");
            return;
        }
        const prompt = `Generate a compelling e-commerce product description for a product named "${productName}". The description should be around 2-3 sentences long and highlight these features: ${keywords}. Make it sound appealing to customers in India.`;
        const generatedDescription = await callGemini(prompt, target);
        form.querySelector('[name="description"]').value = generatedDescription;
    }
    if (action === 'summarize-reviews-btn') {
        const productId = parseInt(target.dataset.productid);
        const product = state.products.find(p => p.id === productId);
        const reviewTexts = product.reviews.map(r => r.comment).join("\n - ");
        const prompt = `Summarize the following customer reviews for the product "${product.name}". Provide a brief overview, then list the main pros and cons in bullet points.\n\nReviews:\n - ${reviewTexts}`;
        const summary = await callGemini(prompt, target);
        const summaryContainer = document.getElementById('review-summary-container');
        summaryContainer.innerHTML = `<div class="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400"><h4 class="font-bold mb-2">AI Review Summary</h4><p class="text-sm whitespace-pre-wrap">${summary}</p></div>`;
        summaryContainer.classList.remove('hidden');
    }
    if (action === 'search-images') {
        const form = target.closest('form');
        const query = form.querySelector('input[name="image-search"]').value;
        if (!query) {
            showToast("Please enter a search term for images.");
            return;
        }
        const resultsContainer = form.querySelector('[id^="image-search-results-"]');
        resultsContainer.innerHTML = '<div class="col-span-full text-center p-4">Searching...</div>';

        const images = await searchUnsplashImages(query);

        resultsContainer.innerHTML = '';
        if (images.length === 0) {
            resultsContainer.innerHTML = '<div class="col-span-full text-center p-4">No images found.</div>';
            return;
        }
        images.forEach(img => {
            const imgEl = document.createElement('img');
            imgEl.src = img.urls.small;
            imgEl.className = 'w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-indigo-500';
            imgEl.dataset.action = 'select-image';
            imgEl.dataset.imageUrl = img.urls.small; // Or a larger version like img.urls.regular
            resultsContainer.appendChild(imgEl);
        });
    }
    if (action === 'select-image') {
        const form = target.closest('form');
        form.querySelector('input[name="image"]').value = target.dataset.imageUrl;
    }

    // User Actions
    if (action === 'login-btn') {
        state.isLoggedIn = true;
        renderUserActions();
        showToast('Login successful!');
    }
    if (action === 'logout-btn') {
        state.isLoggedIn = false;
        state.isSeller = false;
        renderUserActions();
        renderPage('home');
    }
    if (action === 'profile-btn') renderPage('profile');
    if (action === 'add-product-btn' || action === 'add-new-product-from-dashboard-btn') renderPage('addProduct');
    if (action === 'dashboard-btn') renderPage('dashboard');
    if (action === 'home-logo') {
        state.activeFilters.category = 'All';
        renderPage('home');
        renderSidebar();
    }
    if (action === 'seller-toggle') {
        state.isSeller = target.checked;
        renderUserActions();
    }

    // Sidebar Actions
    if (action === 'menu-btn') {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    }
    if (action === 'close-sidebar' || e.target.id === 'sidebar-overlay') {
         sidebar.classList.add('-translate-x-full');
         sidebarOverlay.classList.add('hidden');
    }
    if (action === 'filter-category') {
        e.preventDefault();
        state.activeFilters.category = target.dataset.category;
        renderPage('home');
        renderSidebar();
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    }

    // Cart & Wishlist
    if (action === 'cart-btn') {
        cartSlider.classList.remove('hidden');
        cartPanel.classList.add('slide-in');
        cartPanel.classList.remove('slide-out');
    }
    if (action === 'close-cart' || e.target.id === 'cart-slider') {
        cartPanel.classList.add('slide-out');
        cartPanel.addEventListener('animationend', () => cartSlider.classList.add('hidden'), { once: true });
    }
    if (action === 'wishlist-btn') {
        showToast(`You have ${state.wishlist.length} items in your wishlist.`);
    }

    // Product Actions
    const productTarget = e.target.closest('[data-id]');
    if (productTarget) {
        const id = parseInt(productTarget.dataset.id);
        const product = state.products.find(p => p.id === id);

        if (action === 'add-to-cart') {
            const itemInCart = state.cart.find(item => item.id === id);
            if (itemInCart) itemInCart.quantity++;
            else state.cart.push({ id, quantity: 1 });
            showToast(`${product.name} added to cart`);
            renderCart();
        }
        if (action === 'wishlist') {
            if (state.wishlist.includes(id)) {
                state.wishlist = state.wishlist.filter(wishId => wishId !== id);
            } else {
                state.wishlist.push(id);
            }
            if (document.body.contains(productModal) && !productModal.classList.contains('hidden')) {
                 renderProductModal(product);
            }
            renderPage('home');
        }
        if (action === 'open-modal') renderProductModal(product);
        if (action === 'update-quantity') {
            const change = parseInt(productTarget.dataset.change);
            const item = state.cart.find(i => i.id === id);
            if (item) {
                item.quantity += change;
                if (item.quantity === 0) state.cart = state.cart.filter(i => i.id !== id);
            }
            renderCart();
        }
        if (action === 'remove-from-cart') {
            state.cart = state.cart.filter(i => i.id !== id);
            renderCart();
        }
        if (action === 'delete-product') {
            if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                state.products = state.products.filter(p => p.id !== id);
                renderPage('dashboard');
                showToast('Product deleted successfully');
            }
        }
        if (action === 'edit-product') {
            const editModalContent = document.getElementById('edit-product-modal-content');
            const editModal = document.getElementById('edit-product-modal');
            editModalContent.innerHTML = templates.editProductFormTemplate(product, state);
            editModal.classList.remove('hidden');
            editModal.classList.add('flex');
        }
    }

    // Modal Actions
    if (action === 'close-modal' || action === 'close-edit-modal') {
        const modalToClose = action === 'close-modal' ? productModal : document.getElementById('edit-product-modal');
        modalToClose.classList.add('fade-out');
        modalToClose.addEventListener('animationend', () => {
            modalToClose.classList.add('hidden');
            modalToClose.classList.remove('fade-out');
        }, { once: true });
    }
    const tabTarget = e.target.closest('[data-tab]');
    if (tabTarget) {
        const product = state.products.find(p => p.id === parseInt(document.querySelector('#review-form')?.dataset.productid || productModal.querySelector('[data-action="add-to-cart"]').dataset.id));
        renderModalTab(tabTarget.dataset.tab, product);
    }
    const starTarget = e.target.closest('#review-stars i');
    if (starTarget) {
        const rating = starTarget.dataset.rating;
        document.querySelector('#review-form input[name="rating"]').value = rating;
        document.querySelectorAll('#review-stars i').forEach((star, i) => {
            star.className = `fas fa-star text-2xl cursor-pointer ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`;
        });
    }

    // Address Actions
    if (action === 'remove-address') {
        state.addresses.splice(parseInt(e.target.closest('button').dataset.index), 1);
        renderAddresses();
    }

    saveState();
});

// Form Submissions
document.body.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'address-form') {
        const formData = new FormData(e.target);
        const newAddress = Object.fromEntries(formData.entries());
        state.addresses.push(newAddress);
        renderAddresses();
        e.target.reset();
    }
    if (e.target.id === 'edit-product-form') {
        const formData = new FormData(e.target);
        const editingId = parseInt(e.target.dataset.editingId);
        const product = state.products.find(p => p.id === editingId);

        if (product) {
            product.name = formData.get('name');
            product.price = parseFloat(formData.get('price'));
            product.image = formData.get('image');
            product.category = formData.get('category') === 'Other' ? formData.get('newCategory') : formData.get('category');
            product.description = formData.get('description');
            product.specs = JSON.parse(formData.get('specs') || '{}');
        }

        document.getElementById('edit-product-modal').classList.add('hidden');
        renderPage('dashboard');
        showToast('Product updated successfully!');
    }
    if (e.target.id === 'add-product-form') {
        const formData = new FormData(e.target);
        const newProduct = {
            id: Date.now(),
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            image: formData.get('image'),
            category: formData.get('category') === 'Other' ? formData.get('newCategory') : formData.get('category'),
            description: formData.get('description'),
            specs: JSON.parse(formData.get('specs') || '{}'),
            reviews: []
        };
        state.products.unshift(newProduct);
        showToast('Product added successfully!');
        renderPage('home');
    }
    if (e.target.id === 'review-form') {
        const formData = new FormData(e.target);
        const newReview = {
            user: "Current User", // Simulated
            rating: parseInt(formData.get('rating')),
            comment: formData.get('comment')
        };
        const productId = parseInt(e.target.dataset.productid);
        const product = state.products.find(p => p.id === productId);
        product.reviews.push(newReview);
        renderModalTab('reviews', product);
    }
    saveState();
});

// Other Listeners
document.body.addEventListener('change', e => {
    if (e.target.name === 'category' && e.target.value === 'Other') {
        document.querySelector('input[name="newCategory"]').classList.remove('hidden');
    } else if (e.target.name === 'category') {
        document.querySelector('input[name="newCategory"]').classList.add('hidden');
    }
    if (e.target.id === 'sort-select') {
        state.activeFilters.sort = e.target.value;
        renderPage('home');
    }
});
document.getElementById('search-input').addEventListener('input', e => {
    state.activeFilters.search = e.target.value;
    renderPage('home');
});

// --- INITIALIZATION ---
function init() {
    state.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    state.isSeller = localStorage.getItem('isSeller') === 'true';
    renderUserActions();
    renderPage('home');
    renderCart();
    renderSidebar();
};

document.addEventListener('DOMContentLoaded', init);
