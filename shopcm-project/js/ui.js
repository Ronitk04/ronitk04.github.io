import { state } from './state.js';
import { homePageTemplate, profilePageTemplate, addProductPageTemplate, dashboardPageTemplate } from './templates.js';

const mainContent = document.getElementById('main-content');
const userActionsContainer = document.getElementById('user-actions');
const cartSlider = document.getElementById('cart-slider');
const cartPanel = document.getElementById('cart-panel');
const productModal = document.getElementById('product-modal');
const sidebar = document.getElementById('sidebar');

export function renderPage(page) {
    mainContent.innerHTML = '';
    switch (page) {
        case 'home':
            mainContent.innerHTML = homePageTemplate;
            renderProductSections();
            break;
        case 'profile':
            mainContent.innerHTML = profilePageTemplate(state);
            renderAddresses();
            break;
        case 'addProduct':
            mainContent.innerHTML = addProductPageTemplate(state);
            break;
        case 'dashboard':
            mainContent.innerHTML = dashboardPageTemplate;
            renderDashboardProducts();
            break;
    }
    window.scrollTo(0, 0);
};

function renderDashboardProducts() {
    const productListContainer = document.getElementById('dashboard-product-list');
    if (!productListContainer) return;

    productListContainer.innerHTML = ''; // Clear existing list

    if (state.products.length === 0) {
        productListContainer.innerHTML = '<p class="text-center text-gray-500 py-8">You have not added any products yet.</p>';
        return;
    }

    state.products.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors';
        productEl.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${product.image}" alt="${product.name}" class="w-16 h-16 rounded-md object-cover" onerror="this.onerror=null;this.src='https://placehold.co/100x100/cccccc/ffffff?text=No+Img';">
                <div>
                    <p class="font-semibold">${product.name}</p>
                    <p class="text-sm text-gray-600">₹${product.price.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button data-action="edit-product" data-id="${product.id}" class="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-full hover:bg-blue-200 transition">Edit</button>
                <button data-action="delete-product" data-id="${product.id}" class="bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-full hover:bg-red-200 transition">Delete</button>
            </div>
        `;
        productListContainer.appendChild(productEl);
    });
}

export function renderProductSections() {
    const sectionsContainer = document.getElementById('product-sections');
    if (!sectionsContainer) return;
    sectionsContainer.innerHTML = '';

    const pageTitle = document.getElementById('page-title');
    if(pageTitle) pageTitle.textContent = state.activeFilters.category === 'All' ? 'All Products' : state.activeFilters.category;

    let filteredProducts = state.products
        .filter(p => p.name.toLowerCase().includes(state.activeFilters.search.toLowerCase()));

    if (state.activeFilters.category !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category === state.activeFilters.category);
    }

    switch (state.activeFilters.sort) {
        case 'price-asc': filteredProducts.sort((a, b) => a.price - b.price); break;
        case 'price-desc': filteredProducts.sort((a, b) => b.price - a.price); break;
    }

    const productsByCategory = filteredProducts.reduce((acc, product) => {
        (acc[product.category] = acc[product.category] || []).push(product);
        return acc;
    }, {});

    if (Object.keys(productsByCategory).length === 0) {
         sectionsContainer.innerHTML = `<div class="col-span-full text-center py-10">
            <i class="fas fa-search-minus fa-3x text-gray-400 mb-4"></i>
            <h3 class="text-xl font-semibold">No Products Found</h3>
            <p class="text-gray-500">Try adjusting your search or filters.</p>
        </div>`;
        return;
    }

    for (const category in productsByCategory) {
        const section = document.createElement('section');
        section.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">${category}</h2>
            <div class="flex gap-6 overflow-x-auto pb-4 horizontal-scroll">
                ${productsByCategory[category].map(product => createProductCard(product)).join('')}
            </div>
        `;
        sectionsContainer.appendChild(section);
    }
};

function createProductCard(product) {
    const isWished = state.wishlist.includes(product.id);
    return `
        <div class="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover cursor-pointer" data-action="open-modal" data-id="${product.id}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found';">
                <div class="absolute top-3 right-3">
                    <button data-action="wishlist" data-id="${product.id}" class="bg-white/70 backdrop-blur-sm rounded-full h-10 w-10 flex items-center justify-center text-gray-700 hover:text-red-500 transition ${isWished ? 'text-red-500' : ''}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
                    <button data-action="add-to-cart" data-id="${product.id}" class="product-card-hover-icon bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-base font-semibold text-gray-900 truncate">${product.name}</h3>
                <p class="text-lg font-bold text-gray-900 mt-1">₹${product.price.toLocaleString('en-IN')}</p>
            </div>
        </div>
    `;
};

