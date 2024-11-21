document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    fetchCustomers();
    fetchMenuItems();
    document.getElementById('createForm').addEventListener('submit', createOrder);
    document.getElementById('updateForm').addEventListener('submit', updateOrder);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

function fetchOrders() {
    fetch('http://localhost:3000/api/orders')
        .then(response => response.json())
        .then(orders => {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = '';
            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.customer ? order.customer.name : 'N/A'}</td>
                    <td>${order.items.map(item => item.name).join(', ')}</td>
                    <td>$${order.totalAmount.toFixed(2)}</td>
                    <td>${order.status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${order._id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order._id}')">Delete</button>
                    </td>
                `;
                ordersList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

function fetchCustomers() {
    fetch('http://localhost:3000/api/customers')
        .then(response => response.json())
        .then(customers => {
            const customerSelect = document.getElementById('customer');
            const updateCustomerSelect = document.getElementById('updateCustomer');
            customers.forEach(customer => {
                const option = new Option(customer.name, customer._id);
                const updateOption = new Option(customer.name, customer._id);
                customerSelect.add(option);
                updateCustomerSelect.add(updateOption);
            });
        })
        .catch(error => console.error('Error fetching customers:', error));
}

function fetchMenuItems() {
    fetch('http://localhost:3000/api/menu-items')
        .then(response => response.json())
        .then(menuItems => {
            const itemsSelect = document.getElementById('items');
            const updateItemsSelect = document.getElementById('updateItems');
            menuItems.forEach(item => {
                const option = new Option(item.name, item._id);
                const updateOption = new Option(item.name, item._id);
                itemsSelect.add(option);
                updateItemsSelect.add(updateOption);
            });
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

function createOrder(event) {
    event.preventDefault();
    const customer = document.getElementById('customer').value;
    const items = Array.from(document.getElementById('items').selectedOptions).map(option => option.value);
    const totalAmount = document.getElementById('totalAmount').value;
    const status = document.getElementById('status').value;

    fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer, items, totalAmount, status }),
    })
    .then(response => response.json())
    .then(() => {
        fetchOrders();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating order:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/orders/${id}`)
        .then(response => response.json())
        .then(order => {
            document.getElementById('updateId').value = order._id;
            document.getElementById('updateCustomer').value = order.customer._id;
            document.getElementById('updateItems').value = order.items.map(item => item._id);
            document.getElementById('updateTotalAmount').value = order.totalAmount;
            document.getElementById('updateStatus').value = order.status;
            document.getElementById('updateFormContainer').style.display = 'block';
        })
        .catch(error => console.error('Error fetching order:', error));
}

function updateOrder(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const customer = document.getElementById('updateCustomer').value;
    const items = Array.from(document.getElementById('updateItems').selectedOptions).map(option => option.value);
    const totalAmount = document.getElementById('updateTotalAmount').value;
    const status = document.getElementById('updateStatus').value;

    fetch(`http://localhost:3000/api/orders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer, items, totalAmount, status }),
    })
    .then(response => response.json())
    .then(() => {
        fetchOrders();
        cancelUpdate();
    })
    .catch(error => console.error('Error updating order:', error));
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

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}