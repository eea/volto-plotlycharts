# volto-plotlycharts

[![Releases](https://img.shields.io/github/v/release/eea/volto-plotlycharts)](https://github.com/eea/volto-plotlycharts/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&branch=develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts&branch=develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&branch=develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts&branch=develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&branch=develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts&branch=develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts&branch=develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts&branch=develop)

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

## Getting started

### Try volto-plotlycharts with Docker

      git clone https://github.com/eea/volto-plotlycharts.git
      cd volto-plotlycharts
      make
      make start

Go to http://localhost:3000

`make start` now defaults to Volto 18. To run the same setup against Volto 17, use:

      VOLTO_VERSION=17 make
      VOLTO_VERSION=17 make start

### Add volto-plotlycharts to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

- If you already have a volto project, just update `package.json`:

  ```JSON
  "addons": [
      "@eeacms/volto-plotlycharts"
  ],

  "dependencies": {
      "@eeacms/volto-plotlycharts": "*"
  }
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

   For a legacy Volto 17 project, install the package with `yarn` and restart the frontend as usual.

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-plotlycharts/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-plotlycharts/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-plotlycharts/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
