import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, Icon, Select, InfoBanner, LoadingState, DemoLabel } from '../../components';
import { colors, spacing } from '../../theme';
import { isMockMode } from '../../config/appConfig';
import type { RootScreenProps } from '../../navigation/types';
import { useSettings, useUpdateSettings } from '../auth/useAuth';
import { TIME_ZONES, tzLabel, tzAbbr, tzOffsetMinutes } from '../../utils/timezone';
import { formatTime, formatLongWeekdayDate, formatDateTime } from '../../utils/format';
import { useClockTick } from './hooks';
import { useSessionStore } from '../../state/sessionStore';
import { toast } from '../../state/uiStore';
import { errorMessage } from '../../services/errors';
import { Routes } from '../../navigation/routes';

/** Shared time-zone screen (student + instructor). IANA zones; offsets computed per instant. */
export function TimeZoneScreen({ navigation }: RootScreenProps<'TimeZone'>) {
  const settings = useSettings();
  const update = useUpdateSettings();
  const role = useSessionStore(s => s.user?.role);
  const now = useClockTick(1000);
  const [pending, setPending] = useState<string | null>(null);
  const current = settings.data?.timeZone ?? 'America/Vancouver';
  const target = pending ?? current;
  const d = new Date(now);
  const shift = tzOffsetMinutes(target, d) - tzOffsetMinutes(current, d);
  // A fixed academic deadline instant – shown in both zones to prove the instant never changes.
  const sampleDeadline = isMockMode() ? '2026-10-03T05:29:00-07:00' : d.toISOString();
  const save = async () => {
    try {
      await update.mutateAsync({ timeZone: target });
      toast('Time zone saved', 'success');
      setPending(null);
    } catch (e) { toast(errorMessage(e), 'error'); }
  };
  return (
    <Screen testID="timezone-screen" header={<ScreenHeader backLabel="Back" actions={role === 'student' ? [{ label: 'Help', accessibilityLabel: 'Help', onPress: () => navigation.navigate(Routes.StudentSupport) }] : []} />} footer={<Stack gap={4}><Button title="Save Time Zone" icon={<Icon name="Check" size={16} color={colors.white} />} onPress={save} loading={update.isPending} disabled={target === current} disabledReason="Select a different time zone to save" testID="tz-save" /><Text variant="caption" align="center">Changes take effect immediately across all course modules.</Text></Stack>}>
      {settings.isLoading ? <LoadingState /> : (
        <Stack>
          <Text variant="displayLg">Change Your Time Zone</Text>
          <Text variant="body">Choose the time zone you want to use throughout your learning experience and activity schedules.</Text>
          <InfoBanner tone="green" icon="CalendarSync" title="Academic Schedule Sync" text="Deadlines, exam cut-offs and lecture unlock events are stored as absolute instants and only displayed in your zone — the underlying deadline never moves." />
          <Card>
            <Row gap={6}><Icon name="Clock" size={16} color={colors.coral600} /><Text variant="overline" color={colors.green900}>Current system settings</Text></Row>
            <Text variant="overline" style={{ marginTop: spacing.md }}>Current time</Text>
            <Row gap={8}><Text variant="displayMd" style={{ fontFamily: 'Inter-Bold' }}>{formatTime(d, current, true)}</Text><Pill label="Active" tone="coral" small /></Row>
            <Text variant="bodySm">{formatLongWeekdayDate(d, current)}</Text>
            <View style={styles.divider} />
            <Text variant="overline">Current time zone</Text>
            <Row justify="space-between"><Row gap={6}><View style={styles.greenDot} /><Text variant="bodyStrong">{tzLabel(current, d)}</Text></Row><Pill label={tzAbbr(current, d)} tone="grey" small /></Row>
          </Card>
          <Select label="New Time Zone" required leftIcon="Globe" value={target} onChange={setPending} options={TIME_ZONES.map(z => ({ value: z.id, label: tzLabel(z.id, d), description: z.id }))} testID="tz-select" sheetTitle="Select time zone (IANA)" />
          <InfoBanner tone="gold" icon="Timer" title={`Live Preview: ${formatTime(d, target)}`} text={shift === 0 ? '(No shift from current schedule). Quizzes and weekly submission deadlines will remain synchronized.' : `(${shift > 0 ? '+' : ''}${Math.round(shift / 60 * 10) / 10} h from current display). Example deadline ${formatDateTime(sampleDeadline, current)} becomes ${formatDateTime(sampleDeadline, target)} — same instant.`} />
          <Card tone="muted"><Row gap={8}><Icon name="BookOpen" size={16} color={colors.green900} /><Text variant="caption" style={{ flex: 1 }}>Campus One online courses adhere to asynchronous deadline rules based on your registered time zone{isMockMode() ? ' (demo text)' : ''}.</Text></Row></Card>
          <DemoLabel text="Offsets computed with Intl for the current instant (DST-aware)" />
        </Stack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md }, greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success600 } });
