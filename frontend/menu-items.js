document.addEventListener('DOMContentLoaded', () => {
    fetchMenuItems();
    document.getElementById('createForm').addEventListener('submit', createMenuItem);
    document.getElementById('updateForm').addEventListener('submit', updateMenuItem);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMenuItemsByCategory('Starters');
    fetchMenuItemsByCategory('Main Course');
    fetchMenuItemsByCategory('Desserts');
    fetchMenuItemsByCategory('Beverages');
});

// Function to fetch and display items for a specific category
function fetchMenuItemsByCategory(category) {
    fetch('http://localhost:3000/api/menu-items')
        .then(response => response.json())
        .then(items => {
            // Filter items by category
            const categoryItems = items.filter(item => item.category === category);

            // Render the items in the corresponding category section
            renderCategory(category, categoryItems);
        })
        .catch(error => console.error('Error fetching menu items:', error));
}


// Function to render items under each category
function renderCategory(categoryName, items) {
    const categorySection = document.querySelector(`#${categoryName.replace(/\s+/g, '').toLowerCase()}`);
    categorySection.innerHTML = ''; // Clear existing content

    if (items.length === 0) {
        categorySection.innerHTML = `<p class="text-center text-gray-500 my-4">No items available in this category.</p>`;
        return;
    }

    items.forEach(item => {
        const col = document.createElement('div');
        col.classList.add('col-md-3', 'mb-4');
        col.innerHTML = `
            <div class="card border-0 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <div class="position-relative">
                    <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" 
                         style="height: 250px; object-fit: cover; filter: brightness(0.95);">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-success rounded-pill px-3 py-2 shadow-sm">
                            $${item.price.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div class="card-body bg-white p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${item.name}</h5>
                        <span class="badge bg-light text-dark rounded-pill">
                            ${item.category}
                        </span>
                    </div>
                    <p class="card-text text-muted mb-3" style="font-size: 0.95rem;">
                        ${item.description}
                    </p>
                </div>
            </div>
        `;
        categorySection.appendChild(col);
    });
}


function fetchMenuItems() {
    fetch('http://localhost:3000/api/menu-items')
        .then(response => response.json())
        .then(items => {
            const menuItemsList = document.getElementById('menuItemsList');
            menuItemsList.innerHTML = '';
            items.forEach(item => {
                const col = document.createElement('div');
                col.classList.add('col-md-3', 'mb-4');
                col.innerHTML = `
                    <div class="card border-0 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
                        <div class="position-relative">
                            <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" 
                                 style="height: 250px; object-fit: cover; filter: brightness(0.95);">
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge bg-success rounded-pill px-3 py-2 shadow-sm">
                                    $${item.price.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div class="card-body bg-white p-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold mb-0">${item.name}</h5>
                                <span class="badge bg-light text-dark rounded-pill">
                                    ${item.category}
                                </span>
                            </div>
                            <p class="card-text text-muted mb-3" style="font-size: 0.95rem;">
                                ${item.description}
                            </p>
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-outline-success btn-sm rounded-pill px-3"
                                        onclick="showUpdateForm('${item._id}')">
                                    <i class="bi bi-pencil-square me-1"></i> Edit
                                </button>
                                <button class="btn btn-outline-danger btn-sm rounded-pill px-3"
                                        onclick="deleteMenuItem('${item._id}')">
                                    <i class="bi bi-trash me-1"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                menuItemsList.appendChild(col);
            });
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

function createMenuItem(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const imageUrl = document.getElementById('imageUrl').value;
    const category = document.getElementById('category').value; // New category field

    fetch('http://localhost:3000/api/menu-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price, imageUrl, category }), // Including category in the request
    })
    .then(response => response.json())
    .then(() => {
        fetchMenuItems();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating menu item:', error));
}

// Initialize the Bootstrap modal
const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));

// Update the showUpdateForm function
function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/menu-items/${id}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('updateId').value = item._id;
            document.getElementById('updateName').value = item.name;
            document.getElementById('updateDescription').value = item.description;
            document.getElementById('updatePrice').value = item.price;
            document.getElementById('updateImageUrl').value = item.imageUrl;
            document.getElementById('updateCategory').value = item.category;
            
            // Show the modal
            updateModal.show();
        })
        .catch(error => console.error('Error fetching menu item:', error));
}

function updateMenuItem(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const description = document.getElementById('updateDescription').value;
    const price = parseFloat(document.getElementById('updatePrice').value);
    const imageUrl = document.getElementById('updateImageUrl').value;
    const category = document.getElementById('updateCategory').value; // New category field

    fetch(`http://localhost:3000/api/menu-items/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price, imageUrl, category }), // Include category in the update request
    })
    .then(response => response.json())
    .then(() => {
        fetchMenuItems();
        cancelUpdate();
    })
    .catch(error => console.error('Error updating menu item:', error));
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        fetch(`http://localhost:3000/api/menu-items/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchMenuItems())
        .catch(error => console.error('Error deleting menu item:', error));
    }
}

// Update the cancelUpdate function
function cancelUpdate() {
    document.getElementById('updateForm').reset();
    updateModal.hide();
}

// Add event listener for modal close
document.getElementById('updateModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('updateForm').reset();
});