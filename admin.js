document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la página de admin
    if (!document.getElementById('adminLogoutBtn')) return;

    // Elementos del DOM
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const productsTab = document.getElementById('productsTab');
    const usersTab = document.getElementById('usersTab');
    const settingsTab = document.getElementById('settingsTab');
    const productsContent = document.getElementById('productsContent');
    const usersContent = document.getElementById('usersContent');
    const settingsContent = document.getElementById('settingsContent');
    const productsTable = document.getElementById('productsTable');
    const usersTable = document.getElementById('usersTable');
    const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
    const productForm = document.getElementById('productForm');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const productImagesInput = document.getElementById('productImages');
    const imagePreviews = document.getElementById('imagePreviews');
    const whatsappNumberInput = document.getElementById('whatsappNumber');
    const saveWhatsappBtn = document.getElementById('saveWhatsappBtn');

    // Variables de estado
    let currentProductId = null;
    let currentImages = [];

    // Verificar autenticación y permisos
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Verificar si el usuario es administrador
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists && doc.data().isAdmin) {
                        // Cargar datos iniciales
                        loadProducts();
                        loadUsers();
                        loadSettings();
                    } else {
                        // Redirigir a la página principal si no es admin
                        window.location.href = '../index.html';
                    }
                })
                .catch((error) => {
                    console.error("Error verificando permisos:", error);
                    window.location.href = '../index.html';
                });
        } else {
            // Redirigir a la página de inicio de sesión si no está autenticado
            window.location.href = '../index.html';
        }
    });

    // Cerrar sesión
    adminLogoutBtn.addEventListener('click', function() {
        firebase.auth().signOut()
            .then(() => {
                window.location.href = '../index.html';
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Error al cerrar sesión: " + error.message);
            });
    });

    // Cambiar entre pestañas
    productsTab.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab('products');
    });

    usersTab.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab('users');
    });

    settingsTab.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab('settings');
    });

    function setActiveTab(tab) {
        // Actualizar clases activas
        productsTab.classList.remove('active');
        usersTab.classList.remove('active');
        settingsTab.classList.remove('active');
        
        productsContent.classList.add('d-none');
        usersContent.classList.add('d-none');
        settingsContent.classList.add('d-none');
        
        if (tab === 'products') {
            productsTab.classList.add('active');
            productsContent.classList.remove('d-none');
        } else if (tab === 'users') {
            usersTab.classList.add('active');
            usersContent.classList.remove('d-none');
        } else if (tab === 'settings') {
            settingsTab.classList.add('active');
            settingsContent.classList.remove('d-none');
        }
    }

    // Cargar productos
    function loadProducts() {
        productsTable.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
        
        db.collection('products').orderBy('createdAt', 'desc').get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    productsTable.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos registrados</td></tr>';
                    return;
                }
                
                productsTable.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const productId = doc.id;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><img src="${product.images[0]}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;" loading="lazy"></td>
                        <td>${product.name}</td>
                        <td>${product.price} €</td>
                        <td>${product.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-product" data-id="${productId}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-product" data-id="${productId}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    
                    productsTable.appendChild(row);
                });
                
                // Agregar event listeners a los botones
                setTimeout(() => {
                    document.querySelectorAll('.edit-product').forEach(button => {
                        button.addEventListener('click', function(e) {
                            const productId = e.target.closest('button').getAttribute('data-id');
                            editProduct(productId);
                        });
                    });
                    
                    document.querySelectorAll('.delete-product').forEach(button => {
                        button.addEventListener('click', function(e) {
                            const productId = e.target.closest('button').getAttribute('data-id');
                            deleteProduct(productId);
                        });
                    });
                }, 100);
            })
            .catch((error) => {
                console.error("Error cargando productos:", error);
                productsTable.innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar los productos</td></tr>';
            });
    }

    // Cargar usuarios
    function loadUsers() {
        usersTable.innerHTML = '<tr><td colspan="4" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
        
        db.collection('users').orderBy('createdAt', 'desc').get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    usersTable.innerHTML = '<tr><td colspan="4" class="text-center">No hay usuarios registrados</td></tr>';
                    return;
                }
                
                usersTable.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const user = doc.data();
                    const userId = doc.id;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.name || 'No especificado'}</td>
                        <td>${user.email}</td>
                        <td>${user.isAdmin ? '<span class="badge bg-primary">Admin</span>' : '<span class="badge bg-secondary">Usuario</span>'}</td>
                        <td>
                            ${!user.isAdmin ? `
                            <button class="btn btn-sm btn-success make-admin" data-id="${userId}">
                                Hacer Admin
                            </button>
                            ` : ''}
                        </td>
                    `;
                    
                    usersTable.appendChild(row);
                });
                
                // Agregar event listeners a los botones
                setTimeout(() => {
                    document.querySelectorAll('.make-admin').forEach(button => {
                        button.addEventListener('click', function(e) {
                            const userId = e.target.getAttribute('data-id');
                            makeAdmin(userId);
                        });
                    });
                }, 100);
            })
            .catch((error) => {
                console.error("Error cargando usuarios:", error);
                usersTable.innerHTML = '<tr><td colspan="4" class="text-center">Error al cargar los usuarios</td></tr>';
            });
    }

    // Cargar configuración
    function loadSettings() {
        db.collection('settings').doc('whatsapp').get()
            .then((doc) => {
                if (doc.exists) {
                    whatsappNumberInput.value = doc.data().number || '';
                }
            })
            .catch((error) => {
                console.error("Error cargando configuración:", error);
            });
    }

    // Guardar configuración de WhatsApp
    saveWhatsappBtn.addEventListener('click', function() {
        const number = whatsappNumberInput.value.trim();
        
        if (!number) {
            alert("Por favor ingrese un número de WhatsApp válido.");
            return;
        }
        
        saveWhatsappBtn.disabled = true;
        saveWhatsappBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        db.collection('settings').doc('whatsapp').set({
            number: number
        }, { merge: true })
        .then(() => {
            alert("Configuración de WhatsApp guardada correctamente.");
        })
        .catch((error) => {
            console.error("Error guardando configuración:", error);
            alert("Error al guardar la configuración: " + error.message);
        })
        .finally(() => {
            saveWhatsappBtn.disabled = false;
            saveWhatsappBtn.textContent = 'Guardar';
        });
    });

    // Previsualización de imágenes
    productImagesInput.addEventListener('change', function(e) {
        imagePreviews.innerHTML = '';
        const files = e.target.files;
        
        if (files.length > 4) {
            alert("Solo puedes subir un máximo de 4 imágenes.");
            productImagesInput.value = '';
            return;
        }
        
        currentImages = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                currentImages.push(event.target.result);
                
                const imgContainer = document.createElement('div');
                imgContainer.className = 'col-md-3 mb-2';
                imgContainer.innerHTML = `
                    <img src="${event.target.result}" class="img-thumbnail" style="height: 100px; width: 100%; object-fit: cover;">
                `;
                imagePreviews.appendChild(imgContainer);
            };
            
            reader.readAsDataURL(file);
        }
    });

    // Guardar producto
    saveProductBtn.addEventListener('click', function() {
        const productId = document.getElementById('productId').value;
        const name = document.getElementById('productName').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const sizes = document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s);
        const active = document.getElementById('productActive').checked;
        const files = productImagesInput.files;
        
        // Validaciones
        if (!name) {
            alert("Por favor ingrese el nombre del producto.");
            return;
        }
        
        if (!description) {
            alert("Por favor ingrese la descripción del producto.");
            return;
        }
        
        if (isNaN(price) || price <= 0) {
            alert("Por favor ingrese un precio válido.");
            return;
        }
        
        if (sizes.length === 0) {
            alert("Por favor ingrese al menos una talla.");
            return;
        }
        
        if (!productId && files.length === 0) {
            alert("Por favor seleccione al menos una imagen para el producto.");
            return;
        }
        
        saveProductBtn.disabled = true;
        saveProductBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        // Si hay imágenes nuevas para subir
        if (files.length > 0) {
            uploadImages(files, productId)
                .then((imageUrls) => {
                    saveProductData(productId, name, description, price, sizes, active, imageUrls);
                })
                .catch((error) => {
                    console.error("Error subiendo imágenes:", error);
                    alert("Error al subir las imágenes del producto: " + error.message);
                    saveProductBtn.disabled = false;
                    saveProductBtn.textContent = 'Guardar Producto';
                });
        } else {
            // Si solo se está actualizando la información sin cambiar imágenes
            saveProductData(productId, name, description, price, sizes, active, null);
        }
    });

    // Subir imágenes a Firebase Storage
    function uploadImages(files, productId) {
        const uploadPromises = [];
        const imageUrls = [];
        const storagePath = productId ? `products/${productId}` : `products/temp/${firebase.auth().currentUser.uid}`;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = storage.ref(`${storagePath}/${Date.now()}_${file.name}`);
            const uploadTask = storageRef.put(file);
            
            const promise = new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    null,
                    (error) => {
                        reject(error);
                    },
                    () => {
                        uploadTask.snapshot.ref.getDownloadURL()
                            .then((downloadURL) => {
                                imageUrls.push(downloadURL);
                                resolve();
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                );
            });
            
            uploadPromises.push(promise);
        }
        
        return Promise.all(uploadPromises).then(() => imageUrls);
    }

    // Guardar datos del producto en Firestore
    function saveProductData(productId, name, description, price, sizes, active, imageUrls) {
        const productData = {
            name: name,
            description: description,
            price: price,
            sizes: sizes
