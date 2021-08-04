import React from "react";

import TeamCard from "@shared/TeamCard/TeamCard";

export default function TeamSection() {
  return (
    <div className="testimonials-clean">
      <div className="container">
        <div className="row people">
          <div className="col-md-6 col-lg-4 item">
            <TeamCard
              name="Ben Johnson"
              title="CEO of Company Inc"
              paragraph="Aenean tortor est, vulputate quis leo in, vehicula rhoncus
              lacus. Praesent aliquam in tellus eu gravida. Aliquam varius
              finibus est.enean tortor est, vulputate quis leo in, vehicula
              rhoncus lacus."
            />
          </div>
          <div className="col-md-6 col-lg-4 item">
            <TeamCard
              name="Carl Kent"
              title="Founder of Stuff Inc."
              paragraph="Praesent aliquam in tellus eu gravida. Aliquam varius finibus
              est, et interdum justo suscipit id."
            />
          </div>
          <div className="col-md-6 col-lg-4 item">
            <TeamCard
              name="Emily Clark"
              title="Owner of Creative Ltd."
              paragraph="Aliquam varius finibus est, et interdum justo suscipit.
              Vulputate quis leo in, vehicula rhoncus lacus. Praesent aliquam
              in tellus eu."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
