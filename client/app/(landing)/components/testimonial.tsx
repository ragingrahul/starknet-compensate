"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import securityData from "@/public/lottie/Security.json";
import supportData from "@/public/lottie/Supports Coin.json";

// Future testimonials placeholders - showing product vision instead of actual testimonials
const futureFeedback = [
  {
    quote:
      "Designed to transform how global teams handle international payments with blockchain efficiency and security.",
    author: "Pay Seamlessly",
    role: "ANTICIPATED EXPERIENCE",
    highlight: "Global Teams",
    image: "/4. Compatibility with Different Blockchains.svg",
  },
  {
    quote:
      "Built to save countless hours with automated compliance features that adapt to regulatory changes across jurisdictions.",
    author: "Compliance Without Complexity",
    role: "KEY BENEFIT",
    highlight: "30+ Jurisdictions",
    image: "/5. Encryption of Sensitive Employee Details.svg",
  },
  {
    quote:
      "Engineered to reduce payroll processing time by up to 75% with crypto payment options for remote-first companies.",
    author: "Lightning-Fast Processing",
    role: "EXPECTED OUTCOME",
    highlight: "Remote-First Teams",
    image: "/6. Support for Non-Monetary benefits.svg",
  },
];

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function TestimonialsSection() {
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

      <div className="container relative mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {/* Section badge */}
          <div className="inline-flex mb-6">
            <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
              Early Access Preview
            </div>
          </div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The Future Experience
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            While we&apos;re still in early development, here&apos;s what you
            can expect from Compensate
          </motion.p>
        </div>

        <div className="space-y-32">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Text content - always on the left */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 space-y-6">
              <div className="inline-flex mb-2">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  Coming Soon
                </span>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                {futureFeedback[0].quote}
              </p>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xl font-semibold text-gray-900">
                  {futureFeedback[0].author}
                </h4>
                <p className="text-gray-500 text-sm">
                  {futureFeedback[0].role}
                </p>
                <p className="text-indigo-600 font-medium mt-2">
                  For {futureFeedback[0].highlight}
                </p>
              </div>
            </div>

            {/* Image - always on the right */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <Image
                  src={futureFeedback[0].image || "/placeholder.svg"}
                  alt="Global payment capabilities"
                  width={626}
                  height={382}
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Background decoration */}
              <div className="absolute -z-10 top-8 -right-8 w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl" />
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Image - on the left for second item */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full h-[382px]">
                <Lottie
                  animationData={supportData}
                  loop
                  className="object-cover"
                />
              </div>
              {/* Background decoration */}
              <div className="absolute -z-10 top-8 -left-8 w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl" />
            </div>

            {/* Text content - on the right for second item */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-100 space-y-6">
              <div className="inline-flex mb-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  In Development
                </span>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                {futureFeedback[1].quote}
              </p>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xl font-semibold text-gray-900">
                  {futureFeedback[1].author}
                </h4>
                <p className="text-gray-500 text-sm">
                  {futureFeedback[1].role}
                </p>
                <p className="text-blue-600 font-medium mt-2">
                  Supporting {futureFeedback[1].highlight}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Text content - always on the left for third item */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-100 space-y-6">
              <div className="inline-flex mb-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  Building Now
                </span>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                {futureFeedback[2].quote}
              </p>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xl font-semibold text-gray-900">
                  {futureFeedback[2].author}
                </h4>
                <p className="text-gray-500 text-sm">
                  {futureFeedback[2].role}
                </p>
                <p className="text-green-600 font-medium mt-2">
                  Ideal for {futureFeedback[2].highlight}
                </p>
              </div>
            </div>

            {/* Image - always on the right for third item */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full h-[382px]">
                <Lottie
                  animationData={securityData}
                  loop
                  className="object-cover"
                />
              </div>
              {/* Background decoration */}
              <div className="absolute -z-10 top-8 -right-8 w-full h-full bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
