import express from 'express';
import cors from 'cors';
import { verifyToken } from "../middleware/authMiddleware.js";
// Importar rutas
import parkingRouter from '../routers/parking.route.js'

const name = '/'
const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Rutas
app.use('/', parkingRouter);


// End point losses
app.use((rep, res, next) => {
    res.status(404).json({
        message: 'Endpoint losses'
    })
})

export default app;