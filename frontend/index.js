let cart = [];
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {

  const savedUser = getCookie("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUserGreeting();
    updatePlaceOrderButton();
    updateAuthButtons();
    updateOrderHistory();
    updateReservationHistory();
  }

  fetchMenuItemsByCategory("Starters");
  fetchMenuItemsByCategory("Main Course");
  fetchMenuItemsByCategory("Desserts");
  fetchMenuItemsByCategory("Beverages");

  document
    .getElementById("loginForm")
    .addEventListener("submit", handleLogin);
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);
  document
    .getElementById("placeOrderBtn")
    .addEventListener("click", handlePlaceOrder);
  document
    .getElementById("generatePassword")
    .addEventListener("click", generatePassword);
    document
    .getElementById("logoutBtn")
    .addEventListener("click", handleLogout);
    document
    .getElementById("reservationForm")
    .addEventListener("submit", handleReservation);
});

function fetchMenuItemsByCategory(category) {
  fetch("http://localhost:3000/api/menu-items")
    .then((response) => response.json())
    .then((items) => {
      const categoryItems = items.filter(
        (item) => item.category === category
      );
      renderCategory(category, categoryItems);
    })
    .catch((error) => console.error("Error fetching menu items:", error));
}

function renderCategory(categoryName, items) {
  const categorySection = document.querySelector(
      `#${categoryName.replace(/\s+/g, "").toLowerCase()}`
  );
  categorySection.innerHTML = "";

  if (items.length === 0) {
      categorySection.innerHTML = `<p class="text-center text-muted my-4">No items available in this category.</p>`;
      return;
  }

  const row = document.createElement("div");
  row.classList.add("row", "row-cols-1", "row-cols-md-3", "g-3");

  items.forEach((item) => {
      const col = document.createElement("div");
      col.classList.add("col");
      col.innerHTML = `
          <div class="card h-100 menu-card shadow-sm">
              <img src="${item.imageUrl}" class="card-img-top menu-card-img" alt="${item.name}" style="object-fit: cover; height: 200px;">
              <div class="card-body d-flex flex-column p-3">
                  <div class="mb-2">
                      <h6 class="card-title mb-1 fw-bold">${item.name}</h6>
                      <p class="card-text small text-muted mb-2 flex-grow-1" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.description}</p>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-auto">
                      <span class="fw-bold">$${item.price.toFixed(2)}</span>
                      <button class="btn btn-sm btn-outline-primary add-to-cart" data-item='${JSON.stringify(item)}'>
                          Add to Cart
                      </button>
                  </div>
              </div>
          </div>
      `;
      row.appendChild(col);
  });

  categorySection.appendChild(row);

  categorySection.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", function () {
          const item = JSON.parse(this.getAttribute("data-item"));
          addToCart(item);
      });
  });
}

function addToCart(item) {
  const existingItem = cart.find((cartItem) => cartItem._id === item._id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    cartItems.innerHTML += `
              <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                      <h6 class="mb-0">${item.name}</h6>
                      <small class="text-muted">$${item.price.toFixed(
                        2
                      )} x ${item.quantity}</small>
                  </div>
                  <div>
                      <span class="me-2">$${itemTotal.toFixed(2)}</span>
                      <button class="btn btn-sm btn-outline-danger remove-from-cart" data-id="${
                        item._id
                      }">Remove</button>
                  </div>
              </div>
          `;
  });

  cartCount.textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  cartTotal.textContent = total.toFixed(2);

  cartItems.querySelectorAll(".remove-from-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const itemId = this.getAttribute("data-id");
      removeFromCart(itemId);
    });
  });

  updatePlaceOrderButton();
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item._id !== itemId);
  updateCart();
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  fetch("http://localhost:3000/api/customers/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        currentUser = data.customer;
        setCookie("currentUser", JSON.stringify(currentUser), 7);
        updateUserGreeting();
        updatePlaceOrderButton();
        updateAuthButtons();
        updateOrderHistory();
        updateReservationHistory();
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
          bootstrap.Modal.getInstance(loginModal).hide();
        }
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    });
}

function handleLogout() {
  currentUser = null;
  deleteCookie("currentUser");
  updateUserGreeting();
  updatePlaceOrderButton();
  updateAuthButtons();
  updateReservationHistory();
  alert("You have been logged out.");
}


function updateAuthButtons() {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}


function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const phone = document.getElementById("registerPhone").value;
  const address = document.getElementById("registerAddress").value;
  const password = document.getElementById("registerPassword").value;

  fetch("http://localhost:3000/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, phone, address, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert("Registration successful. Please log in.");
        bootstrap.Modal.getInstance(
          document.getElementById("registerModal")
        ).hide();
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Registration error:", error);
      alert("An error occurred during registration. Please try again.");
    });
}

function updateUserGreeting() {
  const userGreeting = document.getElementById("userGreeting");
  if (currentUser) {
    userGreeting.textContent = `Welcome, ${currentUser.name}!`;
  } else {
    userGreeting.textContent = "";
  }
}

function updatePlaceOrderButton() {
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (currentUser) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = "Place Order";
  } else {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Please register to place an order";
  }
}


// code for place oder functionality and view order history functionality start in here
function handlePlaceOrder() {
  if (!currentUser) {
    alert("Please log in to place an order.");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before placing an order.");
    return;
  }

  const orderData = {
    customer: currentUser._id,
    items: cart.map(item => item._id), // Change this line
    totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
    status: "Pending"
  };

  console.log("Sending order data:", orderData); // Add this line for debugging

  fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then((data) => {
      alert("Order placed successfully!");
      cart = [];
      updateCart();
      updateOrderHistory();
    })
    .catch((error) => {
      console.error("Error placing order:", error);
      alert("An error occurred while placing your order: " + (error.message || "Please try again."));
    });
}




