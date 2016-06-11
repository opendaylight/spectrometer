import { IndexRedirect, Route } from 'react-router';
import React from "react";

import App from "./components/app";

import error404 from "./components/404";

export default (
  <Route name="app" path="/" component={App}>
    <Route path="*" component={error404}/>
  </Route>
);
