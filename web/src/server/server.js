import express from 'express';
import axios from 'axios';
import path from 'path'
import fs from 'fs'

import webpack from 'webpack';
import webpackConfig from '../../webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import _ from 'lodash'
import moment from 'moment'
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import { Provider } from 'react-redux';
import createLocation from 'history/lib/createLocation';
import injectTapEventPlugin from 'react-tap-event-plugin';

import packagejson from '../../package.json';
import configureStore from './store';
import routes from './routes';
import { loadProjectNames, loadBranches, loadCommits, mapProjectCommits } from './api/data-initializer'

const APP_CONFIG_FILE = './config/spectrometer-web.json'
const appConfig = JSON.parse(fs.readFileSync(path.resolve(APP_CONFIG_FILE), 'utf8'))
const url = apiConfig ? apiConfig.apiServer : 'http://localhost:5000'

global.navigator = { navigator: 'all' };
injectTapEventPlugin()

console.info(`starting OpenDaylight Spectrometer web app in ${process.env.NODE_ENV} mode`)

const app = express();

const startTime = moment()
let allProjects = []
loadProjectNames(url).then((names) => {
  console.info("server: project names loaded:", names.length )
  loadBranches(url, names).then((projectsWithBranches) => {
    console.info("server: project branches loaded:", projectsWithBranches.length)
    loadCommits(url, names).then((projectsWithCommits) => {
      allProjects = _.merge(projectsWithBranches, projectsWithCommits)
      console.log("server: it took ", moment().diff(startTime, 'seconds'), "seconds to load", allProjects.length, "projects")
      console.log("server: all projects loaded into store, Spectrometer is READY for browsing")
    })
  })
})

const renderFullPage = (html, initialState) => {
  return (`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <title>OpenDaylight Spectrometer</title>

        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/images/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/images/favicon-192x192.png" sizes="192x192" />
        <link rel="stylesheet" type="text/css" href="/static/app.css">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
  `);
}

if (process.env.NODE_ENV !== 'production') {
  console.info('using webpack dev middleware')
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, stats: { colors: true }, publicPath: webpackConfig.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use('/static', express.static(__dirname + '/../../dist'));
}

// handle all spectrometer-api requests
app.get('/spectrometer-api/*', function(req, res) {
  console.info('serving spectrometer-api url', req.url)
  const url = appConfig.apiServer + req.url.replace('spectrometer-api/', '')
  axios.get(url)
    .then(response => {
      req.url.indexOf('/git/commits') >= 0 ?
        res.json({commits: mapProjectCommits(response.data.commits)}) :
        res.json(response.data)
    })
})

// handle non-api requests
app.get('/*', function(req, res, next) {
  // console.info("serving url:", req.url)
  if ((/\.(gif|jpg|jpeg|tiff|png|ico|svg)$/i).test(req.url)) next()
  // if (req.url.indexOf('.png') >= 0 || req.url.indexOf('.ico') >= 0 || req.url.indexOf('.jpg') >= 0) next();

  const location = createLocation(req.url);
  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if (err) {
      console.error(err)
      return res.status(500).end('Internal server error')
    }

    if (!renderProps) {
      return res.status(404).end('Not found')
    }

    const store = configureStore({
      projects: {
        projects: allProjects
      }
    })

    const InitialView = (<Provider store={ store }>
      <RouterContext {...renderProps}/>
    </Provider>
    )

    const componentHTML = ReactDOMServer.renderToString(InitialView);
    const initialState = store.getState();
    res.status(200).end(renderFullPage(componentHTML, initialState))
  })
})

const server = app.listen(appConfig['httpPort'], function() {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`OpenDaylight Spectrometer web app listening at http://${host}:${port}`);
});
