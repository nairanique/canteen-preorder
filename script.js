// Sample menu data
const menuData = [
    {
        id: 1,
        name: "Bottled Water (Small)",
        category: "beverages",
        price: 15,
        emoji: "💧"
    },
    {
        id: 2,
        name: "Cream-O",
        category: "snacks",
        price: 15,
        emoji: "🍪"
    },
    {
        id: 3,
        name: "Skyflakes",
        category: "snacks",
        price: 15,
        emoji: "🍞"
];

// Cart array
let cart = [];
let orders = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    setupNavigation();
    setupPaymentToggle();
    loadCartFromStorage();
    loadOrdersFromStorage();
    updateCartCount();
});

// Load menu items
function loadMenuItems(filter = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === filter);

    filteredItems.forEach(item => {
        const menuItem = createMenuItemElement(item);
        menuGrid.appendChild(menuItem);
    });
}

// Create menu item element
function createMenuItemElement(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <div class="menu-item-image">${item.emoji}</div>
        <div class="menu-item-content">
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-description">${item.description}</div>
            <div class="menu-item-category">${item.category.toUpperCase()}</div>
            <div class="menu-item-price">₹${item.price}</div>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="decreaseQuantity(this)">−</button>
                <input type="number" class="quantity-input" value="1" min="1">
                <button class="quantity-btn" onclick="increaseQuantity(this)">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id}, this)">Add to Cart</button>
        </div>
    `;
    return div;
}

// Increase quantity
function increaseQuantity(btn) {
    const input = btn.previousElementSibling;
    input.value = parseInt(input.value) + 1;
}

// Decrease quantity
function decreaseQuantity(btn) {
    const input = btn.nextElementSibling;
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Add to cart
function addToCart(itemId, btn) {
    const quantityInput = btn.parentElement.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);
    const item = menuData.find(m => m.id === itemId);

    const existingItem = cart.find(c => c.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...item,
            quantity: quantity
        });
    }

    saveCartToStorage();
    updateCartCount();
    quantityInput.value = 1;
    
    // Show feedback
    btn.textContent = '✓ Added!';
    btn.style.backgroundColor = 'var(--success-color)';
    setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.style.backgroundColor = '';
    }, 1500);
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-message">Your cart is empty</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} each</div>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div style="font-weight: 600; min-width: 70px; text-align: right;">₹${item.price * item.quantity}</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');
    }

    updateCartSummary();
}

// Update quantity in cart
function updateQuantity(itemId, change) {
    const item = cart.find(c => c.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    saveCartToStorage();
    updateCartDisplay();
    updateCartCount();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Setup navigation
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Remove active from all sections
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

            // Show selected section
            const section = btn.dataset.section;
            const sectionElement = document.getElementById(section);
            sectionElement.classList.add('active');

            if (section === 'cart') {
                updateCartDisplay();
            } else if (section === 'orders') {
                displayOrders();
            } else if (section === 'menu') {
                loadMenuItems();
            }
        });
    });

    // Setup filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMenuItems(btn.dataset.filter);
        });
    });
}

// Setup payment method toggle
function setupPaymentToggle() {
    const radioButtons = document.querySelectorAll('input[name="payment"]');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            document.getElementById('upiDetails').classList.add('hidden');
            document.getElementById('cardDetails').classList.add('hidden');

            if (radio.value === 'upi') {
                document.getElementById('upiDetails').classList.remove('hidden');
            } else if (radio.value === 'card') {
                document.getElementById('cardDetails').classList.remove('hidden');
            }
        });
    });
}

// Generate UPI link
function generateUPILink() {
    const upiId = document.getElementById('upiId').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = total * 0.05;
    const finalAmount = total + tax;

    if (!upiId) {
        alert('Please enter your UPI ID');
        return;
    }

    const upiLink = `upi://pay?pa=${upiId}&pn=School%20Canteen&am=${finalAmount.toFixed(2)}&tn=Pre-Order%20Payment`;
    alert('UPI Link Generated! Your payment link:\n' + upiLink + '\n\nThis will open your UPI app.');
    
    // In a real app, you would open the UPI link
    window.location.href = upiLink;
}

