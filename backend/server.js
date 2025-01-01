const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');




const app = express();
const port = 3000;
app.use(bodyParser.json());

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));




mongoose.connect(process.env.MONGODB_URI || "mongodb://mongodb:27017/restaurant_db", { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas and models for each entity
const menuItemSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    category: {
        type: String,
        enum: ['Beverages', 'Desserts', 'Main Course', 'Starters'], // Restricting to specified categories
        required: true,
    },
});






const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    password: String
});



module.exports = mongoose.model('Customer', customerSchema);


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
    unit: String,
    itemType: {
        type: String,
        enum: ['Vegetables & Fruits', 'Meat & Seafood', 'Beverages', 'Utensils & Packaging'],
        required: true
    }
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
        res.status(404).json({ message: error.message });
    }
});

app.put('/api/menu-items/:id', async (req, res) => {
    try {
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Ensure new data is returned and validated
        );
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



// CRUD operations for coustomers

// Rest of your existing endpoints remain the same
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
        
        // Send welcome email
        await sendWelcomeEmail(req.body);
        
        res.status(201).json({
            customer: newCustomer,
            message: 'Customer created and welcome email sent successfully'
        });
    } catch (error) {
        res.status(400).json({ 
            message: error.message,
            emailError: error.emailError || false 
        });
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

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',  // or your preferred email service
    auth: {
        user: 'managementsystem56@gmail.com', // your email
        pass: '' // your app-specific password
    }
});

// Email sending function
async function sendWelcomeEmail(customerData) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: customerData.email,
        subject: 'Welcome to Savory Bites',
        html: `
            <h1>Welcome ${customerData.name}!</h1>
            <p>Thank you for registering with us. Here are your details:</p>
            <ul>
                <li><strong>Name:</strong> ${customerData.name}</li>
                <li><strong>Email:</strong> ${customerData.email}</li>
                <li><strong>Phone:</strong> ${customerData.phone}</li>
                <li><strong>Address:</strong> ${customerData.address || 'Not provided'}</li>
            </ul>
            <p> password is: ${customerData.password}</p>
            <p>Use this details to login to system.</p>
            <p>Best regards,<br>Savory Bites</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
}





// CRUD operations for Order
app.get('/api/orders', async (req, res) => {
    try {
      const customerId = req.query.customer; // Extract customer ID from query params
      const query = customerId ? { customer: customerId } : {};
      const orders = await Order.find(query).populate('customer').populate('items');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, totalAmount, status } = req.body;
        
        // Validate input
        if (!customer || !items || !Array.isArray(items) || items.length === 0 || totalAmount === undefined || !status) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        const order = new Order({
            customer,
            items,
            totalAmount,
            status
        });

        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
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
      const customerId = req.query.customer;
  
      // If a `customer` query parameter is provided, fetch reservations for that customer
      if (customerId) {
        const reservations = await Reservation.find({ customer: customerId });
        return res.json(reservations);
      }
  
      // If no `customer` query parameter, fetch all reservations and populate customer details
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
    const { supplier, date, totalAmount, status, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Items cannot be empty" });
    }

    try {
        const invoice = new Invoice({ supplier, date, totalAmount, status, items });
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

// Utility function for hashing passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. Customer Registration
app.post("/api/customers", async (req, res) => {
    try {
      const { name, email, phone, address, password } = req.body;
  
      // Check if the email is already registered
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered." });
      }
  
      // Create a new customer
      const newCustomer = new Customer({ name, email, phone, address, password });
      await newCustomer.save();
  
      return res.status(201).json({
        success: true,
        message: "Registration successful.",
        customer: newCustomer,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  });
  
  // 2. Customer Login
  app.post("/api/customers/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the customer by email
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found." });
      }
  
      // Check if the password matches
      if (customer.password !== password) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect password." });
      }
  
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        customer,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
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


