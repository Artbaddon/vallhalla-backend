import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const sslCertPath = '/home/deploy/DigiCertGlobalRootCA.crt.pem';
const sslOptions = fs.existsSync(sslCertPath)
  ? {
      ca: fs.readFileSync(sslCertPath),
      rejectUnauthorized: false,
    }
  : undefined;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

if (sslOptions) {
  dbConfig.ssl = sslOptions;
}

export async function seedSurveysAndVisitors() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('📊 Sembrando encuestas y visitantes...');

    // Sembrar Encuestas
    const surveys = [
      { title: 'Encuesta de Satisfacción de Residentes', status: 'active' },
      { title: 'Encuesta de Uso de Instalaciones', status: 'draft' },
      { title: 'Retroalimentación de Servicios de Seguridad', status: 'active' },
      { title: 'Planificación de Eventos Comunitarios', status: 'draft' },
      { title: 'Encuesta de Calidad de Mantenimiento', status: 'active' }
    ];

    for (const survey of surveys) {
      await connection.query(`
        INSERT INTO survey (title, status) VALUES (?, ?)
      `, [survey.title, survey.status]);
    }
    console.log(`   ✓ ${surveys.length} encuestas creadas`);

    // Obtener IDs de encuestas y tipos de preguntas
    const [surveysResult] = await connection.query('SELECT survey_id, title FROM survey');
    const [questionTypes] = await connection.query('SELECT question_type_id, Question_type_name FROM question_type');

    const textType = questionTypes.find(t => t.Question_type_name === 'texto').question_type_id;
    const multipleChoice = questionTypes.find(t => t.Question_type_name === 'opcion_multiple').question_type_id;
    const checkbox = questionTypes.find(t => t.Question_type_name === 'casilla_verificacion').question_type_id;
    const rating = questionTypes.find(t => t.Question_type_name === 'calificacion').question_type_id;

    const satisfactionSurvey = surveysResult.find(s => s.title === 'Encuesta de Satisfacción de Residentes').survey_id;
    const facilitySurvey = surveysResult.find(s => s.title === 'Encuesta de Uso de Instalaciones').survey_id;
    const securitySurvey = surveysResult.find(s => s.title === 'Retroalimentación de Servicios de Seguridad').survey_id;

    // Sembrar Preguntas
    const questions = [
      { 
        survey: satisfactionSurvey, 
        title: '¿Qué tan satisfecho está con el mantenimiento del edificio?', 
        type: rating, 
        options: '["1", "2", "3", "4", "5"]' 
      },
      { 
        survey: satisfactionSurvey, 
        title: '¿Qué instalaciones usa con mayor frecuencia?', 
        type: checkbox, 
        options: '["Gimnasio", "Piscina", "Zona BBQ", "Salón de Fiestas"]' 
      },
      { 
        survey: facilitySurvey, 
        title: '¿Cuándo suele usar el gimnasio?', 
        type: multipleChoice, 
        options: '["Mañana", "Tarde", "Noche", "Madrugada"]' 
      },
      { 
        survey: satisfactionSurvey, 
        title: 'Califique el servicio de seguridad en general', 
        type: rating, 
        options: '["1", "2", "3", "4", "5"]' 
      },
      { 
        survey: securitySurvey, 
        title: '¿Qué medidas de seguridad necesitan mejorar?', 
        type: checkbox, 
        options: '["Cámaras", "Guardias", "Control de Acceso", "Seguridad del Parqueadero"]' 
      },
      { 
        survey: facilitySurvey, 
        title: '¿Qué tipo de eventos comunitarios le interesan?', 
        type: checkbox, 
        options: '["Deportivos", "Culturales", "Educativos", "Sociales"]' 
      },
      { 
        survey: securitySurvey, 
        title: '¿Qué tan rápido se resuelven los problemas de mantenimiento?', 
        type: rating, 
        options: '["1", "2", "3", "4", "5"]' 
      },
      { 
        survey: satisfactionSurvey, 
        title: '¿Algún comentario o sugerencia adicional?', 
        type: textType, 
        options: null 
      }
    ];

    for (const question of questions) {
      await connection.query(`
        INSERT INTO question (survey_id, title, question_type_id, options)
        VALUES (?, ?, ?, ?)
      `, [question.survey, question.title, question.type, question.options]);
    }
    console.log(`   ✓ ${questions.length} preguntas creadas`);

    // Sembrar algunas Respuestas
    const [questionsResult] = await connection.query('SELECT question_id, survey_id FROM question LIMIT 5');
    const [users] = await connection.query('SELECT Users_id FROM users WHERE Role_FK_ID = (SELECT Role_id FROM role WHERE Role_name = "Propietario") LIMIT 3');

    const answers = [
      { survey: questionsResult[0].survey_id, question: questionsResult[0].question_id, user: users[0].Users_id, value: '4' },
      { survey: questionsResult[0].survey_id, question: questionsResult[0].question_id, user: users[1].Users_id, value: '5' },
      { survey: questionsResult[1].survey_id, question: questionsResult[1].question_id, user: users[0].Users_id, value: '["Gimnasio", "Piscina"]' },
      { survey: questionsResult[1].survey_id, question: questionsResult[1].question_id, user: users[1].Users_id, value: '["Zona BBQ", "Salón de Fiestas"]' },
      { survey: questionsResult[2].survey_id, question: questionsResult[2].question_id, user: users[2].Users_id, value: 'Mañana' }
    ];

    for (const answer of answers) {
      await connection.query(`
        INSERT INTO answer (survey_id, question_id, user_id, value)
        VALUES (?, ?, ?, ?)
      `, [answer.survey, answer.question, answer.user, answer.value]);
    }
    console.log(`   ✓ ${answers.length} respuestas creadas`);

    // Sembrar Visitantes
    const [owners] = await connection.query('SELECT Owner_id FROM owner LIMIT 3');

    const visitors = [
      { 
        name: 'Sara González', 
        docNum: '1122334455', 
        host: owners[0].Owner_id, 
        enterDate: '2025-10-10 10:00:00', 
        exitDate: '2025-10-10 16:00:00' 
      },
      { 
        name: 'Miguel Vargas', 
        docNum: '5544332211', 
        host: owners[0].Owner_id, 
        enterDate: '2025-10-11 14:00:00', 
        exitDate: null 
      },
      { 
        name: 'Laura Martínez', 
        docNum: '9988776655', 
        host: owners[1].Owner_id, 
        enterDate: '2025-10-12 09:30:00', 
        exitDate: '2025-10-12 12:30:00' 
      },
      { 
        name: 'Roberto Moreno', 
        docNum: '1234567890', 
        host: owners[2].Owner_id, 
        enterDate: '2025-10-13 15:45:00', 
        exitDate: null 
      },
      { 
        name: 'Emilia Díaz', 
        docNum: '0987654321', 
        host: owners[1].Owner_id, 
        enterDate: '2025-10-08 11:00:00', 
        exitDate: '2025-10-08 18:00:00' 
      }
    ];

    for (const visitor of visitors) {
      await connection.query(`
        INSERT INTO visitor (name, documentNumber, host, enter_date, exit_date)
        VALUES (?, ?, ?, ?, ?)
      `, [visitor.name, visitor.docNum, visitor.host, visitor.enterDate, visitor.exitDate]);
    }
    console.log(`   ✓ ${visitors.length} visitantes creados`);

    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando encuestas y visitantes:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSurveysAndVisitors().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
