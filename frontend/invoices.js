document.addEventListener('DOMContentLoaded', () => {
    fetchInvoices();
    fetchSuppliers();
    document.getElementById('createForm').addEventListener('submit', createInvoice);
    document.getElementById('updateForm').addEventListener('submit', updateInvoice);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
});

function fetchInvoices() {
    fetch('http://localhost:3000/api/invoices')
        .then(response => response.json())
        .then(invoices => {
            const invoicesList = document.getElementById('invoicesList');
            invoicesList.innerHTML = '';
            invoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.supplier ? invoice.supplier.name : 'N/A'}</td>
                    <td>${new Date(invoice.date).toLocaleDateString()}</td>
                    <td>$${invoice.totalAmount.toFixed(2)}</td>
                    <td>${invoice.status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${invoice._id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${invoice._id}')">Delete</button>
                    </td>
                `;
                invoicesList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching invoices:', error));
}

function fetchSuppliers() {
    fetch('http://localhost:3000/api/suppliers')
        .then(response => response.json())
        .then(suppliers => {
            const supplierSelect = document.getElementById('supplier');
            const updateSupplierSelect = document.getElementById('updateSupplier');
            suppliers.forEach(supplier => {
                const option = new Option(supplier.name, supplier._id);
                const updateOption = new Option(supplier.name, supplier._id);
                supplierSelect.add(option);
                updateSupplierSelect.add(updateOption);
            });
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

function createInvoice(event) {
    event.preventDefault();
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const supplier = document.getElementById('supplier').value;
    const date = document.getElementById('date').value;
    const totalAmount = document.getElementById('totalAmount').value;
    const status = document.getElementById('status').value;

    fetch('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceNumber, supplier, date, totalAmount, status }),
    })
    .then(response => response.json())
    .then(() => {
        fetchInvoices();
        document.getElementById('createForm').reset();
    })
    .catch(error => console.error('Error creating invoice:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/invoices/${id}`)
        .then(response => response.json())
        .then(invoice => {
            document.getElementById('updateId').value = invoice._id;
            document.getElementById('updateInvoiceNumber').value = invoice.invoiceNumber;
            document.getElementById('updateSupplier').value = invoice.supplier._id;
            document.getElementById('updateDate').value = new Date(invoice.date).toISOString().split('T')[0];
            document.getElementById('updateTotalAmount').value = invoice.totalAmount;
            document.getElementById('updateStatus').value = invoice.status;
            document.getElementById('updateFormContainer').style.display = 'block';
        })
        .catch(error => console.error('Error fetching invoice:', error));
}

function updateInvoice(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const invoiceNumber = document.getElementById('updateInvoiceNumber').value;
    const supplier = document.getElementById('updateSupplier').value;
    const date = document.getElementById('updateDate').value;
    const totalAmount = document.getElementById('updateTotalAmount').value;
    const status = document.getElementById('updateStatus').value;

    fetch(`http://localhost:3000/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceNumber, supplier, date, totalAmount, status }),
    })
    .then(response => response.json())
    .then(() => {
        fetchInvoices();
        cancelUpdate();
    })
    .catch(error => console.error('Error updating invoice:', error));
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        fetch(`http://localhost:3000/api/invoices/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchInvoices())
        .catch(error => console.error('Error deleting invoice:', error));
    }
}

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
}