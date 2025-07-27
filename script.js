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

// Global variables
let products = [];
const cart = [];

// Initialize the app
function init() {
  fetchProducts();
  setupEventListeners();
}

// Fetch products from API
function fetchProducts() {
  fetch('products.json')
    .then(res => res.json())
    .then(data => {
      products = data;
      displayProducts(data);
    })
    .catch(err => console.error('Error fetching products:', err));
}

// Display products in the main area
function displayProducts(productsToDisplay) {
  mainDiv.innerHTML = '';
  
  if (productsToDisplay.length === 0) {
    mainDiv.innerHTML = '<div class="no-products">No products found. Try a different search.</div>';
    return;
  }
  
  productsToDisplay.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product';
    
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" loading="lazy" />
      <h3>${product.title}</h3>
      <p class="price">₹${product.price.toFixed(2)}</p>
      <div class="buttons">
        <button class="details-btn" onclick="showDetails(${product.id})">
          <i class="fas fa-eye"></i> Details
        </button>
        <button class="cart-btn" onclick="addToCart(${product.id})">
          <i class="fas fa-cart-plus"></i> Add
        </button>
      </div>
    `;
    
    mainDiv.appendChild(card);
  });
}

// Show product details in overlay
function showDetails(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
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

// Add product to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  updateCart();
  
  // Show notification
  showNotification(`${product.title} added to cart!`);
}

// Update cart display
function updateCart() {
  // Update cart count
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  // Update cart items list
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
  
  // Update total price
  cartTotal.textContent = totalPrice.toFixed(2);
}

// Update cart item quantity
function updateCartItem(productId, action) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  if (action === 'increase') {
    item.quantity++;
  } else if (action === 'decrease' && item.quantity > 1) {
    item.quantity--;
  }
  
  updateCart();
}

// Remove item from cart
function removeCartItem(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    updateCart();
  }
}

// Open overlay
function openOverlay(id) {
  const overlay = document.getElementById(id);
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Close overlay
function closeOverlay(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    displayProducts(filtered);
  });
  
  // Clear search
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    displayProducts(products);
  });
  
  // Search on Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
  
  // Open cart overlay
  cartBtn.addEventListener('click', () => {
    openOverlay('cartOverlay');
  });
  
  // Filter products by category
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      if (category === 'all') {
        displayProducts(products);
      } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
      }
    });
  });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);