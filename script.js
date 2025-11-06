

// État global
//const state = { siteName: 'SaniShop', products, cart: [], route: 'home', filterStore: 'all', sortBy: 'default' };
let products = []; // vide au départ

const state = {
  siteName: 'SaniShop',
  products,
  cart: [],
  route: 'home',
  filterStore: 'all',
  sortBy: 'default'
};

const money = v => v.toLocaleString('fr-FR') + ' FCFA';
const q = s => document.querySelector(s);
function qAll(s){ return document.querySelectorAll(s); }

const GITHUB_USER = "boub81124121";
const REPO_NAME = "AdminShop";
const BRANCH = "main";


// --- Chargement des produits ---
async function loadProducts() {
  const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/products.json`;
  const container = q('#app');

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const data = await res.json();
    console.log("✅ Produits chargés depuis GitHub :", data);

    data.forEach(p => {
      if (p.img && !p.img.startsWith("http")) {
        p.img = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/${p.img}`;
      }
    });

    products = data;
    state.products = data;

    render(); // affiche l'écran actuel
    //renderShop(container);  affiche la boutique avec catégories et tri

  } catch (e) {
    console.error("❌ Erreur de chargement des produits :", e);
    state.products = [];
    render();
  }
}


// === Fonction pour générer automatiquement les catégories (menu + filtre boutique) ===
// --- Mise à jour du menu des catégories ---
function updateCategoriesMenu(products) {
  // --- Pour le select (version desktop/boutique) ---
  const filterSelect = document.querySelector('#filterStoreSelect');
  if (filterSelect) {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    filterSelect.innerHTML = `<option value="all">Toutes les boutiques</option>`;
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filterSelect.appendChild(option);
    });
  }

  // --- Pour le menu mobile ---
  const dropdownMenu = document.querySelector('.dropdown-menu[aria-labelledby="categoriesBtn"]');
  if (dropdownMenu) {
    dropdownMenu.innerHTML = ''; // Nettoyer avant d'ajouter
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    if (categories.length === 0) {
      dropdownMenu.innerHTML = `<li><a class="dropdown-item disabled" href="#">Aucune catégorie</a></li>`;
      return;
    }

    // Ajouter "Toutes les boutiques"
    const allItem = document.createElement('li');
    allItem.innerHTML = `<a class="dropdown-item" href="#" data-category="all">Toutes les boutiques</a>`;
    dropdownMenu.appendChild(allItem);

    // Ajouter chaque catégorie
    categories.forEach(cat => {
      const li = document.createElement('li');
      li.innerHTML = `<a class="dropdown-item" href="#" data-category="${cat}">${cat}</a>`;
      dropdownMenu.appendChild(li);
    });

    // Gérer les clics dans le menu mobile
    dropdownMenu.querySelectorAll('a[data-category]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
        filterByCategory(category);
        // fermer le menu Bootstrap après clic
        const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('categoriesBtn'));
        if (dropdown) dropdown.hide();
      });
    });
  }
}



// === Filtrage des produits par catégorie ===
function filterByCategory(category) {
  state.filterStore = category;
  if (category === 'all') {
    render(products);
  } else {
    const filtered = products.filter(p => p.category === category);
    render(filtered);
  }
}




// --- Rendu principal ---
function render(){
  document.title = state.siteName + ' — ' + (state.route||'');
  const sy = document.getElementById('siteYear'); if(sy) sy.textContent = new Date().getFullYear();
  const app = q('#app');
  if(state.route==='home') renderHome(app);
  else if(state.route==='shop') renderShop(app);
  else if(state.route==='product') renderProduct(app, state.productId);
  else if(state.route==='cart') renderCart(app);
  else if(state.route==='profile') renderProfile(app);
  else if(state.route==='about') renderAbout(app);
  else if(state.route==='contact') renderContact(app);
  updateCartCount();
  highlightBottomNav();
}

