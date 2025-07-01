document.addEventListener("DOMContentLoaded", function () {
  // Sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");

  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("d-none");
  });

  // Handle parking type change for Add Modal
  const parkingTypeSelect = document.getElementById("parkingType");
  const residentFields = document.querySelector(".resident-fields");
  const visitorFields = document.querySelector(".visitor-fields");

  parkingTypeSelect?.addEventListener("change", function () {
    handleParkingTypeChange(this, residentFields, visitorFields);
  });

  // Handle parking type change for Edit Modal
  const editParkingTypeSelect =
    document.getElementById("editParkingType");
  const editResidentFields = document.querySelector(
    ".edit-resident-fields"
  );
  const editVisitorFields = document.querySelector(
    ".edit-visitor-fields"
  );

  editParkingTypeSelect?.addEventListener("change", function () {
    handleParkingTypeChange(this, editResidentFields, editVisitorFields);
  });

  function handleParkingTypeChange(
    select,
    residentFields,
    visitorFields
  ) {
    if (select.value === "residente") {
      residentFields.classList.remove("d-none");
      visitorFields.classList.add("d-none");
      toggleRequiredFields(false, true);
    } else if (select.value === "visitante") {
      residentFields.classList.add("d-none");
      visitorFields.classList.remove("d-none");
      toggleRequiredFields(false, false);
    }
  }

  function toggleRequiredFields(isEdit, isResident) {
    const prefix = isEdit ? "edit" : "";
    if (isResident) {
      document.getElementById(`${prefix}OwnerName`).required = true;
      document.getElementById(`${prefix}Apartment`).required = true;
      document.getElementById(`${prefix}VisitorName`).required = false;
      document.getElementById(
        `${prefix}VisitingApartment`
      ).required = false;
    } else {
      document.getElementById(`${prefix}OwnerName`).required = false;
      document.getElementById(`${prefix}Apartment`).required = false;
      document.getElementById(`${prefix}VisitorName`).required = true;
      document.getElementById(
        `${prefix}VisitingApartment`
      ).required = true;
    }
  }

  // Form validation
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // Edit button functionality
  const editButtons = document.querySelectorAll(
    '[data-bs-target="#editModal"]'
  );
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".card");

      // Get values from the card using data attributes
      const parkingData = {
        number: getCardValue(
          card,
          "[data-parking-number]",
          "Parqueadero "
        ),
        type: getCardValue(card, "[data-parking-type]", "Tipo: "),
        owner: getCardValue(card, "[data-owner-name]", "Propietario: "),
        apartment: getCardValue(
          card,
          "[data-apartment]",
          "Apartamento: "
        ),
        plate: getCardValue(card, "[data-license-plate]", "Placa: "),
        vehicleType: getCardValue(card, "[data-vehicle-type]", "Tipo: "),
        model: getCardValue(card, "[data-vehicle-model]", "Modelo: "),
      };

      // Populate edit form with the data
      document.getElementById("editParkingNumber").value =
        parkingData.number;
      document.getElementById("editParkingType").value =
        parkingData.type.toLowerCase();
      document.getElementById("editOwnerName").value = parkingData.owner;
      document.getElementById("editApartment").value =
        parkingData.apartment;
      document.getElementById("editLicensePlate").value =
        parkingData.plate;
      document.getElementById("editVehicleType").value =
        parkingData.vehicleType.toLowerCase();
      document.getElementById("editCarModel").value = parkingData.model;

      // Show/hide fields based on parking type
      const editParkingTypeSelect =
        document.getElementById("editParkingType");
      const editResidentFields = document.querySelector(
        ".edit-resident-fields"
      );
      const editVisitorFields = document.querySelector(
        ".edit-visitor-fields"
      );

      if (parkingData.type.toLowerCase() === "residente") {
        editResidentFields.classList.remove("d-none");
        editVisitorFields.classList.add("d-none");
      } else {
        editResidentFields.classList.add("d-none");
        editVisitorFields.classList.remove("d-none");
      }
    });
  });

  // View button functionality
  const viewButtons = document.querySelectorAll(
    '[data-bs-target="#viewModal"]'
  );
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".card");

      // Get values from the card
      document.getElementById("view-parkingNumber").textContent =
        getCardValue(card, "[data-parking-number]", "Parqueadero ");
      document.getElementById("view-parkingType").textContent =
        getCardValue(card, "[data-parking-type]", "Tipo: ");
      document.getElementById("view-ownerName").textContent =
        getCardValue(card, "[data-owner-name]", "Propietario: ");
      document.getElementById("view-apartment").textContent =
        getCardValue(card, "[data-apartment]", "Apartamento: ");
      document.getElementById("view-licensePlate").textContent =
        getCardValue(card, "[data-license-plate]", "Placa: ");
      document.getElementById("view-vehicleType").textContent =
        getCardValue(card, "[data-vehicle-type]", "Tipo: ");
      document.getElementById("view-carModel").textContent = getCardValue(
        card,
        "[data-vehicle-model]",
        "Modelo: "
      );
    });
  });

  // Helper function to get card values
  function getCardValue(card, selector, prefix) {
    const element = card.querySelector(selector);
    return element ? element.textContent.replace(prefix, "").trim() : "";
  }

  // Form validation for visitor parking
  const visitorForm = document.getElementById("visitorParkingForm");
  if (visitorForm) {
    visitorForm.addEventListener("submit", function (event) {
      if (!this.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.classList.add("was-validated");
    });
  }

  // Container for parking spots
  const parkingContainer = document.querySelector('#guardsContainer') || document.querySelector('.row.g-4');

  // Handle regular parking form submission
  const parkingForm = document.getElementById('parkingForm');
  parkingForm?.addEventListener('submit', function(event) {
      event.preventDefault();
      if (this.checkValidity()) {
          // Get form values
          const parkingData = {
              number: document.getElementById('parkingNumber').value,
              type: document.getElementById('parkingType').value,
              owner: document.getElementById('ownerName').value,
              apartment: document.getElementById('apartment').value,
              plate: document.getElementById('licensePlate').value,
              vehicleType: document.getElementById('vehicleType').value,
              model: document.getElementById('carModel').value
          };

          // Add new parking card
          addParkingCard(parkingData);

          // Close modal and reset form
          const modal = bootstrap.Modal.getInstance(document.getElementById('parkingModal'));
          modal.hide();
          this.reset();
          this.classList.remove('was-validated');
      } else {
          this.classList.add('was-validated');
      }
  });

  // Handle visitor parking form submission
  const visitorParkingForm = document.getElementById('visitorParkingForm');
  visitorParkingForm?.addEventListener('submit', function(event) {
      event.preventDefault();
      if (this.checkValidity()) {
          // Get form values
          const visitorData = {
              number: document.getElementById('visitorParkingNumber').value,
              type: 'visitante',
              owner: document.getElementById('visitorName').value,
              apartment: document.getElementById('visitingApartment').value,
              plate: document.getElementById('visitorLicensePlate').value,
              vehicleType: document.getElementById('visitorVehicleType').value,
              model: document.getElementById('visitorCarModel').value,
              duration: document.getElementById('visitDuration').value
          };

          // Add new visitor parking card
          addParkingCard(visitorData);

          // Close modal and reset form
          const modal = bootstrap.Modal.getInstance(document.getElementById('visitorParkingModal'));
          modal.hide();
          this.reset();
          this.classList.remove('was-validated');
      } else {
          this.classList.add('was-validated');
      }
  });

  // Function to handle parking status toggle
  function handleStatusToggle(switchInput) {
      const card = switchInput.closest('.card');
      const statusBadge = card.querySelector('.badge');
      const isVisitor = card.querySelector('[data-parking-type]').textContent.toLowerCase() === 'visitante';
      const hasOwner = card.querySelector('[data-owner-name]') !== null;
      
      if (switchInput.checked) {
          if (!hasOwner) {
              statusBadge.className = 'badge bg-success';
              statusBadge.textContent = 'Disponible';
          } else if (isVisitor) {
              statusBadge.className = 'badge bg-warning';
              statusBadge.textContent = 'Temporal';
          } else {
              statusBadge.className = 'badge bg-danger';
              statusBadge.textContent = 'Ocupado';
          }
      } else {
          statusBadge.className = 'badge bg-danger';
          statusBadge.textContent = 'Ocupado';
      }
      
      showAlert(`Estado del parqueadero actualizado`, 'success');
  }

  // Add event listeners to existing switches
  document.querySelectorAll('.form-check-input').forEach(switchInput => {
      switchInput.addEventListener('change', function() {
          handleStatusToggle(this);
      });
  });

  // Modify the addParkingCard function to include the toggle functionality
  function addParkingCard(data) {
      const card = document.createElement('article');
      card.className = 'col-xl-2 col-lg-3 col-md-4 col-sm-6';
      
      const isVisitor = data.type === 'visitante';
      const isEmpty = data.isEmpty || !data.owner;
      let status = isEmpty ? 'Disponible' : (isVisitor ? 'Temporal' : 'Ocupado');
      let statusClass = isEmpty ? 'bg-success' : (isVisitor ? 'bg-warning' : 'bg-danger');

      card.innerHTML = `
          <div class="card h-100 shadow-sm">
              <header class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                  <span class="badge ${statusClass}">${status}</span>
                  <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" aria-label="Toggle parking availability" ${isEmpty ? 'checked disabled' : ''}>
                  </div>
              </header>
              <div class="card-body text-center">
                  <i class="bi bi-car-front display-4 mb-3 ${isEmpty ? 'text-muted' : ''}" aria-hidden="true"></i>
                  <h3 class="card-title h5" data-parking-number>Parqueadero ${data.number}</h3>
                  <dl class="small text-muted mb-3">
                      <dt class="visually-hidden">Tipo:</dt>
                      <dd data-parking-type>${data.type}</dd>
                      ${!isEmpty ? `
                      <dt class="visually-hidden">Propietario:</dt>
                      <dd data-owner-name>${data.owner || ''}</dd>
                      <dt class="visually-hidden">Apartamento:</dt>
                      <dd data-apartment>${data.apartment || ''}</dd>
                      <dt class="visually-hidden">Placa:</dt>
                      <dd data-license-plate>${data.plate || ''}</dd>
                      <dt class="visually-hidden">Tipo Vehículo:</dt>
                      <dd data-vehicle-type>${data.vehicleType || ''}</dd>
                      <dt class="visually-hidden">Modelo:</dt>
                      <dd data-vehicle-model>${data.model || ''}</dd>
                      ${isVisitor && data.duration ? `<dt class="visually-hidden">Duración:</dt><dd>${data.duration} horas</dd>` : ''}
                      ` : '<dd>Vacío</dd>'}
                  </dl>
              </div>
              <footer class="card-footer bg-transparent border-0">
                  ${isEmpty ? `
                  <button class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#assignModal">
                      <i class="bi bi-person-plus"></i> Asignar
                  </button>
                  ` : `
                  <div class="btn-group w-100" role="group" aria-label="Acciones de parqueadero">
                      <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#viewModal">
                          <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editModal">
                          <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-sm" onclick="deleteCard(this)">
                          <i class="bi bi-trash"></i>
                      </button>
                  </div>
                  `}
              </footer>
          </div>
      `;

      // Add event listener to the new switch
      const newSwitch = card.querySelector('.form-check-input');
      newSwitch.addEventListener('change', function() {
          handleStatusToggle(this);
      });

      // Determine which container to append to based on type
      const containerSelector = isVisitor ? '#visitorParkingGrid' : '#residentParkingGrid';
      const container = document.querySelector(containerSelector);
      if (container) {
          container.appendChild(card);
      }
      
      showAlert('Parqueadero agregado exitosamente', 'success');
  }

  // Function to delete parking card
  window.deleteCard = function(button) {
      if (confirm('¿Está seguro que desea eliminar este parqueadero?')) {
          const card = button.closest('.col-xl-3');
          card.remove();
          showAlert('Parqueadero eliminado exitosamente', 'danger');
      }
  };

  // Function to show alerts
  function showAlert(message, type) {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
      alertDiv.role = 'alert';
      alertDiv.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(alertDiv);
      
      // Remove alert after 3 seconds
      setTimeout(() => {
          alertDiv.remove();
      }, 3000);
  }

  // Sample data for parking spots
  const parkingSpots = {
    residents: [
      {
        number: "A-101",
        type: "residente",
        owner: "Juan Pérez",
        apartment: "101",
        plate: "ABC123",
        vehicleType: "carro",
        model: "Toyota Corolla 2022",
        status: "disponible"
      },
      {
        number: "A-102",
        type: "residente",
        owner: "María López",
        apartment: "202",
        plate: "XYZ789",
        vehicleType: "carro",
        model: "Mazda 3 2023",
        status: "ocupado"
      },
      {
        number: "A-103",
        type: "residente",
        status: "vacio"
      }
    ],
    visitors: [
      {
        number: "V-01",
        type: "visitante",
        owner: "Ana Martínez",
        apartment: "102",
        plate: "VIS123",
        vehicleType: "carro",
        model: "Chevrolet Spark 2020",
        status: "temporal",
        duration: "2"
      },
      {
        number: "V-02",
        type: "visitante",
        owner: "Pedro Gómez",
        apartment: "203",
        plate: "VIS456",
        vehicleType: "moto",
        model: "Yamaha YBR 2021",
        status: "temporal",
        duration: "4"
      },
      {
        number: "V-03",
        type: "visitante",
        status: "vacio"
      }
    ]
  };

  // Function to filter and sort parking spots
  function filterAndSortParking() {
    const searchTerm = document.getElementById('searchParking').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter and sort resident parking
    const filteredResidents = parkingSpots.residents.filter(spot => {
      const matchesSearch = Object.values(spot).some(value => 
        value.toString().toLowerCase().includes(searchTerm)
      );
      const matchesStatus = statusFilter === 'all' || spot.status === statusFilter;
      const matchesType = typeFilter === 'all' || spot.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    // Filter and sort visitor parking
    const filteredVisitors = parkingSpots.visitors.filter(spot => {
      const matchesSearch = Object.values(spot).some(value => 
        value.toString().toLowerCase().includes(searchTerm)
      );
      const matchesStatus = statusFilter === 'all' || spot.status === statusFilter;
      const matchesType = typeFilter === 'all' || spot.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort the filtered results
    const sortFunction = (a, b) => {
      switch(sortBy) {
        case 'number': return a.number.localeCompare(b.number);
        case 'status': return a.status.localeCompare(b.status);
        case 'type': return a.type.localeCompare(b.type);
        default: return 0;
      }
    };

    filteredResidents.sort(sortFunction);
    filteredVisitors.sort(sortFunction);

    // Update the grids
    updateParkingGrid('residentParkingGrid', filteredResidents);
    updateParkingGrid('visitorParkingGrid', filteredVisitors);
  }

  // Function to update parking grid
  function updateParkingGrid(gridId, spots) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';

    spots.forEach(spot => {
      const card = createParkingCard(spot);
      grid.appendChild(card);
    });
  }

  // Add event listeners for filters
  document.addEventListener('DOMContentLoaded', function() {
    const filterInputs = [
      document.getElementById('searchParking'),
      document.getElementById('statusFilter'),
      document.getElementById('typeFilter'),
      document.getElementById('sortBy')
    ];

    filterInputs.forEach(input => {
      input.addEventListener('input', filterAndSortParking);
      input.addEventListener('change', filterAndSortParking);
    });

    // Initial load
    filterAndSortParking();
  });

  // Handle assignment modal
  document.addEventListener('DOMContentLoaded', function() {
    // Handle assignment button clicks
    document.querySelectorAll('[data-bs-target="#assignModal"]').forEach(button => {
      button.addEventListener('click', function() {
        const card = this.closest('.card');
        const parkingNumber = card.querySelector('[data-parking-number]').textContent;
        const parkingType = card.querySelector('[data-parking-type]').textContent;
        
        // Set the parking number in the modal
        document.getElementById('assignParkingNumber').value = parkingNumber;
        
        // Set the type based on the parking spot
        const assignType = document.getElementById('assignType');
        assignType.value = parkingType.toLowerCase();
        
        // Trigger the type change to show/hide appropriate fields
        assignType.dispatchEvent(new Event('change'));
      });
    });

    // Handle assignment type change
    document.getElementById('assignType').addEventListener('change', function() {
      const residentFields = document.querySelectorAll('.resident-fields');
      const visitorFields = document.querySelectorAll('.visitor-fields');
      
      if (this.value === 'residente') {
        residentFields.forEach(field => field.classList.remove('d-none'));
        visitorFields.forEach(field => field.classList.add('d-none'));
      } else if (this.value === 'visitante') {
        residentFields.forEach(field => field.classList.add('d-none'));
        visitorFields.forEach(field => field.classList.remove('d-none'));
      }
    });

    // Handle assignment form submission
    document.getElementById('assignForm')?.addEventListener('submit', function(event) {
      event.preventDefault();
      if (this.checkValidity()) {
        const parkingNumber = document.getElementById('assignParkingNumber').value;
        const type = document.getElementById('assignType').value;
        const data = {
          number: parkingNumber,
          type: type,
          plate: document.getElementById('assignLicensePlate').value,
          vehicleType: document.getElementById('assignVehicleType').value,
          model: document.getElementById('assignVehicleModel').value
        };

        if (type === 'residente') {
          const resident = document.getElementById('assignResident').value;
          const [owner, apartment] = document.getElementById('assignResident')
            .options[document.getElementById('assignResident').selectedIndex]
            .text.split(' (');
          data.owner = owner;
          data.apartment = apartment.replace(')', '');
        } else {
          data.owner = document.getElementById('assignVisitorName').value;
          data.apartment = document.getElementById('assignVisitingApartment').value;
          data.duration = document.getElementById('assignVisitDuration').value;
        }

        // Find and update the card
        const card = findParkingCard(parkingNumber);
        if (card) {
          // Update status badge
          const statusBadge = card.querySelector('.badge');
          const statusSwitch = card.querySelector('.form-check-input');
          
          if (type === 'visitante') {
            statusBadge.className = 'badge bg-warning';
            statusBadge.textContent = 'Temporal';
          } else {
            statusBadge.className = 'badge bg-danger';
            statusBadge.textContent = 'Ocupado';
          }
          
          // Update switch
          statusSwitch.checked = false;
          statusSwitch.disabled = false;

          // Update card content
          const cardBody = card.querySelector('.card-body');
          const carIcon = cardBody.querySelector('.bi-car-front');
          carIcon.classList.remove('text-muted');
          
          const detailsList = cardBody.querySelector('dl');
          detailsList.innerHTML = `
            <dt class="visually-hidden">Tipo:</dt>
            <dd data-parking-type>${type}</dd>
            <dt class="visually-hidden">Propietario:</dt>
            <dd data-owner-name>${data.owner}</dd>
            <dt class="visually-hidden">Apartamento:</dt>
            <dd data-apartment>${data.apartment}</dd>
            <dt class="visually-hidden">Placa:</dt>
            <dd data-license-plate>${data.plate}</dd>
            <dt class="visually-hidden">Tipo Vehículo:</dt>
            <dd data-vehicle-type>${data.vehicleType}</dd>
            <dt class="visually-hidden">Modelo:</dt>
            <dd data-vehicle-model>${data.model}</dd>
            ${type === 'visitante' ? `<dt class="visually-hidden">Duración:</dt><dd>${data.duration} horas</dd>` : ''}
          `;

          // Update footer buttons
          const footer = card.querySelector('.card-footer');
          footer.innerHTML = `
            <div class="btn-group w-100" role="group" aria-label="Acciones de parqueadero">
              <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#viewModal">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editModal">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="deleteCard(this)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          `;

          // Update the data in parkingSpots array
          const spotType = type === 'residente' ? 'residents' : 'visitors';
          const spotIndex = parkingSpots[spotType].findIndex(spot => spot.number === parkingNumber);
          if (spotIndex !== -1) {
            parkingSpots[spotType][spotIndex] = data;
          }

          // Show success message
          showAlert('Parqueadero asignado exitosamente', 'success');

          // Close the modal and reset the form
          const modal = bootstrap.Modal.getInstance(document.getElementById('assignModal'));
          modal.hide();
          this.reset();
          this.classList.remove('was-validated');
        }
      } else {
        this.classList.add('was-validated');
      }
    });
  });

  // Helper function to find parking card by number
  function findParkingCard(parkingNumber) {
    const allCards = document.querySelectorAll('.card');
    for (const card of allCards) {
      const numberElement = card.querySelector('[data-parking-number]');
      if (numberElement && numberElement.textContent.includes(parkingNumber)) {
        return card.closest('article');
      }
    }
    return null;
  }

  // Handle empty parking spot functionality
  document.addEventListener('DOMContentLoaded', function() {
    const isEmptyParkingCheckbox = document.getElementById('isEmptyParking');
    const parkingDetailsSection = document.querySelector('.parking-details');
    const parkingForm = document.getElementById('parkingForm');
    const requiredFields = parkingForm.querySelectorAll('[required]');

    // Function to toggle parking details visibility
    function toggleParkingDetails() {
        if (isEmptyParkingCheckbox.checked) {
            parkingDetailsSection.style.display = 'none';
            // Remove required attribute from all fields
            requiredFields.forEach(field => {
                field.removeAttribute('required');
            });
        } else {
            parkingDetailsSection.style.display = 'block';
            // Add required attribute back to fields
            requiredFields.forEach(field => {
                field.setAttribute('required', '');
            });
        }
    }

    // Add event listener to checkbox
    if (isEmptyParkingCheckbox) {
        isEmptyParkingCheckbox.addEventListener('change', toggleParkingDetails);
        // Initial state
        toggleParkingDetails();
    }

    // Handle form submission
    if (parkingForm) {
        parkingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                number: document.getElementById('parkingNumber').value,
                type: document.getElementById('parkingType').value,
                isEmpty: isEmptyParkingCheckbox.checked
            };

            if (!formData.isEmpty) {
                // Add additional data for non-empty parking spots
                formData.plate = document.getElementById('licensePlate').value;
                formData.vehicleType = document.getElementById('vehicleType').value;
                formData.model = document.getElementById('carModel').value;

                if (formData.type === 'residente') {
                    formData.owner = document.getElementById('ownerName').value;
                    formData.apartment = document.getElementById('apartment').value;
                } else if (formData.type === 'visitante') {
                    formData.owner = document.getElementById('visitorName').value;
                    formData.duration = document.getElementById('visitDuration').value;
                    formData.apartment = document.getElementById('visitingApartment').value;
                }
            }

            // Add the new parking spot
            addParkingCard(formData);
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('parkingModal'));
            modal.hide();
            
            // Reset the form
            this.reset();
            toggleParkingDetails();
        });
    }
  });
});
