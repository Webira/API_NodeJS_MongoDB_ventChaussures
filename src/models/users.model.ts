import { createHmac } from 'crypto'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { string } from 'zod/lib'

// 1. Définission de UserModel1 - de base
 
export const UserModel1 = z.object({
    _id: z.preprocess(id => `${id}`, z.string()),
    email: z.string().email(),
    firstname: z.string().min(2),
    lastname: z.string().min(2),
    password: z.string().min(8),
    repeated_password: z.string().min(8),
  })


  // 2. Définission de UserModel
  export const UserModel = UserModel1.omit({ repeated_password: true })
  
  //Type de UserModel
  export type UserType = z.infer<typeof UserModel>
  
  //Schéma de UserModel
  export const UserSchema = zodToJsonSchema(UserModel)
  

  //8. PasswordModel - Model pour un mot de passe (facultatif)
    export const PasswordModel = z
    .string()
    .min(5)
    .transform(pass =>
      createHmac('sha256', process.env.API_KEY_SECRET || 'secret')
        .update(pass)
        .digest('hex'),
    )
  
  // 3. Définission de NewUserModel
      //moi : export const NewUserModel = UserModel1.omit({ _id: true })

      //version prof  + model 8
    export const NewUserModel = z
   .object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    // password: z
    //   .string()
    //   .min(5)
    //   .transform(pass =>
    //     createHmac('sha256', process.env.API_KEY_SECRET || 'secret')
    //       .update(pass)
    //       .digest('hex'),
    //   ),
    // repeatedPassword: z
    //   .string()
    //   .min(5)
    //   .transform(pass =>
    //     createHmac('sha256', process.env.API_KEY_SECRET || 'secret')
    //       .update(pass)
    //       .digest('hex'),
    //   ),
    password: PasswordModel,
    repeatedPassword: PasswordModel,
  })
  .refine(newUser => newUser.password === newUser.repeatedPassword, {
    message: 'Your passwords must match',
  })

  //Type de NewUserModel
    export type NewUserType = z.infer<typeof NewUserModel>
        
  // Schéma de NewUserModel
    export const NewUserSchema = zodToJsonSchema(NewUserModel)
    

// 4. UserCollectionModel

export const UserCollectionModel = z.array(UserModel)

//Type de UserCollectionModel
export type UserCollectionType = z.infer<typeof UserCollectionModel>
        
// Schéma de UserCollectionModel
export const UserCollectionSchema = zodToJsonSchema(UserCollectionModel)


// 5. UserSearchCriteriaModel  
  export const UserSearchCriteriaModel = z.object({
      //code prof
    limit: z.number().min(2).max(100).optional().default(20),
    page: z.number().min(1).optional().default(1),
    orderBy: z
      .enum(['_id', 'email', 'firstname', 'lastname'])
      .optional()
      .default('_id'),
    direction: z
      .enum(['asc', 'desc'])
      .optional()
      .default('asc')
      .transform(dir => ('asc' === dir ? 1 : -1)),
    email: z.string().optional(),

      //moi
    // limit: z.number().max(20),
    // orderBy: z.enum([ '_id', 'email', 'firstname', 'lastname']),
       //Peut être 1 pour croissant -1 pour décroissant
    // direction: z.string(),
    // email: z.string(),
  })

// var champs = {Querystring: {champ?:{'_id'|'email'|'firstname'|'lastname'}}

  export type UserSearchCriteriaType = z.infer<typeof UserSearchCriteriaModel>
        
// Schéma de UserSearchCriteriaModel
  export const UserSearchCriteriaSchema = zodToJsonSchema(UserSearchCriteriaModel)

//6. UserCredentialModel
export const UserCredentialModel = z.object({
  email: z.string().email(),
  password: PasswordModel,
})

//Type de UserCredentialModel
 export type UserCredentialType = z.infer<typeof UserCredentialModel>

//Schéma de UserCredentialModel
 export const UserCredentialSchema = zodToJsonSchema(UserCredentialModel)

  // 7. Définission de UserTokenModel

export const UserTokenModel = z.object({
  token: z.string(),
})

 // Type de UserTokenModel
export type UserTokenType = z.infer<typeof UserTokenModel>

 // Schéma de UserTokenModel
 export const UserTokenSchema = zodToJsonSchema(UserTokenModel)

  