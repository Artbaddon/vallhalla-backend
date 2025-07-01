// Utility functions
function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

// Step 1: Email submission
document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (this.checkValidity()) {
        Swal.fire({
            icon: 'success',
            title: 'Código Enviado',
            text: 'Se ha enviado un código de verificación a tu correo electrónico.',
            confirmButtonColor: '#0d6efd'
        }).then(() => {
            showStep(2);
        });
    }
    this.classList.add('was-validated');
});

// Step 2: OTP Verification
document.querySelectorAll('.otp-input').forEach((input, index) => {
    // Style the OTP inputs
    input.style.width = '50px';
    input.style.height = '50px';
    input.style.textAlign = 'center';
    input.style.fontSize = '24px';
    input.style.margin = '0 5px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid #ced4da';

    input.addEventListener('input', function(e) {
        // Only allow numbers
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value.length === 1) {
            const nextInput = document.querySelectorAll('.otp-input')[index + 1];
            if (nextInput) nextInput.focus();
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !this.value) {
            const prevInput = document.querySelectorAll('.otp-input')[index - 1];
            if (prevInput) prevInput.focus();
        }
    });

    // Prevent non-numeric input
    input.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
});

document.getElementById('otpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('.otp-input');
    const code = Array.from(inputs).map(input => input.value).join('');
    
    if (code === '000000') { 
        Swal.fire({
            icon: 'success',
            title: 'Código Verificado',
            text: 'El código es correcto.',
            confirmButtonColor: '#0d6efd'
        }).then(() => {
            showStep(3);
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Código Incorrecto',
            text: 'Por favor, verifica el código e intenta nuevamente.',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-error-popup',
                icon: 'swal-error-icon',
                confirmButton: 'swal-error-button'
            }
        });
    }
});

// Add custom styles for SweetAlert error popup
const style = document.createElement('style');
style.textContent = `
    .swal-error-popup {
        border-radius: 15px !important;
    }
    .swal-error-icon {
        border: 2px solid #ff6b6b !important;
        color: #ff6b6b !important;
    }
    .swal-error-button {
        background-color: #007bff !important;
        border-radius: 5px !important;
        min-width: 100px !important;
    }
`;
document.head.appendChild(style);

function resendCode() {
    Swal.fire({
        icon: 'success',
        title: 'Código Reenviado',
        text: 'Se ha enviado un nuevo código a tu correo electrónico.',
        confirmButtonColor: '#0d6efd'
    });
}

// Step 3: New Password
document.getElementById('newPassword').addEventListener('input', function(e) {
    const password = e.target.value;
    
    // Update requirements
    const requirements = {
        lengthReq: password.length >= 8,
        letterReq: /[A-Za-z]/.test(password),
        numberReq: /\d/.test(password),
        specialReq: /[@$!%*#?&]/.test(password)
    };

    Object.entries(requirements).forEach(([req, isValid]) => {
        const element = document.getElementById(req);
        const icon = element.querySelector('i');
        
        if (isValid) {
            element.classList.remove('invalid');
            element.classList.add('valid');
            icon.classList.remove('bi-circle');
            icon.classList.add('bi-check-circle-fill');
        } else {
            element.classList.remove('valid');
            element.classList.add('invalid');
            icon.classList.remove('bi-check-circle-fill');
            icon.classList.add('bi-circle');
        }
    });
});

document.getElementById('newPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (this.checkValidity()) {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tu contraseña ha sido cambiada exitosamente.',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'Iniciar Sesión'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'start-sesion.html';
            }
        });
    }
    this.classList.add('was-validated');
});
