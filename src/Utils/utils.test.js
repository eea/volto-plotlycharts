import {
  generateFinalCSV,
  generateOriginalCSV,
  getMetadataFlags,
  processMetadataArrays,
  generateCSVForDataset,
} from './utils';

jest.mock('@eeacms/volto-matomo/utils', () => ({
  trackLink: jest.fn(),
}));

const emptyCoreMetadata = {};

describe('getMetadataFlags', () => {
  it('should be all false for empty metadata', () => {
    expect(getMetadataFlags(emptyCoreMetadata)).toEqual({
      hasDataProvenance: false,
      hasOtherOrganisation: false,
      hasTemporalCoverage: false,
      hasGeoCoverage: false,
      hasPublisher: false,
    });
  });

  it('should flag present metadata sections', () => {
    expect(
      getMetadataFlags({
        data_provenance: ['Source A'],
        publisher: ['EEA'],
      }),
    ).toMatchObject({
      hasDataProvenance: true,
      hasPublisher: true,
      hasOtherOrganisation: false,
    });
  });
});

describe('processMetadataArrays', () => {
  it('should return empty arrays when no flag is set', () => {
    const flags = getMetadataFlags(emptyCoreMetadata);
    expect(processMetadataArrays(emptyCoreMetadata, flags)).toEqual({
      data_provenance_array: [],
      other_organisation_array: [],
      temporal_coverage_array: [],
      geo_coverage_array: [],
      publisher_array: [],
    });
  });

  it('should populate arrays for flagged sections', () => {
    const core_metadata = {
      data_provenance: ['Source A', 'Source B'],
    };
    const flags = getMetadataFlags(core_metadata);
    const result = processMetadataArrays(core_metadata, flags);

    expect(result.data_provenance_array.length).toBeGreaterThan(0);
    // each entry keyed by a column that includes "data_provenance" or "Sources"
    result.data_provenance_array.forEach((row) => {
      Object.keys(row).forEach((key) => {
        expect(key.includes('data_provenance') || key.includes('Sources')).toBe(
          true,
        );
      });
    });
  });
});

describe('generateFinalCSV', () => {
  it('should concatenate the download source line and data with no metadata', () => {
    const flags = getMetadataFlags(emptyCoreMetadata);
    const arrays = processMetadataArrays(emptyCoreMetadata, flags);

    const csv = generateFinalCSV(
      [{ region: 'EU', value: 10 }],
      [],
      flags,
      arrays,
      'http://example.org',
    );

    expect(csv).toContain('Downloaded from: ');
    expect(csv).toContain('http://example.org');
    expect(csv).toContain('region,value');
    expect(csv).toContain('EU');
  });

  it('should include metadata sections when flags are set', () => {
    const core_metadata = { publisher: ['EEA'] };
    const flags = getMetadataFlags(core_metadata);
    const arrays = processMetadataArrays(core_metadata, flags);

    const csv = generateFinalCSV(
      [{ region: 'EU', value: 10 }],
      [],
      flags,
      arrays,
      'http://example.org',
    );

    expect(csv).toContain('EEA');
  });
});

describe('generateOriginalCSV', () => {
  it('should build CSV from data sources without columns', () => {
    const csv = generateOriginalCSV(
      { region: ['EU', 'US'], value: [10, 20] },
      [],
      {},
      'http://example.org',
      emptyCoreMetadata,
    );

    expect(csv).toContain('region,value');
    expect(csv).toContain('EU');
    expect(csv).toContain('US');
  });

  it('should order columns according to the provided columns list', () => {
    const csv = generateOriginalCSV(
      { value: [10], region: ['EU'] },
      ['region', 'value'],
      {},
      'http://example.org',
      emptyCoreMetadata,
    );

    expect(csv).toContain('region,value');
  });

  it('should prepend the readme from provider metadata', () => {
    const csv = generateOriginalCSV(
      { region: ['EU'] },
      [],
      { readme: 'Read this' },
      'http://example.org',
      emptyCoreMetadata,
    );

    expect(csv).toContain('Read this');
  });
});

describe('generateCSVForDataset', () => {
  const reactChartEditorLib = {
    constants: { TRACE_SRC_ATTRIBUTES: ['x', 'y'] },
    getAttrsPath: (trace) => {
      const attrs = {};
      if (trace.x) attrs.x = trace.x;
      if (trace.y) attrs.y = trace.y;
      return attrs;
    },
    getSrcAttr: (trace, attr) => ({ value: trace[`${attr}src`] }),
  };

  it('should build CSV from trace-processed data', () => {
    const csv = generateCSVForDataset(
      { year: [2020, 2021], region: ['EU', 'US'] },
      {
        data: [{ x: [2020, 2021], xsrc: 'year' }],
        layout: {},
      },
      {},
      emptyCoreMetadata,
      'http://example.org',
      reactChartEditorLib,
    );

    expect(csv).toContain('year');
    expect(csv).toContain('2020');
  });

  it('should fall back to data sources when traces yield no data', () => {
    const csv = generateCSVForDataset(
      { region: ['EU', 'US'], value: [10, 20] },
      { data: [], layout: {} },
      {},
      emptyCoreMetadata,
      'http://example.org',
      reactChartEditorLib,
    );

    expect(csv).toContain('region,value');
    expect(csv).toContain('EU');
  });
});
