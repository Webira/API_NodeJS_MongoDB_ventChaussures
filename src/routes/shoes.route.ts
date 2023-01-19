import { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import {
  NewShoesModel,
  NewShoesSchema,
  SearchShoesCriteriaSchema,
  ShoesCollectionSchema,
  ShoesModel,
  ShoesSchema,
} from '../models/shoes.model'
import { UserModel } from '../models/users.model'

//----Création d'un annonce de vente de chassure------------
// Plugin fastify
export default async function shoes(app: FastifyInstance) {
  // Creer un nouvel utilisateur
  const NewShoesOptions = {
    schema: {
      body: NewShoesSchema,
      // On définie le schéma du retour de la fonction
      response: {
        // Lorsque tout ce passe bien
        201: ShoesSchema,
      },
    },
  }
  app.post('/shoes', NewShoesOptions, async (request, reply) => {
          // code prof:
// Je souhaiterais m'assurer d'avoir un jeton de connexion valide.
      // En effet, si je n'en posséde pas alors je ne suis pas connécté et
      // donc je ne peut pas créer de chaussure.
      await request.jwtVerify()

      // Je récupére et valide la nouvelle chaussure envoyé de la body
      // de la request
      const newShoes = NewShoesModel.parse(request.body)

      // Récupérer l'identifiant de l'utilisateur contenue dans le jeton
      // de connexion.
      const userId = (request.user as any)._id  //?????
      // Maintenant que je connais l'identifiant de l'utilisateur, j'utilise
      // mongodb pour aller chercher l'utilisateur en question
      const userVendeur = UserModel.parse(
        await app.mongo.db?.collection('users').findOne({
          _id: new ObjectId(userId),
        }),)
 
  // J'insére une chaussure dans la base de données
  const result = await app.mongo.db?.collection('shoes').insertOne({
    ...newShoes, userVendeur,})

  // Je retourne le code http 201 Created
  reply.code(201)

  // Je retourne l'utilisateur tout juste créé dans la base de données
  return ShoesModel.parse(
    await app.mongo.db?.collection('shoes').findOne({
      _id: result?.insertedId,
    }),
  )
},)

    /*      //moi
    const newAnnonce = NewShoesModel.parse(request.body)

    // On enregistre le nouvel utilisateur dans la base de données
    const resultA = await app.mongo.db?.collection('shoes').insertOne({
      title: newAnnonce.title,
      price: newAnnonce.price,
      model: newAnnonce.model,
      brand: newAnnonce.brand,
      pictures: newAnnonce.pictures,
      description: newAnnonce.description,
      couleur: newAnnonce.couleur,
      condition: newAnnonce.condition,
      size: newAnnonce.size,
      //userVendeur: UserModel.user,
    })

    //////UserModel:
    // email: newUser.email,
    // firstname: newUser.firstname,
    // lastname: newUser.lastname,
    // password: newUser.password,

    //////const pictures: Array<{id: number, img: string, libelle: string}> = [
    //     {id: 1, img: 'url' , libelle: ''},
    //     {id: 2, img: 'url' , libelle: ''},
    //     {id: 3, img: 'url' , libelle: ''},

    // On récupére l'annonce tout juste enregistré dans la base de données
    const shoes = await app.mongo.db?.collection('shoes').findOne({
      _id: resultA?.insertedId,
    })
    // On retourne le code 201
    reply.code(201)
    // On retourne l'annonce validé par un Model
    return ShoesModel.parse(shoes)
  })
  //------Récupérer l'utilisateur connécté ----

  app.get('/users', ListUsersOptions, async request => {
    // Je vérifie de bien recevoir un jeton de connexion
    await request.jwtVerify()

    const userVendeur = UserModel.parse(request.body)
    // On lance la requête à la base de données permettant de récupérer
    // les utilisateurs correspondant aux critéres de recherche
    return UserTokenModel.parse(
      await app.mongo?.collection('users').findOne({
        token: app.jwt.sign({
          _id: userVendeur._id,
          email: userVendeur.email,
        }),
      }),
    )
  }) */

  //---------Créer la routes permettant de lister des chaussures-------

  //------ Lister les chaussures

  const SearchShoesCriteriaOptions = {
    schema: {
      querystring: SearchShoesCriteriaSchema,
      response: {
        200: ShoesCollectionSchema,
      },
    },
  }
  // app.get('/shoes', SearchShoesCriteriaOptions, async request => {
  //   // Je vérifie de bien recevoir un jeton de connexion
  //   await request.jwtVerify()
  //   const criteriasSH = SearchShoesCriteriaModel.parse(request.query)

  //   return ShoesCollectionSchema.parse(
  //     await app.mongo.db
  //       ?.collection('shoes')
  //       .find(
  //         criteriasSH.user.email
  //           ? { email: new RegExp(`${criteriasSH.user.email}`) }
  //           : {},
  //       )
  //       .toArray(),
  //   )
  // })
}
