import nodemailer from "nodemailer";

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "valhalla.email.co@gmail.com",
    pass: "vbxc yirc rxiz omwl",
  },
});

// Verificar conexión (opcional)
transporter.verify()
  .then(() => console.log("✅ Servidor de correo listo para enviar mensajes"))
  .catch((err) => {
    console.error("❌ Error al conectar con el servidor de correo:");

    if (err.code === 'EAUTH') {
      console.error("🔑 Error de autenticación: verifica tu correo o la contraseña de aplicación.");
    } else if (err.code === 'ENOTFOUND') {
      console.error("🌐 No se encontró el servidor SMTP. Revisa tu conexión o el host configurado.");
    } else if (err.code === 'ECONNECTION') {
      console.error("⚡ No se pudo establecer conexión con el servidor SMTP (puerto o firewall).");
    } else if (err.code === 'ESOCKET') {
      console.error("🧱 Error de socket SSL/TLS: podría ser por 'secure: true/false' incorrecto.");
    } else {
      console.error("❓ Error desconocido:", err);
    }
  });


export default transporter;
