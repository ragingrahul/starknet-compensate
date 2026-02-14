"use client";

import Button from "@/components/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

// Core payroll ecosystem capabilities and features
const PAYROLL_FEATURES = [
  {
    name: "Multi-Tokens",
    icon: "/icons/features/currency.svg",
    category: "payments",
    color: "#8B5CF6", // Purple
    description: "Support for STRK, WBTC, USDT, USDC, and many more",
  },
  {
    name: "Global Payments",
    icon: "/icons/features/globe.svg",
    category: "payments",
    color: "#3B82F6", // Blue
    description: "Borderless transfers to 150+ countries without fees",
  },
  {
    name: "Smart Contracts",
    icon: "/icons/features/contract.svg",
    category: "technology",
    color: "#10B981", // Green
    description:
      "Starknet-powered execution with ZK-proven privacy and security",
  },
  {
    name: "Tax Compliance",
    icon: "/icons/features/tax.svg",
    category: "compliance",
    color: "#F59E0B", // Amber
    description: "Automated calculations for 30+ jurisdictions",
  },
  {
    name: "Employee Dashboard",
    icon: "/icons/features/dashboard.svg",
    category: "experience",
    color: "#EC4899", // Pink
    description: "Intuitive controls for payment preferences",
  },
  {
    name: "Instant Payments",
    icon: "/icons/features/speed.svg",
    category: "payments",
    color: "#EF4444", // Red
    description: "No more waiting for traditional banking hours",
  },
  {
    name: "Payroll Analytics",
    icon: "/icons/features/analytics.svg",
    category: "insights",
    color: "#6366F1", // Indigo
    description: "Real-time metrics and customizable reports",
  },

  {
    name: "Audit Trails",
    icon: "/icons/features/audit.svg",
    category: "compliance",
    color: "#F97316", // Orange
    description: "Immutable record of all transactions",
  },
  {
    name: "Multi-signature Auth",
    icon: "/icons/features/auth.svg",
    category: "security",
    color: "#14B8A6", // Teal
    description: "Enterprise-grade approval workflows",
  },
  {
    name: "Role-based Access",
    icon: "/icons/features/roles.svg",
    category: "security",
    color: "#6366F1", // Indigo
    description: "Granular permissions for teams of any size",
  },
];

// Cryptocurrency options supported
const CRYPTOCURRENCIES = [
  {
    symbol: "WBTC",
    name: "Bitcoin",
    icon: "/icons/wrapped-bitcoin-wbtc-icon.svg",
  },
  { symbol: "DAI", name: "DAI", icon: "/icons/dai-dai-logo.svg" },
  {
    symbol: "wstETH",
    name: "Lido Staked ETH",
    icon: "/icons/lido-wsteth-logo.svg",
  },
  { symbol: "USDC", name: "USD Coin", icon: "/icons/usd-coin-usdc-logo.svg" },
  { symbol: "USDT", name: "Tether", icon: "/icons/tether-usdt-logo.svg" },
  { symbol: "STRK", name: "Starknet", icon: "/icons/starknet-strk-logo.svg" },
];

