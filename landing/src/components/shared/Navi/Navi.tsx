import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import loadable from "@loadable/component";

import RippleDrop from "@shared/Icons/RippleDrop.svg";

export default function Navi() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <RippleDrop />
          <h2>Liquid Vote</h2>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <a className="nav-link active" aria-current="page" href="#">
              <Link to="/Home">Home</Link>
            </a>
            <a className="nav-link" href="#">
              <Link to="/Team">Team</Link>
            </a>
            <button className="button_" type="submit">
              Join!
            </button>
          </div>
        </div>

        {/* <form className="d-flex">
          <button className="button_" type="submit">
            Join!
          </button>
        </form> */}
      </div>
    </nav>
  );
}
