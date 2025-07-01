// Function to handle return request submission
function submitReturnRequest() {
    const form = document.getElementById('returnRequestForm');
    const reason = document.getElementById('returnReason').value;
    
    if (!reason) {
        form.classList.add('was-validated');
        return;
    }
    
    // Here you would typically make an API call to your backend
    // For now, we'll just show a success message
    Swal.fire({
        title: 'Solicitud Enviada',
        text: 'Tu solicitud de devolución ha sido enviada al administrador para su revisión.',
        icon: 'success',
        confirmButtonText: 'OK'
    }).then(() => {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById('returnRequestModal')).hide();
        // Reset the form
        form.reset();
        form.classList.remove('was-validated');
    });
}

// Function to populate return request modal with reservation data
function populateReturnRequestModal(reservationItem) {
    const area = reservationItem.querySelector('h6').textContent;
    const dateTime = reservationItem.querySelector('small').textContent;
    const [date, time] = dateTime.split(' - ');
    
    document.getElementById('returnArea').value = area;
    document.getElementById('returnDate').value = date;
    document.getElementById('returnTime').value = time;
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Submit button handler
    document.getElementById('submitReturnRequest').addEventListener('click', submitReturnRequest);
    
    // Modal show handler to populate data
    document.getElementById('returnRequestModal').addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const reservationItem = button.closest('.list-group-item');
        populateReturnRequestModal(reservationItem);
    });
}); 