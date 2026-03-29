"use client";

import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import Herosection from "@/components/home/herosection";
import Overview from "@/components/home/overview";
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
