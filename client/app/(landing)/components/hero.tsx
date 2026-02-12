"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { Check, ArrowRight } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  "Immutable, verifiable on-chain records",
  "Swift global, low-fee transfers",
  "Empower employees with data control",
];

const TRUSTED_LOGOS = [
  {
    src: "/trusted/starknet-logo-full.svg",
    alt: "Starknet Logo",
  },
  {
    src: "/trusted/tether-logo-full.svg",
    alt: "Tether Logo",
  },
  {
    src: "/trusted/wbtc-logo-black.svg",
    alt: "WBTC Logo",
  },
];

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visibility after a small delay for animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100vh] pt-32 pb-32 flex items-center justify-center overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-100/50 rounded-full filter blur-[120px] opacity-70" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-100/60 rounded-full filter blur-[100px] opacity-60" />
        <div className="absolute top-60 left-20 w-60 h-60 bg-blue-100/40 rounded-full filter blur-[80px] opacity-40" />

        {/* Grid pattern for texture */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0V20M0 1H20' stroke='%23AF7EFF' stroke-width='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 transition-all duration-1000 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {/* Decorative label */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-4 text-sm text-purple-800 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
              New Features Released
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900">
              Simplify Global Payroll Operations
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              Fast, secure, and borderless payroll solutions for modern teams,
              powered by Starknet&apos;s zero-knowledge technology.
            </p>

            <div className="space-y-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 transition-all duration-700"
                  style={{
                    transitionDelay: `${(index + 1) * 200}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/claim">
                <Button
                  name="Employee portal"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all duration-300 hover:scale-105"
                />
              </Link>
              <Link href="/dashboard">
                <Button
                  name="Employer portal"
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105"
                />
              </Link>
            </div>

            <div className="pt-8">
              <div className="flex flex-col space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  Trusted by innovative companies
                </p>
                <div className="flex flex-wrap gap-8 items-center">
                  {TRUSTED_LOGOS.map((logo, index) => (
                    <div
                      key={logo.alt}
                      className="transition-all duration-700 grayscale hover:grayscale-0 hover:scale-110"
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={80}
                        height={30}
                        loading="lazy"
                        className="h-6 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {/* Decorative elements around the image */}
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-purple-50 rounded-full opacity-70" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-50 rounded-full opacity-70" />

            {/* Main image with card-like styling */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform rotate-1 transition-transform hover:rotate-0 duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-transparent z-10" />
              <Image
                src="/frame1.png"
                alt="Compensate Dashboard"
                width={700}
                height={500}
                className="w-full h-auto"
                priority
                quality={95}
              />
            </div>

            {/* Floating feature badges */}
            <div className="absolute -bottom-10 -left-4 md:left-10 p-3 bg-white rounded-lg shadow-xl flex items-center gap-2 transform rotate-3 hover:rotate-0 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium">Secure Payments</span>
            </div>

            <div className="absolute top-10 -right-4 md:-right-8 p-3 bg-white rounded-lg shadow-xl flex items-center gap-2 transform -rotate-2 hover:rotate-0 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Real-time Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Hero);
