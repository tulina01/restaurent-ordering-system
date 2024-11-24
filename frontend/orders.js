document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    fetchCustomers();
    fetchMenuItems();
    document.getElementById('createForm').addEventListener('submit', createOrder);
    document.getElementById('updateForm').addEventListener('submit', updateOrder);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
    document.getElementById('items').addEventListener('change', calculateTotalAmount);
});

let menuItemPrices = {}; // To store item prices for total calculation

// Modify the fetchOrders function to update the status display
function fetchOrders() {
    fetch('http://localhost:3000/api/orders')
        .then(response => response.json())
        .then(orders => {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = '';
            orders.forEach(order => {
                // Add null checks and default values
                const customerName = order.customer?.name || 'N/A';
                const items = Array.isArray(order.items) ? order.items.map(item => item?.name || 'Unknown Item').join(', ') : 'No items';
                const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00';
                const status = order.status || 'Pending';

                const statusClass = {
                    'Pending': 'bg-warning',
                    'Preparing': 'bg-info',
                    'Ready': 'bg-success',
                    'Delivered': 'bg-primary'
                }[status] || 'bg-secondary';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customerName}</td>
                    <td>${items}</td>
                    <td>$${totalAmount}</td>
                    <td><span class="badge ${statusClass} status-badge">${status}</span></td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${order._id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" style="margin-left: 5px;" onclick="deleteOrder('${order._id}')">
    <i class="bi bi-trash"></i> Delete
</button>

                        
                        </div>
                    </td>
                `;
                ordersList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            // Display error message to user
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Error loading orders. Please try again later.
                    </td>
                </tr>
            `;
        });
}

function fetchCustomers() {
    fetch('http://localhost:3000/api/customers')
        .then(response => response.json())
        .then(customers => {
            const customerSelect = document.getElementById('customer');
            const updateCustomerSelect = document.getElementById('updateCustomer');
            customers.forEach(customer => {
                const option = new Option(customer.name, customer._id);
                customerSelect.add(option);
                updateCustomerSelect.add(option.cloneNode(true));
            });
        })
        .catch(error => console.error('Error fetching customers:', error));
}

function fetchMenuItems() {
    fetch('http://localhost:3000/api/menu-items')
        .then(response => response.json())
        .then(menuItems => {
            const itemsSelect = document.getElementById('items');
            const updateItemsSelect = document.getElementById('updateItemsContainer'); // Ensure this element exists
            menuItems.forEach(item => {
                // Populate dropdown options
                const option = new Option(`${item.name} ($${item.price.toFixed(2)})`, item._id);
                itemsSelect.add(option);

                // Store item prices for calculations
                menuItemPrices[item._id] = item.price;
            });
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

function calculateTotalAmount() {
    const selectedItems = Array.from(document.getElementById('items').selectedOptions).map(option => option.value);
    const total = selectedItems.reduce((sum, itemId) => sum + (menuItemPrices[itemId] || 0), 0);
    document.getElementById('totalAmount').value = total.toFixed(2);
}

function createOrder(event) {
    event.preventDefault();
    const customer = document.getElementById('customer').value;
    const items = Array.from(document.getElementById('items').selectedOptions).map(option => option.value);
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
    const status = document.getElementById('status').value;

    fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            customer, 
            items, 
            totalAmount, 
            status 
        }),
    })
    .then(response => response.json())
    .then(() => {
        fetchOrders();
        document.getElementById('createForm').reset();
    })
    .catch(error => {
        console.error('Error creating order:', error);
        alert('Error creating order. Please try again.');
    });
}


// Initialize Bootstrap modal
const updateModal = new bootstrap.Modal(document.getElementById('updateFormContainer'));

// Modify the showUpdateForm function to use the modal
function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/orders/${id}`)
        .then(response => response.json())
        .then(order => {
            document.getElementById('updateId').value = order._id;
            document.getElementById('updateCustomer').value = order.customer?._id || '';
            document.getElementById('updateTotalAmount').value = 
                (typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00');
            document.getElementById('updateStatus').value = order.status || 'Pending';

            const updateItemsContainer = document.getElementById('updateItemsContainer');
            updateItemsContainer.innerHTML = ''; // Clear previous content

            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (item) {
                        const itemRow = document.createElement('div');
                        itemRow.classList.add('d-flex', 'align-items-center', 'mb-2', 'bg-white', 'p-2', 'rounded');
                        itemRow.innerHTML = `
                            <span class="me-auto">${item.name || 'Unknown Item'}</span>
                            <button type="button" class="btn btn-danger btn-sm" data-id="${item._id || ''}">
                                <i class="bi bi-trash"></i>
                            </button>
                        `;
                        updateItemsContainer.appendChild(itemRow);

                        itemRow.querySelector('button').addEventListener('click', () => {
                            updateItemsContainer.removeChild(itemRow);
                            updateTotalAmount();
                        });
                    }
                });
            }

            // Show the modal
            const updateModal = new bootstrap.Modal(document.getElementById('updateFormContainer'));
            updateModal.show();
        })
        .catch(error => {
            console.error('Error fetching order:', error);
            alert('Error loading order details. Please try again.');
        });
}

function updateTotalAmount() {
    const selectedItemIds = Array.from(document.querySelectorAll('#updateItemsContainer button'))
        .map(button => button.dataset.id);

    const total = selectedItemIds.reduce((sum, id) => sum + (menuItemPrices[id] || 0), 0);
    document.getElementById('updateTotalAmount').value = total.toFixed(2);
}

// Update the updateOrder function
function updateOrder(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const customer = document.getElementById('updateCustomer').value;
    const items = Array.from(document.querySelectorAll('#updateItemsContainer button'))
        .map(button => button.dataset.id)
        .filter(id => id);
    const totalAmount = parseFloat(document.getElementById('updateTotalAmount').value) || 0;
    const status = document.getElementById('updateStatus').value;

    fetch(`http://localhost:3000/api/orders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            customer, 
            items, 
            totalAmount, 
            status 
        }),
    })
    .then(response => response.json())
    .then(() => {
        // Get the modal instance and hide it
        const modalElement = document.getElementById('updateFormContainer');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Reset form and refresh orders
        document.getElementById('updateForm').reset();
        fetchOrders();
    })
    .catch(error => {
        console.error('Error updating order:', error);
        alert('Error updating order. Please try again.');
    });
}

function deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        fetch(`http://localhost:3000/api/orders/${id}`, {
            method: 'DELETE',
        })
            .then(() => fetchOrders())
            .catch(error => console.error('Error deleting order:', error));
    }
}

// Modify the cancelUpdate function to use the modal
function cancelUpdate() {
    const modalElement = document.getElementById('updateFormContainer');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    document.getElementById('updateForm').reset();
}