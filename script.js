const gallery = document.getElementById("product-gallery");

// Ürünleri localStorage'dan çek
function getProducts() {
  const data = localStorage.getItem("products");
  return data ? JSON.parse(data) : [];
}

// Ürünleri göster
function renderProducts() {
  const products = getProducts();
  gallery.innerHTML = "";

  if(products.length === 0) {
    gallery.innerHTML = "<p style='text-align:center; color:#777;'>Henüz ürün eklenmemiş.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="gallery-img" />
      <div class="card-body">
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <strong>${product.price}</strong>
        <a href="https://wa.me/905425969558?text=Merhaba, '${encodeURIComponent(product.name)}' hakkında bilgi almak istiyorum." target="_blank" class="btn">WhatsApp'tan Sipariş</a>
      </div>
    `;
    gallery.appendChild(card);
  });

  addLightboxListeners();
}

// Lightbox fonksiyonu
function addLightboxListeners() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  document.querySelectorAll(".gallery-img").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.classList.remove("hidden");
    });
  });

  lightboxClose.addEventListener("click", () => {
    lightbox.classList.add("hidden");
  });

  lightbox.addEventListener("click", e => {
    if(e.target === lightbox) {
      lightbox.classList.add("hidden");
    }
  });
}

// Sayfa açıldığında ürünleri göster
window.onload = function() {
  renderProducts();
}
