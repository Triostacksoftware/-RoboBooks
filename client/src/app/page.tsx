import React from 'react'
import Navbar from './homepage/components/Navbar'
import Hero from './homepage/components/Home'
import AboutSection from './homepage/components/AboutSection'
import FeaturesSection from './homepage/components/FeaturesSection'
import BusinessBenefits from './homepage/components/BusinessBenefits'
import AboutSplit from './homepage/components/AboutSplit'
import TeamManagement from './homepage/components/TeamManagement'

const page = () => {
  return (
    <>
    <Navbar/>
    <Hero/>
    <AboutSection/>
    <FeaturesSection/>
    <BusinessBenefits/>
    <AboutSplit/>
    <TeamManagement/>
    </>
  )
}
export default page