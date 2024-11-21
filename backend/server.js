const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas and models for each entity
const menuItemSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number
});

const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String
});

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    totalAmount: Number,
    status: String
});

const reservationSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, 
    date: { type: Date, required: true }, 
    time: { type: String, required: true }, 
    partySize: { type: Number, required: true }, 
    status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' } 
});



const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    position: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, 
    phone: { type: String, required: true } 
});

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    date: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }]
});

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

invoiceSchema.pre('save', function(next) {
    const doc = this;
    Counter.findByIdAndUpdate(
        { _id: 'invoiceNumber' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).then(function(counter) {
        doc.invoiceNumber = `INV-${counter.seq.toString().padStart(6, '0')}`;
        next();
    }).catch(function(error) {
        return next(error);
    });
});


const inventoryItemSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    unit: String
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Order = mongoose.model('Order', orderSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const Counter = mongoose.model('Counter', counterSchema);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Restaurant Ordering System API' });
  });

// CRUD operations for MenuItem
app.get('/api/menu-items', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/menu-items', async (req, res) => {
    const menuItem = new MenuItem(req.body);
    try {
        const newMenuItem = await menuItem.save();
        res.status(201).json(newMenuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/menu-items/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (menuItem == null) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/menu-items/:id', async (req, res) => {
    try {
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMenuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/menu-items/:id', async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for Customer
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const customer = new Customer(req.body);
    try {
        const newCustomer = await customer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer == null) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for Order
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('customer').populate('items');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const order = new Order(req.body);
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer').populate('items');
        if (order == null) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for Reservation
app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find().populate('customer');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/reservations', async (req, res) => {
    const { customer, date, time, partySize, status } = req.body;

    const reservation = new Reservation({
        customer,
        date,
        time,
        partySize,
        status
    });

    try {
        const newReservation = await reservation.save();
        res.status(201).json(newReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('customer');
        if (reservation == null) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/reservations/:id', async (req, res) => {
    const { customer, date, time, partySize, status } = req.body;

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { customer, date, time, partySize, status },
            { new: true, runValidators: true } // Ensure validation runs for updated fields
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json(updatedReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
app.delete('/api/reservations/:id', async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reservation deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for Employee
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/employees', async (req, res) => {
    const { name, position, email, phone } = req.body;

    const employee = new Employee({
        name,
        position,
        email,
        phone
    });

    try {
        const newEmployee = await employee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee == null) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    const { name, position, email, phone } = req.body;

    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, position, email, phone },
            { new: true, runValidators: true } // Ensure validation runs for updated fields
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for Supplier
app.get('/api/suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/suppliers', async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;
        const supplier = new Supplier({ name, contactPerson, email, phone, address });
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/suppliers/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (supplier == null) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/suppliers/:id', async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { name, contactPerson, email, phone, address },
            { new: true }
        );
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/suppliers/:id', async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for Invoice
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('supplier');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/invoices', async (req, res) => {
    const invoice = new Invoice(req.body);
    try {
        const newInvoice = await invoice.save();
        const populatedInvoice = await Invoice.findById(newInvoice._id).populate('supplier');
        res.status(201).json(populatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('supplier');
        if (invoice == null) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/invoices/:id', async (req, res) => {
    const { supplier, date, totalAmount, status, items } = req.body;

    if (!items || !items.length) {
        return res.status(400).json({ message: "Items cannot be empty" });
    }

    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { supplier, date, totalAmount, status, items },
            { new: true }
        ).populate('supplier');

        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoice', error });
    }
});

app.delete('/api/invoices/:id', async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/invoices/:id', async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/invoices/:id', async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD operations for InventoryItem
app.get('/api/inventory', async (req, res) => {
    try {
        const inventoryItems = await InventoryItem.find();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    const inventoryItem = new InventoryItem(req.body);
    try {
        const newInventoryItem = await inventoryItem.save();
        res.status(201).json(newInventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/inventory/:id', async (req, res) => {
    try {
        const inventoryItem = await InventoryItem.findById(req.params.id);
        if (inventoryItem == null) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const updatedInventoryItem = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedInventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await InventoryItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inventory item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });
  
  // 404 Not Found middleware
  app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// Customer registration
app.post('/api/customers/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let customer = await Customer.findOne({ email });
        if (customer) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new customer
        customer = new Customer({
            name,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(password, salt);

        // Save customer to database
        await customer.save();

        // Create and return JWT token
        const payload = {
            customer: {
                id: customer.id
            }
        };

        jwt.sign(
            payload,
            'your_jwt_secret', // Replace with your actual JWT secret
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Customer login
app.post('/api/customers/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create and return JWT token
        const payload = {
            customer: {
                id: customer.id
            }
        };

        jwt.sign(
            payload,
            'your_jwt_secret', // Replace with your actual JWT secret
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});