function updateOrderHistory() {
  if (!currentUser) return;

  // Fetch orders for the current user
  fetch(`http://localhost:3000/api/orders?customer=${currentUser._id}`)
    .then((response) => response.json())
    .then((orders) => {
      const orderHistoryElement = document.getElementById("orderHistory");
      orderHistoryElement.innerHTML = "";

      // Check if there are any orders
      if (orders.length === 0) {
        orderHistoryElement.innerHTML = "<p>No order history available.</p>";
        return;
      }

      // Create a table for displaying order history
      const table = document.createElement("table");
      table.className = "table table-striped";

      // Table header
      table.innerHTML = `
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      `;

      const tbody = table.querySelector("tbody");

      // Populate table rows with order data
      orders.forEach((order) => {
        const row = document.createElement("tr");

        // Get item names (assumes `order.items` is populated with item details)
        const itemNames = order.items.map(item => item.name).join(", ");

        row.innerHTML = `
          <td>Order #${order._id.slice(-6)}</td>
          <td>${itemNames}</td>
          <td>$${order.totalAmount.toFixed(2)}</td>
          <td>${order.status}</td>
        `;

        tbody.appendChild(row);
      });

      // Append the table to the order history element
      orderHistoryElement.appendChild(table);
    })
    .catch((error) => {
      console.error("Error fetching order history:", error);
      document.getElementById("orderHistory").innerHTML = "<p>Failed to load order history. Please try again later.</p>";
    });
}
// code for place oder functionality and view order history functionality end  here


function generatePassword() {
  const password = Math.random().toString(36).slice(-8);
  document.getElementById("registerPassword").value = password;
}


// Cookie Utility Functions
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}





// reservation funtionality start in here

// Navigation Toggle Logic
const menuNavBtn = document.getElementById('menuNavBtn');
const reservationNavBtn = document.getElementById('reservationNavBtn');
const menuSection = document.getElementById('menuSection');
const reservationSection = document.getElementById('reservationSection');

// Navigation Button Event Listeners
function resetNavButtons() {
    [menuNavBtn, reservationNavBtn].forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    });
}

function hideAllSections() {
    [menuSection, reservationSection].forEach(section => {
        section.classList.remove('active');
    });
}

menuNavBtn.addEventListener('click', () => {
    resetNavButtons();
    hideAllSections();
    menuNavBtn.classList.remove('btn-outline-primary');
    menuNavBtn.classList.add('btn-primary');
    menuSection.classList.add('active');
});

reservationNavBtn.addEventListener('click', () => {
    resetNavButtons();
    hideAllSections();
    reservationNavBtn.classList.remove('btn-outline-primary');
    reservationNavBtn.classList.add('btn-primary');
    reservationSection.classList.add('active');
});


// Add this function at the beginning of your script
function safeQuerySelector(selector) {
  return document.querySelector(selector) || { style: {} };
}

// Update the handleReservation function
function handleReservation(event) {
  event.preventDefault();
  if (!currentUser) {
    alert("Please log in to make a reservation.");
    return;
  }

  const date = document.getElementById("reservationDate").value;
  const time = document.getElementById("reservationTime").value;
  const partySize = document.getElementById("partySize").value;

  const reservationData = {
    customer: currentUser._id,  
    date: date,
    time: time,
    partySize: parseInt(partySize),
    status: "Pending"
  };

  fetch("http://localhost:3000/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservationData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then((data) => {
      alert("Reservation made successfully!");
      document.getElementById("reservationForm").reset();
      updateReservationHistory();
    })
    .catch((error) => {
      console.error("Error making reservation:", error);
      alert("An error occurred while making your reservation: " + (error.message || "Please try again."));
    });
}

// Update the updateReservationHistory function
function updateReservationHistory() {
  if (!currentUser) {
    console.log("No user logged in. Cannot fetch reservation history.");
    return;
  }

  fetch(`http://localhost:3000/api/reservations?customer=${currentUser._id}`)
    .then((response) => response.json())
    .then((reservations) => {
      const reservationHistoryElement = safeQuerySelector("#reservationHistory");
      const reservationHistoryCount = safeQuerySelector("#reservationHistoryCount");
      const emptyReservationHistoryMessage = safeQuerySelector("#emptyReservationHistoryMessage");

      reservationHistoryCount.textContent = reservations.length;

      if (reservations.length === 0) {
        emptyReservationHistoryMessage.style.display = "block";
        reservationHistoryElement.innerHTML = "";
        return;
      }

      emptyReservationHistoryMessage.style.display = "none";
      
      const table = document.createElement("table");
      table.className = "table table-hover";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Party Size</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      `;

      const tbody = table.querySelector("tbody");

      reservations.forEach((reservation) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(reservation.date).toLocaleDateString()}</td>
          <td>${reservation.time}</td>
          <td>${reservation.partySize}</td>
          <td><span class="badge bg-${getStatusColor(reservation.status)}">${reservation.status}</span></td>
        `;
        tbody.appendChild(row);
      });

      reservationHistoryElement.innerHTML = "";
      reservationHistoryElement.appendChild(table);
    })
    .catch((error) => {
      console.error("Error fetching reservation history:", error);
      safeQuerySelector("#reservationHistory").innerHTML = "<p>Failed to load reservation history. Please try again later.</p>";
    });
}


function getStatusColor(status) {
  switch (status) {
    case "Confirmed":
      return "success";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "danger";
    default:
      return "secondary";
  }
}