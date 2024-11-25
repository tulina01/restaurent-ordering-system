document.addEventListener('DOMContentLoaded', () => {
    fetchSuppliers();
    document.getElementById('createForm').addEventListener('submit', createSupplier);
    document.getElementById('updateForm').addEventListener('submit', updateSupplier);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
    updateModal = new bootstrap.Modal(document.getElementById('updateFormContainer'));
});

function fetchSuppliers() {
    fetch('http://localhost:3000/api/suppliers')
        .then(response => response.json())
        .then(suppliers => {
            const suppliersList = document.getElementById('suppliersList');
            suppliersList.innerHTML = '';
            suppliers.forEach(supplier => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${supplier.name || 'N/A'}</td>
                    <td>${supplier.contactPerson || 'N/A'}</td>
                    <td>${supplier.email || 'N/A'}</td>
                    <td>${supplier.phone || 'N/A'}</td>
                    <td>${supplier.address || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="showUpdateForm('${supplier._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier('${supplier._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                suppliersList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

function createSupplier(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const contactPerson = document.getElementById('contactPerson').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    fetch('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, contactPerson, email, phone, address }),
    })
    .then(response => response.json())
    .then(() => {
        fetchSuppliers();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating supplier:', error));
}

let updateModal;

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/suppliers/${id}`)
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('updateId').value = supplier._id;
            document.getElementById('updateName').value = supplier.name;
            document.getElementById('updateContactPerson').value = supplier.contactPerson;
            document.getElementById('updateEmail').value = supplier.email;
            document.getElementById('updatePhone').value = supplier.phone;
            document.getElementById('updateAddress').value = supplier.address;
            updateModal.show();
        })
        .catch(error => console.error('Error fetching supplier:', error));
}

function updateSupplier(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const contactPerson = document.getElementById('updateContactPerson').value;
    const email = document.getElementById('updateEmail').value;
    const phone = document.getElementById('updatePhone').value;
    const address = document.getElementById('updateAddress').value;

    fetch(`http://localhost:3000/api/suppliers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, contactPerson, email, phone, address }),
    })
    .then(response => response.json())
    .then(() => {
        fetchSuppliers();
        cancelUpdate();
    })
    .catch(error => console.error('Error updating supplier:', error));
}

function deleteSupplier(id) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        fetch(`http://localhost:3000/api/suppliers/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchSuppliers())
        .catch(error => console.error('Error deleting supplier:', error));
    }
}

function cancelUpdate() {
    updateModal.hide();
    document.getElementById('updateForm').reset();
}