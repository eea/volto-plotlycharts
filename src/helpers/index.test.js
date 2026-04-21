import {
  deleteGeneratedFigureMetadataBlock,
  getFigureMetadata,
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

  describe('getFigureMetadata', () => {
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
  });
});
