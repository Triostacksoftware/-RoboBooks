import React from 'react'
import ContactHero from './components/hero'
import ContactForm from './components/contactform'
import ContactDetails from './components/contact-details'
import StartFree from './components/start-free'
import Navbar from '../homepage/components/Navbar'
import Footer from '../homepage/components/Footer'

const page = () => {
  return (
    <>
    <Navbar/>
    <ContactHero />
    <ContactForm />
    <ContactDetails />
    <StartFree />
    <Footer/>
    </>
  )
}

export default page