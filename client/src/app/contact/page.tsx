import React from 'react'
import ContactHero from './components/hero'
import ContactForm from './components/contactform'
import ContactDetails from './components/contact-details'
import StartFree from './components/start-free'

const page = () => {
  return (
    <>
    <ContactHero />
    <ContactForm />
    <ContactDetails />
    <StartFree />
    </>
  )
}

export default page