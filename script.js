// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('adamCornChocoCart')) || [];
        this.cartIcon = document.getElementById('cartIcon');
        this.cartCount = document.getElementById('cartCount');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
        this.closeCart = document.getElementById('closeCart');
        this.clearCartBtn = document.getElementById('clearCartBtn');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        
        this.init();
    }

    init() {
        this.updateCartUI();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Cart icon click
        this.cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });

        // Close cart
        this.closeCart.addEventListener('click', () => this.closeCartSidebar());
        this.cartOverlay.addEventListener('click', () => this.closeCartSidebar());

        // Clear cart
        this.clearCartBtn.addEventListener('click', () => this.clearCart());

        // Checkout
        this.checkoutBtn.addEventListener('click', () => this.checkout());

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = e.currentTarget.dataset.product;
                const price = parseFloat(e.currentTarget.dataset.price);
                const image = e.currentTarget.dataset.image;
                this.addToCart(product, price, image);
                
                // Add animation
                e.currentTarget.classList.add('added');
                setTimeout(() => {
                    e.currentTarget.classList.remove('added');
                }, 600);
            });
        });
    }

    addToCart(product, price, image) {
        const existingItem = this.cart.find(item => item.product === product);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                product,
                price,
                image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product} added to cart!`);
    }

    removeFromCart(product) {
        this.cart = this.cart.filter(item => item.product !== product);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(product, change) {
        const item = this.cart.find(item => item.product === product);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(product);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Cart cleared!');
        }
    }

    saveCart() {
        localStorage.setItem('adamCornChocoCart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        // Update cart items
        if (this.cart.length === 0) {
            this.cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <button class="btn btn-primary" onclick="shoppingCart.closeCartSidebar()">
                        <i class="fas fa-arrow-left"></i>
                        Continue Shopping
                    </button>
                </div>
            `;
        } else {
            this.cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.product}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.product}</div>
                        <div class="cart-item-price">RM${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="shoppingCart.updateQuantity('${item.product}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="shoppingCart.updateQuantity('${item.product}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item" onclick="shoppingCart.removeFromCart('${item.product}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotal.textContent = `RM${total.toFixed(2)}`;
    }

    openCart() {
        this.cartSidebar.classList.add('active');
        this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCartSidebar() {
        this.cartSidebar.classList.remove('active');
        this.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const items = this.cart.map(item => `${item.product} x${item.quantity}`).join('\n');
        
        // Open contact form with cart details
        this.closeCartSidebar();
        
        // Pre-fill the contact form
        setTimeout(() => {
            const productSelect = document.getElementById('product');
            const quantityField = document.getElementById('quantity');
            
            if (productSelect && quantityField) {
                productSelect.value = 'Mixed Order - ' + this.cart.length + ' items';
                quantityField.value = this.cart.reduce((sum, item) => sum + item.quantity, 0);
                
                document.getElementById('contact').scrollIntoView({
                    behavior: 'smooth'
                });
                
                this.showNotification('Cart details added to order form!');
            }
        }, 300);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            box-shadow: var(--shadow-medium);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Back to Top Button with Progress
class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.progressCircle = document.querySelector('.progress-circle-fill');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.updateProgress());
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        // Update progress circle
        const circumference = 2 * Math.PI * 18;
        const offset = circumference - (scrollPercent / 100) * circumference;
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Show/hide button
        if (scrollTop > 300) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Testimonials Slider
class TestimonialsSlider {
    constructor() {
        this.testimonials = document.querySelectorAll('.testimonial-card');
        this.currentTestimonial = 0;
        this.prevBtn = document.getElementById('prevTestimonial');
        this.nextBtn = document.getElementById('nextTestimonial');
        this.init();
    }

    init() {
        // Show first testimonial
        this.showTestimonial(0);
        
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prevTestimonial());
        this.nextBtn.addEventListener('click', () => this.nextTestimonial());
        
        // Auto-play testimonials
        this.startAutoPlay();
    }

    showTestimonial(index) {
        // Hide all testimonials
        this.testimonials.forEach((testimonial, i) => {
            testimonial.style.display = 'none';
            testimonial.classList.remove('active');
        });
        
        // Show current testimonial
        this.testimonials[index].style.display = 'block';
        this.testimonials[index].classList.add('active', 'fade-in');
        
        // Update buttons
        this.updateButtons();
    }

    nextTestimonial() {
        this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
        this.showTestimonial(this.currentTestimonial);
        this.resetAutoPlay();
    }

    prevTestimonial() {
        this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
        this.showTestimonial(this.currentTestimonial);
        this.resetAutoPlay();
    }

    updateButtons() {
        // Disable/enable buttons based on current testimonial
        if (this.testimonials.length <= 1) {
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
        } else {
            this.prevBtn.style.display = 'flex';
            this.nextBtn.style.display = 'flex';
        }
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextTestimonial();
        }, 5000); // Change every 5 seconds
    }

    resetAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.startAutoPlay();
    }
}

// Form Validation
class FormValidator {
    constructor() {
        this.orderForm = document.getElementById('orderForm');
        this.init();
    }

    init() {
        if (this.orderForm) {
            this.orderForm.addEventListener('submit', (e) => this.handleSubmit(e));
            this.addRealTimeValidation();
        }
    }

    addRealTimeValidation() {
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const productSelect = document.getElementById('product');
        const quantityInput = document.getElementById('quantity');

        // Name validation
        nameInput.addEventListener('blur', () => this.validateName(nameInput));
        nameInput.addEventListener('input', () => this.clearError(nameInput));

        // Phone validation
        phoneInput.addEventListener('blur', () => this.validatePhone(phoneInput));
        phoneInput.addEventListener('input', () => this.clearError(phoneInput));

        // Product validation
        productSelect.addEventListener('change', () => this.validateProduct(productSelect));

        // Quantity validation
        quantityInput.addEventListener('blur', () => this.validateQuantity(quantityInput));
        quantityInput.addEventListener('input', () => this.clearError(quantityInput));
    }

