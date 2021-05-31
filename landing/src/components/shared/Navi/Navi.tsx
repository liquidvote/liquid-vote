import React from "react";

export default function Navi() {
  return (
    <nav className="navbar navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img
            src="/docs/5.0/assets/brand/bootstrap-logo.svg"
            alt=""
            width="30"
            height="24"
            className="d-inline-block align-text-top"
          />
          <span>Liquid Vote</span>
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
