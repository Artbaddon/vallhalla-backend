export default function packageArrivalTemplate(user, packageNumber) {
  // Color Definitions:
  // secondaryColor: #494CA2 (Dark Blue/Indigo)
  // accentColor: #6A5ACD (Slate Blue - for the main button)
  // textColor: #F3F3FF (Off-White - for text on dark backgrounds)
  // lightBackground: #E6E6FA (Pale Lavender - for main body background)

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>¡Tu paquete ha llegado!</title>
    <style>
      body {
        /* Using lightBackground: #E6E6FA */
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
        /* Using secondaryColor: #494CA2 */
        background-color: #494CA2; 
        /* Using textColor: #F3F3FF */
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
        max-width: 350px;
        background-color: #ffffff;
        text-align: left;
      }
      .package-details p {
        margin: 8px 0;
        font-size: 16px;
      }
      .package-number {
        /* Usando accentColor para resaltar el número */
        color: #6A5ACD; 
        font-weight: bold;
        font-size: 18px;
      }
      /* CTA styles kept, but not used in the HTML now */
      .button-cta {
        display: inline-block;
        background-color: #6A5ACD; 
        color: #F3F3FF; 
        text-decoration: none;
        padding: 12px 25px;
        margin-top: 20px;
        border-radius: 5px;
        font-weight: bold;
        font-size: 16px;
      }
      .footer {
        text-align: center;
        color: #888;
        font-size: 13px;
        padding: 15px 0 30px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📦 Valhalla</h1>
      </div>
      <div class="content">
        <h2>¡Hola ${user.Users_name || "guerrero"}!</h2>
        
        <p>¡Tenemos buenas noticias! Un nuevo paquete ha sido registrado en Valhalla y está listo para ser recogido o gestionado.</p>

        <div class="package-details">
          <p><strong>Destinatario:</strong> ${user.Users_name || "Guerrero Valiente"}</p>
          <p><strong>Número de Paquete:</strong> <span class="package-number">${packageNumber}</span></p>
          <p><strong>Estado:</strong> <span style="color:#28a745; font-weight:bold;">Listo para entrega/recogida</span></p>
        </div>

        <p>Por favor, usa el número de paquete para cualquier consulta o gestión.</p>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">Gracias por confiar en Valhalla.</p>
      </div>
      <div class="footer">
        © 2025 Valhalla App. Todos los derechos reservados.
      </div>
    </div>
  </body>
  </html>
  `;
}