    validateName(input) {
        const name = input.value.trim();
        if (name.length < 2) {
            this.showError(input, 'Name must be at least 2 characters long');
            return false;
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            this.showError(input, 'Name should only contain letters and spaces');
            return false;
        }
        this.showSuccess(input);
        return true;
    }

    validatePhone(input) {
        const phone = input.value.trim();
        const malaysianPhoneRegex = /^(\+?60|0)(1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])-?[0-9]{7,8}$/;
        
        if (!malaysianPhoneRegex.test(phone)) {
            this.showError(input, 'Please enter a valid Malaysian phone number (e.g., 012-3456789)');
            return false;
        }
        this.showSuccess(input);
        return true;
    }

    validateProduct(input) {
        if (!input.value) {
            this.showError(input, 'Please select a product');
            return false;
        }
        this.showSuccess(input);
        return true;
    }

    validateQuantity(input) {
        const quantity = parseInt(input.value);
        if (!quantity || quantity < 1) {
            this.showError(input, 'Quantity must be at least 1');
            return false;
        }
        if (quantity > 100) {
            this.showError(input, 'Maximum quantity is 100');
            return false;
        }
        this.showSuccess(input);
        return true;
    }

    showError(input, message) {
        this.clearError(input);
        input.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }

    showSuccess(input) {
        this.clearError(input);
        input.classList.add('success');
    }

    clearError(input) {
        input.classList.remove('error', 'success');
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const productSelect = document.getElementById('product');
        const quantityInput = document.getElementById('quantity');
        
        // Validate all fields
        const isNameValid = this.validateName(nameInput);
        const isPhoneValid = this.validatePhone(phoneInput);
        const isProductValid = this.validateProduct(productSelect);
        const isQuantityValid = this.validateQuantity(quantityInput);
        
        if (isNameValid && isPhoneValid && isProductValid && isQuantityValid) {
            // Get form data
            const formData = new FormData(this.orderForm);
            const orderData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                product: formData.get('product'),
                quantity: formData.get('quantity')
            };
            
            // Show success message
            this.showOrderConfirmation(orderData);
            
            // Reset form
            this.orderForm.reset();
            this.clearAllValidationStates();
        }
    }

    clearAllValidationStates() {
        const inputs = this.orderForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    showOrderConfirmation(orderData) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: fadeInUp 0.3s ease;
        `;
        
        modalContent.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--success);">✅</div>
            <h3 style="color: var(--deep-brown); margin-bottom: 1rem;">Order Confirmed!</h3>
            <p style="color: var(--light-brown); margin-bottom: 1rem;">Thank you for your order, <strong>${orderData.name}</strong>!</p>
            <div style="background: var(--cream); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0.5rem 0;"><strong>Product:</strong> ${orderData.product}</p>
                <p style="margin: 0.5rem 0;"><strong>Quantity:</strong> ${orderData.quantity}</p>
                <p style="margin: 0.5rem 0;"><strong>Phone:</strong> ${orderData.phone}</p>
            </div>
            <p style="color: var(--light-brown); font-size: 0.9rem;">We will contact you soon to confirm your order details.</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 1.5rem;
                padding: 12px 25px;
                background: var(--gradient-1);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            ">Close</button>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }
}

// Initialize testimonials and form validation
let testimonialsSlider;
let formValidator;

document.addEventListener('DOMContentLoaded', () => {
    shoppingCart = new ShoppingCart();
    backToTop = new BackToTop();
    testimonialsSlider = new TestimonialsSlider();
    formValidator = new FormValidator();
});
// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#FFFFFF';
        navbar.style.backdropFilter = 'none';
    }
});

// Product Order Buttons
const orderButtons = document.querySelectorAll('.order-btn');
const productSelect = document.getElementById('product');

orderButtons.forEach(button => {
    button.addEventListener('click', () => {
        const productName = button.getAttribute('data-product');
        productSelect.value = productName;
        
        // Scroll to contact form
        document.getElementById('contact').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Highlight the form
        const contactForm = document.querySelector('.contact-form');
        contactForm.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            contactForm.style.animation = '';
        }, 1000);
    });
});

// Form Submission
const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(orderForm);
    const orderData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        product: formData.get('product'),
        quantity: formData.get('quantity')
    };
    
    // Show success message
    showOrderConfirmation(orderData);
    
    // Reset form
    orderForm.reset();
});

// Order Confirmation Modal
function showOrderConfirmation(orderData) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: slideInUp 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
        <h3 style="color: #3E1F00; margin-bottom: 1rem;">Order Confirmed!</h3>
        <p style="color: #5D4037; margin-bottom: 1rem;">Thank you for your order, <strong>${orderData.name}</strong>!</p>
        <div style="background: #FFF8E1; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <p style="margin: 0.5rem 0;"><strong>Product:</strong> ${orderData.product}</p>
            <p style="margin: 0.5rem 0;"><strong>Quantity:</strong> ${orderData.quantity}</p>
            <p style="margin: 0.5rem 0;"><strong>Phone:</strong> ${orderData.phone}</p>
        </div>
        <p style="color: #5D4037; font-size: 0.9rem;">We will contact you soon to confirm your order details.</p>
        <button onclick="closeModal()" style="
            margin-top: 1.5rem;
            padding: 10px 25px;
            background: #FFC107;
            color: #3E1F00;
            border: none;
            border-radius: 25px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Close</button>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.animation = 'fadeIn 0.5s ease';
        });
    });
});

// Active navigation highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});
