import fastify from 'fastify'
import fastifyMongodb from '@fastify/mongodb'
import users from './routes/users.route'
import fastifyJwt from '@fastify/jwt'

// Création d'une application fastify
const app = fastify({ logger: true })


// const API_SECRET= function strRandom(option) {
//   return ""
// }

// Je connécte une base de données
app.register(fastifyMongodb, {url: process.env.DATABASE_URL,
    database: process.env.NOMDB,
})
// On enregistre le plugin des utilisateurs
app.register(users)

// On enregistre le plugin nous permettant de gérer les jetons
app.register(fastifyJwt, {
  // On spécifie le secret utilisé pour générer et valider nos jetons
    secret: process.env.API_KEY_SECRET || 'secret'
})


// Démarage du serveur http
app.listen({ port: 5353, host: '127.0.0.1' }, () => {
    console.log("Le serveur http est prêt sur l'adresse : http://127.0.0.1:5353")
})
