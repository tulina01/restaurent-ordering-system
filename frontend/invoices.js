document.addEventListener('DOMContentLoaded', () => {
    fetchInvoices();
    fetchSuppliers();

    const createForm = document.getElementById('createForm');
    const updateForm = document.getElementById('updateForm');
    const cancelUpdateButton = document.getElementById('cancelUpdate');
    const addItemBtn = document.getElementById('addItemBtn');
    const updateAddItemBtn = document.getElementById('updateAddItemBtn');

    if (createForm) createForm.addEventListener('submit', createInvoice);
    if (updateForm) updateForm.addEventListener('submit', updateInvoice);
    if (cancelUpdateButton) cancelUpdateButton.addEventListener('click', cancelUpdate);
    if (addItemBtn) addItemBtn.addEventListener('click', () => addItemField('itemsContainer'));
    if (updateAddItemBtn) updateAddItemBtn.addEventListener('click', () => addItemField('updateItemsContainer', 'update'));
});

function addItemField(containerId, prefix = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const index = container.children.length;
    const itemRow = document.createElement('div');
    itemRow.classList.add('row', 'mb-2');
    itemRow.innerHTML = `
        <div class="col">
            <input type="text" class="form-control" id="${prefix}ItemName${index}" placeholder="Item Name" required>
        </div>
        <div class="col">
            <input type="number" class="form-control" id="${prefix}ItemQuantity${index}" placeholder="Quantity" required>
        </div>
        <div class="col">
            <input type="number" step="0.01" class="form-control" id="${prefix}ItemPrice${index}" placeholder="Price" required>
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger remove-item-btn">Remove</button>
        </div>
    `;
    container.appendChild(itemRow);

    const removeButton = itemRow.querySelector('.remove-item-btn');
    if (removeButton) {
        removeButton.addEventListener('click', () => itemRow.remove());
    }
}