// --- Pages ---
function renderHome(container){
  const heroImg = "https://static-cse.canva.com/blob/1149256/Ficheproduite.commece.png?text=SaniShop+Promo";

  container.innerHTML = `
  <section class="hero bg-white p-4 rounded-3 mb-4 shadow-sm" id="heroSection">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <h1>Bienvenue sur ${state.siteName} 🚀</h1>
        <p class="lead">Boutique demo responsive — affichage optimisé du 50" au smartphone.</p>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" data-link="shop">Voir la boutique</button>
          <button class="btn btn-outline-light" data-link="about">À propos</button>
        </div>
      </div>
      <div class="col-lg-6 d-none d-lg-block">
        <img src="${heroImg}" class="img-fluid rounded-3" alt="hero">
      </div>
    </div>
  </section>
  <section>
    <h4 class="mb-3">Produits en vedette</h4>
    <div class="row g-3" id="featuredRow"></div>
  </section>
  `;

  const heroSection = document.getElementById('heroSection');

  function updateHero(){
    if(window.innerWidth < 992){ // Mobile
      heroSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.79), rgba(0,0,0,0.79)), url(${heroImg})`;
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
      heroSection.style.color = '#fff';
      heroSection.querySelectorAll('.btn-outline-secondary').forEach(btn=>{
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-outline-light');
      });
      heroSection.querySelectorAll('.col-lg-6 img').forEach(img => img.style.display = 'none');
    } else { // Desktop
      heroSection.style.backgroundImage = '';
      heroSection.style.color = 'black';
      heroSection.querySelectorAll('.btn-outline-light').forEach(btn=>{
        btn.classList.remove('btn-outline-light');
        btn.classList.add('btn-outline-secondary');
      });
      heroSection.querySelectorAll('.col-lg-6 img').forEach(img => img.style.display = 'block');
    }
  }

  updateHero();
  window.addEventListener('resize', updateHero);

  // Produits en vedette
  const row = q('#featuredRow');
  const featured = state.products.slice(0, 100);
  featured.forEach(p=>{
    const col=document.createElement('div');
    col.className='col-6 col-md-4 col-lg-3';
    col.innerHTML=productCardHTML(p);
    row.appendChild(col);
  });
}




// --- Filtrage et affichage des produits ---
function renderShop(container){
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h3 id="shopTitle">Boutiques / Produits <span id="activeStoreLabel"></span></h3>
      <div class="d-flex gap-2 flex-wrap">
        <select id="filterStoreSelect" class="form-select form-select-sm" style="width:200px">
          <option value="all">Toutes les boutiques</option>
        </select>
        <select id="sortSelect" class="form-select form-select-sm" style="width:180px">
          <option value="default">Tri par défaut</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name-asc">Nom A → Z</option>
          <option value="name-desc">Nom Z → A</option>
        </select>
      </div>
    </div>
    <div class="row g-3" id="productsGrid"></div>
  `;

  const grid = q('#productsGrid');
  const filterSelect = q('#filterStoreSelect');
  const sortSelect = q('#sortSelect');
  const shopTitle = q('#shopTitle');

  updateCategoriesMenu(state.products);

  filterSelect.addEventListener('change', ()=>{
    state.filterStore = filterSelect.value;
    shopTitle.textContent = 'Boutiques / Produits' + (state.filterStore !== 'all' ? ` (${state.filterStore})` : '');
    renderShopGrid();
  });

  sortSelect.addEventListener('change', ()=>{
    state.sortBy = sortSelect.value;
    renderShopGrid();
  });

  function renderShopGrid(){
    let filtered = [...state.products];
    if(state.filterStore!=='all') filtered = filtered.filter(p=>p.category===state.filterStore);

    switch(state.sortBy){
      case 'price-asc': filtered.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': filtered.sort((a,b)=>b.price-a.price); break;
      case 'name-asc': filtered.sort((a,b)=>a.title.localeCompare(b.title)); break;
      case 'name-desc': filtered.sort((a,b)=>b.title.localeCompare(a.title)); break;
    }

    grid.innerHTML='';
    filtered.forEach(p=>{
      const col=document.createElement('div');
      col.className='col-6 col-md-4 col-lg-3';
      col.innerHTML=productCardHTML(p);
      grid.appendChild(col);
    });
  }

  renderShopGrid();
}


// Le reste du script (renderProduct, renderCart, panier, CSV, paiement simulé, navigation, utils) reste inchangé


