// Notifications data structure
let notifications = [
    {
        id: 1,
        title: "Mantenimiento programado",
        type: "maintenance",
        body: "Se realizará mantenimiento en las áreas comunes el próximo lunes.",
        date: "2024-03-15",
        status: "active",
        recipients: "all"
    },
    {
        id: 2,
        title: "Corte de agua",
        type: "urgent",
        body: "Habrá corte de agua el próximo miércoles de 8am a 12pm.",
        date: "2024-03-14",
        status: "active",
        recipients: "all"
    }
];

// DOM Elements
const notificationsTableBody = document.getElementById('notificationsTableBody');
const notificationForm = document.getElementById('notificationForm');
const createNotificationModal = document.getElementById('createNotificationModal');
const manageNotificationsModal = document.getElementById('manageNotificationsModal');
const viewNotificationModal = document.getElementById('viewNotificationModal');

// Initialize the notifications table
function initializeNotificationsTable() {
    if (notificationsTableBody) {
        renderNotificationsTable();
    }
}

// Render notifications table
function renderNotificationsTable() {
    if (!notificationsTableBody) return;
    notificationsTableBody.innerHTML = '';
    notifications.forEach(notification => {
        const row = document.createElement('tr');
        row.dataset.notificationId = notification.id;
        row.innerHTML = `
            <td>${notification.title}</td>
            <td>
                <span class="badge ${getBadgeClass(notification.type)}">
                    ${getTypeText(notification.type)}
                </span>
            </td>
            <td>${notification.date}</td>
            <td>
                <span class="badge ${notification.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                    ${notification.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                 <button class="btn btn-sm btn-info me-1" onclick="viewNotification(${notification.id})" title="Ver">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary me-1" onclick="editNotification(${notification.id})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteNotification(${notification.id})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        notificationsTableBody.appendChild(row);
    });
}

// Get badge class based on notification type
function getBadgeClass(type) {
    const classes = {
        'info': 'bg-info',
        'warning': 'bg-warning',
        'urgent': 'bg-danger',
        'maintenance': 'bg-primary'
    };
    return classes[type] || 'bg-secondary';
}

// Get type text based on notification type
function getTypeText(type) {
    const types = {
        'info': 'Informativo',
        'warning': 'Advertencia',
        'urgent': 'Urgente',
        'maintenance': 'Mantenimiento'
    };
    return types[type] || type;
}

// Handle notification form submission (Create/Update)
function handleNotificationSave() {
    const notificationId = document.getElementById('notificationId').value;
    const title = document.getElementById('notificationTitle').value;
    const type = document.getElementById('notificationType').value;
    const body = document.getElementById('notificationBody').value;
    const recipients = document.getElementById('notificationRecipients').value;

    if (!title || !type || !body || !recipients) {
        // Use SweetAlert2 for validation error
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Por favor complete todos los campos requeridos (*).',
        });
        return;
    }

    const modalInstance = bootstrap.Modal.getInstance(createNotificationModal);
    let actionText = ''; // To display in success message

    if (notificationId) {
        // Update existing notification
        const index = notifications.findIndex(n => n.id === parseInt(notificationId));
        if (index !== -1) {
            notifications[index] = {
                ...notifications[index],
                title,
                type,
                body,
                recipients
            };
            actionText = 'actualizada';
            console.log('Notification updated:', notifications[index]);
        }
    } else {
        // Create new notification
        const newNotification = {
            id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
            title,
            type,
            body,
            date: new Date().toISOString().split('T')[0],
            status: 'active',
            recipients
        };
        notifications.push(newNotification);
        actionText = 'creada';
        console.log('Notification created:', newNotification);
    }

    renderNotificationsTable();
    notificationForm.reset();
    modalInstance.hide();

    // Use SweetAlert2 for success message
    Swal.fire({
        icon: 'success',
        title: `¡Notificación ${actionText}!`, 
        text: `La notificación "${title}" ha sido ${actionText} exitosamente.`,
        timer: 2000, // Auto close after 2 seconds
        showConfirmButton: false
    });
}

// Edit notification
function editNotification(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Populate form
    document.getElementById('notificationId').value = notification.id;
    document.getElementById('notificationTitle').value = notification.title;
    document.getElementById('notificationType').value = notification.type;
    document.getElementById('notificationBody').value = notification.body;
    document.getElementById('notificationRecipients').value = notification.recipients;

    // Change modal title and button text for clarity
    createNotificationModal.querySelector('.modal-title').textContent = 'Editar Notificación';
    // Ensure the save button calls the correct function
    const saveButton = createNotificationModal.querySelector('.modal-footer .btn-primary');
    saveButton.textContent = 'Guardar Cambios';
    saveButton.onclick = handleNotificationSave; // Assign the unified save function

    // Show the modal
    const modal = bootstrap.Modal.getOrCreateInstance(createNotificationModal);
    modal.show();
}

// View notification
function viewNotification(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Populate view modal elements (ensure these IDs exist in your HTML)
    document.getElementById('viewNotificationTitle').textContent = notification.title;
    document.getElementById('viewNotificationType').textContent = getTypeText(notification.type);
    document.getElementById('viewNotificationDate').textContent = notification.date;
    document.getElementById('viewNotificationStatus').textContent = notification.status === 'active' ? 'Activo' : 'Inactivo';
    document.getElementById('viewNotificationRecipients').textContent = notification.recipients; // Map to readable text if needed
    document.getElementById('viewNotificationBody').textContent = notification.body;

    // Add appropriate badge class to type and status
    const typeBadge = document.getElementById('viewNotificationTypeBadge');
    typeBadge.className = `badge ${getBadgeClass(notification.type)}`;
    const statusBadge = document.getElementById('viewNotificationStatusBadge');
    statusBadge.className = `badge ${notification.status === 'active' ? 'bg-success' : 'bg-secondary'}`;

    // Show the view modal
    const modal = bootstrap.Modal.getOrCreateInstance(viewNotificationModal);
    modal.show();
}

// Delete notification
function deleteNotification(id) {
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) return; // Notification not found
    const notificationTitle = notifications[notificationIndex].title;

    // Use SweetAlert2 for confirmation
    Swal.fire({
        title: '¿Está seguro?',
        text: `¡No podrás revertir la eliminación de "${notificationTitle}"!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Red for delete
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, ¡eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            notifications = notifications.filter(n => n.id !== id);
            renderNotificationsTable();

            // Use SweetAlert2 for deletion success message
            Swal.fire(
                '¡Eliminado!',
                `La notificación "${notificationTitle}" ha sido eliminada.`,
                'success'
            )
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for when the manage modal is shown
    if (manageNotificationsModal) {
        manageNotificationsModal.addEventListener('show.bs.modal', event => {
            console.log('Manage modal shown, rendering table...');
            renderNotificationsTable();
        });
    }

    // Add event listener for when the create modal is shown to reset title/button
    if (createNotificationModal) {
        createNotificationModal.addEventListener('show.bs.modal', event => {
            // Check if triggered by edit button (you might need a more robust way)
            // For now, reset unless an ID is already populated
            if (!document.getElementById('notificationId').value) {
                notificationForm.reset();
                document.getElementById('notificationId').value = ''; // Clear hidden ID
                createNotificationModal.querySelector('.modal-title').textContent = 'Crear notificación';
                const saveButton = createNotificationModal.querySelector('.modal-footer .btn-primary');
                saveButton.textContent = 'Enviar';
                saveButton.onclick = handleNotificationSave; // Ensure it calls the save function
            }
        });
    }

    // Initial render for safety, though modal listener should handle it
    initializeNotificationsTable(); 
});

// Toggle Script
document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
window.addEventListener('resize', () => {
    if (window.innerWidth < 992) { // Less than lg
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.classList.toggle('collapsed');
        }
    }
});