export function renderUserActions() {
    userActionsContainer.innerHTML = '';
    if (state.isLoggedIn) {
        userActionsContainer.innerHTML = `
            ${state.isSeller ? `
            <button id="dashboard-btn" class="hidden sm:block bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-full hover:bg-purple-200 transition">Dashboard</button>
            <button id="add-product-btn" class="hidden sm:block bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-full hover:bg-green-200 transition">Add Product</button>
            ` : ''}
            <button id="profile-btn" class="relative text-gray-600 hover:text-indigo-600 transition"><i class="fas fa-user fa-lg"></i></button>
            <button id="wishlist-btn" class="relative text-gray-600 hover:text-indigo-600 transition">
                <i class="fas fa-heart fa-lg"></i>
                <span id="wishlist-count" class="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
            </button>
            <button id="cart-btn" class="relative text-gray-600 hover:text-indigo-600 transition">
                <i class="fas fa-shopping-cart fa-lg"></i>
                <span id="cart-count" class="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
            </button>
        `;
    } else {
        userActionsContainer.innerHTML = `<button id="login-btn" class="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-indigo-700 transition">Login</button>`;
    }
    updateCounters();
};

export function renderCart() {
    const subtotal = state.cart.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    cartPanel.innerHTML = `
        <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold">Your Cart</h2>
            <button data-action="close-cart" class="text-gray-500 hover:text-gray-800"><i class="fas fa-times fa-lg"></i></button>
        </div>
        ${state.cart.length === 0 ? `
        <div class="flex-grow flex flex-col items-center justify-center text-center p-6">
            <i class="fas fa-shopping-cart fa-4x text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold">Your cart is empty</h3>
        </div>` : `
        <div class="flex-grow overflow-y-auto p-6 space-y-4">
            ${state.cart.map(item => {
                const product = state.products.find(p => p.id === item.id);
                if (!product) return ''; // Handle case where product might be deleted
                return `
                <div class="flex items-center space-x-4">
                    <img src="${product.image}" class="w-20 h-20 rounded-lg object-cover">
                    <div class="flex-grow">
                        <p class="font-semibold">${product.name}</p>
                        <p class="text-sm text-gray-500">₹${product.price.toLocaleString('en-IN')}</p>
                        <div class="flex items-center mt-2">
                            <button data-action="update-quantity" data-id="${item.id}" data-change="-1" class="border rounded-l px-2 py-1 text-sm">-</button>
                            <span class="border-t border-b px-3 py-1 text-sm">${item.quantity}</span>
                            <button data-action="update-quantity" data-id="${item.id}" data-change="1" class="border rounded-r px-2 py-1 text-sm">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold">₹${(product.price * item.quantity).toLocaleString('en-IN')}</p>
                        <button data-action="remove-from-cart" data-id="${item.id}" class="text-red-500 text-sm hover:underline mt-1">Remove</button>
                    </div>
                </div>`;
            }).join('')}
        </div>
        <div class="p-6 border-t bg-gray-50">
            <div class="flex justify-between items-center mb-4"><span class="text-lg">Subtotal</span><span class="text-xl font-bold">₹${subtotal.toLocaleString('en-IN')}</span></div>
            <button class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">Proceed to Checkout</button>
        </div>`}
    `;
    updateCounters();
};

export function renderProductModal(product) {
    const isWished = state.wishlist.includes(product.id);
    productModal.querySelector('#product-modal-content').innerHTML = `
        <div class="p-2"><button data-action="close-modal" class="float-right text-gray-500 hover:text-gray-800"><i class="fas fa-times fa-lg"></i></button></div>
        <div class="flex-grow overflow-y-auto p-6 pt-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <img src="${product.image}" class="w-full rounded-lg shadow-lg">
                <div>
                    <h2 class="text-3xl font-bold mb-2">${product.name}</h2>
                    <p class="text-md text-gray-500 mb-4">${product.category}</p>
                    <span class="text-4xl font-bold text-indigo-600">₹${product.price.toLocaleString('en-IN')}</span>
                    <div class="flex items-center gap-4 mt-6">
                        <button data-action="add-to-cart" data-id="${product.id}" class="flex-grow bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                        <button data-action="wishlist" data-id="${product.id}" class="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-gray-700 hover:text-red-500 transition ${isWished ? 'text-red-500' : ''}"><i class="fas fa-heart fa-lg"></i></button>
                    </div>
                </div>
            </div>
            <div class="mt-8 border-t pt-6">
                <div id="modal-tabs" class="flex border-b mb-4">
                    <button data-tab="description" class="px-4 py-2 font-semibold border-b-2 border-indigo-500 text-indigo-600">Description</button>
                    <button data-tab="specs" class="px-4 py-2 font-semibold text-gray-500">Specifications</button>
                    <button data-tab="reviews" class="px-4 py-2 font-semibold text-gray-500">Reviews (${product.reviews.length})</button>
                </div>
                <div id="modal-tab-content">
                    <!-- Tab content injected here -->
                </div>
            </div>
        </div>`;
    renderModalTab('description', product);
    productModal.classList.remove('hidden');
    productModal.classList.add('flex', 'fade-in');
};

