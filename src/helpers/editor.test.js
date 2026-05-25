import { destroyEditor, onPasteEditor, validateEditor } from './editor';

jest.mock('react-toastify', () => ({
  toast: { warn: jest.fn() },
}));

jest.mock('@plone/volto/components/manage/Toast/Toast', () => () => null);

describe('editor helpers', () => {
  describe('destroyEditor', () => {
    it('should call destroy on a provided editor', () => {
      const editor = { destroy: jest.fn() };
      destroyEditor(editor);
      expect(editor.destroy).toHaveBeenCalled();
    });

    it('should do nothing when no editor is given', () => {
      expect(() => destroyEditor(null)).not.toThrow();
    });
  });

  describe('onPasteEditor', () => {
    it('should repair and format the editor', () => {
      const editor = {
        current: { repair: jest.fn(), format: jest.fn() },
      };
      onPasteEditor(editor);
      expect(editor.current.repair).toHaveBeenCalled();
      expect(editor.current.format).toHaveBeenCalled();
    });

    it('should swallow errors thrown while repairing', () => {
      const editor = {
        current: {
          repair: () => {
            throw new Error('bad');
          },
          format: jest.fn(),
        },
      };
      expect(() => onPasteEditor(editor)).not.toThrow();
    });
  });

  describe('validateEditor', () => {
    it('should return true when there are no validation errors', async () => {
      const editor = { current: { validate: jest.fn().mockResolvedValue([]) } };
      await expect(validateEditor(editor)).resolves.toBe(true);
    });

    it('should warn and return false when validation errors exist', async () => {
      const { toast } = require('react-toastify');
      const editor = {
        current: { validate: jest.fn().mockResolvedValue([{ message: 'x' }]) },
      };
      await expect(validateEditor(editor)).resolves.toBe(false);
      expect(toast.warn).toHaveBeenCalled();
    });
  });
});
