import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Problem } from "../components/Problem";
import { Solution } from "../components/Solution";
import { HowItWorks } from "../components/HowItWorks";
import { Comparison } from "../components/Comparison";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";

const IndexPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Comparison />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default IndexPage;
