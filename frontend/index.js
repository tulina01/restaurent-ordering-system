
let cart = [];
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
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

  items.forEach((item) => {
    const col = document.createElement("div");
    col.classList.add("col-12", "mb-4");
    col.innerHTML = `
              <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                  <div class="row g-0">
                      <div class="col-4">
                          <img src="${
                            item.imageUrl
                          }" class="img-fluid rounded-start" alt="${
      item.name
    }" style="height: 100%; object-fit: cover;">
                      </div>
                      <div class="col-8">
                          <div class="card-body">
                              <h5 class="card-title">${item.name}</h5>
                              <p class="card-text small">${
                                item.description
                              }</p>
                              <div class="d-flex justify-content-between align-items-center">
                                  <span class="fw-bold">$${item.price.toFixed(
                                    2
                                  )}</span>
                                  <button class="btn btn-sm btn-outline-primary add-to-cart" data-item='${JSON.stringify(
                                    item
                                  )}'>Add to Cart</button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
    categorySection.appendChild(col);
  });

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
        updateUserGreeting();
        updatePlaceOrderButton();
        bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        ).hide();
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    });
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

function handlePlaceOrder() {
  if (!currentUser) {
    alert("Please register with the system to place an order.");
    return;
  }

  // Implement order placement logic here
  console.log("Placing order for user:", currentUser.name);
  console.log("Order items:", cart);

  // Clear the cart after placing the order
  cart = [];
  updateCart();
  alert("Order placed successfully!");
}

function generatePassword() {
  const password = Math.random().toString(36).slice(-8);
  document.getElementById("registerPassword").value = password;
}