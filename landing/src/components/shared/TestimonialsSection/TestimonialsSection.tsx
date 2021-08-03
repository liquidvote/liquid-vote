import React from "react";
import Avatar from "react-avatar";

export default function TestimonialsSection() {
  return (
    <div className="testimonials-clean">
      <div className="container">
        <div className="row people">
          <div className="col-md-6 col-lg-4 item">
            <div className="box">
              <p className="description">
                Aenean tortor est, vulputate quis leo in, vehicula rhoncus
                lacus. Praesent aliquam in tellus eu gravida. Aliquam varius
                finibus est.enean tortor est, vulputate quis leo in, vehicula
                rhoncus lacus.
              </p>
            </div>
            <div className="author">
              {/* <img className="rounded-circle" src="assets/img/1.jpg" /> */}
              <div className="avatar-test">
                <Avatar
                  className="rounded-circle"
                  name="Ben Johnson"
                  size="40"
                />
              </div>
              <h5 className="name">Ben Johnson</h5>
              <p className="title">CEO of Company Inc.</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-4 item">
            <div className="box">
              <p className="description">
                Praesent aliquam in tellus eu gravida. Aliquam varius finibus
                est, et interdum justo suscipit id.
              </p>
            </div>
            <div className="author">
              <div className="avatar-test">
                <Avatar className="rounded-circle" name="Carl Kent" size="40" />
              </div>
              <h5 className="name">Carl Kent</h5>
              <p className="title">Founder of Style Co.</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-4 item">
            <div className="box">
              <p className="description">
                Aliquam varius finibus est, et interdum justo suscipit.
                Vulputate quis leo in, vehicula rhoncus lacus. Praesent aliquam
                in tellus eu.
              </p>
            </div>
            <div className="author">
              <div className="avatar-test">
                <Avatar
                  className="rounded-circle"
                  name="Emily Clark"
                  size="40"
                />
              </div>
              <h5 className="name">Emily Clark</h5>
              <p className="title">Owner of Creative Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
