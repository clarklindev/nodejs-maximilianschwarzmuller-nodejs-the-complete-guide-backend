//addProduct
import { NextFunction, Response } from 'express';
import { File } from 'buffer';

import Product from '../../../lib/models/product';
import User from '../../../lib/models/user';
import { IError } from '../../../lib/interfaces/IError';
import { IRequest } from '../../../lib/interfaces/IRequest';
import { IUserDocument } from '../../../lib/interfaces/IUser';

//addProduct should receive an upload image
export const addProduct = async (req: IRequest, res: Response, next: NextFunction) => {
  const jsonApiData = req.body.jsonApiData; //note: "file" is not included..handled by multer (formData - not jsonapi format...)
  const { title, price, description } = JSON.parse(jsonApiData).data.attributes;
  const upload: File | undefined = req.file;
  /*
  upload:{
    fieldname: 'upload',
    originalname: 'bread.jpeg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'images',
    filename: '2023-08-15_UTC_23_28_18.462Z__bread.jpeg',
    path: 'images\\2023-08-15_UTC_23_28_18.462Z__bread.jpeg',
    size: 9209
  }
  */

  //if no file was uploaded
  if (!upload) {
    const error: IError = new Error('No file uploaded');
    error.statusCode = 422;
    throw error;
  }

  try {
    const createProduct = async () => {
      //Mongoose - pass an object to Product - eg... { title (refers to title from schema) : title (refers to req.body.title) }
      const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: upload.filename, //upload.filename: not the path, store just the image - makes things easier to maintain
        userId: req.userId, //or with mongoose: you can reference the entire object req.user and mongoose will get the ._id from there.
      });

      const result = await product.save();

      //find the user thats associated with this product added
      const user: IUserDocument | null = await User.findById(req.userId); //reminder: we stored userId in the 'req' in isAuth.ts
      if (!user) {
        const error: IError = new Error('User not found');
        error.statusCode = 422;
        next(error);
      }

      if (user) {
        user.addToProducts(product._id);

        return res.status(200).json({
          status: 'PRODUCT CREATED',
          product: result,
          creator: { _id: user._id, name: user.name },
        });
      }
    };
    createProduct();
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
