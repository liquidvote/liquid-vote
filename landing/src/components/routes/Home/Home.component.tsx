import React from "react";

import Title from "../../shared/Title/Title";
import HowSection from "../../shared/HowSection/HowSection";
import WhySection from "../../shared/WhySection/WhySection";
import TestimonialsSection from "../../shared/TestimonialsSection/TestimonialsSection";
import CtaSection from "../../shared/CtaSection/CtaSection";
import env from "@env";

console.log({ env });

export default function Home() {
  return (
    <>
      <Title />
      <hr />
      <HowSection />
      <hr />
      <WhySection />
      <hr />
      <TestimonialsSection />
      <hr />
      <CtaSection />

      {/* <pre>{JSON.stringify(env, null, 2)} </pre> */}
    </>
  );
}
