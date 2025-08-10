"use client";

import Image from "next/image";
import React from "react";

const AboutHero: React.FC = () => {
  const scrollToTeam = () => {
    console.log('Scrolling to team section...');
    const teamSection = document.getElementById('team-section');
    if (teamSection) {
      console.log('Team section found, scrolling...');
      teamSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.log('Team section not found');
    }
  };

  const scrollToMission = () => {
    console.log('Scrolling to mission section...');
    const missionSection = document.getElementById('mission');
    if (missionSection) {
      console.log('Mission section found, scrolling...');
      missionSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.log('Mission section not found');
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft floating circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-200/40 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-sky-200/20 rounded-full blur-xl animate-float-slow"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Top Badge */}
        <div className="text-center mb-8 mt-14 animate-fade-in-down">
          <span className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-sm rounded-full font-medium text-indigo-600 shadow-sm border border-indigo-100">
            <svg
              className="w-4 h-4 mr-2 text-indigo-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
            </svg>
            Our Story
          </span>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight animate-slide-up">
              <span className="text-gray-900">Empowering</span><br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                businesses with
              </span><br />
              <span className="text-gray-900">smart accounting</span>
            </h1>
            
            <p className="mt-8 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up leading-relaxed">
              Founded with a vision to simplify accounting for Indian businesses, Robo Books has been transforming how companies manage their finances since 2020.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-fade-in-up">
              <button 
                onClick={scrollToMission}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold transition duration-300 transform hover:from-indigo-600 hover:to-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Learn More
              </button>
              <button 
                onClick={scrollToTeam}
                className="border-2 border-indigo-200 text-indigo-600 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full font-semibold transition duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-105 shadow-sm"
              >
                Meet Our Team
              </button>
            </div>

            {/* Stats Preview */}
            <div className="mt-12 grid grid-cols-3 gap-6 animate-fade-in-up">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">500+</div>
                <div className="text-sm text-gray-500">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">4+</div>
                <div className="text-sm text-gray-500">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">99%</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative animate-fade-in-up">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
              <Image
                src="/images/your-illustration.png"
                alt="About Robo Books"
                width={600}
                height={400}
                className="w-full h-auto object-cover relative z-10"
              />
              
              {/* Floating elements around the image */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-indigo-200 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-200 rounded-full animate-bounce-delayed"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(-10px) rotate(240deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(-120deg);
          }
          66% {
            transform: translateY(-5px) rotate(-240deg);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1.2s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 1.2s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 1.5s ease-out forwards;
        }

        .animate-bounce-delayed {
          animation: bounce 2s infinite 0.5s;
        }
      `}</style>
    </section>
  );
};

export default AboutHero;
