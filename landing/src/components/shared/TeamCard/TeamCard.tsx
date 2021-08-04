import React from "react";

import Avatar from "react-avatar";

type CardProps = {
  name: string;
  title: string;
  paragraph: string;
};

export default function TeamCard({ name, title, paragraph }: CardProps) {
  return (
    <div className="box-team">
      <div className="author">
        <div className="avatar-test">
          <Avatar className="rounded-circle" name={name} size="40" />
        </div>
        <h5 className="name">{name}</h5>
        <p className="title">{title}</p>
      </div>
      <hr />
      <p className="description">{paragraph}</p>
    </div>
  );
}
