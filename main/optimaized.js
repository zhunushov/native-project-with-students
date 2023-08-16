const API = "http://localhost:8000/goods";
const section = document.querySelector("#section");

const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const createInputs = document.querySelectorAll(".create-input");
const createButton = document.getElementById("create-button");

const createAccordion = document.getElementById("create-accordion");

const editInputs = document.querySelectorAll(".edit-input");
const saveEditedButton = document.getElementById("save-edited-button");

let currentPage = 1;
let countPage = 1;

const LIMIT = 4;

const config = {
  "Content-Type": "application/json; charset=utf-8",
};

function clearInputs(inputs) {
  for (const input of inputs) {
    input.value = "";
  }
}

async function createProduct(newProduct) {
  try {
    await fetch(API, {
      method: "POST",
      headers: config,
      body: JSON.stringify(newProduct),
    });
    renderGoods();
  } catch (error) {
    console.log(error);
  }
}

createButton.addEventListener("click", () => {
  const newItem = {};
  for ({ value, name } of createInputs) {
    if (!value.trim()) {
      return alert("Заполните все поля");
    }
    newItem[name] = value;
  }
  createProduct(newItem);
  clearInputs(createInputs);
  createAccordion.classList.remove("show");
});

// Оптимизированная функция рендеринга списка товаров
async function renderGoods() {
  const params = new URLSearchParams({
    ...(searchInput.value && { title: searchInput.value }),
    _page: currentPage,
    _limit: LIMIT,
  });
  //   params.set("title", searchInput.value);

  const res = await fetch(`${API}?${params}`);
  const data = await res.json();

  countPage = Math.ceil(res.headers.get("x-total-count") / LIMIT);

  toggleDisabledClass(nextBtn, currentPage === countPage);
  toggleDisabledClass(prevBtn, currentPage === 1);

  section.innerHTML = data.map(createProductCard).join("");
}
renderGoods();

async function deleteProductById(id) {
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    renderGoods();
  } catch (error) {
    console.log(error);
  }
}

async function getProductById(id) {
  try {
    const item = await (await fetch(`${API}/${id}`)).json();
    for (const input of editInputs) {
      input.value = item[input.name];
    }
    saveEditedButton.setAttribute("id", item.id);
    return item;
  } catch (error) {
    console.log(error);
  }
}

async function updateProductById(id, editedProduct) {
  try {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: config,
      body: JSON.stringify(editedProduct),
    });
    renderGoods();
  } catch (error) {
    console.log(error);
  }
}

saveEditedButton.addEventListener("click", ({ target }) => {
  const editedItem = {};

  for ({ value, name } of editInputs) {
    if (!value.trim()) {
      return alert("Заполните все поля");
    }
    editedItem[name] = value;
  }

  updateProductById(target.id, editedItem);
  clearInputs(editInputs);
});

document.addEventListener("click", (event) => {
  const { classList, id } = event.target;
  if (classList.contains("delete-button")) {
    deleteProductById(id);
  } else if (classList.contains("edit-button")) {
    getProductById(id);
  } else if (classList.contains("detail-button")) {
    localStorage.setItem("detail-id", id);
  }
});

// Слушатели для пагинации
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderGoods();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < countPage) {
    currentPage++;
    renderGoods();
  }
});

// Слушатели для поиска
searchButton.addEventListener("click", renderGoods);

function toggleDisabledClass(element, condition) {
  element.classList.toggle("disabled", condition);
}

// функция создания карточки товара
function createProductCard({ price, title, desc, image, id }) {
  return `
      <div class="card m-1 cardBook" style="width: 18rem">
          <img id="${id}" src=${image} class="card-img-top detailsCard" style="height: 280px" alt="${title}"/>
          <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${desc}</p>
              <p class="card-text">${price}</p>
  
              <button class="btn btn-outline-danger delete-button" id="${id}">
                  Удалить
              </button>
              <button 
                  class="btn btn-outline-warning edit-button" id="${id}"
                  data-bs-target="#exampleModal"
                  data-bs-toggle="modal"
              >
                  Изменить
              </button>
              <a href="./detail.html">
                  <button 
                      class="btn btn-outline-info detail-button mt-1" id="${id}"
                  >
                      Details
                  </button>
              </a>
          </div>
      </div>
      `;
}
