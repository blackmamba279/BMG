document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la página principal
    if (!document.getElementById('productsGrid')) return;

    const productsGrid = document.getElementById('productsGrid');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalTitle = document.getElementById('productModalTitle');
    const productDescription = document.getElementById('productDescription');
    const productPrice = document.getElementById('productPrice');
    const productSizes = document.getElementById('productSizes');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const carouselImages = document.getElementById('carouselImages');

    // Cargar catálogo desde Firestore
    function loadCatalog() {
        productsGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
        
        db.collection('products').where('active', '==', true).get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    productsGrid.innerHTML = '<div class="col-12 text-center"><p>No hay productos disponibles</p></div>';
                    return;
                }
                
                productsGrid.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const productId = doc.id;
                    
                    // Crear tarjeta de producto
                    const productCard = document.createElement('div');
                    productCard.className = 'col-md-4 mb-4';
                    productCard.innerHTML = `
                        <div class="card h-100">
                            <img src="${product.images[0]}" class="card-img-top product-img" alt="${product.name}" loading="lazy">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text text-muted">${product.price} €</p>
                                <button class="btn btn-primary view-product" data-id="${productId}">Ver detalles</button>
                            </div>
                        </div>
                    `;
                    
                    productsGrid.appendChild(productCard);
                });
                
                // Agregar event listeners a los botones
                setTimeout(() => {
                    document.querySelectorAll('.view-product').forEach(button => {
                        button.addEventListener('click', function(e) {
                            const productId = e.target.getAttribute('data-id');
                            showProductDetails(productId);
                        });
                    });
                }, 100);
            })
            .catch((error) => {
                console.error("Error cargando productos:", error);
                productsGrid.innerHTML = '<div class="col-12 text-center"><p>Error al cargar los productos</p></div>';
            });
    }

    // Mostrar detalles del producto en modal
    function showProductDetails(productId) {
        carouselImages.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
        
        db.collection('products').doc(productId).get()
            .then((doc) => {
                if (!doc.exists) {
                    alert("Producto no encontrado");
                    return;
                }
                
                const product = doc.data();
                
                // Actualizar información del modal
                productModalTitle.textContent = product.name;
                productDescription.textContent = product.description;
                productPrice.textContent = `${product.price} €`;
                productSizes.textContent = product.sizes.join(', ');
                
                // Configurar botón de WhatsApp
                db.collection('settings').doc('whatsapp').get()
                    .then((settingsDoc) => {
                        const whatsappNumber = settingsDoc.exists ? settingsDoc.data().number : '34123456789';
                        const message = `Hola, estoy interesado en reservar el producto "${product.name}" (${productId}).`;
                        whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                    })
                    .catch((error) => {
                        console.error("Error cargando configuración de WhatsApp:", error);
                        whatsappBtn.href = `https://wa.me/34123456789?text=${encodeURIComponent(message)}`;
                    });
                
                // Configurar carrusel de imágenes
                carouselImages.innerHTML = '';
                product.images.forEach((image, index) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                    carouselItem.innerHTML = `<img src="${image}" class="d-block w-100" alt="${product.name}" loading="lazy">`;
                    carouselImages.appendChild(carouselItem);
                });
                
                // Mostrar modal
                productModal.show();
            })
            .catch((error) => {
                console.error("Error cargando detalles del producto:", error);
                alert("Error al cargar los detalles del producto");
            });
    }

    // Inicializar la carga del catálogo si el usuario está autenticado
    if (firebase.auth().currentUser) {
        loadCatalog();
    }
});
