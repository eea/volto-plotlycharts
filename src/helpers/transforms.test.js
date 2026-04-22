import { applyFilters } from './transforms';

describe('applyFilters', () => {
  it('should return the original data sources when filters are not usable', () => {
    const dataSources = {
      region: ['EU', 'US'],
      value: [10, 20],
    };

    expect(applyFilters(dataSources)).toBe(dataSources);
    expect(applyFilters(dataSources, [])).toBe(dataSources);
    expect(applyFilters(dataSources, 'region')).toBe(dataSources);
    expect(
      applyFilters(null, [{ field: 'region', data: { value: 'EU' } }]),
    ).toBe(null);
  });

  it('should return a clone when the first data source is not an array', () => {
    const dataSources = {
      region: 'EU',
      value: [10, 20],
    };

    const result = applyFilters(dataSources, [
      { field: 'region', data: { value: 'EU' } },
    ]);

    expect(result).toEqual(dataSources);
    expect(result).not.toBe(dataSources);
  });

  it('should filter every array data source by selected filter values', () => {
    const result = applyFilters(
      {
        region: ['EU', 'US', 'EU'],
        year: [2020, 2020, 2021],
        value: [10, 20, 30],
        unit: 'kt',
      },
      [
        { field: 'region', data: { value: 'EU' } },
        { field: 'year', defaultValue: 2021 },
      ],
    );

    expect(result).toEqual({
      region: ['EU'],
      year: [2021],
      value: [30],
      unit: 'kt',
    });
  });

  it('should keep all rows when filter values are empty or fields are missing', () => {
    const result = applyFilters(
      {
        region: ['EU', 'US'],
        value: [10, 20],
      },
      [
        { field: 'region', data: { value: '' } },
        { field: 'missing', defaultValue: 'EU' },
      ],
    );

    expect(result).toEqual({
      region: ['EU', 'US'],
      value: [10, 20],
    });
  });
});
