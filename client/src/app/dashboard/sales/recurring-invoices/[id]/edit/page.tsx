import React from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";

const page = () => {
  return <div></div>;
};

// Wrapped with access guard
const pageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <page />
  </ModuleAccessGuard>
);

export default pageWithGuard;
