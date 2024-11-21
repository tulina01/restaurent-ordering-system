document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
    document.getElementById('createForm').addEventListener('submit', createEmployee);
    document.getElementById('updateForm').addEventListener('submit', updateEmployee);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

function fetchEmployees() {
    fetch('http://localhost:3000/api/employees')
        .then(response => response.json())
        .then(employees => {
            const employeesList = document.getElementById('employeesList');
            employeesList.innerHTML = '';
            employees.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.name}</td>
                    <td>${employee.position}</td>
                    <td>${employee.email}</td>
                    <td>${employee.phone}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${employee._id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${employee._id}')">Delete</button>
                    </td>
                `;
                employeesList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function createEmployee(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const position = document.getElementById('position').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, position, email, phone }),
    })
    .then(response => response.json())
    .then(() => {
        fetchEmployees();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating employee:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/employees/${id}`)
        .then(response => response.json())
        .then(employee => {
            document.getElementById('updateId').value = employee._id;
            document.getElementById('updateName').value = employee.name;
            document.getElementById('updatePosition').value = employee.position;
            document.getElementById('updateEmail').value = employee.email;
            document.getElementById('updatePhone').value = employee.phone;
            document.getElementById('updateFormContainer').style.display = 'block';
        })
        .catch(error => console.error('Error fetching employee:', error));
}

function updateEmployee(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const name = document.getElementById('updateName').value;
    const position = document.getElementById('updatePosition').value;
    const email = document.getElementById('updateEmail').value;
    const phone = document.getElementById('updatePhone').value;

    fetch(`http://localhost:3000/api/employees/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, position, email, phone }),
    })
    .then(response => response.json())
    .then(() => {
        fetchEmployees();
        cancelUpdate();
    })
    .catch(error => console.error('Error updating employee:', error));
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`http://localhost:3000/api/employees/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchEmployees())
        .catch(error => console.error('Error deleting employee:', error));
    }
}

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}