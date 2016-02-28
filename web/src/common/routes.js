import { Route } from "react-router";
import React from "react";

import App from "./components/app";

//Redux Smart
import GitStatsPage from "./components/git-stats-page";


//Redux Dumb
import HomePage from "./components/home";
import AboutPage from "./components/about";
import error404 from "./components/404";

export default (
  <Route name="app" path="/" component={App}>
      <Route path="home" component={HomePage} />
      <Route path="git-commits" component={GitStatsPage} />
      <Route path="about" component={AboutPage} />
      <Route path="*" component={error404}/>
  </Route>
);
