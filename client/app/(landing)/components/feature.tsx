"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import smartContract from "@/public/lottie/Smart Contract.json";
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { GlobeDemo } from "@/components/globe-demo";
import { motion, useScroll, useTransform } from "framer-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Icons = {
  bitcoin: "/icons/wrapped-bitcoin-wbtc-icon.svg",
  starknet: "/icons/starknet-strk-logo.svg",
  ethereum: "/icons/ethereum-eth-logo.svg",
  solana: "/icons/solana-sol-logo.svg",
  tether: "/icons/tether-usdt-logo.svg",
  usdc: "/icons/usd-coin-usdc-logo.svg",
};

export function FeaturesSection() {
  const { scrollY } = useScroll();
  const [isClient, setIsClient] = useState(false);

  const fontSize = useTransform(
    scrollY,
    [0, 200, 400, 600],
    ["5.2rem", "4.5rem", "3.8rem", "3rem"],
  );

  const headerOpacity = useTransform(
    scrollY,
    [0, 200, 400, 600],
    [1, 1, 0.95, 0.9],
  );

  // More gradual scale transition for smoothness
  const headerScale = useTransform(
    scrollY,
    [0, 200, 400, 600],
    [1.1, 1.08, 1.04, 1],
  );

  // For the header container to create a sticky effect
  const headerY = useTransform(scrollY, [0, 200], [0, -40]);

  // Handle client-side rendering only
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container relative mx-auto px-4 z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center mb-16 overflow-hidden"
          style={{
            scale: isClient ? headerScale : 1,
            opacity: isClient ? headerOpacity : 1,
            y: isClient ? headerY : 0,
          }}
        >
          {/* Section badge */}
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Enterprise Solutions
            </div>
          </div>

          <motion.h2
            className="font-bold mb-6 text-center transition-all duration-200 ease-out bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            style={{
              fontSize: isClient ? fontSize : "3rem",
              lineHeight: "1.1",
              maxWidth: "100%",
            }}
          >
            Streamline into the <br /> Global Payroll Operations
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Manage your entire payroll process from a single dashboard, designed
            for modern businesses operating globally.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mx-auto w-full">
          <div className="relative h-full bg-purple-img-dark min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Blockchain Powered
              </div>
            </div>
            <div className="w-full h-full relative">
              <h2 className="absolute top-4 left-4 max-w-56 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-black z-10">
                Smart Contract Automation
              </h2>
              <p className="absolute bottom-4 left-4 mt-4 text-left text-base/6 text-white z-10">
                Automate payroll transactions with Starknet smart contracts for
                unmatched security and zero-knowledge transparency.
              </p>
            </div>
            <Lottie
              animationData={smartContract}
              loop
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="relative h-full bg-img-light min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Real-time Data
              </div>
            </div>
            <div className="w-full h-full relative">
              <h2 className="absolute max-w-56 top-4 left-4 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-black z-10">
                Comprehensive Payroll Analytics
              </h2>
              <p className="absolute bottom-4 left-4 mt-4 text-left text-base/6 text-black z-10">
                Harness deep insights with real-time metrics for data-driven
                payroll decisions.
              </p>
            </div>
            <Image
              src="/2. Employer and Employee Management - Copy.svg"
              alt="linear demo image"
              fill
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="relative h-full bg-img-light min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                Multi-Currency
              </div>
            </div>
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg border bg-purple-img-light">
              <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-purple-img-light bg-clip-text text-center text-7xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
                Compensate
              </span>

              <OrbitingCircles iconSize={40}>
                <Image
                  src={Icons.starknet}
                  width={40}
                  height={40}
                  alt="Starknet"
                />
                <Image src={Icons.tether} width={40} height={40} alt="Tether" />
                <Image src={Icons.usdc} width={40} height={40} alt="USDC" />
                <Image
                  src={Icons.starknet}
                  width={40}
                  height={40}
                  alt="Starknet"
                />
                <Image
                  src={Icons.bitcoin}
                  width={40}
                  height={40}
                  alt="Bitcoin"
                />
              </OrbitingCircles>
              <OrbitingCircles iconSize={30} radius={100} reverse speed={2}>
                <Image
                  src={Icons.bitcoin}
                  width={30}
                  height={30}
                  alt="Bitcoin"
                />
                <Image
                  src={Icons.starknet}
                  width={30}
                  height={30}
                  alt="Starknet"
                />
                <Image src={Icons.tether} width={30} height={30} alt="USDT" />
                <Image src={Icons.usdc} width={30} height={30} alt="USDC" />
              </OrbitingCircles>
            </div>
          </div>
          {/* Important! Keep the globe contained within the card boundaries */}
          <div className="relative h-full bg-purple-img-light min-h-[500px] lg:min-h-[600px] rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2">
            <div className="absolute top-4 right-4 z-50">
              <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Global Coverage
              </div>
            </div>
            {/* Main container with text */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4">
              <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-black">
                Harness deep insights with real-time metrics for data-driven
                payroll decisions.
              </h2>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
              <p className="max-w-[26rem] text-left text-base/6 font-medium text-black">
                Effortlessly process international salary payments with
                Starknet&apos;s speed and ZK-proven security.
              </p>
            </div>

            {/* Globe Container with explicit styling to ensure visibility */}
            <div
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
                zIndex: 20,
                position: "absolute",
                overflow: "hidden", // Added to prevent overflow
              }}
            >
              {/* Direct inline GlobeDemo with 100% height/width */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 25,
                }}
              >
                <GlobeDemo />
              </div>
            </div>
          </div>

          <div className="relative h-full bg-img-light min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                Enterprise Ready
              </div>
            </div>
            <div className="w-full h-full relative">
              <h2 className="absolute max-w-56 top-4 left-4 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-black z-10">
                Employer & Employee Management
              </h2>
              <p className="absolute bottom-4 left-4 mt-4 text-left text-base/6 text-white z-10">
                Empower employers and employees through secure, integrated
                management solutions.
              </p>
            </div>
            <Image
              src="/3. Transaction History and Receipts Mirror.svg"
              alt="linear demo image"
              fill
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
