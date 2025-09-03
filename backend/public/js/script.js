document.addEventListener("DOMContentLoaded", () => {
  fetch("/product/listele")
    .then(res => res.json())
    .then(data => {
      const urunlerDiv = document.getElementById("urunler");
      urunlerDiv.innerHTML = ""; 

      data.forEach(urun => {
        const div = document.createElement("div");
        div.classList.add("urun-kart");
        div.innerHTML = `
          <h3>${urun.name}</h3>
          <p>${urun.description}</p>
          <p>₺${urun.price}</p>
          <button class="ekle-btn" data-id="${urun.id}">Sepete Ekle</button>
        `;
        urunlerDiv.appendChild(div);
      });

      document.querySelectorAll(".ekle-btn").forEach(button => {
        button.addEventListener("click", () => {
          const product_id = button.getAttribute("data-id");
          const user_id = 1; 
          const quantity = 1;

          fetch("/cart/urun_ekle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, product_id, quantity })
          })
            .then(res => res.json())
            .then(res => {
              alert(res.message || "Sepete eklendi.");
            })
            .catch(err => {
              alert("Hata oluştu: " + err.message);
            });
        });
      });
    })
    .catch(err => {
      console.error("Ürünleri çekerken hata oluştu:", err);
    });
});
