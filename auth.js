// Manejo de autenticación
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const googleLogin = document.getElementById('googleLogin');
    const emailLogin = document.getElementById('emailLogin');
    const showEmailLogin = document.getElementById('showEmailLogin');
    const emailLoginForm = document.getElementById('emailLoginForm');
    const showRegister = document.getElementById('showRegister');
    const registerForm = document.getElementById('registerForm');
    const showLogin = document.getElementById('showLogin');
    const registerBtn = document.getElementById('registerBtn');
    const authContainer = document.getElementById('authContainer');
    const catalogContainer = document.getElementById('catalogContainer');

    // Mostrar/ocultar formularios
    showEmailLogin.addEventListener('click', () => {
        emailLoginForm.classList.remove('d-none');
        showEmailLogin.classList.add('d-none');
    });

    showRegister.addEventListener('click', () => {
        emailLoginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
    });

    showLogin.addEventListener('click', () => {
        registerForm.classList.add('d-none');
        emailLoginForm.classList.remove('d-none');
    });

    // Iniciar sesión con Google
    googleLogin.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Usuario autenticado
                checkAdminStatus(result.user.uid);
            })
            .catch((error) => {
                console.error("Error en autenticación con Google:", error);
                alert("Error al iniciar sesión con Google");
            });
    });

    // Iniciar sesión con email y contraseña
    emailLogin.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Usuario autenticado
                checkAdminStatus(userCredential.user.uid);
            })
            .catch((error) => {
                console.error("Error en autenticación:", error);
                alert("Error al iniciar sesión: " + error.message);
            });
    });

    // Registro de nuevo usuario
    registerBtn.addEventListener('click', () => {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Guardar información adicional del usuario
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    isAdmin: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                alert("Registro exitoso. Ahora puedes iniciar sesión.");
                registerForm.classList.add('d-none');
                emailLoginForm.classList.remove('d-none');
            })
            .catch((error) => {
                console.error("Error en registro:", error);
                alert("Error al registrarse: " + error.message);
            });
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut()
            .then(() => {
                authContainer.classList.remove('d-none');
                catalogContainer.classList.add('d-none');
                loginBtn.classList.remove('d-none');
                logoutBtn.classList.add('d-none');
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
            });
    });

    // Observador de estado de autenticación
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Usuario ha iniciado sesión
            authContainer.classList.add('d-none');
            catalogContainer.classList.remove('d-none');
            loginBtn.classList.add('d-none');
            logoutBtn.classList.remove('d-none');
            
            // Cargar catálogo
            loadCatalog();
        } else {
            // Usuario no ha iniciado sesión
            authContainer.classList.remove('d-none');
            catalogContainer.classList.add('d-none');
            loginBtn.classList.remove('d-none');
            logoutBtn.classList.add('d-none');
        }
    });

    // Verificar si el usuario es administrador
    function checkAdminStatus(userId) {
        db.collection('users').doc(userId).get()
            .then((doc) => {
                if (doc.exists && doc.data().isAdmin) {
                    // Redirigir a panel de administración si es admin
                    window.location.href = '/admin/index.html';
                }
            })
            .catch((error) => {
                console.error("Error verificando estado de admin:", error);
            });
    }
});