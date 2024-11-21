document.addEventListener('DOMContentLoaded', () => {
    fetchMenuItems();
    setupEventListeners();
});

function fetchMenuItems() {
    fetch('http://localhost:3000/api/menu-items')
        .then(response => response.json())
        .then(items => {
            const menuItemsContainer = document.getElementById('menuItems');
            items.forEach(item => {
                const itemElement = createMenuItemElement(item);
                menuItemsContainer.appendChild(itemElement);
            });
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

function createMenuItemElement(item) {
    const div = document.createElement('div');
    div.className = 'col-md-4 menu-item';
    div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <p>Price: $${item.price}</p>
        <button class="btn btn-primary add-to-cart" data-id="${item._id}">Add to Cart</button>
    `;
    return div;
}

function setupEventListeners() {
    document.getElementById('menuItems').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const itemId = e.target.getAttribute('data-id');
            addToCart(itemId);
        }
    });

    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    document.getElementById('loginBtn').addEventListener('click', showLoginForm);
    document.getElementById('registerBtn').addEventListener('click', showRegisterForm);
    document.getElementById('adminLoginBtn').addEventListener('click', showAdminLoginForm);
}

function addToCart(itemId) {
    // Implement cart functionality
}

function checkout() {
    // Implement checkout functionality
}

function showLoginForm() {
    // Implement login form display
}

function showRegisterForm() {
    // Implement register form display
}

function showAdminLoginForm() {
    // Implement admin login form display
}