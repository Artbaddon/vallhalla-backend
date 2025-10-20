import petController from "../controllers/pet.controller.js";

export async function getPetReportData() {
  // obtenemos todas las mascotas (ejemplo, si tienes un controlador)
  const pets = await petController.getAllpets(); 

  // mapeamos solo los datos que necesitamos para el reporte
  return pets.map(pet => ({
    name: pet.Pet_name,
    species: pet.Pet_species,
    breed: pet.Pet_Breed,
  }));
}