export function renderModalTab(tabName, product) {
    const contentContainer = document.getElementById('modal-tab-content');
    const tabs = document.querySelectorAll('#modal-tabs button');
    tabs.forEach(t => {
        t.classList.remove('border-indigo-500', 'text-indigo-600');
        t.classList.add('text-gray-500');
    });
    document.querySelector(`#modal-tabs button[data-tab="${tabName}"]`).classList.add('border-indigo-500', 'text-indigo-600');

    let content = '';
    if (tabName === 'description') {
        content = `<p class="text-gray-700 leading-relaxed">${product.description}</p>`;
    } else if (tabName === 'specs') {
        content = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            ${Object.entries(product.specs).map(([key, value]) => `
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="font-semibold text-gray-600">${key}</p>
                    <p class="text-gray-800">${value}</p>
                </div>
            `).join('') || '<p>No specifications available.</p>'}
        </div>`;
    } else if (tabName === 'reviews') {
        let reviewSummaryButton = '';
        if (product.reviews.length > 1) {
            reviewSummaryButton = `<div class="flex justify-end mb-4">
                <button id="summarize-reviews-btn" data-productid="${product.id}" class="bg-indigo-100 text-indigo-600 text-sm font-bold py-2 px-3 rounded-full hover:bg-indigo-200 flex items-center gap-2">
                    ✨ Summarize Reviews
                </button>
            </div>`;
        }

        content = `<div class="space-y-6">
            ${reviewSummaryButton}
            <div id="review-summary-container" class="hidden"></div>
            <div>
                ${product.reviews.map(r => `
                    <div class="border-b pb-4 mb-4">
                        <div class="flex items-center mb-1">
                            ${Array(5).fill(0).map((_, i) => `<i class="fas fa-star ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`).join('')}
                        </div>
                        <p class="font-semibold">${r.user}</p>
                        <p class="text-gray-600">${r.comment}</p>
                    </div>
                `).join('') || '<p>No reviews yet. Be the first!</p>'}
            </div>
            ${state.isLoggedIn ? `
            <form id="review-form" data-productid="${product.id}" class="space-y-3 pt-4">
                <h4 class="font-semibold">Write a Review</h4>
                <div class="flex items-center" id="review-stars">
                    ${Array(5).fill(0).map((_, i) => `<i class="fas fa-star text-gray-300 text-2xl cursor-pointer" data-rating="${i+1}"></i>`).join('')}
                </div>
                <input type="hidden" name="rating" value="0"/>
                <textarea name="comment" required placeholder="Your review..." class="w-full p-2 border rounded-lg"></textarea>
                <button type="submit" class="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg">Submit Review</button>
            </form>` : '<p>You must be logged in to write a review.</p>'}
        </div>`;
    }
    contentContainer.innerHTML = content;
};

export function renderAddresses() {
    const list = document.getElementById('address-list');
    if (!list) return;
    list.innerHTML = state.addresses.length === 0 ? '<p>No saved addresses.</p>' :
        state.addresses.map((addr, index) => `
            <div class="border p-4 rounded-lg flex justify-between items-start">
                <div>
                    <p class="font-semibold">${addr.name}</p>
                    <p>${addr.address}, ${addr.pincode}</p>
                    <p>Mobile: ${addr.mobile}</p>
                </div>
                <button data-action="remove-address" data-index="${index}" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
};

export function renderSidebar() {
    const categories = ['All', ...new Set(state.products.map(p => p.category))];
    sidebar.innerHTML = `
        <div class="p-6 flex justify-between items-center border-b">
            <h2 class="text-xl font-bold">Categories</h2>
            <button data-action="close-sidebar" class="text-gray-500 hover:text-gray-800"><i class="fas fa-times fa-lg"></i></button>
        </div>
        <nav class="p-4 space-y-2">
            ${categories.map(cat => `
                <a href="#" data-action="filter-category" data-category="${cat}" class="flex items-center px-4 py-2 rounded-lg font-semibold transition ${state.activeFilters.category === cat ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}">
                    ${cat}
                </a>
            `).join('')}
        </nav>
    `;
};

function updateCounters() {
    if (state.isLoggedIn) {
        const cartCount = document.getElementById('cart-count');
        const wishlistCount = document.getElementById('wishlist-count');
        if (cartCount) cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (wishlistCount) wishlistCount.textContent = state.wishlist.length;
    }
};

export function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'bg-gray-800 text-white py-3 px-5 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-y-4 opacity-0';
    toast.innerHTML = `<i class="fas fa-check-circle text-green-400"></i> <p>${message}</p>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
};
