import { array, string, z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { UserModel } from './users.model'

//----------------La création d'une annonce-------------------
// 1.----- Modele ShoesModel

export const ShoesModel = z.object({
  _id: z.preprocess(id => `${id}`, z.string()),
  title: z.string().min(2),
  price: z.number().min(2).max(1000), //between
  model: z.string().min(2),
  brand: z.string().min(2),
  pictures: z.array(z.string().url()),
  description: z.string().optional(),
  color: z.string().regex(/^[a-f0-9A-F]{6}$|^[a-f0-9A-F]{3}$/), //les regex (l'expression reguliere)
  condition: z
    .enum(['neuf', 'semi neuve', 'usé', 'très usé'])
    .optional()
    .default('neuf'),
  size: z.number().min(10).max(70),
  userVendeur: UserModel,
})
//img :
//   function pictures(tagName: "img"): HTMLImageElement;
//   const pictures: Array<{id: number, img: string, libelle: string}> = [
//     {id: 1, img: 'url' , libelle: ''},
//     {id: 2, img: 'url' , libelle: ''},
//     {id: 3, img: 'url' , libelle: ''},
// ];
//UserVendeur:
//const userVendeur=z.object({NewUserModel})
//const UserTokenModel = z.object({ token: z.string()})

//Type de UserModel
export type ShoesType = z.infer<typeof ShoesModel>

//Schéma de UserModel
export const ShoesSchema = zodToJsonSchema(ShoesModel)

// 2.----NewShoesModel (envoyer à la BDD)

export const NewShoesModel = UserModel.omit({ _id: true, userVendeur: true })

//Type de NewShoesModel
export type NewShoesType = z.infer<typeof NewShoesModel>

//Schéma de NewShoesModel
export const NewShoesSchema = zodToJsonSchema(NewShoesModel)

////// pour ajouter une parametre à model utiliser: extend()
////// ex. : export const ShoesModel = NewShoesModel.extend({
          //   _id: z.preprocess(id => `${id}`, z.string()),
          //   user: UserModel,
          // })

//-----------Lister les annonces de vente de chaussure-------------

// 3.------Création SearchShoesCriteriaModel

export const SearchShoesCriteriaModel = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  page: z.number().min(1).optional().default(1),
  orderBy: z
    .enum([
      '_id',
      'price',
      'title',
      'model',
      'brand',
      'couleur',
      'size',
      'condition',
    ])
    .optional()
    .default('_id'),
  direction: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
    .transform(dir => ('asc' === dir ? 1 : -1)),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  couleur: z.string().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
  condition: z.string().optional(), //?????????
  user: z.string().email().optional(),
})

//Type de NewShoesModel
export type SearchShoesCriteriaType = z.infer<typeof SearchShoesCriteriaModel>

//Schéma de NewShoesModel
export const SearchShoesCriteriaSchema = zodToJsonSchema(
  SearchShoesCriteriaModel,
)

// 4.-----Création ShoesCollectionModel
export const ShoesCollectionModel = z.array(ShoesModel)
//Type de NewShoesModel
export type ShoesCollectionType = z.infer<typeof ShoesCollectionModel>

//Schéma de NewShoesModel
export const ShoesCollectionSchema = zodToJsonSchema(ShoesCollectionModel)
