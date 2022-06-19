const html = document.documentElement;
const body = document.body;
const menuLinks = document.querySelectorAll(".side-menu a");
const collapseBtn = document.querySelector(".collapser");
const switchInput = document.querySelector(".switch input");
const switchLabel = document.querySelector(".switch label");
const orderModal = document.querySelector(".order-modal");
const modalCloseBtn = document.querySelector(".circle-close");
const orderBtn = document.querySelector(".order-btn");
const collapsedClass = "collapsed";
const openOrderModal = "open-modal";
const lightModeClass = "light-mode";

const subTotalInput = document.querySelector(".cal-subtotal");
const taxInput = document.querySelector(".cal-tax");
const totalInput = document.querySelector(".cal-total");

let subTotal = 0;
let tax = 0;
let total = 0;

orderBtn.addEventListener("click", toggleOrderModal);
modalCloseBtn.addEventListener("click", toggleOrderModal);

function toggleOrderModal() {
  orderModal.classList.toggle(openOrderModal);
}

//Fetch data from json

fetch("./data/products.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    data.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.addEventListener("click", function () {
        addToOrder(product);
      });
      productCard.innerHTML = `
        <img src="./images/food.png" alt="burger" width="50px">
        <p class="card-title">${product.name}</p>
        <p class="card-price">${product.price}</p>`;
      document.querySelector(".grid").appendChild(productCard);
    });
    getOrder();
  });

// get order from local storage
function getOrder() {
  const orders = localStorage.getItem("orders") || [];
  if (orders.length) {
    const allOrders = JSON.parse(orders);
    allOrders.forEach((order) => {
      const modalBody = document.querySelector(".order-cards");
      modalBody.innerHTML += `
          <div class="order-card" id="order-card-${order.id}">
            <img src="./images/food.png" alt="burger" width="65px">
            <div>
              <p class="card-title">${order.name}</p>
              <p class="card-price">${order.price}</p>
            </div>
            <div class="order-quantity">
              <button class="minus-btn" onclick="subtractQuantity(${order.id})">-</button>
              <span class="quantity" id="quantity-${order.id}">${order.quantity}</span>
              <button class="plus-btn" onclick="addQuantity(${order.id})">+</button>
            </div>
          </div>`;
      calculateTotal(order.price, "add");
    });
  }
  return [];
}

function addToOrder(product) {
  const orders = localStorage.getItem("orders") || [];
  let allOrders = [];
  if (orders.length) {
    allOrders = JSON.parse(orders);
    //check if id already exists and add to quantity
    const existOrder = allOrders.find((order) => order.id === product.id);
    if (existOrder) {
      existOrder.quantity++;
      setOrderCard(existOrder, true);
    } else {
      const createOrder = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      };
      allOrders.push(createOrder);
      setOrderCard(createOrder, false);
    }
  } else {
    const createOrder = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    };
    allOrders.push(createOrder);
    setOrderCard(createOrder, false);
  }
  calculateTotal(product.price, "add");
  localStorage.setItem("orders", JSON.stringify(allOrders));
}

function addQuantity(id) {
  const quantity = document.querySelector(`#quantity-${id}`);
  quantity.innerHTML = parseInt(quantity.innerHTML) + 1;
  calculateTotal(
    document.querySelector(`#order-card-${id} .card-price`).innerHTML,
    "add"
  );
  // update in local storage
  const orders = localStorage.getItem("orders") || [];
  const allOrders = JSON.parse(orders);
  const existOrder = allOrders.find((order) => order.id === id);
  existOrder.quantity++;
  localStorage.setItem("orders", JSON.stringify(allOrders));
}

function subtractQuantity(id) {
  const quantity = document.querySelector(`#quantity-${id}`);
  if (quantity.innerHTML >= 1) {
    quantity.innerHTML = parseInt(quantity.innerHTML) - 1;
    calculateTotal(
      document.querySelector(`#order-card-${id} .card-price`).innerHTML,
      "subtract"
    );
    if (quantity.innerHTML == 0) {
      document.querySelector(`#order-card-${id}`).remove();
    }
  }
  const orders = localStorage.getItem("orders") || [];
  const allOrders = JSON.parse(orders);
  const existOrder = allOrders.find((order) => order.id === id);
  existOrder.quantity--;
  if (existOrder.quantity == 0) {
    allOrders.splice(allOrders.indexOf(existOrder), 1);
  }
  localStorage.setItem("orders", JSON.stringify(allOrders));
}

function setOrderCard(product, alreadyExist) {
  const modalBody = document.querySelector(".order-cards");
  //if already exist, just update quantity
  if (alreadyExist) {
    const quantity = document.querySelector(`#quantity-${product.id}`);
    quantity.innerHTML = product.quantity;
  } else {
    modalBody.innerHTML += `
    <div class="order-card" id="order-card-${product.id}">
      <img src="./images/food.png" alt="burger" width="65px">
      <div>
        <p class="card-title">${product.name}</p>
        <p class="card-price">${product.price}</p>
      </div>
      <div class="order-quantity">
        <button class="minus-btn" onclick="subtractQuantity(${product.id})">-</button>
        <span class="quantity" id="quantity-${product.id}">${product.quantity}</span>
        <button class="plus-btn" onclick="addQuantity(${product.id})">+</button>
      </div>
    </div>`;
  }
}

function calculateTotal(price, addOrSubtract) {
  if (addOrSubtract === "add") {
    subTotal += parseInt(price.replace("$", ""));
  } else {
    subTotal -= parseInt(price.replace("$", ""));
  }
  tax = subTotal * 0.1;
  total = subTotal + tax;
  subTotalInput.innerHTML = subTotal.toFixed(2);
  taxInput.innerHTML = tax.toFixed(2);
  totalInput.innerHTML = total.toFixed(2);
}

function printBill() {
  localStorage.getItem("orders");
  const orders = localStorage.getItem("orders") || [];
  let element = "";
  let products = "";
  if (orders.length) {
    const allOrders = JSON.parse(orders);
    allOrders.forEach((order) => {
      products += `
      <p>Product Name: ${order.name}</p>
      <p>Product Quantity: ${order.quantity}</p>
      <p>Product Price:  ${order.quantity} * ${order.price}</p>
      ===================================`;
    });
  }
  element += `<div style="display: flex;flex-direction: column;align-items: center">
  ${products}
  <p>Total: ${total}</p>
  </div>`;
  html2pdf()
    .from(element)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      window.open(pdf.output("bloburl"), "_blank");
    });
}

/*TOGGLE HEADER STATE*/
collapseBtn.addEventListener("click", function () {
  body.classList.toggle(collapsedClass);
});

/*TOGGLE LIGHT/DARK MODE*/
if (localStorage.getItem("dark-mode") === "false") {
  html.classList.add(lightModeClass);
}
