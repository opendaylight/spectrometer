/**
# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################
*/

/**
 * Server-side startup page
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import express from 'express';
import axios from 'axios';
import path from 'path'
import fs from 'fs'
import compression from 'compression'

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

import logger from './logger'

import packagejson from '../../package.json';
import configureStore from './store';
import routes from './routes';
import * as DataInitializer from './api/data-initializer'
import { mapCommits } from './api/data-reducers'

const argv = require('yargs')
  .usage('Usage: npm start [--projects|-p]')
  .alias('p', 'projects')
  .describe('load only first n projects - use only in development mode')
  .epilog('Copyright The Linux Foundation 2016')
  .argv

const DEFAULT_SPECTROMETER_API_SERVER_URL = "http://localhost:5000"
const DEFAULT_STORE_REFRESH_INTERVAL_IN_MINUTES = 15

// load spectrometer-web json configuration file
const APP_CONFIG_FILE = './config/spectrometer-web.json'
const webAppConfig = JSON.parse(fs.readFileSync(path.resolve(APP_CONFIG_FILE), 'utf8'))
const refreshIntervalMs = (webAppConfig.app.storeRefreshIntervalInMinutes || DEFAULT_STORE_REFRESH_INTERVAL_IN_MINUTES) * 60 * 1000

/** material-ui requirements to inject Touch features **/
global.navigator = { navigator: 'all' };
injectTapEventPlugin()

logger.info(`starting ${webAppConfig.app.title} web app in ${process.env.NODE_ENV} mode`)
const apiServerUrl = webAppConfig ? webAppConfig.server.apiServerUrl : DEFAULT_SPECTROMETER_API_SERVER_URL
logger.info("using apiServerUrl", apiServerUrl)

const app = express()
app.use(compression())

/**
 * Compile and Run for Development or Production
 * Note:
 * - For Development, the webpackDevMiddleware and webpackHotMiddleware are used to hot-load changes (only ui changes are hot-loaded)
 * - For Production, the app must be precompiled with `npm run build` statement before executing `npm run start-prod`
 */
if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(webpackConfig)
  logger.info('using webpackDevMiddleware and webpackHotMiddleware')
  logger.info('process running from', __dirname)
  app.use(webpackDevMiddleware(compiler, { noInfo: true, stats: { colors: true }, publicPath: webpackConfig.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
  app.use('/static', express.static(__dirname))
} else {
  //use the artifacts precompiled via `npm run build` statement and available in the dist/ directory
  app.use('/static', express.static(__dirname + '/../../dist'));
}

/**
 * API to handle all proxy requests to the Spectrometer Server
 * Spectrometer Browser Client does not call Spectrometer Server directly;
 *  instead requests are proxied via the NodeJS server to avoid CORS issues
 *  Browser Client -> Spectrometer NodeJS  -> Spectrometer Python Server
 *  all Browser Client requests for the proxy must be prefixed with /spectrometer-api url
 * @example: http://spectrometer.opendaylight.org:8000/spectrometer-api/git/commits?x -> http://localhost:5000/git/commits?x
 * @return whatever data that the Spectrometer Server returns for the api
 */
app.get('/spectrometer-api/*', function(req, res) {
  logger.info('serving spectrometer-api url', req.url)
  const url = apiServerUrl + req.url.replace('spectrometer-api/', '')
  axios.get(url)
    .then(response => {
      req.url.indexOf('/git/commits') >= 0 ?
        res.json({commits: mapCommits(response.data.commits)}) :
        res.json(response.data)
    })
})

/**
 * API to retrieve allProjects (projects with commits used by Web UI)
 */
app.get('/all-projects', function(req, res) {
  logger.info('serving url', req.url)
  res.json(allProjects)
})

/**
 * API to refresh store by force
 * Uses POST verb since store is being updated
 */
app.post('/refresh-store', function(req, res) {
  logger.info('serving url', req.url)
  if (refreshIntervalId) {
    //clear existing timer, as it will be reset; if we dont clear we will be running multiple timers to refreshProjects
    clearInterval(refreshIntervalId)
    fetchProjects()
  }
  res.json(JSON.stringify("done"))
})

/**
 * handle all non-api requests
 */
app.get('/*', function(req, res, next) {
  logger.info("serving url:", req.url)
  if ((/\.(gif|jpg|jpeg|tiff|png|ico|svg)$/i).test(req.url)) next()

  const location = createLocation(req.url);
  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if (err) {
      logger.error(err)
      return res.status(500).end('Internal server error')
    }

    if (!renderProps) {
      return res.status(404).end('Not found')
    }

    const store = configureStore({
      spectro: {
        projects: allProjects,
        projectCards: [],
        organizationCards: [],
        authorCards: [],
        isFetching: false,
        isError: false
      }
    })

    const InitialView = (<Provider store={ store }>
      <RouterContext {...renderProps}/>
    </Provider>
    )

    const componentHTML = ReactDOMServer.renderToString(InitialView)
    const initialState = store.getState()
    logger.info("server:initial-state: # of projects:", initialState.spectro.projects.length)
    logger.info("server:rendering initial app")
    res.status(200).end(renderFullPage(componentHTML, initialState))
  })
})

/**
 * refreshProjects
 * Read Projects from the API Server and load it into the allProjects variable (used by Redux store to render initial app)
 * broadcasts a message "projects-updated" to all clients via websocket
 * method is called every ${refreshIntervalMs} milliseconds via the setInterval timer
 */
let allProjects = []
let refreshIntervalId = 0
const refreshProjects = () => {
  logger.info('refreshProjects')
  const startTime = moment()
  DataInitializer.loadProjectNames(apiServerUrl, argv.projects).then((names) => {
    logger.info(`server: ${names.length} project names loaded`)
    DataInitializer.loadBranches(apiServerUrl, names).then((projectsWithBranches) => {
      logger.info(`server: ${projectsWithBranches.length} project branches loaded`)
      DataInitializer.loadCommits(apiServerUrl, names).then((projectsWithCommits) => {
        allProjects = _.merge(projectsWithCommits, projectsWithBranches)
        logger.info(`server: loaded ${allProjects.length} projects in ${moment().diff(startTime, 'seconds')} seconds`)
        logger.info(`server: Projects will be refreshed in ${refreshIntervalMs/1000} seconds (at ${moment().add(refreshIntervalMs, 'ms').utc().format()})`)
        logger.info("server: Spectrometer is READY for browsing")
      })
    })
  })
}

/**
 * fetchProjects
 * wrapper for refreshProjects and sets the timer to call refreshProjects every ${refreshIntervalMs} milliseconds
 */
const fetchProjects = () => {
  refreshProjects()
  refreshIntervalId = setInterval(refreshProjects, refreshIntervalMs)
}

/**
 * renderFullPage
 * Renders the initial html with Store state in the browser
 * @param html: the html content to render
 * @param initialState: initial store state from the redux store
 **/
const renderFullPage = (html, initialState) => {
  return (`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="description" content="${webAppConfig.app.title}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <meta name="keywords" content="${webAppConfig.app.metaKeywords}"/>
        <title>${webAppConfig.app.title}</title>
        <link type="text/css" href="/static/app.css" rel="stylesheet" />
        <link rel="icon" type="image/x-icon" href="/static/images/favicon.ico">
        <link type="text/css" href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      </head>
      <body>
        <div id="spectrometer" class="container">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
  `);
}

/** Setup Http Server **/
const server = app.listen(webAppConfig.server['httpPort'], function() {
  const host = server.address().address
  const port = server.address().port
  logger.info(`${webAppConfig.app.title} web app listening at http://${host}:${port}`)
  fetchProjects()
});
