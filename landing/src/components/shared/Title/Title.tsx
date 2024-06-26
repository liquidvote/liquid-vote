import React from "react";

export default function Title() {
  return (
    <div className="title">
      <div className="container">
        <div className="row featurette">
          <div className="col-md-5">
            <svg
              className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
              width="500"
              height="500"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Placeholder: 500x500"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
            >
              <title>Placeholder</title>
              <rect width="100%" height="100%" fill="#eee"></rect>
              <text x="50%" y="50%" fill="#aaa" dy=".3em">
                500x500
              </text>
            </svg>
          </div>
          <div className="col-md-7">
            <h1 className="featurette-heading">
              Liquid Voting.{" "}
              <span className="text-muted">Delegate your opinion.</span>
            </h1>
            <p className="lead">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis
              ullam doloremque culpa harum! Perferendis mollitia velit excepturi
              beatae neque quae animi est reiciendis, atque, facilis quasi!
              Fugit nostrum ipsa ratione.
            </p>
            <button className="button_" type="submit">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
