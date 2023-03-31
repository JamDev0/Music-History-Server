// Verify if the type is right too


export function objectHasAllProperties<Object>(object: unknown, propertiesArray: (keyof Object)[]): object is Object {
  const objectKeys = Object.keys(object as object);

  if(objectKeys.length !== propertiesArray.length) {
    return false
  }

  return Object.keys(object as object).reduce((acc, key, index) => {
    const propertyIndex = propertiesArray.findIndex(property => key === property)

    propertiesArray.slice(propertyIndex);

    return (propertyIndex !== -1) && acc;
  }, true);
}