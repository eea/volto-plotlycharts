import { cloneDeep, keys, mapValues } from 'lodash';

export const applyFilters = (dataSources, filters) => {
  // Early return if no filters or empty dataSources
  if (
    !filters ||
    !Array.isArray(filters) ||
    filters.length === 0 ||
    !dataSources
  ) {
    return dataSources;
  }

  // Clone to avoid mutating the original
  const clonedDataSources = cloneDeep(dataSources);

  // Find the first key with data to determine indices
  const firstKey = keys(clonedDataSources)[0];
  if (!firstKey || !Array.isArray(clonedDataSources[firstKey])) {
    return clonedDataSources;
  }

  // Collect indices that pass all filters
  const okIndexes = [];

  (clonedDataSources[firstKey] || []).forEach((_, index) => {
    let passesAllFilters = true;

    // Check each filter against the current index
    for (const filter of filters) {
      const filterValue = filter.data?.value || filter.defaultValue;
      if (
        filterValue &&
        clonedDataSources[filter.field] &&
        clonedDataSources[filter.field][index] !== filterValue
      ) {
        passesAllFilters = false;
        break; // Optimization: exit early once we know it fails
      }
    }

    if (passesAllFilters) {
      okIndexes.push(index);
    }
  });

  // Apply the filter to all data arrays
  return mapValues(clonedDataSources, (values) =>
    Array.isArray(values)
      ? values.filter((_, index) => okIndexes.includes(index))
      : values,
  );
};
