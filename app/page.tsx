"use client";

import Features from "@/component/home/features";
import Footer from "@/component/home/footer";
import Header from "@/component/home/header";
import Herosection from "@/component/home/herosection";
import Overview from "@/component/home/overview";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <div className="overflow-x-hidden">
        <Header />
        <Herosection />
        <Overview />
        <Features />
        <Footer />
      </div>
    </>
  );
}
