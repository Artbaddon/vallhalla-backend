import VehicleTypeModel from "../models/vehicleType.model.js";

class VehicleTypeController {
  async register(req, res) {
    const { Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color } = req.body;

    if (!Vehicle_type_name) {
      return res
        .status(400)
        .json({ success: false, error: "Vehicle_type_name es obligatorio" });
    }

    const result = await VehicleTypeModel.create({
      Vehicle_type_name,
      vehicle_plate,
      vehicle_model,
      vehicle_brand,
      vehicle_color
    });

    if (result.error) {
      if (result.error === "duplicate") {
        return res
          .status(409)
          .json({ success: false, error: "Ya existe un tipo de vehículo con ese nombre" });
      }
      return res
        .status(500)
        .json({ success: false, error: "Error al registrar el vehículo" });
    }

    res.status(201).json({
      success: true,
      message: "Vehículo registrado exitosamente",
      data: { id: result.id },
    });
  }

  async show(req, res) {
    const data = await VehicleTypeModel.findAll();
    res.status(200).json({ 
      success: true, 
      data,
      count: data.length
    });
  }

  async findById(req, res) {
    const { id } = req.params;
    const data = await VehicleTypeModel.findById(id);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: "Vehículo no encontrado" });
    }
    res.status(200).json({ success: true, data });
  }

  async update(req, res) {
    const { id } = req.params;
    const { Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color } = req.body;

    if (!Vehicle_type_name) {
      return res
        .status(400)
        .json({ success: false, error: "Vehicle_type_name es obligatorio" });
    }

    const result = await VehicleTypeModel.update(id, {
      Vehicle_type_name,
      vehicle_plate,
      vehicle_model,
      vehicle_brand,
      vehicle_color
    });

    if (result.error) {
      if (result.error === "duplicate") {
        return res
          .status(409)
          .json({ success: false, error: "Ya existe un tipo de vehículo con ese nombre" });
      }
      return res
        .status(400)
        .json({ success: false, error: "Error al actualizar el vehículo" });
    }

    if (!result.success) {
      return res
        .status(404)
        .json({ success: false, error: "Vehículo no encontrado" });
    }

    res
      .status(200)
      .json({ success: true, message: "Vehículo actualizado correctamente" });
  }

  async delete(req, res) {
    const { id } = req.params;
    const success = await VehicleTypeModel.delete(id);

    if (!success) {
      return res
        .status(404)
        .json({ success: false, error: "Error al eliminar el vehículo" });
    }

    res.status(200).json({ success: true, message: "Vehículo eliminado correctamente" });
  }
}

export default new VehicleTypeController();