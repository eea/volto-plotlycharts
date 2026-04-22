import {
  applyPlotlyDefaults,
  deleteGeneratedFigureMetadataBlock,
  getCssVariables,
  getDataSources,
  getFigureMetadataId,
  getFigurePosition,
  getFigureMetadata,
  getGeneratedFigureMetadataBlockId,
  insertFigureMetadataBeforeBlock,
} from './index.js';
import config from '@plone/volto/registry';

let mockUuidCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    const value =
      mockUuidCounter === 0 ? 'mock-uuid' : `mock-uuid${mockUuidCounter}`;
    mockUuidCounter += 1;
    return value;
  }),
}));

describe('helpers.js', () => {
  beforeEach(() => {
    mockUuidCounter = 0;
    config.blocks = config.blocks || {};
    config.blocks.blocksConfig = {
      ...config.blocks.blocksConfig,
      group: {},
    };
    jest.clearAllMocks();
  });

  describe('applyPlotlyDefaults', () => {
    it('should create complete chart defaults for missing chart data', () => {
      const result = applyPlotlyDefaults();

      expect(result.chartData.data).toEqual([]);
      expect(result.chartData.frames).toEqual([]);
      expect(result.chartData.layout).toMatchObject({
        autosize: true,
        hovermode: 'closest',
        dragmode: false,
        showlegend: false,
        xaxis: {
          autorange: true,
          title: {
            font: {
              size: 14,
            },
          },
        },
        yaxis: {
          autorange: true,
          title: {
            font: {
              size: 14,
            },
          },
        },
      });
    });

    it('should preserve existing chart data, frames, and custom layout values', () => {
      const result = applyPlotlyDefaults({
        title: 'Chart block',
        chartData: {
          data: [{ type: 'bar' }],
          frames: [{ name: 'frame-1' }],
          layout: {
            height: 320,
            showlegend: true,
          },
        },
      });

      expect(result.title).toBe('Chart block');
      expect(result.chartData.data).toEqual([{ type: 'bar' }]);
      expect(result.chartData.frames).toEqual([{ name: 'frame-1' }]);
      expect(result.chartData.layout.height).toBe(320);
      expect(result.chartData.layout.showlegend).toBe(true);
    });
  });

  describe('getCssVariables', () => {
    it('should prefer the y axis title font size', () => {
      expect(
        getCssVariables({
          layout: {
            font: { size: 12 },
            yaxis: {
              title: {
                font: { size: 18 },
              },
            },
          },
        }),
      ).toEqual({ '--y-axis-title-font-size': 18 });
    });

    it('should fall back to layout font size or zero', () => {
      expect(getCssVariables({ layout: { font: { size: 12 } } })).toEqual({
        '--y-axis-title-font-size': 12,
      });
      expect(getCssVariables()).toEqual({ '--y-axis-title-font-size': 0 });
    });
  });

  describe('getDataSources', () => {
    it('should merge data source props in priority order', () => {
      expect(
        getDataSources({
          provider_data: {
            shared: ['provider'],
            providerOnly: ['provider'],
          },
          data_source: {
            shared: ['data_source'],
            sourceOnly: ['source'],
          },
          dataSources: {
            shared: ['dataSources'],
            localOnly: ['local'],
          },
        }),
      ).toEqual({
        shared: ['dataSources'],
        providerOnly: ['provider'],
        sourceOnly: ['source'],
        localOnly: ['local'],
      });
    });

    it('should handle missing data source props', () => {
      expect(getDataSources({})).toEqual({});
    });
  });

  describe('getFigurePosition', () => {
    it('should count figure-like blocks before the target block', () => {
      const properties = {
        blocks: {
          intro: { '@type': 'slate' },
          figure1: { '@type': 'plotly_chart' },
          group: {
            '@type': 'group',
            data: {
              blocks: {
                nested: { '@type': 'embed_content' },
              },
              blocks_layout: { items: ['nested'] },
            },
          },
          figure2: { '@type': 'embed_visualization' },
        },
        blocks_layout: { items: ['intro', 'figure1', 'group', 'figure2'] },
      };

      expect(getFigurePosition(properties, 'figure1')).toBe(1);
      expect(getFigurePosition(properties, 'figure2')).toBe(3);
      expect(getFigurePosition(properties, 'unknown')).toBe(1);
    });
  });

  describe('getFigureMetadata', () => {
    it('should build generated figure metadata with title and description', () => {
      document.getElementById = jest.fn().mockReturnValue(null);

      const result = getFigureMetadata(
        'embed_visualization',
        {
          title: 'Test Title',
          description: 'Test Description',
        },
        4,
      );

      expect(result).toEqual({
        '@type': 'group',
        className: 'figure-metadata',
        id: 'figure-metadata-embed_visualization',
        data: {
          blocks: {
            'mock-uuid': {
              '@type': 'slate',
              value: [
                {
                  type: 'h3-light',
                  children: [{ text: 'Figure 4. Test Title' }],
                },
              ],
              plaintext: 'Figure 4. Test Title',
            },
            'mock-uuid1': {
              '@type': 'slate',
              value: [
                {
                  type: 'p',
                  children: [{ text: 'Test Description' }],
                },
              ],
              plaintext: 'Test Description',
            },
          },
          blocks_layout: { items: ['mock-uuid', 'mock-uuid1'] },
        },
      });
    });

    it('should return generated figure metadata with the expected markers', () => {
      document.getElementById = jest.fn().mockReturnValue(null);

      const result = getFigureMetadata('embed_visualization', {
        title: 'Test Title',
      });

      expect(result).toMatchObject({
        '@type': 'group',
        className: 'figure-metadata',
        id: 'figure-metadata-embed_visualization',
      });
    });

    it('should return undefined when generated metadata already exists in the DOM', () => {
      document.getElementById = jest.fn().mockReturnValue(true);

      expect(
        getFigureMetadata('embed_visualization', { title: 'Test Title' }),
      ).toBeUndefined();
    });

    it('should return undefined without a title or description', () => {
      document.getElementById = jest.fn().mockReturnValue(null);

      expect(getFigureMetadata('embed_visualization', {})).toBeUndefined();
    });
  });

  describe('getFigureMetadataId', () => {
    it('should build the generated metadata DOM id', () => {
      expect(getFigureMetadataId('figure')).toBe('figure-metadata-figure');
    });
  });

  describe('getGeneratedFigureMetadataBlockId', () => {
    it('should find generated metadata by block id', () => {
      expect(
        getGeneratedFigureMetadataBlockId(
          {
            blocks: {
              generated: { id: 'figure-metadata-figure' },
              figure: { '@type': 'embed_visualization' },
            },
          },
          'figure',
        ),
      ).toBe('generated');
    });

    it('should return null when generated metadata is missing', () => {
      expect(getGeneratedFigureMetadataBlockId({}, 'figure')).toBeNull();
    });
  });

  describe('insertFigureMetadataBeforeBlock', () => {
    it('should insert metadata before an embed_visualization block', () => {
      const properties = {
        blocks: {
          intro: { '@type': 'slate' },
          embed_visualization: { '@type': 'embed_visualization' },
        },
        blocks_layout: { items: ['intro', 'embed_visualization'] },
      };
      const metadataSection = {
        '@type': 'group',
        id: 'figure-metadata-embed_visualization',
      };
      const onChangeFormData = jest.fn();

      const newBlock = insertFigureMetadataBeforeBlock({
        properties,
        block: 'embed_visualization',
        metadataSection,
        blocksConfig: { group: {} },
        onChangeFormData,
      });

      expect(newBlock).toBe('mock-uuid');
      expect(
        onChangeFormData.mock.calls[0][0].blocks_layout.items,
      ).toStrictEqual(['intro', 'mock-uuid', 'embed_visualization']);
    });

    it('should insert metadata before an embed_content proxy block', () => {
      const properties = {
        blocks: {
          intro: { '@type': 'slate' },
          embed_content: { '@type': 'embed_content' },
          tail: { '@type': 'slate' },
        },
        blocks_layout: { items: ['intro', 'embed_content', 'tail'] },
      };
      const metadataSection = {
        '@type': 'group',
        id: 'figure-metadata-embed_content',
      };
      const onChangeFormData = jest.fn();

      const newBlock = insertFigureMetadataBeforeBlock({
        properties,
        block: 'embed_content',
        metadataSection,
        blocksConfig: { group: {} },
        onChangeFormData,
      });

      expect(newBlock).toBe('mock-uuid');
      expect(
        onChangeFormData.mock.calls[0][0].blocks_layout.items,
      ).toStrictEqual(['intro', 'mock-uuid', 'embed_content', 'tail']);
    });

    it('should not insert a duplicate metadata block', () => {
      const onChangeFormData = jest.fn();
      const onInsertBlock = jest.fn();

      const result = insertFigureMetadataBeforeBlock({
        properties: {
          blocks: {
            metadata: {
              '@type': 'group',
              id: 'figure-metadata-embed_visualization',
            },
            embed_visualization: { '@type': 'embed_visualization' },
          },
          blocks_layout: { items: ['metadata', 'embed_visualization'] },
        },
        block: 'embed_visualization',
        metadataSection: {
          '@type': 'group',
          id: 'figure-metadata-embed_visualization',
        },
        onChangeFormData,
        onInsertBlock,
      });

      expect(result).toBeUndefined();
      expect(onChangeFormData).not.toHaveBeenCalled();
      expect(onInsertBlock).not.toHaveBeenCalled();
    });

    it('should return undefined when no metadata section is provided', () => {
      const onChangeFormData = jest.fn();
      const onInsertBlock = jest.fn();

      expect(
        insertFigureMetadataBeforeBlock({
          properties: {
            blocks: {
              embed_visualization: { '@type': 'embed_visualization' },
            },
            blocks_layout: { items: ['embed_visualization'] },
          },
          block: 'embed_visualization',
          onChangeFormData,
          onInsertBlock,
        }),
      ).toBeUndefined();
      expect(onChangeFormData).not.toHaveBeenCalled();
      expect(onInsertBlock).not.toHaveBeenCalled();
    });

    it('should fall back to onInsertBlock when form data mutation is unavailable', () => {
      const onInsertBlock = jest.fn().mockReturnValue('inserted');
      const metadataSection = {
        '@type': 'group',
        id: 'figure-metadata-embed_visualization',
      };

      expect(
        insertFigureMetadataBeforeBlock({
          block: 'embed_visualization',
          metadataSection,
          onInsertBlock,
        }),
      ).toBe('inserted');
      expect(onInsertBlock).toHaveBeenCalledWith(
        'embed_visualization',
        metadataSection,
      );
    });
  });

  describe('deleteGeneratedFigureMetadataBlock', () => {
    it('should delete the matching generated metadata block when toggled off', () => {
      const onDeleteBlock = jest.fn();
      const onSelectBlock = jest.fn();

      const result = deleteGeneratedFigureMetadataBlock({
        properties: {
          blocks: {
            generated_metadata: {
              '@type': 'group',
              id: 'figure-metadata-embed_visualization',
            },
            embed_visualization: { '@type': 'embed_visualization' },
          },
          blocks_layout: {
            items: ['generated_metadata', 'embed_visualization'],
          },
        },
        block: 'embed_visualization',
        onDeleteBlock,
        onSelectBlock,
      });

      expect(result).toBe('generated_metadata');
      expect(onDeleteBlock).toHaveBeenCalledWith('generated_metadata');
      expect(onSelectBlock).toHaveBeenCalledWith('embed_visualization');
    });

    it('should return undefined when there is no generated metadata block', () => {
      const onDeleteBlock = jest.fn();
      const onSelectBlock = jest.fn();

      expect(
        deleteGeneratedFigureMetadataBlock({
          properties: {
            blocks: {
              embed_visualization: { '@type': 'embed_visualization' },
            },
          },
          block: 'embed_visualization',
          onDeleteBlock,
          onSelectBlock,
        }),
      ).toBeUndefined();
      expect(onDeleteBlock).not.toHaveBeenCalled();
      expect(onSelectBlock).not.toHaveBeenCalled();
    });
  });
});
