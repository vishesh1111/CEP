import { Metadata } from 'next';
import { AnimatedAbout } from '@/components/about/animated-about';

export const metadata: Metadata = {
  title: 'About Us | CampusEvents',
  description: 'Learn why CampusEvents exists and how we\'re making campus event management simpler for students.',
};

export default function AboutPage() {
  return <AnimatedAbout />;
}
