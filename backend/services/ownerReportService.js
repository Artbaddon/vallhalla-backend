import ownerController from "../controllers/owner.controller.js";

export async function getOwnerReportData() {
  const owners = await ownerController.getAllowners();

  return owners.map((o) => ({
    name: o.Users_name,
    profileName: o.Profile_fullName,
    status: o.User_status_name,
    documentNumber: o.Profile_document_number,
    phoneNumber: o.Profile_telephone_number,
  }));
}