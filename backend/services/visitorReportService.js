import visitorController from "../controllers/visitor.controller.js";

export async function getVisitorReportData() {
  const visitors = await visitorController.getAllVisitors();

  return visitors.map((v) => ({
    name: v.name,
    documentNumber: v.documentNumber,
    host_name: v.host_name,
  }));
}