function renderProduct(container,id){
  const p = state.products.find(x=>x.id==id);
  if(!p){ container.innerHTML='<div class="alert alert-warning">Produit non trouvé.</div>'; return }
  container.innerHTML = `
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="product-card p-3 bg-contain">
          <img src="${p.img}" alt="${p.title}" class="img-fluid rounded-2 mb-3">
          <div class="p-2">
            <h4>${p.title}</h4>
            <p class="text-muted">${p.desc}</p>
            <h5 class="mt-3">${money(p.price)}</h5>
            <div class="mt-3 d-flex gap-2">
              <button id="addToCartBtn" class="btn btn-primary">Ajouter au panier</button>
              <button class="btn btn-outline-secondary" data-link="shop">Retour boutique</button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card p-3 shadow-sm">
          <h5>Détails</h5>
          <p class="text-muted">Description complète et caractéristiques techniques.</p>
        </div>
      </div>
    </div>
  `;
  const addBtn=document.getElementById('addToCartBtn'); if(addBtn) addBtn.addEventListener('click', ()=>addToCart(p.id));
}

function renderCart(container){
  if(state.cart.length===0){ container.innerHTML='<div class="alert alert-info">Votre panier est vide. <a href="#" data-link="shop">Voir les produits</a></div>'; return; }
  let total=0;
  container.innerHTML=`<h3>Panier</h3><div id="cartList" class="list-group mb-3"></div><div class="d-flex justify-content-between"><div><strong>Total:</strong> <span id="cartTotal">0</span></div><div class="d-flex gap-2">
  <button id="checkoutBtn" class="btn btn-success">Commander</button></div></div>`;
  const list=q('#cartList');
  state.cart.forEach(item=>{const p=state.products.find(x=>x.id==item.id);total+=p.price*item.qty;const row=document.createElement('div');row.className='list-group-item d-flex align-items-center gap-3';row.innerHTML=`<img src="${p.img}" style="width:70px;height:50px;border-radius:5px"><div class="flex-grow-1"><div class="d-flex justify-content-between"><strong>${p.title}</strong><small>${money(p.price)}</small></div><div class="mt-2 d-flex align-items-center gap-2"><button class="btn btn-sm btn-outline-secondary dec-btn">-</button><span class="px-2 qty">${item.qty}</span><button class="btn btn-sm btn-outline-secondary inc-btn">+</button><button class="btn btn-sm btn-danger ms-3 remove-btn">Supprimer</button></div></div>`;row.querySelector('.dec-btn').addEventListener('click',()=>changeQty(item.id,-1));row.querySelector('.inc-btn').addEventListener('click',()=>changeQty(item.id,+1));row.querySelector('.remove-btn').addEventListener('click',()=>removeFromCart(item.id));list.appendChild(row);});
  q('#cartTotal').textContent=money(total);
  q('#checkoutBtn').addEventListener('click',()=>openPaymentModal(total));
}

function renderProfile(container){container.innerHTML='<div class="card p-4"><h4>Profil / Connexion</h4><p class="text-muted">Fonction à venir.</p></div>';}
function renderAbout(container){container.innerHTML='<div class="card p-4"><h4>À propos</h4><p class="text-muted">SaniShop — boutique démo responsive.</p></div>';}
function renderContact(container){container.innerHTML='<div class="card p-4"><h4>Contact</h4><p>Email: contact@sanishop.com</p></div>';}

// --- Fonctions auxiliaires pour le rendu, panier, produit ---
function productCardHTML(p){
  return `
  <div class="product-card p-2 position-relative" data-link="product" data-id="${p.id}" style="color:#000; cursor:pointer;">
    <div class="product-bg" data-id="${p.id}" style="
      background-image: url('${p.img}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: var(--card-radius);
      height: 220px;
      transition: transform 0.25s ease;
    "></div>
    <div class="p-2 position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end"
         style="background: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)); border-radius: var(--card-radius);">
      <h6 class="text-white mb-1">${p.title}</h6>
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-white">${money(p.price)}</small>
        <div>
          <button class="btn btn-sm btn-outline-light me-1 view-btn" data-id="${p.id}" data-link="product"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-primary add-btn" data-id="${p.id}" aria-label="Ajouter au panier">
            <i class="bi bi-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
  `;
}




// Panier ;alert('Ajouté au panier')
function addToCart(id){const f=state.cart.find(x=>x.id==id);if(f)f.qty++;else state.cart.push({id,qty:1});updateCartCount();}
function changeQty(id,d){const i=state.cart.find(x=>x.id==id);if(!i)return;i.qty+=d;if(i.qty<=0)removeFromCart(id);render();}
function removeFromCart(id){state.cart=state.cart.filter(x=>x.id!=id);render();}
function updateCartCount(){const c=state.cart.reduce((s,i)=>s+i.qty,0);const el=document.getElementById('cartCount');if(el)el.textContent=c;}

