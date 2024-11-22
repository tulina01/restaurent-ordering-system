document.addEventListener('DOMContentLoaded', () => {
    fetchInvoices();
    fetchSuppliers();
    document.getElementById('createForm').addEventListener('submit', createInvoice);
    document.getElementById('updateForm').addEventListener('submit', updateInvoice);
    document.getElementById('cancelUpdate').addEventListener('click', cancelUpdate);
    document.getElementById('addItemBtn').addEventListener('click', addItemField);
    document.getElementById('updateAddItemBtn').addEventListener('click', addUpdateItemField);
});

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
            <button class="btn btn-sm btn-primary" onclick="showUpdateForm('${invoice._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${invoice._id}')">Delete</button>
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

function createInvoice(event) {
    event.preventDefault();
    const supplier = document.getElementById('supplier').value;
    const date = document.getElementById('date').value;
    const totalAmount = document.getElementById('totalAmount').value;
    const status = document.getElementById('status').value;
    const items = getItemsFromForm('itemsContainer');

    if (items.length === 0) {
        return; // Exit if no items are present
    }

    console.log('Creating invoice with items:', items); // Debug log

    fetch('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
                    addUpdateItemField();
                    document.getElementById(`updateItemName${index}`).value = item.name;
                    document.getElementById(`updateItemQuantity${index}`).value = item.quantity;
                    document.getElementById(`updateItemPrice${index}`).value = item.price;
                });
            } else {
                addUpdateItemField(); // Add at least one item field if there are no items
            }
            
            document.getElementById('updateFormContainer').style.display = 'block';
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
    const items = getItemsFromForm('updateItemsContainer', 'update'); // Fetch items

    // Ensure items array is correctly formed
    if (!items.length) {
        alert("Items cannot be empty! Add at least one item.");
        return;
    }

    fetch(`http://localhost:3000/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ supplier, date, totalAmount, status, items }),
    })
        .then(response => response.json())
        .then(updatedInvoice => {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.replaceWith(createInvoiceRow(updatedInvoice));
            } else {
                fetchInvoices(); // Refresh if row not found
            }
            cancelUpdate();
        })
        .catch(error => console.error('Error updating invoice:', error));
}


function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        fetch(`http://localhost:3000/api/invoices/${id}`, {
            method: 'DELETE',
        })
        .then(() => {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
            } else {
                fetchInvoices(); // Fallback to re-fetching all invoices if row not found
            }
        })
        .catch(error => console.error('Error deleting invoice:', error));
    }
}

function cancelUpdate() {
    document.getElementById('updateForm').reset();
    document.getElementById('updateFormContainer').style.display = 'none';
    document.getElementById('updateItemsContainer').innerHTML = '';
}



function addUpdateItemField() {
    const container = document.getElementById('updateItemsContainer');
    const index = container.children.length;
    const itemField = document.createElement('div');
    itemField.innerHTML = `
        <input type="text" id="updateItemName${index}" placeholder="Item Name" required>
        <input type="number" id="updateItemQuantity${index}" placeholder="Quantity" required>
        <input type="number" id="updateItemPrice${index}" placeholder="Price" step="0.01" required>
    `;
    container.appendChild(itemField);
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

        // Debugging: Check if elements exist
        if (!nameElement || !quantityElement || !priceElement) {
            console.warn(`Missing input elements for item ${i}.`);
            continue;
        }

        const name = nameElement.value.trim();
        const quantity = parseInt(quantityElement.value.trim(), 10);
        const price = parseFloat(priceElement.value.trim());

        // Debugging: Check parsed values
        console.log(`Item ${i}:`, { name, quantity, price });

        if (name && !isNaN(quantity) && !isNaN(price)) {
            items.push({ name, quantity, price });
        }
    }

    if (items.length === 0) {
        alert('Please add at least one item.');
    }

    return items;
}


document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const createForm = document.getElementById('createForm');

    let itemCount = 0; // To track the number of items dynamically

    // Add a new item row to the container
    addItemBtn.addEventListener('click', () => {
        const itemRow = document.createElement('div');
        itemRow.classList.add('row', 'mb-2');

        itemRow.innerHTML = `
            <div class="col">
                <input type="text" class="form-control" id="ItemName${itemCount}" placeholder="Item Name" required>
            </div>
            <div class="col">
                <input type="number" class="form-control" id="ItemQuantity${itemCount}" placeholder="Quantity" required>
            </div>
            <div class="col">
                <input type="number" step="0.01" class="form-control" id="ItemPrice${itemCount}" placeholder="Price" required>
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-danger remove-item-btn">Remove</button>
            </div>
        `;

        itemsContainer.appendChild(itemRow);
        itemCount++;

        // Add event listener to remove this row
        itemRow.querySelector('.remove-item-btn').addEventListener('click', () => {
            itemRow.remove();
        });
    });

    // Collect items from the form
    function getItemsFromForm(container) {
        const items = [];
        const rows = container.querySelectorAll('.row');

        rows.forEach((row, index) => {
            const name = row.querySelector(`#ItemName${index}`).value.trim();
            const quantity = parseInt(row.querySelector(`#ItemQuantity${index}`).value.trim(), 10);
            const price = parseFloat(row.querySelector(`#ItemPrice${index}`).value.trim());

            if (name && !isNaN(quantity) && !isNaN(price)) {
                items.push({ name, quantity, price });
            }
        });

        return items;
    }

    // Handle form submission
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const supplier = document.getElementById('supplier').value;
        const date = document.getElementById('date').value;
        const totalAmount = parseFloat(document.getElementById('totalAmount').value);
        const status = document.getElementById('status').value;

        // Get items
        const items = getItemsFromForm(itemsContainer);

        if (items.length === 0) {
            alert('Please add at least one item.');
            return;
        }

        // Construct the invoice object
        const invoice = {
            supplier,
            date,
            totalAmount,
            status,
            items
        };

        console.log('New Invoice:', invoice);

        // Clear the form after submission
        createForm.reset();
        itemsContainer.innerHTML = '';
        itemCount = 0;

        // Optionally add the new invoice to a table or database here
    });
});


