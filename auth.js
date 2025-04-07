document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
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
    showEmailLogin.addEventListener('click', function(e) {
        e.preventDefault();
        emailLoginForm.classList.remove('d-none');
        showEmailLogin.classList.add('d-none');
    });

    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        emailLoginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('d-none');
        emailLoginForm.classList.remove('d-none');
    });

    // Iniciar sesión con Google
    googleLogin.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Verificar si el usuario ya existe
                return db.collection('users').doc(result.user.uid).get()
                    .then((doc) => {
                        if (!doc.exists) {
                            // Crear nuevo usuario si no existe
                            return db.collection('users').doc(result.user.uid).set({
                                name: result.user.displayName,
                                email: result.user.email,
                                isAdmin: false,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                    });
            })
            .then(() => {
                checkAdminStatus(firebase.auth().currentUser.uid);
            })
            .catch((error) => {
                console.error("Error en autenticación con Google:", error);
                alert("Error al iniciar sesión con Google: " + error.message);
            });
    });

    // Iniciar sesión con email y contraseña
    emailLogin.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert("Por favor ingrese correo y contraseña");
            return;
        }
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                checkAdminStatus(userCredential.user.uid);
            })
            .catch((error) => {
                console.error("Error en autenticación:", error);
                alert("Error al iniciar sesión: " + error.message);
            });
    });

    // Registro de nuevo usuario
    registerBtn.addEventListener('click', function() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            alert("Por favor complete todos los campos");
            return;
        }
        
        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        
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
                document.getElementById('registerForm').reset();
            })
            .catch((error) => {
                console.error("Error en registro:", error);
                alert("Error al registrarse: " + error.message);
            });
    });

    // Cerrar
