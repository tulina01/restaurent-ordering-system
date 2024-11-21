document.addEventListener('DOMContentLoaded', () => {
    fetchMenuItems();
    document.getElementById('createForm').addEventListener('submit', createMenuItem);
    document.getElementById('updateForm').addEventListener('submit', updateMenuItem);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

function fetchMenuItems() {
    fetch('http://localhost:3000/api/menu-items')
        .then(response => response.json())
        .then(items => {
            const menuItemsList = document.getElementById('menuItemsList');
            menuItemsList.innerHTML = '';
            items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${item._id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMenuItem('${item._id}')">Delete</button>
                    </td>
                `;
                menuItemsList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

function createMenuItem(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    fetch('http://localhost:3000/api/menu-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price }),
    })
    .then(response => response.json())
    .then(() => {
        fetchMenuItems();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating menu item:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/menu-items/${id}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('updateId').value = item._id;
            document.getElementById('updateName').value = item.name;
            document.getElementById('updateDescription').value = item.description;
            document.getElementById('updatePrice').value = item.price;
            document.getElementById('updateFormContainer').style.display = 'block';
        })
        .catch(error => console.error('Error fetching menu item:', error));
}

function updateMenuItem(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const description = document.getElementById('updateDescription').value;
    const price = document.getElementById('updatePrice').value;

    fetch(`http://localhost:3000/api/menu-items/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price }),
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

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}