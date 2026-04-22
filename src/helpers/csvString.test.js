import {
  applyAggregateTransform,
  applyFilterTransform,
  applySortTransform,
  applySplitTransform,
  applyTransform,
  convertMatrixToCSV,
  convertToCSV,
  groupDataByDataset,
  processTraceData,
  renameKey,
  spreadCoreMetadata,
  truncateFilename,
} from './csvString';

jest.mock('@eeacms/volto-matomo/utils', () => ({
  trackLink: jest.fn(),
}));

describe('csvString helpers', () => {
  describe('truncateFilename', () => {
    it('should normalize, truncate, and preserve file extensions', () => {
      expect(truncateFilename()).toBe('data');
      expect(truncateFilename('My Long File Name.CSV', 8)).toBe('my_long_.csv');
      expect(truncateFilename('No Extension Name', 6)).toBe('no_ext');
    });
  });

  describe('convertToCSV', () => {
    it('should convert objects to CSV and quote comma values', () => {
      expect(
        convertToCSV(
          [
            { label: 'A,B', value: 10 },
            { label: 'C', value: '20,30' },
          ],
          ['Read me'],
        ),
      ).toBe('label,value\r\n\r\n"A,B",10\r\nC,"20,30"\r\n\r\nRead me\r\n');
    });

    it('should handle empty arrays and section-only headers', () => {
      expect(convertToCSV([])).toBe('');
      expect(convertToCSV([{ Section: 'Title' }], [], true)).toBe(
        'SectionTitle\r\n\r\n',
      );
    });
  });

  describe('convertMatrixToCSV', () => {
    it('should convert multiple object arrays to CSV', () => {
      expect(
        convertMatrixToCSV([[{ col: 'A' }], [{ next: 'B' }]], ['Read me']),
      ).toBe('col\r\n\r\nA\r\nnext\r\n\r\nB\r\nRead me\r\n');
    });
  });

  describe('metadata helpers', () => {
    it('should rename known metadata keys', () => {
      expect(renameKey('data_provenance')).toBe('Sources');
      expect(renameKey('other_organisations')).toBe(
        'Other organisations involved',
      );
      expect(renameKey('temporal_coverage')).toBe('Temporal coverage');
      expect(renameKey('geo_coverage')).toBe('Geographical coverage');
      expect(renameKey('publisher')).toBe('Publisher');
      expect(renameKey('custom')).toBe('custom');
    });

    it('should spread string and object metadata into CSV columns', () => {
      expect(
        spreadCoreMetadata({
          data_provenance: ['Source A'],
          temporal_coverage: [
            { label: '2020', value: 'ignored', '@id': 'ignored' },
            { label: '2021' },
          ],
          geo_coverage: [{ label: 'Europe' }, { label: 'World' }],
          publisher: [{ title: 'EEA' }],
        }),
      ).toEqual({
        Sources: [' '],
        data_provenance: ['Source A'],
        'Temporal coverage': [' '],
        temporal_coverage_label: ['2020, 2021'],
        'Geographical coverage': [' '],
        geo_coverage_label: ['Europe, World'],
        Publisher: [' '],
        publisher_title: ['EEA'],
      });
    });
  });

  describe('groupDataByDataset', () => {
    it('should return the default dataset when traces are missing', () => {
      const chartData = { layout: { title: 'Chart' } };
      expect(groupDataByDataset(chartData)).toEqual({ default: chartData });
    });

    it('should group traces by dataset id', () => {
      expect(
        groupDataByDataset({
          layout: { title: 'Chart' },
          data: [
            { dataset: 'a', x: [1] },
            { dataset: 'b', x: [2] },
            { dataset: 'a', x: [3] },
            { x: [4] },
          ],
        }),
      ).toMatchObject({
        a: {
          name: 'a',
          data: [
            { dataset: 'a', x: [1] },
            { dataset: 'a', x: [3] },
          ],
        },
        b: { name: 'b', data: [{ dataset: 'b', x: [2] }] },
      });
    });
  });

  describe('trace transforms', () => {
    const rows = [
      { region: 'EU', value: 10 },
      { region: 'US', value: 20 },
      { region: 'EU', value: 30 },
    ];

    it('should apply filter transform operations', () => {
      expect(
        applyFilterTransform(rows, {
          targetsrc: 'region',
          operation: '=',
          value: 'EU',
        }),
      ).toHaveLength(2);
      expect(
        applyFilterTransform(rows, {
          targetsrc: 'region',
          operation: '!=',
          value: 'EU',
        }),
      ).toEqual([{ region: 'US', value: 20 }]);
      expect(
        applyFilterTransform(rows, {
          targetsrc: 'region',
          operation: 'contains',
          value: 'S',
        }),
      ).toEqual([{ region: 'US', value: 20 }]);
      expect(applyFilterTransform(rows, { targetsrc: 'value' })).toBe(rows);
    });

    it('should apply sort, aggregate, and split transforms', () => {
      expect(
        applySortTransform(rows, {
          targetsrc: 'value',
          order: 'descending',
        }).map((row) => row.value),
      ).toEqual([30, 20, 10]);

      expect(
        applyAggregateTransform(rows, {
          groups: 'region',
          aggregations: [
            { target: 'value', func: 'sum' },
            { target: 'missing', func: 'count' },
          ],
        }),
      ).toEqual([
        { region: 'EU', value: 40, missing: 0 },
        { region: 'US', value: 20, missing: 0 },
      ]);

      expect(applySplitTransform(rows, { groups: 'region' })).toEqual([
        { region: 'EU', value: 10, _split_group: 'EU' },
        { region: 'US', value: 20, _split_group: 'US' },
        { region: 'EU', value: 30, _split_group: 'EU' },
      ]);
    });

    it('should dispatch generic transforms and keep unsupported transforms unchanged', () => {
      expect(applyTransform(rows, {})).toBe(rows);
      expect(
        applyTransform(rows, {
          type: 'filter',
          targetsrc: 'region',
          value: 'EU',
        }),
      ).toHaveLength(2);
      expect(
        applyTransform(rows, {
          type: 'unsupported',
          targetsrc: 'region',
        }),
      ).toBe(rows);
    });
  });

  describe('processTraceData', () => {
    const reactChartEditorLib = {
      constants: { TRACE_SRC_ATTRIBUTES: ['x', 'y'] },
      getAttrsPath: (trace) => {
        const attrs = {};
        if (trace.x) attrs.x = trace.x;
        if (trace.y) attrs.y = trace.y;
        return attrs;
      },
      getSrcAttr: (trace, attr) => ({
        value: trace[`${attr}src`],
      }),
    };

    it('should extract columns used by trace source attributes and transforms', () => {
      expect(
        processTraceData(
          {
            x: [1, 2],
            xsrc: 'year',
            transforms: [{ targetsrc: 'region' }],
          },
          {
            year: [2020, 2021],
            region: ['EU', 'US'],
            unused: ['x', 'y'],
          },
          reactChartEditorLib,
        ),
      ).toEqual([
        { year: 2020, region: 'EU' },
        { year: 2021, region: 'US' },
      ]);
    });

    it('should fall back to all array data sources when no trace columns are used', () => {
      expect(
        processTraceData(
          {},
          {
            year: [2020],
            region: ['EU'],
            unit: 'kt',
          },
          reactChartEditorLib,
        ),
      ).toEqual([{ year: 2020, region: 'EU' }]);
    });
  });
});
