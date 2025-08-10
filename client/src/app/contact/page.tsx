import React from 'react'
import Navbar from '../homepage/components/Navbar'
import Footer from '../homepage/components/Footer'
import Hero from './components/hero'
import ContactForm from './components/contactform'
import ContactDetails from './components/contact-details'
import StartFree from './components/start-free'

const ContactPage = () => {
  return (
    <>
      <Navbar/>
      <div className="pt-16">
        <Hero />
        <ContactForm />
        <ContactDetails 
          hqTitle="Robo Books HQ"
          addressLines={[
            "123 Business Park, Tech Hub",
            "Mumbai, Maharashtra 400001"
          ]}
          phones={[
            { label: "Mobile", number: "+91 98765 43210" },
            { label: "Support", number: "+91 1800 1102" }
          ]}
          emails={[
            { label: "Info", address: "hello@robobooks.com" },
            { label: "Support", address: "support@robobooks.com" }
          ]}
          showMap={true}
          placeQuery="Robo Books HQ Mumbai"
          whatsAppNumber="+91 98765 43210"
        />
        <StartFree 
          eyebrow="Launch faster • Grow smarter"
          title="Start building with Robo Books"
          ctaHref="/register"
          ctaText="Get Started for Free"
          secondaryHref="/pricing"
          secondaryText="See pricing"
        />
      </div>
      <Footer/>
    </>
  )
}

export default ContactPage