import React from "react";
import HowCard from "../HowCard/HowCard";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVoteYea,
  faPoll,
  faUserFriends,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";

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
          <HowCard
            ic={faVoteYea}
            title="Create group polls"
            paragraph="The ability to use a smartphone, tablet, or computer to access
              your account means your files follow you everywhere."
          />
          <HowCard
            ic={faSitemap}
            title="Delegate votes"
            paragraph="The ability to use a smartphone, tablet, or computer to access
              your account means your files follow you everywhere."
          />
          <HowCard
            ic={faUserFriends}
            title="Engage with your community"
            paragraph="The ability to use a smartphone, tablet, or computer to access
              your account means your files follow you everywhere."
          />
          <HowCard
            ic={faPoll}
            title="Decide based on liquid democracy"
            paragraph="The ability to use a smartphone, tablet, or computer to access
              your account means your files follow you everywhere."
          />
        </div>
      </div>
    </div>
  );
}
