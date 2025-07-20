// Sayfa yüklendiğinde login kontrol
window.onload = function() {
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn === "true") {
    showAdminPanel();
  }
};

// Giriş formu submit
document.getElementById("login-form").addEventListener("submit", function(e){
  e.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const error = document.getElementById("login-error");

  if(user === "kerem" && pass === "0909") {
    localStorage.setItem("loggedIn", "true");
    error.textContent = "";
    showAdminPanel();
  } else {
    error.textContent = "Hatalı giriş. Tekrar deneyin.";
  }
});

// Admin paneli göster
function showAdminPanel() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
  loadProducts();
}

// Çıkış yap
document.getElementById("logout-btn").addEventListener("click", function(){
  localStorage.removeItem("loggedIn");
  location.reload();
});

// Ürün verilerini al
function getProducts() {
  const data = localStorage.getItem("products");
  return data ? JSON.parse(data) : [];
}

// Ürün verilerini kaydet
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// Resim base64 tutacak değişken
let base64Image = "";

// Resim input değişince base64 yap
document.getElementById("imageInput").addEventListener("change", function(){
  const file = this.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function() {
    base64Image = reader.result;
    document.getElementById("preview-area").innerHTML = `<img src="${base64Image}" alt="Önizleme"/>`;
  }
  reader.readAsDataURL(file);
});

// Ürün ekleme form submit
document.getElementById("product-form").addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value.trim();

  if(!name || !price || !base64Image) {
    alert("Lütfen tüm zorunlu alanları doldurun ve görsel seçin!");
    return;
  }

  const products = getProducts();
  products.push({name, description, price, image: base64Image});
  saveProducts(products);
  this.reset();
  base64Image = "";
  document.getElementById("preview-area").innerHTML = "";
  loadProducts();
});

// Ürünleri listele
function loadProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  const products = getProducts();

  if(products.length === 0){
    list.innerHTML = "<li>Henüz ürün yok.</li>";
    return;
  }

  products.forEach((product, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${product.name} - ${product.price}
      <button class="delete-btn" onclick="deleteProduct(${i})">Sil</button>
    `;
    list.appendChild(li);
  });
}

// Ürün sil
function deleteProduct(index) {
  const products = getProducts();
  products.splice(index, 1);
  saveProducts(products);
  loadProducts();
}
