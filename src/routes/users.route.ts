import { FastifyInstance } from 'fastify'
import { NewUserModel, NewUserSchema, UserCollectionModel, UserCollectionSchema,
     UserCredentialModel,
     UserCredentialSchema,
     UserModel, UserSchema, UserSearchCriteriaModel, UserSearchCriteriaSchema,
     UserTokenModel, UserTokenSchema } from '../models/users.model'

// Plugin fastify 
export default async function users(app: FastifyInstance) {

// Creer un nouvel utilisateur
   const NewUsersOptions = {
     schema: {
        // On définie le schéma du body
        body: NewUserSchema,
        // On définie le schéma du retour de la fonction
        response: {
          // Lorsque tout ce passe bien
          201: UserSchema,
        },
    },
}
    app.post('/users', NewUsersOptions, async (request, reply) => {
            //moi
        // const ResultNewUser = await app.mongo.db?.collection('users').
        // insertOne(NewUserModel.parse(request.body))

            //code prof 
      const newUser = NewUserModel.parse(request.body)
      // On enregistre le nouvel utilisateur dans la base de données
      const result = await app.mongo.db?.collection('users').insertOne({
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        password: newUser.password,
      })
      // On récupére l'utilisateur tout juste enregistré dans la base de données
      const user = await app.mongo.db?.collection('users').findOne({
        _id: result?.insertedId,
      })
      // On retourne le code 201
      reply.code(201)
      // On retourne l'utilisateur validé par un Model
      return UserModel.parse(user)
    },)
          //moi:
        // return UserModel.parse(await app.mongo.db?.collection('users').findOne({
        //   _id: ResultNewUser?.insertedId,
        // }))

// Lister les utilisateurs
  
    const ListUsersOptions = {
        schema: {
        querystring: UserSearchCriteriaSchema,
        response: {
          200: UserCollectionSchema,
        },
        },
      }
      app.get('/users', ListUsersOptions, async request => {
        // Je vérifie de bien recevoir un jeton de connexion
           await request.jwtVerify()
           const criterias = UserSearchCriteriaModel.parse(request.query)
           
    // On lance la requête à la base de données permettant de récupérer
    // les utilisateurs correspondant aux critéres de recherche
            return UserCollectionModel.parse(await app.mongo.db?.collection('users')
              .find(criterias.email
                ? {email: new RegExp(`${criterias.email}`),} : {},
              )
            //code de prof
              .limit(criterias.limit)
              .skip((criterias.page - 1) * criterias.limit)
              .sort({ [criterias.orderBy]: criterias.direction })
                  //moi
              // .limit(20)
              // .sort({ email: 1 })
              // .toArray(),
          )
      })

  // Route de création d'un jeton de connexion

      app.post('/token',{ schema: { body: UserCredentialSchema, response: { 201: UserTokenSchema } } },
        async (request, reply) => {
          // On récupére les données envoyé par l'utilisateur
        const credential = UserCredentialModel.parse(request.body)

          // On récupére l'utilisateur correspondant dans la base de données
          const data = await app.mongo.db?.collection('users').findOne({
                email: credential.email,
                password: credential.password,
          })
                // Si il n'éxiste pas d'utilisateur
          if (!data) {
            reply.code(400)
            return {
              error: 'Bad credentials',
            }
          }
  // On s'assure que les données de la base de données corresponde bien
      // à notre model
      const user = UserModel.parse(data)

      // On génére notre UserTokenModel avec un jeton de connexion
      // Les données qui seront crypté dans notre jeton
        // (généralement il s'agot de l'identifiant de certaines
        // informations de l'utilisateur. Attention à ne rien mettre de très sensible)
      return UserTokenModel.parse({token: app.jwt.sign({ 
          _id: user._id,
          email: user.email }),
      })
    },
  )
}

      
