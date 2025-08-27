// ------------------- INITIAL SETUP -------------------

// Load cart from localStorage or initialize empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let shippingCost = 100;
let promoDiscount = 0;
const freeShippingThreshold = 1600;

const cartItemsEl = document.getElementById("cart-items");
const miniCartEl = document.getElementById("mini-cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const freeShipProgressEl = document.getElementById("free-ship-progress");
const promoInput = document.getElementById("promo-code");
const applyPromoBtn = document.getElementById("apply-promo");

const miniCartContainer = document.getElementById("mini-cart");
const closeMiniCartBtn = document.getElementById("close-mini-cart");

// ------------------- CART FUNCTIONS -------------------

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  miniCartEl.innerHTML = "";

  cart.forEach(item => {
    // Full cart
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="item-details">
        <h3>${item.name}</h3>
        <p>Flavor: ${item.flavor}</p>
        <p>R${item.price} each</p>
        <div class="quantity">
          <button onclick="changeQty('${item.id}', '${item.flavor}', -1)">−</button>
          <input type="number" value="${item.qty}" min="1" 
                 onchange="setQty('${item.id}', '${item.flavor}', this.value)">
          <button onclick="changeQty('${item.id}', '${item.flavor}', 1)">+</button>
        </div>
        <button onclick="removeItem('${item.id}', '${item.flavor}')">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(div);

    // Mini cart
    const miniDiv = document.createElement("div");
    miniDiv.classList.add("mini-cart-item");
    miniDiv.innerHTML = `
      <p>${item.name} (${item.flavor}) x ${item.qty} - R${(item.price * item.qty).toFixed(2)}</p>
    `;
    miniCartEl.appendChild(miniDiv);
  });

  updateTotals();
  saveCart();
}

function changeQty(id, flavor, delta) {
  const item = cart.find(i => i.id === id && i.flavor === flavor);
  if (item) {
    item.qty += delta;
    if (item.qty < 1) item.qty = 1;
    renderCart();
  }
}

function setQty(id, flavor, qty) {
  const item = cart.find(i => i.id === id && i.flavor === flavor);
  if (item) {
    item.qty = parseInt(qty);
    if (item.qty < 1) item.qty = 1;
    renderCart();
  }
}

function removeItem(id, flavor) {
  cart = cart.filter(i => !(i.id === id && i.flavor === flavor));
  renderCart();
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id && i.flavor === product.flavor);
  if (existing) {
    existing.qty += product.qty;
  } else {
    cart.push(product);
  }
  renderCart();
}

// ------------------- PROMO -------------------

function applyPromo() {
  const code = promoInput.value.trim().toUpperCase();
  if (code === "SHISHA10") {
    promoDiscount = 0.1;
  } else {
    promoDiscount = 0;
  }
  updateTotals();
}

// ------------------- TOTALS -------------------

function updateTotals() {
  let subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  let discount = subtotal * promoDiscount;
  let tax = (subtotal - discount) * 0.05; // 5% tax
  let total = subtotal - discount + tax + shippingCost;

  subtotalEl.textContent = `R${(subtotal - discount).toFixed(2)}`;
  shippingEl.textContent = `R${shippingCost}`;
  taxEl.textContent = `R${tax.toFixed(2)}`;
  totalEl.textContent = `R${total.toFixed(2)}`;

  // Free shipping progress
  let progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  freeShipProgressEl.style.setProperty("--progress", progressPercent + "%");
  freeShipProgressEl.textContent =
    subtotal >= freeShippingThreshold
      ? "Free shipping!"
      : `R${freeShippingThreshold - subtotal} to free shipping`;
}

// ------------------- MINI CART -------------------

function openMiniCart() {
  miniCartContainer.classList.add("open");
}

function closeMiniCart() {
  miniCartContainer.classList.remove("open");
}

closeMiniCartBtn.addEventListener("click", closeMiniCart);

// ------------------- INIT -------------------

applyPromoBtn.addEventListener("click", applyPromo);

// Expose addToCart globally so product pages can use it
window.addToCart = addToCart;

renderCart();

// Hook up product buttons
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const product = {
        id: button.dataset.id, // ✅ consistent ID
        name: button.dataset.name,
        flavor: button.dataset.flavor || "Default",
        price: parseFloat(button.dataset.price),
        img: button.dataset.img,
        qty: 1
      };
      addToCart(product);
    });
  });
});