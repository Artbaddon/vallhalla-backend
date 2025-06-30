import express from 'express';
import cors from 'cors';
// Importar ruta
import surveyRouter from '../routers/survey.route.js'
import questionRouter from '../routers/question.route.js'
import answerRouter from '../routers/answer.route.js'

const name = '/'
const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Rutas
app.use(name, surveyRouter);
app.use(name, questionRouter);
app.use(name, answerRouter);

// End point losses
app.use((rep, res, next) => {
    res.status(404).json({
        message: 'Endpoint losses'
    })
})

export default app;