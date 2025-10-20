import XlsxPopulate from "xlsx-populate";

/**
 * Genera un archivo Excel con datos dinámicos.
 *
 * @param {Array} data - Lista de objetos con los datos (ej: [{name: 'Aldair', age: 25}])
 * @param {Array} headers - Lista de columnas [{ key: 'name', label: 'Nombre' }]
 * @param {String} reportName - Nombre base del archivo (ej: 'visitors', 'pets', etc.)
 * @param {Boolean} saveToFile - Si true, guarda el archivo en disco. Si false, devuelve buffer.
 * @returns {Promise<Buffer|void>}
 */
export async function generateExcelReport(
  data = [],
  headers = [],
  reportName = "reporte",
  saveToFile = true
) {
  try {
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0).name("Reporte");

    // ======================
    // Cabeceras dinámicas
    // ======================
    headers.forEach((header, i) => {
      const col = String.fromCharCode(65 + i); // A, B, C...
      sheet.cell(`${col}1`).value(header.label);
    });

    // ======================
    // Llenar filas
    // ======================
    data.forEach((item, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const col = String.fromCharCode(65 + colIndex);
        sheet.cell(`${col}${rowIndex + 2}`).value(item[header.key] ?? "");
      });
    });

    // ======================
    // Estilos
    // ======================
    const lastCol = String.fromCharCode(64 + headers.length);
    const headerRange = sheet.range(`A1:${lastCol}1`);
    headerRange.style({
      bold: true,
      fill: "BFBFBF",
      horizontalAlignment: "center",
    });

    // Ajustar ancho columnas
    headers.forEach((_, i) => {
      const col = String.fromCharCode(65 + i);
      sheet.column(col).width(20);
    });

    // ======================
    // Nombre dinámico del archivo
    // ======================
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const fileName = `./reporte_${reportName}_${date}.xlsx`;

    // ======================
    // Guardar o devolver buffer
    // ======================
    if (saveToFile) {
      await workbook.toFileAsync(fileName);
      console.log(`✅ Archivo '${fileName}' generado correctamente.`);
      return;
    } else {
      const buffer = await workbook.outputAsync();
      return buffer;
    }
  } catch (error) {
    console.error("❌ Error generando Excel:", error);
    throw error;
  }
}