// Export CSV
function exportCartCSV(){if(state.cart.length===0)return alert('Panier vide');const headers=['id','title','price','qty','total'];const rows=state.cart.map(i=>{const p=state.products.find(x=>x.id==i.id);return[p.id,p.title,p.price,i.qty,p.price*i.qty];});const csv=[headers.join(','),...rows.map(r=>r.join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='panier.csv';a.click();URL.revokeObjectURL(url);}

// Ouvre le modal de commande
function openPaymentModal(amount) {
  const html = `
  <div class="modal fade" id="orderModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Passer la commande</h5>
          <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="orderForm" class="vstack gap-2">
            <div>
              <label class="form-label">Nom complet</label>
              <input type="text" id="clientName" class="form-control" placeholder="Ex: Nom du client" required>
            </div>
            <div>
              <label class="form-label">Localisation / Adresse</label>
              <input type="text" id="clientLocation" class="form-control" placeholder="Ex: Ville, Quartier" required>
            </div>
            <div>
              <label class="form-label">Description (optionnelle)</label>
              <textarea id="clientDescription" class="form-control" rows="2" placeholder="Ex: Vos commentaires..."></textarea>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-success w-25">
                <i class="bi bi-whatsapp fs-5"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  `;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  const modal = new bootstrap.Modal(document.getElementById('orderModal'));
  modal.show();

  document.getElementById('orderModal').addEventListener('hidden.bs.modal', () => wrap.remove());



  // Soumission du formulaire -> envoie sur WhatsApp
  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const location = document.getElementById('clientLocation').value.trim();
    const description = document.getElementById('clientDescription').value.trim();

    if (!name || !location) return alert('Veuillez remplir votre nom et votre localisation.');

    sendOrderViaWhatsApp(name, location, description, amount, modal);
  });


}


function sendOrderViaWhatsApp(name, location, description, amount, modal) {
  if (!state.cart.length) {
    alert('Votre panier est vide.');
    return;
  }

  const phone = "22789413840"; // ton numéro WhatsApp sans +
  let message = `🛍 *Nouvelle commande via ${state.siteName}*%0A%0A`;
  message += `👤 *Nom:* ${name}%0A`;
  message += `📍 *Localisation:* ${location}%0A`;
  if (description) message += `📝 *Note:* ${description}%0A`;
  message += `%0A🧾 *Détails de la commande :*%0A`;

  state.cart.forEach((item, i) => {
    const product = state.products.find(p => p.id === item.id);
    if (product) {
      message += `\n${i + 1}. ${product.title} - ${money(product.price)} x ${item.qty}`;
    }
  });

  message += `%0A%0A💰 *Total:* ${money(amount)}%0A`;
  message += `%0A✅ Merci de confirmer votre commande.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(decodeURIComponent(message))}`;

  modal.hide();
  state.cart = [];
  render();
  window.open(url, "_blank");
}


// Navigation
function navigateTo(route,params){state.route=route;if(params&&params.id)state.productId=params.id;render();}
window.addEventListener('click', (e) => {
  // 1) Priorité: bouton ajouter au panier
  const addBtn = e.target.closest('.add-btn');
  if (addBtn) {
    e.preventDefault();
    const id = +addBtn.getAttribute('data-id');
    if (!isNaN(id)) addToCart(id);
    return;
  }

  // 2) Deuxième priorité: clic sur image / bouton "Voir" (détail)
  const viewTarget = e.target.closest('.view-btn') || e.target.closest('.product-bg');
  if (viewTarget) {
    e.preventDefault();
    // récupère l'id soit sur l'élément, soit sur l'ancêtre data-id
    const idAttr = viewTarget.getAttribute('data-id') || viewTarget.closest('[data-id]')?.getAttribute('data-id');
    const id = idAttr ? +idAttr : null;
    if (id) navigateTo('product', { id });
    return;
  }

  // 3) Enfin: autres éléments marqués data-link (nav, boutons, etc.)
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    const route = link.getAttribute('data-link');
    if (route === 'product') {
      const id = +link.getAttribute('data-id');
      if (!isNaN(id)) navigateTo('product', { id });
    } else {
      navigateTo(route);
    }
    return;
  }
});


function highlightBottomNav(){qAll('.bottom-nav .nav-btn').forEach(b=>{b.classList.remove('active');if(b.getAttribute('data-link')===state.route)b.classList.add('active');});}



document.addEventListener('DOMContentLoaded', loadProducts);
