import { FastifyInstance } from 'fastify'
import { ObjectId, SortDirection } from 'mongodb'
import { REPL_MODE_SLOPPY } from 'repl'
import {
  IdOwnedModel,
  NewShoesModel,
  NewShoesSchema,
  SearchShoesCriteriaSchema,
  ShoesCollectionSchema,
  ShoesModel,
  ShoesSchema,
  UpdateShoesModel,
  UpdateShoesSchema,
  IdOwnedSchema,
  SearchShoesCriteriaModel,
  ShoesCollectionModel,
} from '../models/shoes.model'
import { UserModel } from '../models/users.model'

//----Création d'un annonce de vente de chassure------------

// Ce module contient le plugin fastify avec toutes les routes concernant
//  les chaussures
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
    const userId = (request.user as any)._id //??any
    // Maintenant que je connais l'identifiant de l'utilisateur, j'utilise
    // mongodb pour aller chercher l'utilisateur en question
    const userVendeur = UserModel.parse(
      await app.mongo.db?.collection('users').findOne({
        _id: new ObjectId(userId),
      }),
    )

    // J'insére une chaussure dans la base de données
    const result = await app.mongo.db?.collection('shoes').insertOne({
      ...newShoes,
      userVendeur,
    })

    // Je retourne le code http 201 Created
    reply.code(201)

    // Je retourne l'utilisateur tout juste créé dans la base de données
    return ShoesModel.parse(
      await app.mongo.db?.collection('shoes').findOne({
        _id: result?.insertedId,
      }),
    )
  })
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
  })    */

  //---------Modifier et supprimer une chaussure-----------
  // UpdateShoesModel

  app.patch(
    '/shoes/:id',
    {
      schema: {
        params: IdOwnedSchema,
        body: UpdateShoesSchema,
        response: { 200: ShoesSchema },
      },
    },
    async (request, reply) => {
      // Je souhaiterais m'assurer d'avoir un jeton de connexion valide.
      await request.jwtVerify()

      // Je récupére et valide la chaussure à modiffier dans les params de la route
      const idShoes: string = IdOwnedModel.parse(request.params).id

      //code prof de ligne147 : const { id } = IdOwnerModel.parse(request.params)

      const shoesM = ShoesModel.parse(
        await app.mongo.db?.collection('shoes').findOne({
          _id: new ObjectId(idShoes),
        }),
      )

      // Récupérer l'identifiant de l'utilisateur contenue dans le jeton
      // de connexion.
      const userId = (request.user as any)._id
      // Maintenant que je connais l'identifiant de l'utilisateur, j'utilise
      // mongodb pour aller chercher l'utilisateur en question
      const user = UserModel.parse(
        await app.mongo.db?.collection('users').findOne({
          _id: new ObjectId(userId),
        }),
      )
      // On s'assure que l'utilisateur connécté soit bien le revendeur de la chaussure
      // code prof
      //if (shoes.user._id !== user._id) {
      //moi
      if (shoesM.userVendeur._id !== user._id) {
        //???
        reply.code(404)

        return { error: 'resource not found' }
      }
      // Modiffier une chaussure dans la base de données
      await app.mongo.db?.collection('shoes').updateOne(
        {
          //code prof
          // _id: new ObjectId(shoes._id),
          //moi
          _id: new ObjectId(shoesM._id), //????
        },
        {
          //metre à jour le shoes
          $set: UpdateShoesModel.parse(request.body),
        },
      )

      return ShoesModel.parse(
        await app.mongo.db?.collection('shoes').findOne({
          _id: new ObjectId(idShoes),
        }),
      )
    },
  )

  //--------Supprimer l'une annonce de chaussures

  app.delete(
    '/shoes/:id',
    { schema: { params: IdOwnedSchema, response: { 200: ShoesSchema } } },
    async (request, reply) => {
      // Je souhaiterais m'assurer d'avoir un jeton de connexion valide.
      await request.jwtVerify()

      // Je récupére et valide la chaussure à supprimer
      const idShoes: string = IdOwnedModel.parse(request.params).id

      const shoesD = await app.mongo.db?.collection('shoes').findOne({
        _id: new ObjectId(idShoes),
      })

      // Récupérer l'identifiant de l'utilisateur contenue dans le jeton
      // de connexion.
      const userId = (request.user as any)._id
      // Maintenant que je connais l'identifiant de l'utilisateur, j'utilise
      // mongodb pour aller chercher l'utilisateur en question
      const user = UserModel.parse(
        await app.mongo.db?.collection('users').findOne({
          _id: new ObjectId(userId),
        }),
      )
      const resultDelete = await app.mongo.db?.collection('shoes').deleteOne({
        _id: new ObjectId(idShoes),
      })
    },
  )

  //---------Créer la routes permettant de lister des chaussures-------
  //------ Lister les chaussures. Récupére la liste filtrer des annonces de chaussures

  const SearchShoesCriteriaOptions = {
    schema: {
      querystring: SearchShoesCriteriaSchema,
      response: {
        200: ShoesCollectionSchema,
      },
    },
  }
  app.get('/shoes', SearchShoesCriteriaOptions, async (request, reply) => {
    // Je vérifie de bien recevoir un jeton de connexion
    await request.jwtVerify()
    const criterias = SearchShoesCriteriaModel.parse(request.query)

    // Contient les filtres mongodb
    let filters: any = {}

    // Si nous avons un prix minimum
    if (criterias.minPrice) {
      filters = {
        ...filters,
        price: {
          ...(filters['price'] || {}),
          $gte: criterias.minPrice,
        },
      }
    }

    // Si nous avons un prix maximum
    if (criterias.maxPrice) {
      filters = {
        ...filters,
        price: {
          ...(filters['price'] || {}),
          $lte: criterias.maxPrice,
        },
      }
    }

    // Si nous avons un filtre sur la couleur
    if (criterias.color) {
      filters = {
        ...filters,
        color: {
          $regex: criterias.color,
        },
      }
    }

    // Si nous avons un filtre sur la condition
    if (criterias.condition) {
      filters = {
        ...filters,
        condition: {
          $regex: criterias.condition,
        },
      }
    }

    // Si nous avons un filtre sur la taille minimum
    if (criterias.minSize) {
      filters = {
        ...filters,
        size: {
          ...(filters.size || {}),
          $gte: criterias.minSize,
        },
      }
    }

    // Si nous avons un filtre sur la taille minimum
    if (criterias.maxSize) {
      filters = {
        ...filters,
        size: {
          ...(filters.size || {}),
          $lte: criterias.maxSize,
        },
      }
    }

    // Si nous avons un filtre sur le user
    if (criterias.user) {
      filters = {
        ...filters,
        'user.email': {
          $regex: criterias.user,
        },
      }
    }

    // Lancer la recherche
    const data = await app.mongo.db
      ?.collection('shoes')
      .find(filters)
      .limit(criterias.limit)
      .skip((criterias.page - 1) * criterias.limit)
      .sort({ [criterias.orderBy]: criterias.direction as SortDirection })
      .toArray()

    // Retourner la collection
    return ShoesCollectionModel.parse(data)
  })
}
