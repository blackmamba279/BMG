// Manejo del catálogo y reservas
document.addEventListener('DOMContentLoaded', () => {
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
        productsGrid.innerHTML = '';
        
        db.collection('products').where('active', '==', true).get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const productId = doc.id;
                    
                    // Crear tarjeta de producto
                    const productCard = document.createElement('div');
                    productCard.className = 'col-md-4 mb-4';
                    productCard.innerHTML = `
                        <div class="card h-100">
                            <img src="${product.images[0]}" class="card-img-top product-img" alt="${product.name}">
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
                document.querySelectorAll('.view-product').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = e.target.getAttribute('data-id');
                        showProductDetails(productId);
                    });
                });
            })
            .catch((error) => {
                console.error("Error cargando productos:", error);
            });
    }

    // Mostrar detalles del producto en modal
    function showProductDetails(productId) {
        db.collection('products').doc(productId).get()
            .then((doc) => {
                if (doc.exists) {
                    const product = doc.data();
                    
                    // Actualizar información del modal
                    productModalTitle.textContent = product.name;
                    productDescription.textContent = product.description;
                    productPrice.textContent = `${product.price} €`;
                    productSizes.textContent = product.sizes.join(', ');
                    
                    // Configurar botón de WhatsApp
                    const message = `Hola, estoy interesado en reservar el producto "${product.name}" (${productId}).`;
                    whatsappBtn.href = `https://wa.me/34TU_NUMERO_WHATSAPP?text=${encodeURIComponent(message)}`;
                    
                    // Configurar carrusel de imágenes
                    carouselImages.innerHTML = '';
                    product.images.forEach((image, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                        carouselItem.innerHTML = `<img src="${image}" class="d-block w-100" alt="${product.name}">`;
                        carouselImages.appendChild(carouselItem);
                    });
                    
                    // Mostrar modal
                    productModal.show();
                }
            })
            .catch((error) => {
                console.error("Error cargando detalles del producto:", error);
            });
    }
});
// Configuración de notificaciones push
function initializeFirebaseMessaging() {
    const messaging = firebase.messaging();
    
    // Solicitar permiso para notificaciones
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Permission granted');
            getToken();
        } else {
            console.log('Permission denied');
        }
    }).catch((error) => {
        console.error("Error requesting permission:", error);
    });
    
    // Obtener token de FCM
    function getToken() {
        messaging.getToken({ vapidKey: 'TU_VAPID_KEY' }).then((currentToken) => {
            if (currentToken) {
                // Guardar token en Firestore para el usuario actual
                const userId = firebase.auth().currentUser.uid;
                if (userId) {
                    db.collection('users').doc(userId).update({
                        fcmToken: currentToken
                    });
                }
            } else {
                console.log('No registration token available.');
            }
        }).catch((error) => {
            console.error('Error getting token:', error);
        });
    }
    
    // Escuchar mensajes en primer plano
    messaging.onMessage((payload) => {
        console.log('Message received:', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon
        };
        
        if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }
    });
}

// Llamar a la función después de que el usuario inicie sesión
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        initializeFirebaseMessaging();
    }
});
