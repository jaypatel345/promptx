import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import React from "react";
import Link from "next/link";

export default function Page() {
  return (
   <>
   <Header/>
   <div className="min-h-screen bg-white dark:bg-black pt-20">
     {/* Hero Section */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
         Simple, Transparent Pricing
       </h1>
       <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
         Choose the perfect plan for your needs. No hidden fees, cancel anytime.
       </p>
       
       {/* Toggle */}
       <div className="flex items-center justify-center gap-4 mb-12">
         <span className="text-gray-900 dark:text-white font-medium">Monthly</span>
         <button className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors">
           <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform"></span>
         </button>
         <span className="text-gray-600 dark:text-gray-400">Yearly <span className="text-green-500 text-sm">(Save 20%)</span></span>
       </div>
     </div>

     {/* Pricing Cards */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
       <div className="grid md:grid-cols-3 gap-8">
         
         {/* Free Plan */}
         <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-shadow">
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
           <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for getting started</p>
           <div className="mb-6">
             <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
             <span className="text-gray-600 dark:text-gray-400">/month</span>
           </div>
           <ul className="space-y-4 mb-8">
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               5 prompts per day
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Basic prompt templates
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Community support
             </li>
             <li className="flex items-center text-gray-400 dark:text-gray-600">
               <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
               Advanced AI models
             </li>
           </ul>
           <button className="w-full py-3 px-6 border border-gray-300 dark:border-gray-700 rounded-full text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
             Get Started
           </button>
         </div>

         {/* Pro Plan */}
         <div className="border-2 border-blue-500 rounded-2xl p-8 relative hover:shadow-xl transition-shadow bg-blue-50 dark:bg-blue-900/10">
           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
             <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">Most Popular</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
           <p className="text-gray-600 dark:text-gray-400 mb-6">For power users and professionals</p>
           <div className="mb-6">
             <span className="text-4xl font-bold text-gray-900 dark:text-white">$19</span>
             <span className="text-gray-600 dark:text-gray-400">/month</span>
           </div>
           <ul className="space-y-4 mb-8">
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Unlimited prompts
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               All prompt templates
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Advanced AI models
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Priority support
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               API access
             </li>
           </ul>
           <button className="w-full py-3 px-6 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
             Upgrade to Pro
           </button>
         </div>

         {/* Enterprise Plan */}
         <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-shadow">
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
           <p className="text-gray-600 dark:text-gray-400 mb-6">For teams and organizations</p>
           <div className="mb-6">
             <span className="text-4xl font-bold text-gray-900 dark:text-white">$49</span>
             <span className="text-gray-600 dark:text-gray-400">/user/month</span>
           </div>
           <ul className="space-y-4 mb-8">
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Everything in Pro
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Team collaboration
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Custom integrations
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Dedicated support
             </li>
             <li className="flex items-center text-gray-700 dark:text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               SLA guarantee
             </li>
           </ul>
           <button className="w-full py-3 px-6 border border-gray-300 dark:border-gray-700 rounded-full text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
             Contact Sales
           </button>
         </div>
       </div>
     </div>

     {/* FAQ Section */}
     <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
       <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
       <div className="space-y-4">
         <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
           <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change my plan later?</h3>
           <p className="text-gray-600 dark:text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
         </div>
         <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
           <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
           <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
         </div>
         <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
           <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
           <p className="text-gray-600 dark:text-gray-400">Yes, Pro and Enterprise plans come with a 14-day free trial. No credit card required.</p>
         </div>
       </div>
     </div>

     {/* CTA Section */}
     <div className="bg-gray-50 dark:bg-gray-900 py-16">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h2>
         <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Join thousands of users who are already using PromptX to supercharge their productivity.</p>
         <Link href="/Signup" className="inline-block py-3 px-8 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
           Start Free Trial
         </Link>
       </div>
     </div>
   </div>
   <Footer/>
   </>
  );
}
