import { Request, Response, NextFunction } from 'express';

import validate from '../validators'; // import validate from 'validate.js';  //NB: dont import validate directly
import { jsonApiErrorResponseFromValidateJsError } from '../helpers/jsonApiErrorResponseFromValidateJsError';

/**
 * multipart form data (ie. including a file) should be sent as FormData() 
 * content is sent from frontend directly attached to body if FormData:
FORMDATA METHOD
FRONTEND: 
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

BACKEND: Multer handles the File (req.file), while the formData is on the req.body
  const { field1, field2 } = req.body;
  
--------
JSONAPI METHOD - sending request as structured JSONAPI data:           
FRONTEND: you append it to formdata, 

  const formData = new FormData(form);    //if you pass reference to form to FormData, it picks out input with name properties

  const jsonApiData = {
      data: {
          type: 'items',
          attributes: {
              attribute1: 'value1',
              attribute2: 'value2'
          }
      }
  };
 
 * formData.append('jsonApiData', JSON.stringify(jsonApiData));   //in postman you can just paste the jsonApiData without Stringify
 * BACKEND: you can access the jsonapi data: const jsonApiData = JSON.parse(req.body.jsonApiData);  
 
 */
type requestDataType = 'FormData' | 'JsonApiData';

export const validateRequestData = (validation: object) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //note: not needed to JSON.parse() because Middleware is used to parse incoming JSON data with JSON API content type
    const formData = req.body.data.attributes;

    try {
      await validate.async(formData, validation, { format: 'detailed' });
    } catch (err: any) {
      const formattedResponse = { errors: jsonApiErrorResponseFromValidateJsError(err) };
      return res.status(422).json(formattedResponse);
    }
    return next();
  };
};
