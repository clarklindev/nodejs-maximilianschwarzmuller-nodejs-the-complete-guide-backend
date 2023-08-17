//editProduct
import { Request, Response, NextFunction } from 'express';
import path from 'path';

import Product from '../../../lib/models/product';
import { IError } from '../../../lib/interfaces/IError';
import { deleteFile } from '../../../lib/helpers/deleteFile';

//expects jsonapi
export const editProduct = async (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.params.productId;
  const jsonApiData = req.body.jsonApiData; //note: "file" is not included..handled by multer (formData - not jsonapi format...)
  const updateFormData = JSON.parse(jsonApiData).data.attributes;

  //1. find the product
  const product = await Product.findById(prodId);
  if (!product) {
    const error: IError = new Error('Product with id does not exist');
    error.statusCode = 404;
    return next(error);
  }

  //2. get the details of the upload
  const updatedTitle = updateFormData.title ? updateFormData.title : product.title;
  const updatedPrice = updateFormData.price ? updateFormData.price : product.price;
  const updatedDescription = updateFormData.description ? updateFormData.description : product.description;
  const upload: File | undefined = req.file; //thanks to multer middleware, we have access to file and not just text from the form.
  const imageUrl = !upload ? product.imageUrl : upload.filename;
  if (!imageUrl) {
    const error: IError = new Error('invalid file format');
    error.statusCode = 422;
    throw error;
  }

  //3. ensure that the person logged in is same as owner of product
  const productUserId = product.userId.toString();
  const requestUserId = req.userId.toString();

  if (productUserId !== requestUserId) {
    const error: IError = new Error('invalid authentication');
    error.statusCode = 403;
    throw error;
  }

  //4. delete old image if new image
  let result;
  if (product) {
    //we know something got updated so delete old image
    if (imageUrl !== product.imageUrl) {
      deleteFile(path.join(process.cwd(), 'images', product.imageUrl!));
    }

    //update the details and save to database
    product.title = updatedTitle;
    product.description = updatedDescription;
    product.price = updatedPrice;
    product.imageUrl = imageUrl;
    result = await product.save();
  }

  return res.status(200).json({ status: 'PRODUCT EDITED', result });
};
