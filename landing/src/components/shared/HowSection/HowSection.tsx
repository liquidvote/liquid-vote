import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVoteYea } from "@fortawesome/free-solid-svg-icons";

export default function HowSection() {
  return (
    <div className="container-fluid">
      <h1>How does it work?</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure ad
        architecto tempore exercitationem quos doloremque voluptatibus dolor
        libero
      </p>

      <div className="container features">
        <div className="row">
          <div className="col-lg-6 feat-box">
            <FontAwesomeIcon icon={faVoteYea} />
            <h3>Access your files, anywhere</h3>
            <p>
              The ability to use a smartphone, tablet, or computer to access
              your account means your files follow you everywhere.
            </p>
          </div>

          <div className="col-lg-6 feat-box">
            <img
              className="icons"
              src="images/icon-security.svg"
              alt="security"
            />
            <h3>Security you can trust</h3>
            <p>
              2-factor authentication and user-controlled encryption are just a
              couple of the security features we allow to help secure your
              files.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 feat-box">
            <img
              className="icons"
              src="images/icon-collaboration.svg"
              alt="collaboration"
            />
            <h3>Real-time collaboration</h3>
            <p>
              Securely share files and folders with friends, family and
              colleagues for live collaboration. No email attachments required.
            </p>
          </div>

          <div className="col-lg-6 feat-box">
            <img
              className="icons"
              src="images/icon-any-file.svg"
              alt="icon-any-file"
            />
            <h3>Store any type of file</h3>
            <p>
              Whether you're sharing holidays photos or work documents, Fylo has
              you covered allowing for all file types to be securely stored and
              shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
