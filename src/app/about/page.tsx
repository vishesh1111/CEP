import { Metadata } from 'next';
import { AnimatedAbout } from '@/components/about/animated-about';
import { AboutShaderBg } from '@/components/about/about-shader-bg';

export const metadata: Metadata = {
  title: 'About Us | CampusEvents',
  description: 'Learn why CampusEvents exists and how we\'re making campus event management simpler for students.',
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <AboutShaderBg />
      <div className="relative z-10">
        <AnimatedAbout />
      </div>
    </div>
  );
}