// Ecosystem visualization component
const PayrollEcosystemVisualizer = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<number>(0);
  const [paymentAnimation, setPaymentAnimation] = useState<boolean>(false);

  // Cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(Math.floor(Math.random() * PAYROLL_FEATURES.length));

      setTimeout(() => {
        setActiveFeature(null);
      }, 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Cycle through cryptocurrencies
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCurrency((prev) => (prev + 1) % CRYPTOCURRENCIES.length);

      // Trigger payment animation
      setPaymentAnimation(true);
      setTimeout(() => {
        setPaymentAnimation(false);
      }, 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Features organized by category for the visualization
  const featuresByCategory = {
    payments: PAYROLL_FEATURES.filter((f) => f.category === "payments"),
    security: PAYROLL_FEATURES.filter((f) => f.category === "security"),
    compliance: PAYROLL_FEATURES.filter((f) => f.category === "compliance"),
    technology: PAYROLL_FEATURES.filter((f) => f.category === "technology"),
    automation: PAYROLL_FEATURES.filter((f) => f.category === "automation"),
    experience: PAYROLL_FEATURES.filter((f) => f.category === "experience"),
    insights: PAYROLL_FEATURES.filter((f) => f.category === "insights"),
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central dashboard display */}
      <motion.div
        className="relative z-30 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        initial={{ width: 260, height: 400 }}
        animate={{
          width: 280,
          height: 420,
          boxShadow: paymentAnimation
            ? "0 0 60px rgba(139, 92, 246, 0.3)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        {/* Dashboard header */}
        <div className="h-12 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center px-4">
          <div className="text-white font-medium text-sm">
            Compensate Dashboard
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 h-full flex flex-col">
          <div className="text-xl font-bold text-gray-800 mb-2">
            Payroll Summary
          </div>

          {/* Active cryptocurrency display */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center">
            <div className="w-10 h-10 relative mr-3">
              <Image
                src={CRYPTOCURRENCIES[activeCurrency].icon}
                alt={CRYPTOCURRENCIES[activeCurrency].name}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500">Selected Token</div>
              <div className="font-semibold">
                {CRYPTOCURRENCIES[activeCurrency].name} (
                {CRYPTOCURRENCIES[activeCurrency].symbol})
              </div>
            </div>
          </div>

          {/* Payment animation indicator */}
          <motion.div
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-100"
            animate={{
              opacity: paymentAnimation ? 1 : 0,
              y: paymentAnimation ? 0 : 10,
            }}
          >
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-green-800">
                Payment Processed
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1">
              7,500 USDC sent to 12 employees • Complete
            </div>
          </motion.div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600">Employees</div>
              <div className="text-xl font-bold text-blue-900">127</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-xs text-purple-600">Next Payout</div>
              <div className="text-xl font-bold text-purple-900">2d 14h</div>
            </div>
          </div>

          {/* Feature highlight */}
          {activeFeature !== null && (
            <motion.div
              className="mt-auto bg-indigo-50 rounded-lg p-3 border border-indigo-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="text-xs font-medium text-indigo-800">
                FEATURED
              </div>
              <div className="text-sm font-semibold text-indigo-900">
                {PAYROLL_FEATURES[activeFeature].name}
              </div>
              <div className="text-xs text-indigo-700 mt-1">
                {PAYROLL_FEATURES[activeFeature].description}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Feature nodes by category */}
      <div className="absolute inset-0 z-10">
        {/* Position feature categories in different areas */}
        <div className="absolute top-0 left-1/4 transform -translate-x-1/2">
          <FeatureGroup
            title="Security"
            features={featuresByCategory.security}
            activeFeature={activeFeature}
            color="blue"
          />
        </div>

        <div className="absolute top-0 right-1/4 transform translate-x-1/2">
          <FeatureGroup
            title="Compliance"
            features={featuresByCategory.compliance}
            activeFeature={activeFeature}
            color="amber"
          />
        </div>

        <div className="absolute bottom-0 left-1/4 transform -translate-x-1/2">
          <FeatureGroup
            title="Payments"
            features={featuresByCategory.payments}
            activeFeature={activeFeature}
            color="purple"
          />
        </div>

        <div className="absolute bottom-0 right-1/4 transform translate-x-1/2">
          <FeatureGroup
            title="Analytics"
            features={featuresByCategory.insights.concat(
              featuresByCategory.automation,
            )}
            activeFeature={activeFeature}
            color="emerald"
          />
        </div>
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
        {/* Connection lines would be drawn here to connect dashboard to feature groups */}
        <line
          x1="50%"
          y1="50%"
          x2="25%"
          y2="10%"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1="50%"
          y1="50%"
          x2="75%"
          y2="10%"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1="50%"
          y1="50%"
          x2="25%"
          y2="90%"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1="50%"
          y1="50%"
          x2="75%"
          y2="90%"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Payment animation particles */}
      {paymentAnimation && (
        <>
          <PaymentParticle direction="topLeft" delay={0} />
          <PaymentParticle direction="topRight" delay={0.1} />
          <PaymentParticle direction="bottomLeft" delay={0.2} />
          <PaymentParticle direction="bottomRight" delay={0.3} />
        </>
      )}
    </div>
  );
};

// Feature group component
const FeatureGroup = ({
  title,
  features,
  activeFeature,
  color,
}: {
  title: string;
  features: typeof PAYROLL_FEATURES;
  activeFeature: number | null;
  color: "purple" | "blue" | "amber" | "emerald";
}) => {
  const bgColor =
    color === "purple"
      ? "bg-purple-50"
      : color === "blue"
        ? "bg-blue-50"
        : color === "amber"
          ? "bg-amber-50"
          : "bg-emerald-50";

  const textColor =
    color === "purple"
      ? "text-purple-800"
      : color === "blue"
        ? "text-blue-800"
        : color === "amber"
          ? "text-amber-800"
          : "text-emerald-800";

  const borderColor =
    color === "purple"
      ? "border-purple-100"
      : color === "blue"
        ? "border-blue-100"
        : color === "amber"
          ? "border-amber-100"
          : "border-emerald-100";

  return (
    <div
      className={`${bgColor} rounded-lg p-3 border ${borderColor} shadow-sm max-w-[180px]`}
    >
      <div className={`text-xs font-bold ${textColor} mb-2`}>
        {title.toUpperCase()}
      </div>
      <div className="space-y-2">
        {features.map((feature) => {
          const isActive =
            PAYROLL_FEATURES.findIndex((f) => f.name === feature.name) ===
            activeFeature;

          return (
            <motion.div
              key={feature.name}
              className={`flex items-center ${
                isActive ? "bg-white/80 shadow-sm" : "bg-transparent"
              } rounded-md p-1.5 transition-all`}
              animate={{
                scale: isActive ? 1.05 : 1,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mr-2`}
                style={{
                  backgroundColor: isActive ? feature.color : "transparent",
                }}
              >
                <div className="relative w-4 h-4">
                  <Image
                    src={feature.icon || "/placeholder.svg"}
                    alt={feature.name}
                    fill
                    className={`object-contain ${
                      isActive ? "filter-white" : ""
                    }`}
                    style={{ filter: isActive ? "brightness(10)" : "none" }}
                  />
                </div>
              </div>
              <div className="text-xs font-medium text-gray-700">
                {feature.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Payment animation particle
const PaymentParticle = ({
  direction,
  delay,
}: {
  direction: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  delay: number;
}) => {
  // Calculate start and end positions based on direction
  let startX, startY, endX, endY;
  switch (direction) {
    case "topLeft":
      startX = "50%";
      startY = "50%";
      endX = "25%";
      endY = "10%";
      break;
    case "topRight":
      startX = "50%";
      startY = "50%";
      endX = "75%";
      endY = "10%";
      break;
    case "bottomLeft":
      startX = "50%";
      startY = "50%";
      endX = "25%";
      endY = "90%";
      break;
    case "bottomRight":
      startX = "50%";
      startY = "50%";
      endX = "75%";
      endY = "90%";
      break;
    default:
      startX = "50%";
      startY = "50%";
      endX = "50%";
      endY = "0%";
  }

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-purple-500 z-40"
      style={{
        left: startX,
        top: startY,
        marginLeft: "-4px",
        marginTop: "-4px",
      }}
      animate={{
        left: [startX, endX],
        top: [startY, endY],
        opacity: [1, 0],
        scale: [1, 0.5],
      }}
      transition={{
        duration: 1,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
};

export function IntegrationsSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Features" },
    { id: "payments", name: "Payments" },
    { id: "security", name: "Security" },
    { id: "compliance", name: "Compliance" },
    { id: "technology", name: "Technology" },
  ];

  const filteredFeatures =
    selectedCategory === "all"
      ? PAYROLL_FEATURES
      : PAYROLL_FEATURES.filter((f) => f.category === selectedCategory);

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

        {/* Blockchain-inspired background */}
        <svg
          className="absolute inset-0 w-full h-full z-0 opacity-5"
          viewBox="0 0 1200 800"
        >
          {/* Hexagonal pattern suggesting blockchain */}
          <path
            d="M100,100 L200,50 L300,100 L300,200 L200,250 L100,200 Z"
            stroke="#6366F1"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M300,300 L400,250 L500,300 L500,400 L400,450 L300,400 Z"
            stroke="#8B5CF6"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M700,200 L800,150 L900,200 L900,300 L800,350 L700,300 Z"
            stroke="#EC4899"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M600,500 L700,450 L800,500 L800,600 L700,650 L600,600 Z"
            stroke="#10B981"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M300,600 L400,550 L500,600 L500,700 L400,750 L300,700 Z"
            stroke="#F59E0B"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M900,500 L1000,450 L1100,500 L1100,600 L1000,650 L900,600 Z"
            stroke="#3B82F6"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-16">
          {/* Left column - Text content */}
          <div className="w-full md:w-1/2 space-y-8">
            {/* Section badge */}
            <div className="inline-flex mb-4">
              <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium inline-flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                Complete Payroll Ecosystem
              </div>
            </div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Everything You Need for On-Chain Payroll
            </motion.h2>

            <motion.p
              className="text-xl text-gray-600 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Compensate is a complete, standalone payroll solution built on
              Starknet. Leverage zero-knowledge proofs for every aspect of your
              global payroll operations from a single powerful platform.
            </motion.p>

            {/* Feature category filter */}
            <div className="flex flex-wrap gap-2 pt-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${
                      selectedCategory === category.id
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Feature grid */}
            <div className="mt-10">
              <p className="text-sm font-medium text-gray-500 mb-4">
                KEY FEATURES
              </p>
              <div className="grid grid-cols-2 gap-4">
                {filteredFeatures.slice(0, 6).map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${feature.color}15` }} // 15% opacity
                    >
                      <div className="relative w-5 h-5">
                        <Image
                          src={feature.icon || "/placeholder.svg"}
                          alt={feature.name}
                          fill
                          className="object-contain"
                          style={{
                            filter: `drop-shadow(0 0 1px ${feature.color})`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {feature.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {feature.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button name="Explore All Features" size="lg" />
            </motion.div>
          </div>

          {/* Right column - Interactive payroll ecosystem visualization */}
          <div className="w-full md:w-1/2 h-[40rem] flex mt-10 md:mt-0 justify-center items-center">
            <motion.div
              className="w-full h-full max-w-lg flex items-center justify-center relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <PayrollEcosystemVisualizer />
            </motion.div>
          </div>
        </div>

        {/* Supported cryptocurrencies section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Supported Cryptocurrencies
            </h3>
            <p className="text-gray-600">
              Pay your team natively on Starknet in their preferred currency
            </p>
          </motion.div>

          <div className="flex justify-center">
            {/* Only display Starknet */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center hover:shadow-md transition-all max-w-xs"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 relative mb-4">
                <Image
                  src={CRYPTOCURRENCIES[5].icon}
                  alt={CRYPTOCURRENCIES[5].name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {CRYPTOCURRENCIES[5].symbol}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {CRYPTOCURRENCIES[5].name}
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                Featured Currency
              </span>
            </motion.div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            More cryptocurrencies coming soon
          </div>
        </div>
      </div>
    </section>
  );
}
