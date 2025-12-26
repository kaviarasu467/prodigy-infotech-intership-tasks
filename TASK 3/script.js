const products = [
  {
    id: 1,
    name: "HP 15s, 12th Gen Intel Core i3-1215U Laptop (8GB DDR4, 512GB SSD) Anti-Glare, 15.6/39.6cm,FHD, Win 11, MS Office 21, Silver, 1.69kg, Intel UHD Graphics, HD Camera, Dual Speakers",
    price: 55000,
    image: "https://m.media-amazon.com/images/I/71+gQ9gOTuL._SX679_.jpg"
  },
  {
    id: 2,
    name: "Headphones boAt Rockerz 450",
    price: 1500,
    image: "https://m.media-amazon.com/images/I/31ztpzzaDSL._SX300_SY300_QL70_FMwebp_.jpg"
  },
  {
    id: 3,
    name: "Xiaomi 14 (Black, 12GB RAM, 512GB Storage)",
    price: 60000,
    image: "https://m.media-amazon.com/images/I/714PYaZXuiL._SX679_.jpg"
  },
  {
    id: 4,
    name: "Campus Men Roar Sneakers",
    price: 2000,
    image: "https://m.media-amazon.com/images/I/612p45SuDzL._SY695_.jpg"
  },
  {
    id: 5,
    name: "ZEBRONICS Wireless Gaming Mouse",
    price: 250,
    image: "https://m.media-amazon.com/images/I/61K2ZX6suPL._AC_UY327_FMwebp_QL65_.jpg"
  },
  {
    id: 6,
    name: "Die-Cast Metal Car Toy",
    price: 1939,
    image: "https://m.media-amazon.com/images/I/51ckU5VK+iL._SX522_.jpg"
  },
  {
    id: 7,
    name: "OLEVS Men's Business Watch",
    price: 4000,
    image: "https://m.media-amazon.com/images/I/61JDO9NNOiL._SX679_.jpg"
  },
  {
    id: 8,
    name: "Skmei New Car Wheel Watch",
    price: 3210,
    image: "https://m.media-amazon.com/images/I/515HYYdZydL.jpg"
  },
  {
    id: 9,
    name: "Fastrack Limitless Glide X Smart Watch",
    price: 2299,
    image: "https://m.media-amazon.com/images/I/61q6ZowCukL._SX522_.jpg"
  },
  {
    id: 10,
    name: "Acnos Multi-Color Leather Watch Combo (Pack of 3)",
    price: 998,
    image: "https://m.media-amazon.com/images/I/61ESEPGpJPL._SX679_.jpg"
  },
  {
    id: 11,
    name: "Samsung Galaxy M05 (Mint Green, 4GB RAM, 64 GB Storage)",
    price: 16000,
    image: "https://m.media-amazon.com/images/I/81T3olLXpUL._SX679_.jpg"
  },
  {
    id: 12,
    name: "Die-Cast Metal Car with Sport car Openable Doors Light and Sound,Pull Back Function Indoor Outdoor Toy ",
    price: 1600,
    image: "https://m.media-amazon.com/images/I/71uo1OYcJwL._SX522_.jpg"
  },
  {
    id: 13,
    name: "Solar Light Outdoor Rechargeable LED Torch Lights for Home  ",
    price: 455,
    image: "https://m.media-amazon.com/images/I/61cvGsBGUML._SX679_.jpg"
  },
  {
    id: 14,
    name: "Samsung Galaxy A14 5G (Black, 128GB) | Triple Camera (50MP Main) | Up to 12GB RAM  ",
    price: 15000,
    image: "https://m.media-amazon.com/images/I/81oIf9yg9tL._SX679_.jpg"
  },
];

let cart = [];
let currentBuyNowProduct = null;

// Display products with Add to Cart and Buy Now
function displayProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>Price: ₹${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
      <button onclick="buyNow(${product.id})">Buy Now</button>
    `;
    productList.appendChild(div);
  });
}

// Add item to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  cart.push(product);
  document.getElementById("cart-count").innerText = cart.length;
}

// Show cart popup
function showCart() {
  const cartPopup = document.getElementById("cart-popup");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₹${item.price}`;
    cartItems.appendChild(li);
    total += item.price;
  });

  cartTotal.innerText = total;
  cartPopup.classList.remove("hidden");
}

// Close cart popup
function closeCart() {
  document.getElementById("cart-popup").classList.add("hidden");
}

// Cart checkout
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  document.getElementById("checkout-form-popup").classList.remove("hidden");
  closeCart();
}

// Buy Now logic
function buyNow(productId) {
  const product = products.find(p => p.id === productId);
  currentBuyNowProduct = product;
  document.getElementById("checkout-form-popup").classList.remove("hidden");
}

// Close checkout form
function closeCheckoutForm() {
  document.getElementById("checkout-form-popup").classList.add("hidden");
}

// Submit form: used for both cart checkout and Buy Now
function submitCheckoutForm(event) {
  event.preventDefault();

  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!address || !phone) {
    alert("Please enter all details.");
    return;
  }

  if (currentBuyNowProduct) {
    // Handle Buy Now
    alert(`Order Placed!\nProduct: ${currentBuyNowProduct.name}\nPrice: ₹${currentBuyNowProduct.price}\nPhone: ${phone}\nAddress: ${address}`);
    currentBuyNowProduct = null;
  } else {
    // Handle cart checkout
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`Thank you for your order!\nTotal: ₹${total}\nPhone: ${phone}\nAddress: ${address}`);
    cart = [];
    document.getElementById("cart-count").innerText = 0;
  }

  document.getElementById("checkout-form").reset();
  closeCheckoutForm();
}

// Setup
document.getElementById("cart-btn").addEventListener("click", showCart);
displayProducts();