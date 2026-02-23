import { Metadata } from 'next'
import DemoForm from './DemoForm'

export const metadata: Metadata = {
  title: 'Request a Demo - VendorFlow',
  description: 'See VendorFlow in action. Schedule a personalized demo with our product experts.',
}

export default function DemoPage() {
  return <DemoForm />
}
