import express from 'express';
import cors from 'cors';
// Importar rutas
import parkingRouter from '../routers/parking.route.js';
import vehicleTypeRouter from '../routers/vehicleType.route.js';

const name = '/'
const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Rutas
app.use(name, parkingRouter);
app.use(name, vehicleTypeRouter);


// End point losses
app.use((rep, res, next) => {
    res.status(404).json({
        message: 'Endpoint losses'
    })
})

export default app;