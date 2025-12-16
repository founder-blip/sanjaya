import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import Navigation from '../components/Navigation';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <Card>
            <CardContent className="p-8 prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-6">Last Updated: December 2024</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
              <p>At Sanjaya, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our emotional support services for children.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">Personal Information</h3>
              <ul>
                <li>Name, email address, and phone number of parents/guardians</li>
                <li>Child's name, age, grade, and school information</li>
                <li>Session notes and progress reports from observers</li>
                <li>Mood entries and emotional tracking data</li>
                <li>Goal setting information and progress updates</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">Usage Data</h3>
              <ul>
                <li>Login timestamps and session duration</li>
                <li>Pages viewed and features accessed</li>
                <li>Device information and browser type</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul>
                <li>Provide emotional support services to children</li>
                <li>Track progress and generate reports for parents</li>
                <li>Facilitate communication between parents and observers</li>
                <li>Improve our services and develop new features</li>
                <li>Send important updates and notifications</li>
                <li>Ensure the safety and security of our platform</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication with JWT tokens</li>
                <li>Regular security audits and updates</li>
                <li>Role-based access control</li>
                <li>Secure database with MongoDB</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul>
                <li>Assigned observers and school principals (as necessary for service delivery)</li>
                <li>Legal authorities (when required by law)</li>
                <li>Service providers who assist in platform operations (under strict confidentiality agreements)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Children's Privacy</h2>
              <p>We are committed to protecting children's privacy:</p>
              <ul>
                <li>All child data is stored securely and accessed only by authorized personnel</li>
                <li>Parent/guardian consent is required for all services</li>
                <li>Children's identifiable information is never shared publicly</li>
                <li>Parents can request deletion of child's data at any time</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Request corrections to your data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of non-essential communications</li>
                <li>Export your data in a portable format</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your experience. You can control cookie preferences in your browser settings.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <ul>
                <li>Email: privacy@sanjaya.com</li>
                <li>Phone: +91-800-SANJAYA</li>
                <li>Address: Mumbai, Maharashtra, India</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;