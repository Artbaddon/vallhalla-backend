import VehicleTypeModel from "../models/vehicleType.model.js";

class VehicleTypeController {
  async register(req, res) {
    const { Vehicle_name, Vehicle_number, Owner } = req.body;

    if (!Vehicle_name || !Vehicle_number) {
      return res
        .status(400)
        .json({ success: false, error: "Faltan campos obligatorios" });
    }

    const id = await VehicleTypeModel.create({
      Vehicle_name,
      Vehicle_number,
      Owner,
    });

    if (!id) {
      return res
        .status(500)
        .json({ success: false, error: "No se pudo crear el vehículo" });
    }

    res.status(201).json({
      success: true,
      message: "Vehículo creado exitosamente",
      data: { id },
    });
  }

  async show(req, res) {
    const data = await VehicleTypeModel.findAll();
    res.status(200).json({ success: true, data });
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
    const { Vehicle_name, Vehicle_number, Owner} = req.body;

    const success = await VehicleTypeModel.update(id, {
      Vehicle_name,
      Vehicle_number,
      Owner,
    });

    if (!success) {
      return res
        .status(400)
        .json({ success: false, error: "No se pudo actualizar" });
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
        .json({ success: false, error: "No se pudo eliminar el vehículo" });
    }

    res.status(200).json({ success: true, message: "Vehículo eliminado" });
  }
}

export default new VehicleTypeController();