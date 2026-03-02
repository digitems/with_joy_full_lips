import { Box, Typography, Link } from '@mui/material';
import SEOHead from '../components/common/SEOHead';

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 }, pb: 8 }}>
      <SEOHead
        title="Privacy Policy"
        description="Privacy Policy for With Joyful Lips — learn how we collect, use, and protect your data."
        canonicalPath="/privacy"
      />

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Effective date: March 2, 2026
      </Typography>

      <Typography variant="body1" paragraph>
        With Joyful Lips ("we", "our", or "the app") is a hymn music streaming application
        developed by AnointTech. This Privacy Policy explains how we collect, use, and protect
        your information when you use our service.
      </Typography>

      <Section title="1. Information We Collect">
        <Typography variant="body1" paragraph>
          <strong>Account Information</strong> — When you create an account, we collect your name,
          email address, and profile picture. If you sign in with Google, we receive your basic
          profile information from your Google account. If you sign in with your phone number,
          we collect and verify your phone number via Firebase Authentication.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Usage Data</strong> — We collect information about how you interact with the app,
          including songs played, playback history, favorites, and ratings. This helps us
          personalize your experience.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Device Information</strong> — We may collect basic device information such as
          device type, operating system, and browser type for analytics and to improve app
          compatibility.
        </Typography>
      </Section>

      <Section title="2. Local Storage & IndexedDB">
        <Typography variant="body1" paragraph>
          The app stores certain data locally on your device to provide a seamless experience:
        </Typography>
        <Typography component="div" variant="body1" paragraph>
          <ul style={{ margin: 0, paddingLeft: 24 }}>
            <li>Authentication tokens (for keeping you signed in)</li>
            <li>Theme preferences (dark/light mode)</li>
            <li>Playlists you create (stored in IndexedDB)</li>
            <li>Splash screen and consent preferences</li>
          </ul>
        </Typography>
        <Typography variant="body1" paragraph>
          This data remains on your device and is not transmitted to our servers unless
          required for app functionality (e.g., syncing playlists).
        </Typography>
      </Section>

      <Section title="3. How We Use Your Information">
        <Typography component="div" variant="body1" paragraph>
          We use the information we collect to:
          <ul style={{ margin: '8px 0 0', paddingLeft: 24 }}>
            <li>Provide and maintain the music streaming service</li>
            <li>Personalize your experience (recommendations, playback history)</li>
            <li>Manage your account and authentication</li>
            <li>Improve app performance and fix issues</li>
            <li>Display relevant advertisements</li>
          </ul>
        </Typography>
      </Section>

      <Section title="4. Third-Party Services">
        <Typography variant="body1" paragraph>
          We use the following third-party services, each governed by their own privacy policies:
        </Typography>
        <Typography component="div" variant="body1" paragraph>
          <ul style={{ margin: 0, paddingLeft: 24 }}>
            <li>
              <strong>Firebase (Google)</strong> — Authentication (email/password, Google Sign-In,
              phone OTP) and analytics.{' '}
              <Link href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">
                Firebase Privacy Policy
              </Link>
            </li>
            <li>
              <strong>Google AdSense</strong> — To serve advertisements within the app.{' '}
              <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener">
                Google Privacy Policy
              </Link>
            </li>
          </ul>
        </Typography>
      </Section>

      <Section title="5. Data Sharing">
        <Typography variant="body1" paragraph>
          We do not sell your personal information. We may share data only in the following cases:
        </Typography>
        <Typography component="div" variant="body1" paragraph>
          <ul style={{ margin: 0, paddingLeft: 24 }}>
            <li>With third-party service providers listed above, as necessary to operate the app</li>
            <li>When required by law or to protect our legal rights</li>
            <li>With your explicit consent</li>
          </ul>
        </Typography>
      </Section>

      <Section title="6. Data Retention & Deletion">
        <Typography variant="body1" paragraph>
          We retain your account data for as long as your account is active. You may request
          deletion of your account and associated data at any time by contacting us. Upon
          account deletion, we will remove your personal data from our servers within 30 days.
        </Typography>
        <Typography variant="body1" paragraph>
          Locally stored data (playlists, preferences) can be cleared by uninstalling the app
          or clearing your browser data.
        </Typography>
      </Section>

      <Section title="7. Children's Privacy">
        <Typography variant="body1" paragraph>
          Our service is not directed to children under the age of 13. We do not knowingly
          collect personal information from children. If you believe a child has provided us
          with personal data, please contact us and we will take steps to delete it.
        </Typography>
      </Section>

      <Section title="8. Changes to This Policy">
        <Typography variant="body1" paragraph>
          We may update this Privacy Policy from time to time. We will notify you of any
          changes by posting the new policy on this page and updating the effective date.
        </Typography>
      </Section>

      <Section title="9. Contact Us">
        <Typography variant="body1" paragraph>
          If you have questions about this Privacy Policy or wish to request data deletion,
          please contact us at:{' '}
          <Link href="mailto:anointtech@gmail.com">anointtech@gmail.com</Link>
        </Typography>
      </Section>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
