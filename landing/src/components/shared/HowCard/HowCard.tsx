import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconLookup } from "@fortawesome/fontawesome-common-types";
// import { IconProp } from "@fortawesome/fontawesome-svg-core";

type CardProps = {
  ic: IconLookup;
  title: string;
  paragraph: string;
};

export default function HowCard({ ic, title, paragraph }: CardProps) {
  return (
    <div className="col-lg-6 feat-box">
      <FontAwesomeIcon icon={ic} size="3x" />
      <h3>{title}</h3>
      <p>{paragraph}</p>
    </div>
  );
}
