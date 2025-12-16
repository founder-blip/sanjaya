import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import Navigation from '../components/Navigation';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <Card>
            <CardContent className="p-8 prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-6">Last Updated: December 2024</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using Sanjaya's emotional support services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Services</h2>
              <p>Sanjaya provides:</p>
              <ul>
                <li>Daily emotional support sessions for children</li>
                <li>Progress tracking and reporting for parents</li>
                <li>Communication platform between parents and observers</li>
                <li>Resource library for emotional wellness</li>
                <li>Goal setting and achievement tracking</li>
                <li>Community forums for parent support</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One account per user; multiple accounts are not permitted</li>
                <li>Accounts are non-transferable</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">Account Types</h3>
              <ul>
                <li><strong>Parent/Guardian:</strong> Access child's progress, communicate with observers</li>
                <li><strong>Observer:</strong> Conduct sessions, create mood entries, set goals</li>
                <li><strong>Principal:</strong> School-wide analytics and oversight</li>
                <li><strong>Admin:</strong> Platform management and content control</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul>
                <li>Provide truthful information about your child's needs</li>
                <li>Attend scheduled sessions or notify in advance of cancellations</li>
                <li>Respect observers and other platform users</li>
                <li>Not share login credentials</li>
                <li>Not misuse the platform for unauthorized purposes</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Professional Standards</h2>
              <p>Observers agree to:</p>
              <ul>
                <li>Maintain professional conduct at all times</li>
                <li>Keep child information confidential</li>
                <li>Provide accurate progress reports</li>
                <li>Attend training sessions and maintain certifications</li>
                <li>Report any concerns about child safety immediately</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Payment and Fees</h2>
              <ul>
                <li>Service fees are determined by school agreements or individual subscriptions</li>
                <li>Payment must be made in advance for scheduled services</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>We reserve the right to change fees with 30 days notice</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Intellectual Property</h2>
              <p>All content on the Sanjaya platform, including text, graphics, logos, and software, is the property of Sanjaya and protected by intellectual property laws.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Prohibited Activities</h2>
              <p>Users must not:</p>
              <ul>
                <li>Attempt to access unauthorized areas of the platform</li>
                <li>Interfere with platform security features</li>
                <li>Upload malicious code or viruses</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Use the platform for commercial purposes without authorization</li>
                <li>Scrape or collect data without permission</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitation of Liability</h2>
              <p>Sanjaya provides emotional support services but is not a replacement for professional medical or psychological treatment. We are not liable for:</p>
              <ul>
                <li>Outcomes of emotional support sessions</li>
                <li>Actions taken based on advice or resources provided</li>
                <li>Technical issues or service interruptions</li>
                <li>Loss of data due to user error</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Emergency Situations</h2>
              <p>If a child is in immediate danger or experiencing a mental health crisis, please contact local emergency services (112 in India) or seek immediate professional help. Sanjaya is not an emergency service.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">11. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms. Users may also request account deletion at any time.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">12. Changes to Terms</h2>
              <p>We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">13. Governing Law</h2>
              <p>These terms are governed by the laws of India. Any disputes will be resolved in the courts of Mumbai, Maharashtra.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">14. Contact Information</h2>
              <p>For questions about these Terms of Service:</p>
              <ul>
                <li>Email: legal@sanjaya.com</li>
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

export default Terms;