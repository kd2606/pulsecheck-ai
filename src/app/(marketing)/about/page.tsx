import React from 'react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 text-center bg-blue-50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About DiagnoVerse</h1>
            <p className="text-xl text-gray-600">Bringing accessible, AI-powered healthcare diagnostics to rural India.</p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">The Problem</h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg">
            Millions of people in rural India lack access to timely and accurate medical diagnostics. The distance to healthcare facilities and the shortage of medical professionals often lead to delayed treatments and worsened health outcomes.
          </p>
        </section>

        {/* What we're building Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto border-t border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">What We're Building</h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg">
            We are building a robust, AI-driven diagnostic platform tailored for the unique challenges of rural healthcare. Our solution aims to empower frontline health workers with reliable tools to screen, triage, and guide patients effectively in a clinical, trust-first environment.
          </p>
        </section>

        {/* Safety Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto border-t border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Safety & Compliance</h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg">
            Patient safety is our highest priority. We adhere strictly to the CDSCO Medical Device Rules and India's DPDP Act 2023 to ensure data privacy and clinical efficacy in every aspect of our platform.
          </p>
        </section>

        {/* Team Hackboard Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-gray-50 max-w-4xl mx-auto border border-gray-200 rounded-xl my-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">Team Hackboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center md:text-left">
              <h3 className="font-semibold text-xl text-gray-900">Core Team</h3>
              <p className="text-gray-600 mt-3">Dedicated to revolutionizing rural healthcare through technology.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center md:text-left">
              <h3 className="font-semibold text-xl text-gray-900">Advisors</h3>
              <p className="text-gray-600 mt-3">Guided by medical professionals and healthcare legal experts.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 text-center max-w-4xl mx-auto border-t border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Contact Us</h2>
          <p className="text-gray-700 mb-8 text-lg">
            Have questions or want to partner with us? Reach out to our team.
          </p>
          <a href="mailto:team@diagnoverse.in" className="inline-flex items-center justify-center bg-blue-600 text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200">
            team@diagnoverse.in
          </a>
        </section>
      </main>
    </div>
  );
}
