document.addEventListener('DOMContentLoaded', () => {
    fetchCustomers();
    document.getElementById('createForm').addEventListener('submit', createCustomer);
    document.getElementById('updateForm').addEventListener('submit', updateCustomer);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
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

    fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone }),
    })
    .then(response => response.json())
    .then(() => {
        fetchCustomers();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating customer:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/customers/${id}`)
        .then(response => response.json())
        .then(customer => {
            document.getElementById('updateId').value = customer._id;
            document.getElementById('updateName').value = customer.name;
            document.getElementById('updateEmail').value = customer.email;
            document.getElementById('updatePhone').value = customer.phone;
            document.getElementById('updateFormContainer').style.display = 'block';
        })
        .catch(error => console.error('Error fetching customer:', error));
}

function updateCustomer(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const email = document.getElementById('updateEmail').value;
    const phone = document.getElementById('updatePhone').value;

    fetch(`http://localhost:3000/api/customers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone }),
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

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}