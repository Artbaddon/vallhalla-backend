import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const sslCertPath = '/home/deploy/DigiCertGlobalRootCA.crt.pem';
const sslOptions = fs.existsSync(sslCertPath)
  ? {
      ca: fs.readFileSync(sslCertPath),
      rejectUnauthorized: false,
    }
  : undefined;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

if (sslOptions) {
  dbConfig.ssl = sslOptions;
}

export async function seedParkingAndPets() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🚗 Sembrando parqueaderos y mascotas...');

    // Sembrar Tipos de Vehículos
    const vehicles = [
      { name: 'Automóvil', plate: 'ABC123', model: '2022', brand: 'Toyota', color: 'Rojo', engineCC: '2000cc' },
      { name: 'Motocicleta', plate: 'XYZ789', model: '2021', brand: 'Honda', color: 'Negro', engineCC: '150cc' },
      { name: 'Bicicleta', plate: null, model: '2023', brand: 'Trek', color: 'Azul', engineCC: null },
      { name: 'Camioneta', plate: 'DEF456', model: '2023', brand: 'Honda', color: 'Plateado', engineCC: '2500cc' },
      { name: 'Scooter', plate: 'GHI789', model: '2022', brand: 'Yamaha', color: 'Azul', engineCC: '125cc' },
      { name: 'Van', plate: 'JKL012', model: '2021', brand: 'Ford', color: 'Blanco', engineCC: '3000cc' },
      { name: 'Carro Eléctrico', plate: 'ELE001', model: '2024', brand: 'Tesla', color: 'Blanco', engineCC: null },
      { name: 'Camión', plate: 'TRK555', model: '2020', brand: 'Chevrolet', color: 'Gris', engineCC: '4000cc' }
    ];

    for (const vehicle of vehicles) {
      await connection.query(`
        INSERT INTO vehicle_type (
          Vehicle_type_name, vehicle_plate, vehicle_model, 
          vehicle_brand, vehicle_color, vehicle_engineCC
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE vehicle_plate = VALUES(vehicle_plate)
      `, [vehicle.name, vehicle.plate, vehicle.model, vehicle.brand, vehicle.color, vehicle.engineCC]);
    }
    console.log(`   ✓ ${vehicles.length} tipos de vehículos creados`);

    // Sembrar Espacios de Parqueadero
    const [parkingStatuses] = await connection.query('SELECT Parking_status_id, Parking_status_name FROM parking_status');
    const [parkingTypes] = await connection.query('SELECT Parking_type_id, Parking_type_name FROM parking_type');
    const [vehicleTypes] = await connection.query('SELECT Vehicle_type_id FROM vehicle_type LIMIT 8');
    const [users] = await connection.query('SELECT Users_id FROM users WHERE Role_FK_ID = (SELECT Role_id FROM role WHERE Role_name = "Propietario") LIMIT 8');

    const available = parkingStatuses.find(s => s.Parking_status_name === 'Disponible').Parking_status_id;
    const occupied = parkingStatuses.find(s => s.Parking_status_name === 'Ocupado').Parking_status_id;
    const regular = parkingTypes.find(t => t.Parking_type_name === 'Regular').Parking_type_id;
    const visitor = parkingTypes.find(t => t.Parking_type_name === 'Visitante').Parking_type_id;
    const disabled = parkingTypes.find(t => t.Parking_type_name === 'Discapacitado').Parking_type_id;

    const parkingSpots = [
      { num: 'A-01', status: occupied, vehicle: vehicleTypes[0].Vehicle_type_id, type: regular, user: users[0].Users_id },
      { num: 'A-02', status: available, vehicle: vehicleTypes[1].Vehicle_type_id, type: regular, user: users[1].Users_id },
      { num: 'A-03', status: occupied, vehicle: vehicleTypes[2].Vehicle_type_id, type: regular, user: users[2].Users_id },
      { num: 'A-04', status: occupied, vehicle: vehicleTypes[3].Vehicle_type_id, type: regular, user: users[3].Users_id },
      { num: 'B-01', status: available, vehicle: vehicleTypes[4].Vehicle_type_id, type: regular, user: users[4].Users_id },
      { num: 'B-02', status: occupied, vehicle: vehicleTypes[5].Vehicle_type_id, type: regular, user: users[5].Users_id },
      { num: 'V-01', status: available, vehicle: null, type: visitor, user: null },
      { num: 'V-02', status: available, vehicle: null, type: visitor, user: null },
      { num: 'D-01', status: available, vehicle: null, type: disabled, user: null }
    ];

    for (const spot of parkingSpots) {
      await connection.query(`
        INSERT INTO parking (
          Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, 
          Parking_type_ID_FK, User_ID_FK
        ) VALUES (?, ?, ?, ?, ?)
      `, [spot.num, spot.status, spot.vehicle, spot.type, spot.user]);
    }
    console.log(`   ✓ ${parkingSpots.length} espacios de parqueadero creados`);

    // Sembrar Mascotas
    const [owners] = await connection.query('SELECT Owner_id FROM owner LIMIT 6');

    const pets = [
      { name: 'Max', species: 'Perro', breed: 'Golden Retriever', vaccination: 'carnet_vacunacion.pdf', photo: 'max.jpg', owner: owners[0].Owner_id },
      { name: 'Luna', species: 'Gato', breed: 'Persa', vaccination: 'carnet_vacunacion.pdf', photo: 'luna.jpg', owner: owners[0].Owner_id },
      { name: 'Rocky', species: 'Perro', breed: 'Pastor Alemán', vaccination: 'carnet_vacunacion.pdf', photo: 'rocky.jpg', owner: owners[1].Owner_id },
      { name: 'Milo', species: 'Perro', breed: 'Labrador', vaccination: 'carnet_vacunacion.pdf', photo: 'milo.jpg', owner: owners[2].Owner_id },
      { name: 'Bella', species: 'Gato', breed: 'Siamés', vaccination: 'carnet_vacunacion.pdf', photo: 'bella.jpg', owner: owners[3].Owner_id },
      { name: 'Charlie', species: 'Perro', breed: 'Poodle', vaccination: 'carnet_vacunacion.pdf', photo: 'charlie.jpg', owner: owners[4].Owner_id },
      { name: 'Simba', species: 'Gato', breed: 'Maine Coon', vaccination: 'carnet_vacunacion.pdf', photo: 'simba.jpg', owner: owners[5].Owner_id },
      { name: 'Buddy', species: 'Perro', breed: 'Beagle', vaccination: 'carnet_vacunacion.pdf', photo: 'buddy.jpg', owner: owners[1].Owner_id }
    ];

    for (const pet of pets) {
      await connection.query(`
        INSERT INTO pet (
          Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, 
          Pet_Photo, Owner_FK_ID
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [pet.name, pet.species, pet.breed, pet.vaccination, pet.photo, pet.owner]);
    }
    console.log(`   ✓ ${pets.length} mascotas creadas`);

    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando parqueaderos y mascotas:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedParkingAndPets().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
