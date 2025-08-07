export const homePageTemplate = `
    <div class="flex items-center justify-between mb-8">
        <h1 id="page-title" class="text-3xl font-bold">All Products</h1>
        <div>
            <select id="sort-select" class="bg-white border-gray-300 text-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                <option value="default">Sort by: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
            </select>
        </div>
    </div>
    <div id="product-sections" class="space-y-12"></div>
`;

export const profilePageTemplate = (state) => `
    <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h1 class="text-3xl font-bold mb-6">My Profile</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
                <h2 class="text-xl font-semibold mb-4">Saved Addresses</h2>
                <div id="address-list" class="space-y-4 mb-6"></div>
                <h3 class="text-lg font-semibold mb-2">Add New Address</h3>
                <form id="address-form" class="space-y-3 p-4 border rounded-lg bg-gray-50">
                    <input name="name" required placeholder="Full Name" class="w-full p-2 border rounded"/>
                    <input name="mobile" required placeholder="Mobile Number" class="w-full p-2 border rounded"/>
                    <input name="pincode" required placeholder="Pincode" class="w-full p-2 border rounded"/>
                    <textarea name="address" required placeholder="Full Address (Area, Street...)" class="w-full p-2 border rounded"></textarea>
                    <button type="submit" class="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">Save Address</button>
                </form>
            </div>
            <div>
                <h2 class="text-xl font-semibold mb-4">Account Settings</h2>
                <div class="space-y-3">
                   <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" id="seller-toggle" class="h-5 w-5 rounded" ${state.isSeller ? 'checked' : ''}>
                        <span class="font-medium">I am a Seller</span>
                   </label>
                   <button id="logout-btn" class="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">Logout</button>
                </div>
            </div>
        </div>
    </div>
`;

export const editProductFormTemplate = (product, state) => `
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Edit Product</h1>
            <button data-action="close-edit-modal" class="text-gray-500 hover:text-gray-800"><i class="fas fa-times fa-lg"></i></button>
        </div>
        <form id="edit-product-form" data-editing-id="${product.id}" class="space-y-4">
            <input name="name" required placeholder="Product Name" class="w-full p-3 border rounded-lg" value="${product.name}"/>
            <input name="price" required type="number" placeholder="Price (INR)" class="w-full p-3 border rounded-lg" value="${product.price}"/>
            <input name="image" required placeholder="Image URL" class="w-full p-3 border rounded-lg" value="${product.image}"/>
            <div class="p-2 bg-gray-50 rounded-lg">
                <div class="flex gap-2">
                    <input type="text" name="image-search" placeholder="Search for an image..." class="w-full p-2 border rounded-lg">
                    <button type="button" data-action="search-images" class="bg-indigo-500 text-white font-semibold px-4 rounded-lg hover:bg-indigo-600">Search</button>
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2" id="image-search-results-edit"></div>
            </div>
            <select name="category" required class="w-full p-3 border rounded-lg bg-white">
                <option value="">Select Category</option>
                ${[...new Set(state.products.map(p => p.category))].map(c => `<option value="${c}" ${product.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                <option value="Other">Other (New Category)</option>
            </select>
            <input name="newCategory" placeholder="New Category Name (if 'Other' selected)" class="w-full p-3 border rounded-lg hidden"/>
            <div class="relative">
                <textarea name="description" required placeholder="Product Description or Keywords" class="w-full p-3 border rounded-lg h-28">${product.description}</textarea>
                <button type="button" id="generate-description-btn-edit" class="absolute bottom-3 right-3 bg-indigo-100 text-indigo-600 text-xs font-bold py-1 px-2 rounded-full hover:bg-indigo-200">✨ Generate with AI</button>
            </div>
            <textarea name="specs" placeholder="Specifications (JSON format)" class="w-full p-3 border rounded-lg h-28 font-mono text-sm">${JSON.stringify(product.specs, null, 2)}</textarea>
            <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700">Save Changes</button>
        </form>
    </div>
`;

export const addProductPageTemplate = (state) => `
    <div class="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Add a New Product</h1>
        <form id="add-product-form" class="space-y-4">
            <input name="name" required placeholder="Product Name" class="w-full p-3 border rounded-lg"/>
            <input name="price" required type="number" placeholder="Price (INR)" class="w-full p-3 border rounded-lg"/>
            <input name="image" required placeholder="Image URL" class="w-full p-3 border rounded-lg"/>
            <div class="p-2 bg-gray-50 rounded-lg">
                <div class="flex gap-2">
                    <input type="text" name="image-search" placeholder="Search for an image..." class="w-full p-2 border rounded-lg">
                    <button type="button" data-action="search-images" class="bg-indigo-500 text-white font-semibold px-4 rounded-lg hover:bg-indigo-600">Search</button>
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2" id="image-search-results-add"></div>
            </div>
            <select name="category" required class="w-full p-3 border rounded-lg bg-white">
                <option value="">Select Category</option>
                ${[...new Set(state.products.map(p => p.category))].map(c => `<option value="${c}">${c}</option>`).join('')}
                <option value="Other">Other (New Category)</option>
            </select>
            <input name="newCategory" placeholder="New Category Name (if 'Other' selected)" class="w-full p-3 border rounded-lg hidden"/>
            <div class="relative">
                <textarea name="description" required placeholder="Product Description or Keywords (e.g., fast, lightweight, long battery)" class="w-full p-3 border rounded-lg h-28"></textarea>
                <button type="button" id="generate-description-btn" class="absolute bottom-3 right-3 bg-indigo-100 text-indigo-600 text-xs font-bold py-1 px-2 rounded-full hover:bg-indigo-200">✨ Generate with AI</button>
            </div>
            <textarea name="specs" placeholder="Specifications (JSON format, e.g., {&quot;Key&quot;: &quot;Value&quot;})" class="w-full p-3 border rounded-lg h-28 font-mono text-sm"></textarea>
            <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700">Add Product</button>
        </form>
    </div>
`;

export const dashboardPageTemplate = `
    <div class="bg-white p-8 rounded-2xl shadow-lg">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Seller Dashboard</h1>
            <button id="add-new-product-from-dashboard-btn" class="bg-green-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-green-700 transition">
                <i class="fas fa-plus mr-2"></i>Add New Product
            </button>
        </div>
        <div id="dashboard-product-list" class="space-y-4">
            <!-- Product list will be rendered here by ui.js -->
        </div>
    </div>
`;
