import {
  CREATE_CONTENT,
  UPDATE_CONTENT,
} from '@plone/volto/constants/ActionTypes';
import { isArray } from 'lodash';

export const preview_image = (middlewares) => [
  (store) => (next) => async (action) => {
    if (![CREATE_CONTENT, UPDATE_CONTENT].includes(action.type))
      return next(action);

    const state = store.getState();
    const contentData = state.content.data;
    const lastPreviewImage = Object.keys(action?.request?.data).includes(
      'preview_image',
    )
      ? action?.request?.data.preview_image
      : contentData?.preview_image;
    const type = action?.request?.data?.['@type'] || contentData['@type'];

    if (
      type !== 'visualization' ||
      state.content.data.preview_image_saved ||
      (lastPreviewImage &&
        lastPreviewImage.filename !==
          'preview_image_generated_plotly_chart.png')
    )
      return next(action);

    try {
      const plotly = await import('plotly.js/dist/plotly.min.js');
      const { toImage } = plotly;
      const width = 700;
      const height = 450;
      const plotlyElement = document.querySelector('.js-plotly-plot');

      if (!plotlyElement) throw Error("plotlyElement doesn't exit");

      const dataUrl = await toImage(plotlyElement, {
        format: 'png',
        height,
        width,
      });
      if (!dataUrl) throw Error('dataUrl is not valid');

      const preview_image = {
        preview_image: {
          data: dataUrl.split(',')[1],
          encoding: 'base64',
          'content-type': 'image/png',
          filename: 'preview_image_generated_plotly_chart.png',
        },
        preview_image_saved: true,
      };
      const { request } = action;
      return next({
        ...action,
        request: isArray(request)
          ? request.map((req) => ({
              ...req,
              data: {
                ...(req.data || {}),
                ...preview_image,
              },
            }))
          : {
              ...request,
              data: {
                ...(request.data || {}),
                ...preview_image,
              },
            },
      });
    } catch (error) {
      return next(action);
    }
  },
  ...middlewares,
];
