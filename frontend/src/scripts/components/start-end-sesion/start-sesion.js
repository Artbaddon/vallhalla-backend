const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailFeedback = document.getElementById("emailFeedback");
const passwordFeedback = document.getElementById("passwordFeedback");
const submitButton = document.querySelector('button[type="submit"]');
const loadingModal = new bootstrap.Modal(
  document.getElementById("loadingModal")
);

// Función para verificar si el formulario es válido
function checkFormValidity() {
  const isEmailValid =
    emailInput.value !== "" &&
    emailInput.value.includes("@") &&
    emailInput.value.includes(".");
  const isPasswordValid =
    passwordInput.value !== "" && passwordInput.validity.valid;

  submitButton.disabled = !(isEmailValid && isPasswordValid);
}

// Validación del correo electrónico
emailInput.addEventListener("input", function () {
  if (this.value === "") {
    this.setCustomValidity("");
    emailFeedback.textContent = "";
  } else if (!this.value.includes("@") || !this.value.includes(".")) {
    this.setCustomValidity("Por favor, ingresa un correo electrónico válido");
    emailFeedback.textContent =
      "Por favor, ingresa un correo electrónico válido";
  } else {
    this.setCustomValidity("");
    emailFeedback.textContent = "";
  }
  checkFormValidity();
});

// Validación de la contraseña
passwordInput.addEventListener("input", function () {
  if (this.value === "") {
    this.setCustomValidity("Por favor, ingresa tu contraseña");
    passwordFeedback.textContent = "Por favor, ingresa tu contraseña";
  } else if (this.value.length < 8) {
    this.setCustomValidity("La contraseña debe tener al menos 8 caracteres");
    passwordFeedback.textContent =
      "La contraseña debe tener al menos 8 caracteres";
  } else {
    this.setCustomValidity("");
    passwordFeedback.textContent = "";
  }
  checkFormValidity();
});

// Verificar validez inicial
checkFormValidity();

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Validar el formulario
  if (!this.checkValidity()) {
    e.stopPropagation();
    this.classList.add("was-validated");
    return;
  }

  // Mostrar modal de carga
  loadingModal.show();

  // Obtener los valores del formulario
  const email = emailInput.value;
  const password = passwordInput.value;

  // Simular delay de red y redireccionar según las credenciales
  setTimeout(() => {
    loadingModal.hide();
    if (email === "soyeladmin123@gmail.com" && password === "S0y4dm1n@") {
      window.location.href = "../../../pages/admin/admin_dashboard.html";
    } else if (email === "soyelguard123@gmail.com" && password === "Guardia123?") {
      window.location.href = "../../../pages/guard/index.html";
    } else {
      window.location.href = "../../../pages/owner/owner_dashboard.html";
    }
  }, 1500);
});
