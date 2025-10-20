export default function forgotPasswordTemplate(user, token) {
  // Color Definitions:
  // secondaryColor: #494CA2 (Dark Blue/Indigo)
  // accentColor: #6A5ACD (Slate Blue - for highlighting)
  // textColor: #F3F3FF (Off-White - for text on dark backgrounds)
  // lightBackground: #E6E6FA (Pale Lavender - for main body background)

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restablecer contraseña</title>
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
      }
      .token-box {
        /* Using secondaryColor: #494CA2 */
        background-color: #494CA2; 
        /* Using textColor: #F3F3FF */
        color: #F3F3FF; 
        font-size: 22px;
        letter-spacing: 2px;
        font-weight: bold;
        text-align: center;
        border-radius: 6px;
        padding: 12px 0;
        margin: 25px 0;
      }
      .expiration-time {
        /* Using accentColor: #6A5ACD */
        color: #6A5ACD; 
        font-weight: bold;
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
        <h1>⚔️ Valhalla</h1> 
      </div>
      <div class="content">
        <h2>Hola ${user.Users_name || "guerrero"},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña en <strong>Valhalla</strong>.</p>
        <p>Utiliza el siguiente código para continuar con el proceso:</p>

        <div class="token-box">${token}</div>

        <p>Este código expirará en <strong class="expiration-time">1 hora</strong>.</p>
        <!-- Párrafo modificado para añadir un margen superior y mejorar la separación del footer -->
        <p style="margin-top: 20px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p> 
      </div>
      <div class="footer">
        © 2025 Valhalla App. Todos los derechos reservados.
      </div>
    </div>
  </body>
  </html>
  `;
}