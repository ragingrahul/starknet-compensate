"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#" },
    { name: "Security", href: "#" },
    { name: "Team", href: "#" },
    { name: "Enterprise", href: "#" },
    { name: "Customer Stories", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Resources", href: "#" },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "Guides", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "API Status", href: "#" },
    { name: "Community", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Settings", href: "#" },
    { name: "Acceptable Use", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative pt-24 pb-12 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full filter blur-[120px] opacity-50" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-100/30 rounded-full filter blur-[100px] opacity-40" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0V20M0 1H20' stroke='%23AF7EFF' stroke-width='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Logo + Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-16 pb-16 border-b border-gray-200">
          <div className="mb-8 lg:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="logo" width={280} height={60} />
            </Link>
            <p className="text-gray-600 max-w-md">
              Revolutionizing payroll with secure crypto payments for modern
              teams worldwide.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <h3 className="text-lg font-semibold mb-4 text-center lg:text-left">
              Subscribe to our newsletter
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 w-full sm:w-80 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                      fill="#6366F1"
                    />
                  </svg>
                </div>
              </div>
              <button className="shimmer-button text-white border-[1.5px] border-purple-primary px-6 py-3 rounded-lg font-medium shadow hover:shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Company
            </h3>
            <p className="text-gray-600 mb-4">
              Our mission is to make global payroll seamless through blockchain
              technology.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Product
            </h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Legal
            </h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2024 Compensate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-gray-500 text-sm hover:text-indigo-600 transition-colors"
            >
              Status
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="#"
              className="text-gray-500 text-sm hover:text-indigo-600 transition-colors"
            >
              Sitemap
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="#"
              className="text-gray-500 text-sm hover:text-indigo-600 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
