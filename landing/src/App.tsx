import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import loadable from "@loadable/component";

import twitterIcon from "@assets/twitter.svg";
import Navi from "./components/shared/Navi/Navi";
import Title from "./components/shared/Title/Title";

export default function App() {
  const themeFromParams = ((q) => q.get("theme") || "3")(
    new URLSearchParams(window.location.search)
  );

  return (
    <div className={`AppContainer theme${themeFromParams}`}>
      <div className="row">
        <div className="col-12">
          <Navi />
          <Title />
          <hr />
          <Router>
            <nav>
              <ul>
                <li>
                  <Link to="/Page1">Page1 - Env</Link>
                </li>
                <li>
                  <Link to="/Page2">Page2 - Counter</Link>
                </li>
              </ul>
            </nav>

            <Switch>
              <Route
                path="/Page1"
                component={loadable(() => import("./components/Routes/Page1"))}
              />
              <Route
                path="/Page2"
                component={loadable(() => import("./components/Routes/Page2"))}
              />
            </Switch>
          </Router>

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
    </div>
  );
}
