

document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    document.getElementById('createForm').addEventListener('submit', createInventoryItem);
    document.getElementById('updateForm').addEventListener('submit', updateInventoryItem);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

function fetchInventory() {
    fetch('http://localhost:3000/api/inventory')
        .then(response => response.json())
        .then(inventoryItems => {
            const inventoryList = document.getElementById('inventoryList');
            inventoryList.innerHTML = '';
            inventoryItems.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>${item.itemType}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="showUpdateForm('${item._id}')"> <i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteInventoryItem('${item._id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                inventoryList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

function createInventoryItem(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const unit = document.getElementById('unit').value;
    const itemType = document.getElementById('itemType').value;

    fetch('http://localhost:3000/api/inventory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, quantity, unit, itemType }),
    })
    .then(response => response.json())
    .then(() => {
        fetchInventory();
        document.getElementById('createForm').reset();
        document.getElementById('unit').disabled = true;
    })
    .catch(error => console.error('Error creating inventory item:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/inventory/${id}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('updateId').value = item._id;
            document.getElementById('updateName').value = item.name;
            document.getElementById('updateQuantity').value = item.quantity;
            document.getElementById('updateUnit').value = item.unit;
            document.getElementById('updateItemType').value = item.itemType;
            
            // Use Bootstrap modal to show update form
            var updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
            updateModal.show();
        })
        .catch(error => console.error('Error fetching inventory item:', error));
}

function updateInventoryItem(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const quantity = document.getElementById('updateQuantity').value;
    const unit = document.getElementById('updateUnit').value;
    const itemType = document.getElementById('updateItemType').value;

    fetch(`http://localhost:3000/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, quantity, unit, itemType }),
    })
    .then(response => response.json())
    .then(() => {
        fetchInventory();
        var updateModal = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
        updateModal.hide();
    })
    .catch(error => console.error('Error updating inventory item:', error));
}

function deleteInventoryItem(id) {
    if (confirm('Are you sure you want to delete this inventory item?')) {
        fetch(`http://localhost:3000/api/inventory/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchInventory())
        .catch(error => console.error('Error deleting inventory item:', error));
    }
}

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}

function updateUnitOptions() {
    const itemType = document.getElementById('itemType').value;
    const unitInput = document.getElementById('unit');

    if (itemType === 'Vegetables & Fruits' || itemType === 'Meat & Seafood') {
        unitInput.disabled = false;
        unitInput.value = 'kg';
        unitInput.placeholder = 'Enter Quantity (kg or g)';
    } else if (itemType === 'Beverages') {
        unitInput.disabled = false;
        unitInput.value = 'L';
        unitInput.placeholder = 'Enter Quantity (L or mL)';
    } else if (itemType === 'Utensils & Packaging') {
        unitInput.disabled = false;
        unitInput.value = 'pcs';
        unitInput.placeholder = 'Enter Quantity (pcs)';
    } else {
        unitInput.disabled = true;
        unitInput.placeholder = 'Select Item Type First';
    }
}