import express from 'express';
import request from 'axios';

import webpack from 'webpack';
import webpackConfig from '../../webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RoutingContext, match } from 'react-router';
import { Provider } from 'react-redux';
import createLocation from 'history/lib/createLocation';
import { fetchComponentDataBeforeRender } from '../common/api/fetchComponentDataBeforeRender';

import configureStore from '../common/store/configureStore';
import routes from '../common/routes';
import packagejson from '../../package.json';

const API_SERVER = 'http://127.0.0.1:5000'

const app = express();
const renderFullPage = (html, initialState) => {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>OpenDaylight Spectrometer</title>
        <link rel="stylesheet" type="text/css" href="/static/app.css">
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
  `;
}

if(process.env.NODE_ENV !== 'production'){
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}else{
  app.use('/static', express.static(__dirname + '/../../dist'));
}

app.get('/git/commits/:repo/:branchName', function(req, res) {
  const commitsUrl = `${API_SERVER}/git/commits/${req.params['repo']}/${req.params['branchName']}`
  console.info('loading git commits for repo/branch:', commitsUrl)
  request.get(commitsUrl)
         .then(response => {
          //  console.log("repo done with response:", response);
           res.json(response)
         }
        )
});

app.get('/git/branches/:repo', function(req, res) {
  const branchUrl = `${API_SERVER}/git/branches/${req.params['repo']}`
  console.info('loading git branches from:', branchUrl);
  request.get(branchUrl)
         .then(response => {
          //  console.log("branches done with response:", response);
           res.json(response)
         }
        )
});

app.get('/*', function (req, res) {
  console.info("requested url:", req.url)

  const location = createLocation(req.url);
  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if(err) {
      console.error(err);
      return res.status(500).end('Internal server error');
    }

    if(!renderProps)
      return res.status(404).end('Not found');

    const store = configureStore({version : packagejson.version});

    const InitialView = (
      <Provider store={store}>
          <RoutingContext {...renderProps} />
      </Provider>
    );

    //This method waits for all render component promises to resolve before returning to browser
    fetchComponentDataBeforeRender(store.dispatch, renderProps.components, renderProps.params)
      .then(html => {
        const componentHTML = ReactDOMServer.renderToString(InitialView);
        const initialState = store.getState();
        res.status(200).end(renderFullPage(componentHTML,initialState))
      })
      .catch(err => {
        console.log(err)
        res.end(renderFullPage("",{}))
      });
  });
});

const server = app.listen(8000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Example app listening at http://${host}:${port}`);
});
