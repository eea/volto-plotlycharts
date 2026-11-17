# @eeacms/volto-plotlycharts

[![Releases](https://img.shields.io/github/v/release/eea/volto-plotlycharts)](https://github.com/eea/volto-plotlycharts/releases)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/master/display/redirect)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts)

[Volto](https://github.com/plone/volto) add-on

## Features

Plotly Charts and Plotly Chart Editor integration with Volto

- Exports a PlotlyChart Widget, can be used in regular volto edit forms
- Registers a VisualizationView component for a content type named
  'visualization'. `eea.restapi` has a behavior to implement such a content
  type.

![Plotlycharts](https://raw.githubusercontent.com/eea/volto-plotlycharts/master/docs/volto-plotlycharts.gif)

## Upgrade
- Version `^12.0.0` requires `^eea.plotly@1.0` and `^eea.api.dataconnector@12.0`

- Version `^9.0.0` requires `^eea.api.dataconnector@9.0`

- Version `^8.0.0` requires `^eea.api.dataconnector@7.0`

- Version `^6.0.0` requires `^eea.api.dataconnector@4.4`

## Requirements

### Backend

- [Plone](https://plone.org/download)
- [plone.restapi](https://pypi.org/project/plone.restapi/)

### Frontend

- Node.js: `>=22.0.0`

## Installation

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

- If you already have a volto project, just update `package.json`:

  ```JSON
  "dependencies": {
      "@eeacms/volto-plotlycharts": "*"
  }
  ```

   and `volto.config.js`:

   ```JavaScript
   const addons = ['@eeacms/volto-plotlycharts'];
   ```

- If not, create one with Cookieplone, as recommended by the official Plone documentation for Volto 18+:

  ```
  uvx cookieplone project
  cd project-title
  ```

1. Install or update dependencies, then start the project:

   ```
   make install
   ```

   For a Cookieplone project, start the backend and frontend in separate terminals:

   ```
   make backend-start
   make frontend-start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## License

See [LICENSE.md](LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
