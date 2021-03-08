# Volto plotlycharts 
[![Releases](https://img.shields.io/github/v/release/eea/volto-plotlycharts)](https://github.com/eea/volto-plotlycharts/releases)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/master/display/redirect)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/develop/display/redirect)

Plotly Charts and Plotly Chart Editor integration with Volto

- Exports a PlotlyChart Widget, can be used in regular volto edit forms
- Registers a VisualizationView component for a content type named
  'visualization'. `eea.restapi` has a behavior to implement such a content
  type.

## Getting started

1. Create new volto project if you don't already have one:

   ```
   $ npm install -g yo @plone/generator-volto
   $ yo @plone/volto my-volto-project --addon volto-plotlycharts

   $ cd my-volto-project
   $ yarn add -W volto-plotlycharts
   ```

1. If you already have a volto project, just update `package.json`:

   ```JSON
   "addons": [
      "volto-plotlycharts"
   ],

   "dependencies": {
      "volto-plotlycharts": "github:eea/volto-plotlycharts#2.0.0"
   }
   ```

1. Install new add-ons and restart Volto:

   ```
   $ yarn
   $ yarn start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-plotlycharts/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-plotlycharts/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)