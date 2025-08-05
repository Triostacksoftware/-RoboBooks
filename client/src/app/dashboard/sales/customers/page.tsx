import type { FC } from 'react';
import CustomerHeader from './components/CustomerHeader';
import NewCustomerEmptyState from './components/NewCustomerEmptyState';
import ContactTypesSection from './components/ContactTypesSection';
import ContactFeaturesList from './components/ContactFeaturesList';


const page = () => {
  return (
    <>
      <CustomerHeader/>
      <NewCustomerEmptyState/>
      <ContactTypesSection/>
      <ContactFeaturesList/>
    </>
  );
};
export default page;