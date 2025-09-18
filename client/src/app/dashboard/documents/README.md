# Documents Page

This directory contains the Documents page implementation for the RoboBooks dashboard.

## Structure

- `page.tsx` - Main entry point for the Documents page
- `components/` - Contains all the document-related components
  - `DocumentsOverview.tsx` - Hero section with main title and description
  - `DocumentTypes.tsx` - Section displaying different types of documents
  - `DocumentFeatures.tsx` - Section showcasing key features of document management

## Components

### DocumentsOverview
- Main hero section with title "Manage documents with Robo Books"
- Description about document organization and management
- Call-to-action button "Upload Documents"
- Video placeholder for document management overview

### DocumentTypes
- Displays three main document categories:
  - Invoices & Receipts
  - Contracts & Agreements
  - Certificates & Licenses
- Each type has an icon, title, and description

### DocumentFeatures
- Shows six key features of the document management system:
  - Easy Upload
  - Smart Organization
  - Quick Search
  - Secure Storage
  - Version Control
  - Team Collaboration
- Each feature has an icon, title, and description

## Navigation

The Documents page is accessible through the sidebar navigation at `/dashboard/documents` and uses the `FolderIcon` from Heroicons.

## Styling

All components use Tailwind CSS for styling and are responsive across different screen sizes. 
