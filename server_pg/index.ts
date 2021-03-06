import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import webpack, { Configuration } from 'webpack';

import webpackConfig from '../webpack/webpack.config';
import { isDebug } from '../config/app';
import { connect } from './db';
import initPassport from './init/passport';
import initExpress from './init/express';
import initRoutes from './init/routes';
import renderMiddleware from './render/middleware';

const app = express();

/*
 * Database-specific setup
 * - connect to MongoDB using mongoose
 * - register mongoose Schema
 */
connect();

/*
 * REMOVE if you do not need passport configuration
 */
initPassport();

if (isDebug) {
  // enable webpack hot module replacement
  // eslint-disable-next-line import/no-extraneous-dependencies
  const webpackDevMiddleware = require('webpack-dev-middleware');
  // eslint-disable-next-line import/no-extraneous-dependencies
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const devBrowserConfig = webpackConfig({ browser: true }) as Configuration;
  const compiler = webpack(devBrowserConfig);
  app.use(webpackDevMiddleware(compiler, { publicPath: devBrowserConfig.output!.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

/*
 * Bootstrap application settings
 */
initExpress(app);

/*
 * REMOVE if you do not need any routes
 *
 * Note: Some of these routes have passport and database model dependencies
 */
initRoutes(app);

/*
 * This is where the magic happens. We take the locals data we have already
 * fetched and seed our stores with data.
 * renderMiddleware matches the URL with react-router and renders the app into
 * HTML
 */
app.get('*', renderMiddleware);

app.listen(app.get('port'));
