export default function packageArrivalTemplate(data) {
  const {
    ownerName = "guerrero",
    packageId = "PKG-000000",
    packageType = "paquete",
    sender = "No especificado",
    description = "Sin descripción",
    apartment = "N/A",
    tower = "N/A",
    receivedAt = new Date().toLocaleString(),
    guardName = "Guardia de seguridad",
  } = data;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>¡Tu paquete ha llegado a Valhalla!</title>
    <style>
      body {
        background-color: #E6E6FA; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        background-color: #ffffff;
        margin: 40px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .header {
        background-color: #494CA2; 
        color: #F3F3FF; 
        text-align: center;
        padding: 20px 0;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px 40px;
        color: #333333;
        line-height: 1.6;
        text-align: center;
      }
      .package-details {
        border: 2px solid #494CA2; 
        border-radius: 8px;
        padding: 20px;
        margin: 25px auto;
        max-width: 400px;
        background-color: #ffffff;
        text-align: left;
      }
      .package-details p {
        margin: 10px 0;
        font-size: 16px;
      }
      .package-number {
        color: #6A5ACD; 
        font-weight: bold;
        font-size: 18px;
      }
      .detail-label {
        font-weight: bold;
        color: #494CA2;
        display: inline-block;
        width: 150px;
      }
      .footer {
        text-align: center;
        color: #888;
        font-size: 13px;
        padding: 15px 0 30px 0;
        border-top: 1px solid #eee;
        margin-top: 20px;
      }
      .status-badge {
        display: inline-block;
        background-color: #28a745;
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
        margin-left: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📦 Valhalla - Notificación de Paquete</h1>
      </div>
      <div class="content">
        <h2>¡Hola ${ownerName}!</h2>
        
        <p>Se ha registrado un nuevo paquete a tu nombre en Valhalla. Aquí están los detalles:</p>

        <div class="package-details">
          <p><span class="detail-label">ID del Paquete:</span> <span class="package-number">${packageId}</span></p>
          <p><span class="detail-label">Tipo:</span> ${packageType}</p>
          <p><span class="detail-label">Remitente:</span> ${sender}</p>
          <p><span class="detail-label">Descripción:</span> ${description}</p>
          <p><span class="detail-label">Destino:</span> Torre ${tower}, Apartamento ${apartment}</p>
          <p><span class="detail-label">Recibido por:</span> ${guardName}</p>
          <p><span class="detail-label">Fecha/Hora:</span> ${receivedAt}</p>
          <p><span class="detail-label">Estado:</span> <span class="status-badge">RECIBIDO</span></p>
        </div>

        <p>Puedes pasar a recoger tu paquete por la portería presentando tu identificación.</p>
        
        <p style="margin-top: 25px; font-size: 15px; color: #666;">
          <strong>📋 Información importante:</strong><br>
          • Horario de recogida: Lunes a Viernes 8:00 AM - 6:00 PM<br>
          • Presenta esta notificación o tu documento de identidad<br>
          • El paquete será almacenado por máximo 15 días
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Si tienes alguna pregunta, contacta con la portería.<br>
          ¡Gracias por confiar en Valhalla!
        </p>
      </div>
      <div class="footer">
        © 2025 Valhalla App. Sistema de Gestión de Paquetes.<br>
        Este es un mensaje automático, por favor no responder.
      </div>
    </div>
  </body>
  </html>
  `;
}