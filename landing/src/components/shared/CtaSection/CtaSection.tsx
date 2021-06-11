import React from "react";

export default function CtaSection() {
  return (
    <div className="cta">
      <div className="cta-container">
        <h2>Get early access today</h2>
        <p>
          It only takes a minute to sign up and our free starter tier is
          extremely generous. If you have any questions, our support team would
          be happy to help you.
        </p>

        <form action="mailto:gonndr@gmail.com" method="GET">
          <input
            className="myEmail"
            name="subject"
            type="text"
            placeholder="email@example.com"
          />
          <input className="button_" type="submit" value="Join!" />
        </form>
      </div>
    </div>
  );
}
