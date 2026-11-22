import { destroyEditor, onPasteEditor, validateEditor } from './editor';

vi.mock('react-toastify', () => ({
  toast: { warn: vi.fn() },
}));

vi.mock('@plone/volto/components/manage/Toast/Toast', () => ({
  default: () => null,
}));

describe('editor helpers', () => {
  describe('destroyEditor', () => {
    it('should call destroy on a provided editor', () => {
      const editor = { destroy: vi.fn() };
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
        current: { repair: vi.fn(), format: vi.fn() },
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
          format: vi.fn(),
        },
      };
      expect(() => onPasteEditor(editor)).not.toThrow();
    });
  });

  describe('validateEditor', () => {
    it('should return true when there are no validation errors', async () => {
      const editor = { current: { validate: vi.fn().mockResolvedValue([]) } };
      await expect(validateEditor(editor)).resolves.toBe(true);
    });

    it('should warn and return false when validation errors exist', async () => {
      const { toast } = await import('react-toastify');
      const editor = {
        current: { validate: vi.fn().mockResolvedValue([{ message: 'x' }]) },
      };
      await expect(validateEditor(editor)).resolves.toBe(false);
      expect(toast.warn).toHaveBeenCalled();
    });
  });
});
