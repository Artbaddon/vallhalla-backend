import FacilityModel from "../models/facility.model.js";

export const register = async (req, res) => {
  try {
    const { name, description, capacity, status } = req.body;

    // Validate required fields
    if (!name || !capacity) {
      return res.status(400).json({ error: "Name and capacity are required" });
    }

    const result = await FacilityModel.create({
      name,
      description,
      capacity,
      status: status || "available",
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      message: "Facility created successfully",
      id: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const result = await FacilityModel.show();
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({
      message: "Facility retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const findById = async (req, res) => {
  try {
    const result = await FacilityModel.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Facility not found" });
    }
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({
      message: "Facility retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { name, description, capacity, status } = req.body;

    // Validate at least one field to update
    if (!name && !description && !capacity && !status) {
      return res
        .status(400)
        .json({ error: "At least one field to update is required" });
    }

    const result = await FacilityModel.update(req.params.id, {
      name,
      description,
      capacity,
      status,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({ message: "Facility updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await FacilityModel.delete(req.params.id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({
      message: "Facility deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const findByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: "Status parameter is required" });
    }

    const result = await FacilityModel.findByStatus(status);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({
      message: "Facility status retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const result = await FacilityModel.updateStatus(req.params.id, status);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res
      .status(200)
      .json({
        message: "Facility status updated successfully",
        id: req.params.id,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const result = await FacilityModel.checkAvailability(start_date, end_date);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
