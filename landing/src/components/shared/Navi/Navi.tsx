import React from "react";

import RippleDrop from "@shared/Icons/RippleDrop.svg";

export default function Navi() {
  return (
    <nav className="navbar navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <RippleDrop />
          <h2>Liquid Vote</h2>
        </a>
        <form className="d-flex">
          <button className="button_" type="submit">
            Join!
          </button>
        </form>
      </div>
    </nav>
  );
}