// Validate form
function validateForm() {
    const studentName = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();
    const pickupTime = document.getElementById('pickupTime').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (!studentName) {
        alert('Please enter your name');
        return false;
    }

    if (!studentClass) {
        alert('Please enter your class');
        return false;
    }

    if (!pickupTime) {
        alert('Please select a pickup time');
        return false;
    }

    if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upiId').value.trim();
        if (!upiId) {
            alert('Please enter your UPI ID');
            return false;
        }
    }

    if (paymentMethod === 'card') {
        const cardName = document.getElementById('cardName').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardExpiry = document.getElementById('cardExpiry').value.trim();
        const cardCVV = document.getElementById('cardCVV').value.trim();

        if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
            alert('Please fill in all card details');
            return false;
        }

        if (cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Card number must be 16 digits');
            return false;
        }

        if (cardCVV.length !== 3) {
            alert('CVV must be 3 digits');
            return false;
        }
    }

    return true;
}

// Place order
function placeOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    if (!validateForm()) {
        return;
    }

    const studentName = document.getElementById('studentName').value;
    const studentClass = document.getElementById('studentClass').value;
    const pickupTime = document.getElementById('pickupTime').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const orderId = 'ORD' + Date.now();
    
    const order = {
        id: orderId,
        studentName,
        studentClass,
        pickupTime,
        paymentMethod,
        items: [...cart],
        subtotal,
        tax,
        total,
        status: 'pending',
        date: new Date().toLocaleString(),
        timestamp: Date.now()
    };

    orders.push(order);
    saveOrdersToStorage();

    // Show confirmation
    showConfirmation(order);

    // Reset cart and form
    cart = [];
    saveCartToStorage();
    updateCartCount();
    updateCartDisplay();

    // Reset form
    document.getElementById('studentName').value = '';
    document.getElementById('studentClass').value = '';
    document.getElementById('pickupTime').value = '';
    document.getElementById('upiId').value = '';
    document.getElementById('cardName').value = '';
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCVV').value = '';
}

// Show confirmation modal
function showConfirmation(order) {
    document.getElementById('orderId').textContent = order.id;
    document.getElementById('confirmPickupTime').textContent = order.pickupTime;
    document.getElementById('confirmTotal').textContent = `₹${order.total.toFixed(2)}`;
    document.getElementById('confirmPayment').textContent = 
        order.paymentMethod === 'cash' ? 'Cash (at pickup)' :
        order.paymentMethod === 'upi' ? 'UPI' : 'Card';

    document.getElementById('confirmationModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('confirmationModal').classList.add('hidden');
    goToMenu();
}

// Navigate to menu
function goToMenu() {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-section="menu"]').classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('menu').classList.add('active');
    loadMenuItems();
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('ordersList');

    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="empty-message">No orders yet</p>';
        return;
    }

    // Sort orders by newest first
    const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

    ordersList.innerHTML = sortedOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-details-list">
                <div class="order-detail-item">
                    <span><strong>Name:</strong></span>
                    <span>${order.studentName}</span>
                </div>
                <div class="order-detail-item">
                    <span><strong>Class:</strong></span>
                    <span>${order.studentClass}</span>
                </div>
                <div class="order-detail-item">
                    <span><strong>Pickup Time:</strong></span>
                    <span>${order.pickupTime}</span>
                </div>
                <div class="order-detail-item">
                    <span><strong>Payment:</strong></span>
                    <span>${order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod === 'upi' ? 'UPI' : 'Card'}</span>
                </div>
                <div class="order-detail-item">
                    <span><strong>Ordered:</strong></span>
                    <span>${order.date}</span>
                </div>
            </div>
            <div class="order-items-list">
                <h4>Items Ordered</h4>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-detail-item" style="border-top: 2px solid var(--primary-red); padding-top: 1rem; margin-top: 0.5rem;">
                <span><strong>Total:</strong></span>
                <span style="color: var(--primary-red); font-weight: 700;">₹${order.total.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('canteenCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem('canteenCart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartCount();
    }
}

// Save orders to localStorage
function saveOrdersToStorage() {
    localStorage.setItem('canteenOrders', JSON.stringify(orders));
}

// Load orders from localStorage
function loadOrdersFromStorage() {
    const saved = localStorage.getItem('canteenOrders');
    if (saved) {
        orders = JSON.parse(saved);
    }
}

// Format card number with spaces
document.addEventListener('DOMContentLoaded', () => {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    const cardCVVInput = document.getElementById('cardCVV');
    if (cardCVVInput) {
        cardCVVInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
        });
    }
});
