document.addEventListener('DOMContentLoaded', () => {
    fetchCustomers();
    document.getElementById('createForm').addEventListener('submit', createCustomer);
    document.getElementById('updateForm').addEventListener('submit', updateCustomer);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
    document.getElementById('generatePassword').addEventListener('click', generatePassword);
    document.getElementById('updateGeneratePassword').addEventListener('click', generatePasswordForUpdate);
});

function fetchCustomers() {
    fetch('http://localhost:3000/api/customers')
        .then(response => response.json())
        .then(customers => {
            const customersList = document.getElementById('customersList');
            customersList.innerHTML = '';
            customers.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>${customer.password || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${customer._id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer._id}')">Delete</button>
                    </td>
                `;
                customersList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching customers:', error));
}

function createCustomer(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, address, password }),
    })
        .then(response => response.json())
        .then((data) => {
            if (data.customer) {
                alert('Customer created successfully and welcome email sent!');
                fetchCustomers();
                document.getElementById('createForm').reset();
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error creating customer:', error);
            alert('Error creating customer: ' + error.message);
        });
}

// Initialize the Bootstrap modal
const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));

// Update the showUpdateForm function
function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/customers/${id}`)
        .then(response => response.json())
        .then(customer => {
            document.getElementById('updateId').value = customer._id;
            document.getElementById('updateName').value = customer.name;
            document.getElementById('updateEmail').value = customer.email;
            document.getElementById('updatePhone').value = customer.phone;
            document.getElementById('updateAddress').value = customer.address;
            document.getElementById('updatePassword').value = customer.password;
            updateModal.show();
        })
        .catch(error => console.error('Error fetching customer:', error));
}

function updateCustomer(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const email = document.getElementById('updateEmail').value;
    const phone = document.getElementById('updatePhone').value;
    const address = document.getElementById('updateAddress').value;
    const password = document.getElementById('updatePassword').value;

    fetch(`http://localhost:3000/api/customers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, address, password }),
    })
        .then(response => response.json())
        .then(() => {
            fetchCustomers();
            cancelUpdate();
        })
        .catch(error => console.error('Error updating customer:', error));
}

function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        fetch(`http://localhost:3000/api/customers/${id}`, {
            method: 'DELETE',
        })
            .then(() => fetchCustomers())
            .catch(error => console.error('Error deleting customer:', error));
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

function generatePassword() {
    const password = Math.random().toString(36).slice(-8);
    document.getElementById('password').value = password;
}

function generatePasswordForUpdate() {
    const password = Math.random().toString(36).slice(-8);
    document.getElementById('updatePassword').value = password;
}

function renderCustomerRow(customer) {
    return `
        <tr>
            <td class="px-4">${customer.name}</td>
            <td class="px-4">${customer.email}</td>
            <td class="px-4">${customer.phone}</td>
            <td class="px-4">${customer.address}</td>
            <td class="px-4">
                <span class="badge bg-light text-dark">********</span>
            </td>
            <td class="px-4 text-end">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="showUpdateForm('${customer._id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer('${customer._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}