function fetchInvoices() {
    fetch('http://localhost:3000/api/invoices')
        .then(response => response.json())
        .then(invoices => {
            const invoicesList = document.getElementById('invoicesList');
            invoicesList.innerHTML = '';
            invoices.forEach(invoice => {
                const row = createInvoiceRow(invoice);
                invoicesList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching invoices:', error));
}

function createInvoiceRow(invoice) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', invoice._id);

    const itemsHtml = invoice.items
        ? invoice.items.map(item => `${item.name} (${item.quantity} x $${item.price.toFixed(2)})`).join(', ')
        : 'No items';

    row.innerHTML = `
        <td>${invoice.invoiceNumber || 'N/A'}</td>
        <td>${invoice.supplier ? invoice.supplier.name : 'N/A'}</td>
        <td>${invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}</td>
        <td>${invoice.totalAmount ? '$' + Number(invoice.totalAmount).toFixed(2) : 'N/A'}</td>
        <td>${invoice.status || 'N/A'}</td>
        <td>${itemsHtml}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="showUpdateForm('${invoice._id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteInvoice('${invoice._id}')"><i class="fas fa-trash"></i></button>
        </td>
    `;
    return row;
}

function fetchSuppliers() {
    fetch('http://localhost:3000/api/suppliers')
        .then(response => response.json())
        .then(suppliers => {
            const supplierSelect = document.getElementById('supplier');
            const updateSupplierSelect = document.getElementById('updateSupplier');
            supplierSelect.innerHTML = '<option value="">Select a supplier</option>';
            updateSupplierSelect.innerHTML = '<option value="">Select a supplier</option>';
            suppliers.forEach(supplier => {
                const option = new Option(supplier.name, supplier._id);
                const updateOption = new Option(supplier.name, supplier._id);
                supplierSelect.add(option);
                updateSupplierSelect.add(updateOption);
            });
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

function getItemsFromForm(containerId, prefix = '') {
    const container = document.getElementById(containerId);
    const items = [];

    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return items;
    }

    for (let i = 0; i < container.children.length; i++) {
        const nameElement = document.getElementById(`${prefix}ItemName${i}`);
        const quantityElement = document.getElementById(`${prefix}ItemQuantity${i}`);
        const priceElement = document.getElementById(`${prefix}ItemPrice${i}`);

        if (!nameElement || !quantityElement || !priceElement) {
            console.warn(`Missing input elements for item ${i}.`);
            continue;
        }

        const name = nameElement.value.trim();
        const quantity = parseInt(quantityElement.value.trim(), 10);
        const price = parseFloat(priceElement.value.trim());

        if (name && !isNaN(quantity) && !isNaN(price)) {
            items.push({ name, quantity, price });
        }
    }

    if (items.length === 0) {
        alert('Please add at least one item.');
    }

    return items;
}

function createInvoice(event) {
    event.preventDefault();
    const supplier = document.getElementById('supplier').value;
    const date = document.getElementById('date').value;
    const totalAmount = document.getElementById('totalAmount').value;
    const status = document.getElementById('status').value;
    const items = getItemsFromForm('itemsContainer');

    if (items.length === 0) return;

    fetch('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier, date, totalAmount, status, items }),
    })
    .then(response => response.json())
    .then(newInvoice => {
        const invoicesList = document.getElementById('invoicesList');
        const row = createInvoiceRow(newInvoice);
        invoicesList.appendChild(row);
        document.getElementById('createForm').reset();
        document.getElementById('itemsContainer').innerHTML = '';
    })
    .catch(error => console.error('Error creating invoice:', error));
}

function showUpdateForm(id) {
    fetch(`http://localhost:3000/api/invoices/${id}`)
        .then(response => response.json())
        .then(invoice => {
            document.getElementById('updateId').value = invoice._id;
            document.getElementById('updateSupplier').value = invoice.supplier._id;
            document.getElementById('updateDate').value = new Date(invoice.date).toISOString().split('T')[0];
            document.getElementById('updateTotalAmount').value = invoice.totalAmount;
            document.getElementById('updateStatus').value = invoice.status;
            
            const updateItemsContainer = document.getElementById('updateItemsContainer');
            updateItemsContainer.innerHTML = '';
            if (invoice.items && invoice.items.length > 0) {
                invoice.items.forEach((item, index) => {
                    addItemField('updateItemsContainer', 'update');
                    document.getElementById(`updateItemName${index}`).value = item.name;
                    document.getElementById(`updateItemQuantity${index}`).value = item.quantity;
                    document.getElementById(`updateItemPrice${index}`).value = item.price;
                });
            } else {
                addItemField('updateItemsContainer', 'update');
            }
            
            new bootstrap.Modal(document.getElementById('updateModal')).show();
        })
        .catch(error => console.error('Error fetching invoice:', error));
}

function updateInvoice(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const supplier = document.getElementById('updateSupplier').value;
    const date = document.getElementById('updateDate').value;
    const totalAmount = document.getElementById('updateTotalAmount').value;
    const status = document.getElementById('updateStatus').value;
    const items = getItemsFromForm('updateItemsContainer', 'update');

    if (!items.length) {
        alert("Items cannot be empty! Add at least one item.");
        return;
    }

    fetch(`http://localhost:3000/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier, date, totalAmount, status, items }),
    })
    .then(response => response.json())
    .then(updatedInvoice => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.replaceWith(createInvoiceRow(updatedInvoice));
        } else {
            fetchInvoices();
        }
        cancelUpdate();
    })
    .catch(error => console.error('Error updating invoice:', error));
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        fetch(`http://localhost:3000/api/invoices/${id}`, { method: 'DELETE' })
        .then(() => {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
            } else {
                fetchInvoices();
            }
        })
        .catch(error => console.error('Error deleting invoice:', error));
    }
}

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateItemsContainer').innerHTML = '';
    bootstrap.Modal.getInstance(document.getElementById('updateModal')).hide();
}