import React from 'react';
import { Linking } from 'react-native';
import { useAppNavigation } from '../../../navigation/hooks';
import { Screen, ScreenHeader, Text, Card, Stack, ListRow, DemoLabel, Button, Accordion } from '../../../components';
import { spacing } from '../../../theme';
import { isMockMode } from '../../../config/appConfig';
import { useSessionStore } from '../../../state/sessionStore';
import { Routes } from '../../../navigation/routes';

const FAQ: { q: string; a: string }[] = [
  { q: 'How do I reset my password?', a: 'Choose "Reset your password" above (or "Forgot password?" on the sign-in screen) and enter your campus email. We email you a secure link to set a new password.' },
  { q: 'How do I pay my fees?', a: 'Open Finance and tap "Pay Outstanding Balance". You can pay the balance shown by card; a receipt appears in your transaction history once the payment is confirmed.' },
  { q: 'How do I upload an assignment?', a: 'Go to Assignments, open the assignment, attach your file and tap Submit. Check the due date and accepted file types on the assignment before submitting.' },
  { q: 'My attendance is wrong. How do I get it corrected?', a: 'Open Attendance, select the class session and request a correction with a short explanation. Your instructor or the registrar reviews it before your record changes.' },
  { q: 'How do I request a leave of absence?', a: 'Open Leave of Absence from the Services menu, choose your dates and give a reason. The request stays pending until the registrar reviews it.' },
  { q: 'How do I contact my instructor?', a: 'Use campus mail: open Mail, tap Compose and pick your instructor from the recipient list.' },
];

export function SupportScreen() {
  const navigation = useAppNavigation();
  const user = useSessionStore(s => s.user);
  const isStudent = user?.role === 'student';
  return (
    <Screen header={<ScreenHeader title={user?.role === 'instructor' ? 'Instructor Support' : user ? 'Student Support' : 'Support'} />} testID="support-screen">
      <Stack>
        <DemoLabel text="Inferred supporting screen · synthetic contacts" />
        <Card>
          <Text variant="displaySm">We're here to help</Text>
          <Text variant="body">Reach the right team for sign-in problems, records, finance, or wellbeing.{isMockMode() ? ' Contact details below are synthetic demo values.' : ''}</Text>
        </Card>
        <Text variant="overline">Contact channels</Text>
        <Card padding={spacing.md}>
          {isMockMode() ? <ListRow icon="Mail" title="Email Student Support" subtitle="support@heritage.edu (demo)" onPress={() => Linking.openURL('mailto:support@heritage.edu?subject=Student%20support').catch(() => undefined)} /> : null}
          {isMockMode() ? <ListRow icon="Phone" title="Call the help desk" subtitle="+1 (604) 555-0100 (demo)" onPress={() => Linking.openURL('tel:+16045550100').catch(() => undefined)} /> : null}
          {user ? <ListRow icon="Sparkles" title="Ask Campus One" subtitle="Get instant answers about your record" onPress={() => navigation.navigate(Routes.AskHeritage)} testID="support-ask" /> : null}
          {user ? <ListRow icon="MessageSquare" title="Message Academic Advising" subtitle="Campus mail" onPress={() => navigation.navigate(Routes.MailCompose, isMockMode() ? { toId: 'c_advising', subject: 'Support request' } : { subject: 'Support request' })} testID="support-mail" /> : null}
          {isStudent ? <ListRow icon="ClipboardList" title="Student Services requests" subtitle="Transcripts, letters, leave and more" onPress={() => navigation.navigate(Routes.StudentServices)} testID="support-services" /> : null}
          <ListRow icon="KeyRound" title="Reset your password" subtitle={isMockMode() ? 'Mock reset request' : 'Email a recovery link'} onPress={() => navigation.navigate(Routes.ResetPassword)} testID="support-reset" />
        </Card>
        {isMockMode() ? (
          <Card padding={spacing.md} testID="support-hours">
            <Text variant="overline" style={{ marginBottom: 4 }}>Support hours (demo)</Text>
            <Text variant="body">Mon–Fri · 9:00 am – 5:00 pm</Text>
            <Text variant="caption">Campus mail and Ask Campus One are available any time.</Text>
          </Card>
        ) : null}
        <Text variant="overline">Frequently asked questions</Text>
        <Stack gap={spacing.sm}>
          {FAQ.map((f, i) => (
            <Accordion key={f.q} title={f.q} testID={`support-faq-${i}`}>
              <Text variant="body">{f.a}</Text>
            </Accordion>
          ))}
        </Stack>
        <Button title="Back" variant="outline" onPress={() => navigation.goBack()} />
      </Stack>
    </Screen>
  );
}
