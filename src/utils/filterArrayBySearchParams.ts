export function filterArrayBySearchParams(array: any[], searchParams: any) {
  const searchParamsKeys = Object.keys(searchParams);

  const filteredArray = array.filter(music => {
    return searchParamsKeys.reduce((acc, key) => {
      if(key !== 'sort_by' && key !== 'order') {
        if(new RegExp('.+_higher_than').test(key)) {
          return acc && music.duration > searchParams[key];
        }

        if(new RegExp('.+_lower_than').test(key)) {
          return acc && music.duration < searchParams[key];
        }

        if(key === 'id') {
          return (acc && ( music[key] === searchParams[key] ));
        }

        return (acc && ( music[key].includes(searchParams[key]) ));
      }

      return true && acc;
    }, true);
  });

  return filteredArray;
}