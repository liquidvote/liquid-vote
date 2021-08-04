import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import loadable from "@loadable/component";

import twitterIcon from "@assets/twitter.svg";
import Navi from "./components/shared/Navi/Navi";

export default function App() {
  const themeFromParams = ((q) => q.get("theme") || "3")(
    new URLSearchParams(window.location.search)
  );

  return (
    <div className={`AppContainer theme${themeFromParams}`}>
      <Router>
        <div className="row">
          <div className="col-12">
            <Navi />
            <Switch>
              <Route exact path="/">
                <Redirect to="/Home" />
              </Route>
              <Route
                path="/Home"
                component={loadable(() => import("./components/routes/Home"))}
              />
              <Route
                path="/Team"
                component={loadable(() => import("./components/routes/Team"))}
              />
            </Switch>

            <hr />

            <a
              className="btn btn-sm"
              href="https://twitter.com/intent/tweet?text=@esperancaJs+halp"
            >
              <img className="img-fluid" src={twitterIcon} />
              Any questions?
            </a>
          </div>
        </div>
      </Router>
    </div>
  );
}
