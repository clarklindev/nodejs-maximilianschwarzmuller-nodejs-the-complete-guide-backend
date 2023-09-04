import DateHelper from './DateHelper';

//takes in object
export const jsonApiSuccessResponseFromMongooseQuery = (object: Record<string, any>) => {
  const { _id, createdAt, updatedAt, ...attributes } = object;

  const attributeData: Record<string, any> = {
    ...attributes._doc, // needs ._doc as .lean() is not used and lean reduces amount of data returned -> Tenant.findOne({ _id: reqTenantId }).lean();
  };

  // Include createdAt and updatedAt only if they exist on the object
  if (createdAt in object) {
    attributeData.timestamps = {
      created: DateHelper.unixEpochToUTCDate(createdAt),
    };
  }
  if (updatedAt in object) {
    attributeData.timestamps = {
      ...attributeData.timestamps,
      modified: DateHelper.unixEpochToUTCDate(updatedAt),
    };
  }

  return {
    id: _id.toString(),
    type: typeof object,
    attributes: {
      ...attributeData,
    },
  };
};
