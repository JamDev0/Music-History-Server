export function sort<ArrayType>(arrayToSort: any[], sortBy: keyof ArrayType, order: 'ASC' | 'DESC') {
  return arrayToSort.sort((a, b) => {
    if(a[sortBy] > b[sortBy]) {
      return order === 'DESC' ? -1 : 1;
    }

    if(a[sortBy] < b[sortBy]) {
      return order === 'DESC' ? 1 : -1;
    }

    return 0;
  });
}