document.addEventListener('DOMContentLoaded', () => {
    fetchReservations();
    fetchCustomers();
    document.getElementById('createForm').addEventListener('submit', createReservation);
    document.getElementById('updateForm').addEventListener('submit', updateReservation);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

function fetchReservations() {
    fetch('http://localhost:3000/api/reservations')
        .then(response => response.json())
        .then(reservations => {
            const reservationsList = document.getElementById('reservationsList');
            reservationsList.innerHTML = '';
            reservations.forEach(reservation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reservation.customer ? reservation.customer.name : 'N/A'}</td>
                    <td>${new Date(reservation.date).toLocaleDateString()}</td>
                    <td>${reservation.time}</td>
                    <td>${reservation.partySize}</td>
                    <td>${reservation.status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${reservation._id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteReservation('${reservation._id}')">Delete</button>
                    </td>
                `;
                reservationsList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching reservations:', error));
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

function createReservation(event) {
    event.preventDefault();
    const customer = document.getElementById('customer').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const partySize = document.getElementById('partySize').value;
    const status = document.getElementById('status').value;

    fetch('http://localhost:3000/api/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer, date, time, partySize, status }),
    })
    .then(response => response.json())
    .then(() => {
        fetchReservations();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating reservation:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/reservations/${id}`)
        .then(response => response.json())
        .then(reservation => {
            document.getElementById('updateId').value = reservation._id;
            document.getElementById('updateCustomer').value = reservation.customer._id;
            document.getElementById('updateDate').value = new Date(reservation.date).toISOString().split('T')[0];
            document.getElementById('updateTime').value = reservation.time;
            document.getElementById('updatePartySize').value = reservation.partySize;
            document.getElementById('updateStatus').value = reservation.status;
            document.getElementById('updateFormContainer').style.display = 'block';
        })
        .catch(error => console.error('Error fetching reservation:', error));
}

function updateReservation(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const customer = document.getElementById('updateCustomer').value;
    const date = document.getElementById('updateDate').value;
    const time = document.getElementById('updateTime').value;
    const partySize = document.getElementById('updatePartySize').value;
    const status = document.getElementById('updateStatus').value;

    fetch(`http://localhost:3000/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer, date, time, partySize, status }),
    })
    .then(response => response.json())
    .then(() => {
        fetchReservations();
        cancelUpdate();
    })
    .catch(error => console.error('Error updating reservation:', error));
}

function deleteReservation(id) {
    if (confirm('Are you sure you want to delete this reservation?')) {
        fetch(`http://localhost:3000/api/reservations/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchReservations())
        .catch(error => console.error('Error deleting reservation:', error));
    }
}

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}