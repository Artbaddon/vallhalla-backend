// Function to handle return request actions
function handleReturnRequest(button, action) {
    const listItem = button.closest('.list-group-item');
    const apartment = listItem.querySelector('h6').textContent;
    const dates = listItem.querySelector('small').textContent;
    const reason = listItem.querySelector('p').textContent.replace('Motivo: ', '');
    
    // Split apartment info
    const [aptNumber, area] = apartment.split(' - ');
    
    // Fill modal with data
    document.getElementById('returnApartment').value = aptNumber;
    document.getElementById('returnArea').value = area;
    document.getElementById('returnDates').value = dates;
    document.getElementById('returnReason').value = reason;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('returnRequestModal'));
    modal.show();
    
    // Store the list item for later use
    document.getElementById('returnRequestModal').dataset.listItem = listItem.outerHTML;
}

// Function to process return request
function processReturnRequest(action) {
    const modal = document.getElementById('returnRequestModal');
    const listItem = modal.dataset.listItem;
    const response = document.getElementById('returnResponse').value;
    
    // Here you would typically make an API call to your backend
    // For now, we'll just show a success message and remove the item
    Swal.fire({
        title: action === 'accept' ? 'Devolución Aceptada' : 'Devolución Rechazada',
        text: 'La solicitud ha sido procesada exitosamente.',
        icon: 'success',
        confirmButtonText: 'OK'
    }).then(() => {
        // Remove the item from the list
        const listGroup = document.querySelector('.list-group');
        const items = listGroup.querySelectorAll('.list-group-item');
        items.forEach(item => {
            if (item.outerHTML === listItem) {
                item.remove();
            }
        });
        
        // Close modal
        bootstrap.Modal.getInstance(modal).hide();
    });
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Accept button handler
    document.getElementById('acceptReturnBtn').addEventListener('click', function() {
        processReturnRequest('accept');
    });
    
    // Reject button handler
    document.getElementById('rejectReturnBtn').addEventListener('click', function() {
        processReturnRequest('reject');
    });
}); 