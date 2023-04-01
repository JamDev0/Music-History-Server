export function areThereWrongQueries(searchQueries: any[], reqQueryKeys: any[]) {
  const wrongQueries = reqQueryKeys.reduce((acc: any[], key) => {
    if(searchQueries.find(query => key === query)){
      return acc;
    }

    return [...acc, key];
  }, [] as any[]);


  const wrongQueriesLength = wrongQueries.length;

  if(wrongQueriesLength > 0) {
    return wrongQueries.reduce((acc, query, index, array) => array.length === 1 ? query : array.length - 1 === index ? `${acc} and ${query}` : `${acc}, ${query}`, '') 
      + 
        ` ${wrongQueriesLength === 1 ? 'is a' : 'are'} invalid search ${wrongQueriesLength === 1 ? 'param' : 'params'}.`
      +
        ` The available queries are: ${searchQueries.reduce((acc, query, index) => index === 0 ? query : `${acc}, ${query}` , '')}`;
  }
}