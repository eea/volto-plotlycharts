import { getAPIResourceWithAuth } from '@plone/volto/helpers';
import express from 'express';

const HEADERS = [
  'Accept-Ranges',
  'Cache-Control',
  'Content-Disposition',
  'Content-Range',
  'Content-Type',
];

function plotly_preview_fn(req, res, next) {
  getAPIResourceWithAuth(req)
    .then((resource) => {
      // Just forward the headers that we need
      HEADERS.forEach((header) => {
        if (resource.get(header)) {
          res.set(header, resource.get(header));
        }
      });
      res.status(resource.statusCode);
      res.send(resource.body);
    })
    .catch(next);
}

export default function plotly_preview() {
  const middleware = express.Router();

  middleware.all(['**/(@@)?plotly_preview.svg(/*)?'], plotly_preview_fn);
  middleware.id = 'plotly-middlewares';
  return middleware;
}
