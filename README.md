# volto-plotlycharts

[![Releases](https://img.shields.io/github/v/release/eea/volto-plotlycharts)](https://github.com/eea/volto-plotlycharts/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-plotlycharts%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-plotlycharts/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-plotlycharts-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-plotlycharts-develop)

[Volto](https://github.com/plone/volto) add-on

## Features

Plotly Charts and Plotly Chart Editor integration with Volto

- Exports a PlotlyChart Widget, can be used in regular volto edit forms
- Registers a VisualizationView component for a content type named
  'visualization'. `eea.restapi` has a behavior to implement such a content
  type.

## Getting started

### Try volto-plotlycharts with Docker

1. Get the latest Docker images

   ```
   docker pull plone
   docker pull plone/volto
   ```

1. Start Plone backend

   ```
   docker run -d --name plone -p 8080:8080 -e SITE=Plone -e PROFILES="profile-plone.restapi:blocks" plone
   ```

1. Start Volto frontend

   ```
   docker run -it --rm -p 3000:3000 --link plone -e ADDONS="@eeacms/volto-plotlycharts" plone/volto
   ```

1. Go to http://localhost:3000

### Add volto-plotlycharts to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

1. Start Volto frontend

- If you already have a volto project, just update `package.json`:

  ```JSON
  "addons": [
      "@eeacms/volto-plotlycharts"
  ],

  "dependencies": {
      "@eeacms/volto-plotlycharts": "^1.0.0"
  }
  ```

- If not, create one:

  ```
  npm install -g yo @plone/generator-volto
  yo @plone/volto my-volto-project --addon @eeacms/volto-plotlycharts
  cd my-volto-project
  ```

1. Install new add-ons and restart Volto:

   ```
   yarn
   yarn start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## Release

Version ^6.0.0 requires ^eea.api.dataconnector@4.4

See [RELEASE.md](https://github.com/eea/volto-plotlycharts/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-plotlycharts/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-plotlycharts/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
