'use client'

import React from 'react'
import Navbar from '../homepage/components/Navbar'
import AboutHero from './components/AboutHero'
import AboutMission from './components/AboutMission'
import AboutValues from './components/AboutValues'
import AboutTeam from './components/AboutTeam'
import AboutStats from './components/AboutStats'
import AboutTimeline from './components/AboutTimeline'
import Footer from '../homepage/components/Footer'
import { 
  SparklesIcon,
  ArrowRightIcon,
  HeartIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const AboutPage = () => {
  const scrollToTeam = () => {
    const teamSection = document.getElementById('team-section');
    if (teamSection) {
      teamSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToMission = () => {
    const missionSection = document.getElementById('mission');
    if (missionSection) {
      missionSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      <Navbar />

      {/* Clean Hero Section - Focused on Company Story */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-100/30 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100/30 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        {/* Minimal Floating Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-3 h-3 bg-blue-500/40 rounded-full animate-bounce"
          />
          <div
            className="absolute top-40 right-20 w-2 h-2 bg-purple-500/40 rounded-full animate-pulse"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            {/* Simple Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium mb-8 animate-fade-in"
            >
              <HeartIcon className="w-4 h-4" />
              <span>Our Story</span>
            </div>

            {/* Clean Heading */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in"
            >
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-green-600 bg-clip-text text-transparent">
                About RoboBooks
              </span>
            </h1>

            {/* Simple Subtitle */}
            <p
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in"
            >
              Empowering businesses with smart accounting solutions since 2020. We transform complex financial management into a delightful experience.
            </p>

            {/* Clean CTA */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
            >
              <button 
                onClick={scrollToMission}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Learn More
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button 
                onClick={scrollToTeam}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-green-500 hover:text-green-600 transition-all duration-300"
              >
                Meet Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Original About Components */}
      <AboutMission/>
      <AboutValues/>
      <AboutStats/>
      <AboutTimeline/>
      <AboutTeam/>
      <Footer/>
    </>
  )
}

export default AboutPage
