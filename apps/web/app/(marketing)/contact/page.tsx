import { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us - VendorFlow',
  description: 'Get in touch with the VendorFlow team. We\'re here to help with any questions.',
}

export default function ContactPage() {
  return <ContactForm />
}
