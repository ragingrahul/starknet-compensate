"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Abstract background elements */}
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-100/50 rounded-full filter blur-[120px] opacity-70" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-100/60 rounded-full filter blur-[100px] opacity-60" />
        <div className="absolute top-60 left-20 w-60 h-60 bg-blue-100/40 rounded-full filter blur-[80px] opacity-40" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0V20M0 1H20' stroke='%23AF7EFF' stroke-width='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Restored container but with full-width content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Background decoration */}
            <div className="absolute inset-0 z-10">
              <Image
                src="/grid.png"
                alt="grid pattern"
                width={1200}
                height={600}
                className="w-full h-full object-cover opacity-20"
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute w-3 h-3 bg-white/30 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Content - centered with max-width */}
            <div className="relative z-20 px-4 py-20 md:py-24 text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex mb-6">
                  <div className="px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium inline-flex items-center backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
                    Get Started Today
                  </div>
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Transform How You Handle Global Payroll
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl mb-12 text-white/90 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join thousands of companies using Compensate to streamline their
                global payroll operations with blockchain technology.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-medium px-8 py-4 rounded-lg hover:bg-white/90  shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Get started for free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/claim"
                  className="inline-flex items-center justify-center border border-white/30 backdrop-blur-sm bg-white/10 text-white font-medium px-8 py-4 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Claim Payroll
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
