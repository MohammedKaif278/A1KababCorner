// A1 Kabab Corner Combined Script with WhatsApp Checkout, Cart Persistence, and Accessibility

// DOM Elements
const mainDiv = document.getElementById('main');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearch = document.getElementById('clearSearch');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const filterBtns = document.querySelectorAll('.filter-btn');

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function init() {
  fetchProducts();
  setupEventListeners();
  updateCart();
}

function fetchProducts() {
  fetch('products.json')
    .then(res => res.json())
    .then(data => {
      products = data.filter(isValidProduct);
      displayProducts(products);
    })
    .catch(err => console.error('Error fetching products:', err));
}

function isValidProduct(p) {
  return p && p.id && p.title && p.price != null && p.image;
}

function displayProducts(productsToDisplay) {
  mainDiv.innerHTML = '';

  if (productsToDisplay.length === 0) {
    mainDiv.innerHTML = '<div class="no-products">No products found. Try a different search.</div>';
    return;
  }

  productsToDisplay.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product';

    const image = product.image || 'fallback.jpg';
    const title = product.title || 'No title';
    const price = product.price != null ? `₹${product.price.toFixed(2)}` : 'Price unavailable';

    card.innerHTML = `
      <img src="${image}" alt="${title}" loading="lazy" />
      <h3>${title}</h3>
      <p class="price">${price}</p>
      <div class="buttons">
        <button class="details-btn" onclick="showDetails(${product.id})" aria-label="View details for ${title}">
          <i class="fas fa-eye"></i> Details
        </button>
        <button class="cart-btn" onclick="addToCart(${product.id})" aria-label="Add ${title} to cart">
          <i class="fas fa-cart-plus"></i> Add
        </button>
      </div>
    `;

    mainDiv.appendChild(card);
  });
}

function showDetails(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  document.title = `${product.title} | A1 Kabab Corner`;
  setMetaTags(product);
  injectProductJSONLD(product);

  const detailsDiv = document.getElementById('detailsContent');
  detailsDiv.innerHTML = `
    <div class="product-details">
      <img src="${product.image}" alt="${product.title}" />
      <div class="product-info">
        <h2>${product.title}</h2>
        <span class="category">${product.category}</span>
        <p class="price">₹${product.price.toFixed(2)}</p>
        <p class="description">${product.description}</p>
        <button class="cart-btn" onclick="addToCart(${product.id})">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
  openOverlay('detailsOverlay');
}

function setMetaTags(product) {
  document.querySelector("meta[name='description']")?.remove();
  document.querySelector("meta[name='keywords']")?.remove();

  const desc = document.createElement('meta');
  desc.name = 'description';
  desc.content = product.description || 'Delicious items available at A1 Kabab Corner';
  document.head.appendChild(desc);

  const keywords = document.createElement('meta');
  keywords.name = 'keywords';
  keywords.content = `${product.title}, kabab, food, tandoori`;
  document.head.appendChild(keywords);
}

function injectProductJSONLD(product) {
  const existing = document.getElementById('jsonld');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'jsonld';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: [product.image],
    description: product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock'
    }
  });
  document.head.appendChild(script);
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showNotification(`${product.title} added to cart!`);
}

function updateCart() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = '0.00';
    return;
  }

  let totalPrice = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <p class="cart-item-price">₹${item.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateCartItem(${item.id}, 'increase')"><i class="fas fa-plus"></i></button>
        <span>${item.quantity}</span>
        <button onclick="updateCartItem(${item.id}, 'decrease')"><i class="fas fa-minus"></i></button>
        <button onclick="removeCartItem(${item.id})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });

  cartTotal.textContent = totalPrice.toFixed(2);
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartItem(productId, action) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  if (action === 'increase') item.quantity++;
  else if (action === 'decrease' && item.quantity > 1) item.quantity--;

  updateCart();
}

function removeCartItem(productId) {
  const index = cart.findIndex(i => i.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    updateCart();
  }
}

function openOverlay(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = 'auto';
}

function showNotification(msg) {
  const note = document.createElement('div');
  note.className = 'notification';
  note.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  document.body.appendChild(note);

  setTimeout(() => note.classList.add('show'), 10);
  setTimeout(() => {
    note.classList.remove('show');
    setTimeout(() => note.remove(), 300);
  }, 3000);
}

function setupEventListeners() {
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = products.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    displayProducts(filtered);
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    displayProducts(products);
  });

  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchBtn.click();
  });

  cartBtn.addEventListener('click', () => openOverlay('cartOverlay'));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      displayProducts(cat === 'all' ? products : products.filter(p => p.category === cat));
    });
  });
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.checkout-btn').addEventListener('click', handleCheckout);
});

function handleCheckout() {
  if (!cart.length) return alert('Cart is empty!');

  const name = prompt("Enter your name:");
  const phone = prompt("Enter your phone number:");
  const address = prompt("Enter your delivery address:");
  const notes = prompt("Any notes for the order? (Optional):") || 'None';

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  let msg = `🛒 *A1 Kabab Corner*\n👤 Name: ${name}\n📞 Phone: ${phone}\n🏠 Address: ${address}\n📍 Map: ${mapsLink}\n\n`;

  cart.forEach(i => {
    msg += `• ${i.title} x ${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}\n`;
  });

  msg += `\n📝 Notes: ${notes}\n💰 Total: ₹${cart.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)}`;

  window.open(`https://wa.me/918956507490?text=${encodeURIComponent(msg)}`, '_blank');

  cart.length = 0;
  updateCart();
  localStorage.removeItem('cart');
  alert('Thank you! Order sent via WhatsApp');
}
