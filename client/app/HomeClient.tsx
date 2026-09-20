"use client";

import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import Herosection from "@/components/home/herosection";
import Overview from "@/components/home/overview";
import Faq from "@/components/home/faq";

export default function HomeClient() {
  return (
    <>
      <div className="overflow-x-hidden">
        <Header />
        <Herosection />
        <Overview />
        <Features />
        <Faq />
        <Footer />
      </div>
    </>
  );
}
