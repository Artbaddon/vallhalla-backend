import PQRSCategoryModel from "../models/pqrsCategory.model.js";

class PQRSCategoryController {
  async register(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ 
          error: "Name is required" 
        });
      }

      const categoryId = await PQRSCategoryModel.create({
        name,
        description: description || null
      });

      if (categoryId.error) {
        return res.status(400).json({ error: categoryId.error });
      }

      res.status(201).json({
        message: "PQRS category created successfully",
        id: categoryId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const categories = await PQRSCategoryModel.show();

      if (categories.error) {
        return res.status(500).json({ error: categories.error });
      }

      res.status(200).json({
        message: "PQRS categories retrieved successfully",
        categories: categories,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { name, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Category ID is required" });
      }

      const updateResult = await PQRSCategoryModel.update(id, {
        name,
        description
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "PQRS category updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating PQRS category:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Category ID is required" });
      }

      const deleteResult = await PQRSCategoryModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "PQRS category deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting PQRS category:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Category ID is required" });
      }

      const category = await PQRSCategoryModel.findById(id);

      if (!category) {
        return res.status(404).json({ error: "PQRS category not found" });
      }

      res.status(200).json({
        message: "PQRS category found successfully",
        category: category,
      });
    } catch (error) {
      console.error("Error finding PQRS category by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PQRSCategoryController();