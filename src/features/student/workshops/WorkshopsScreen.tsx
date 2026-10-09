import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, LoadingState, ErrorState, EmptyState, Icon, SegmentedTabs, KeyValue, InfoBanner, ConfirmSheet, DemoLabel, ProgressBar } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { useWorkshops, useWorkshopMutations, useCurrentTermLabel } from '../courses/useCourses';
import { formatDate, daysUntil } from '../../../utils/format';
import type { WorkshopWithStatus } from '../../../services/contracts/academics';
import { toast } from '../../../state/uiStore';
import { errorMessage } from '../../../services/errors';
import { clock } from '../../../utils/clock';
import { isMockMode } from '../../../config/appConfig';

type View3 = 'mine' | 'available' | 'completed';

export function workshopTiming(w: WorkshopWithStatus) {
  const start = new Date(`${w.date}T${w.startTime}:00`).getTime();
  // Multi-day workshops run until the last session day ends.
  const lastStart = w.endDate ? new Date(`${w.endDate}T${w.startTime}:00`).getTime() : start;
  const end = lastStart + w.durationHours * 3600_000;
  const now = clock.now();
  const d = new Date(now);
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStart = w.endDate ? new Date(`${today}T${w.startTime}:00`).getTime() : start;
  const sessionStart = now > start && now <= end ? todayStart : start;
  return { start, end, isPast: now > end, isLive: now >= sessionStart - 15 * 60_000 && now <= sessionStart + w.durationHours * 3600_000 && now <= end, days: Math.ceil((start - now) / 86_400_000) };
}

export function WorkshopsScreen({ navigation, route }: RootScreenProps<'StudentWorkshops'>) {
  const termLabel = useCurrentTermLabel();
  const workshops = useWorkshops();
  const m = useWorkshopMutations();
  const [view, setView] = useState<View3>(route.params?.view ?? 'mine');
  const [dropId, setDropId] = useState<string | null>(null);
  const data = useMemo(() => workshops.data ?? [], [workshops.data]);
  const groups = useMemo(() => ({
    mine: data.filter(w => w.myEnrolment && (w.myEnrolment.status === 'approved' || w.myEnrolment.status === 'pending') && !workshopTiming(w).isPast),
    available: data.filter(w => !w.myEnrolment && !workshopTiming(w).isPast),
    completed: data.filter(w => w.myEnrolment?.status === 'completed' || (w.myEnrolment?.status === 'approved' && workshopTiming(w).isPast)),
  }), [data]);
  const list = groups[view];
  const nextMine = groups.mine.slice().sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <Screen testID="workshops-screen" header={<ScreenHeader backLabel="Back" />}>
      {workshops.isLoading ? <LoadingState /> : workshops.error ? <ErrorState error={workshops.error} onRetry={() => workshops.refetch()} /> : (
        <Stack>
          <Row justify="space-between"><Text variant="displayLg">My Workshops</Text>{termLabel ? <Pill label={termLabel} tone="green" small /> : null}</Row>
          <Text variant="body">{isMockMode() ? 'Track enrolled sessions, access online rooms, and register for peer learning modules.' : 'Track your registered sessions and register for upcoming workshops.'}</Text>
          <SegmentedTabs options={[{ value: 'mine', label: 'My Workshops', count: groups.mine.length }, { value: 'available', label: 'Available', count: groups.available.length }, { value: 'completed', label: 'Completed', count: groups.completed.length }]} value={view} onChange={setView} testID="workshops-view" />
          {view === 'mine' && nextMine ? <InfoBanner tone="gold" icon="Clock" title={workshopTiming(nextMine).isLive ? 'A session is live now' : `Session starts in ${daysUntil(`${nextMine.date}T${nextMine.startTime}:00`)} days`} text={isMockMode() ? (nextMine.mode === 'Online' ? 'Online demo room link opens 15 minutes before start time.' : `Location: ${nextMine.location}`) : nextMine.location ? `Location: ${nextMine.location}` : undefined} /> : null}
          {!list.length ? <EmptyState icon="Users" title={view === 'mine' ? 'No registered workshops' : view === 'available' ? 'No workshops available' : 'No completed workshops'} message={view === 'mine' ? 'Browse available workshops to register.' : undefined} action={view === 'mine' ? { label: 'Browse', onPress: () => setView('available') } : undefined} /> : list.map(w => <WorkshopCard key={w.id} w={w} onDetails={() => navigation.navigate(Routes.StudentWorkshopDetails, { workshopId: w.id })} onRegister={async () => { try { const r = await m.register.mutateAsync(w.id); toast(r.status === 'pending' ? 'Registration sent for instructor approval' : 'Registered', 'success'); } catch (e) { toast(errorMessage(e), 'error'); } }} onDrop={isMockMode() ? () => setDropId(w.id) : undefined} registering={m.register.isPending} />)}
          {view === 'mine' && groups.available.length ? (
            <Card tone="green"><Row justify="space-between"><View style={{ flex: 1 }}><Text variant="overline">Expand skills</Text><Text variant="titleSm">{groups.available.length} Available Workshops</Text><Text variant="caption">{[...new Set(groups.available.map(w => w.category))].slice(0, 3).join(', ')} {isMockMode() ? 'are' : 'sessions are'} open for registration.</Text></View><Button title="Browse" variant="outline" size="sm" fullWidth={false} onPress={() => setView('available')} testID="workshops-browse" /></Row></Card>
          ) : null}
          <DemoLabel text="Seats, counts and session timing derived from fixtures + demo clock" />
        </Stack>
      )}
      <ConfirmSheet visible={!!dropId} onClose={() => setDropId(null)} destructive title="Drop this workshop?" message="Your registration will be withdrawn and the seat released. You can register again if seats remain." confirmLabel="Drop registration" loading={m.drop.isPending} testID="workshop-drop-sheet" onConfirm={async () => { try { await m.drop.mutateAsync(dropId!); toast('Registration dropped', 'success'); } catch (e) { toast(errorMessage(e), 'error'); } setDropId(null); }} />
    </Screen>
  );
}

function WorkshopCard({ w, onDetails, onRegister, onDrop, registering }: { w: WorkshopWithStatus; onDetails: () => void; onRegister: () => void; onDrop?: () => void; registering: boolean }) {
  const t = workshopTiming(w);
  const status = w.myEnrolment?.status;
  const full = w.registeredCount >= w.capacity;
  return (
    <Card testID={`workshop-${w.id}`}>
      <Stack gap={spacing.sm}>
        <Row gap={spacing.md}>
          <View style={styles.tile}><Icon name={w.category.includes('Health') ? 'HeartPulse' : w.category.includes('Career') ? 'BriefcaseBusiness' : w.category.includes('Leader') ? 'Users' : w.category.includes('Tech') ? 'Map' : 'BookOpen'} size={22} color={colors.green900} /></View>
          <View style={{ flex: 1 }}><Text variant="overline" color={colors.coral600}>{w.category}</Text><Text variant="mono">CODE: {w.code}</Text></View>
          {status ? <Pill label={status === 'pending' ? 'Pending approval' : status === 'approved' ? 'Registered' : status} tone={status === 'pending' ? 'yellow' : 'green'} small dot /> : full ? <Pill label="Full" tone="red" small /> : <Pill label={w.requiresApproval ? 'Approval required' : 'Open'} tone="grey" small />}
        </Row>
        <Text variant="titleMd">{w.code} · {w.title}</Text>
        <Text variant="bodySm">{w.description}</Text>
        <Row wrap gap={spacing.md}>
          <KeyValue label="Date" value={w.endDate ? `${formatDate(w.date)} – ${formatDate(w.endDate)}` : `${formatDate(w.date)} · Single Day Session`} style={styles.kv} />
          <KeyValue label="Schedule" value={<Row gap={4}><Text variant="bodyStrong">{w.mode}</Text>{t.isLive ? <Pill label="LIVE" tone="red" small /> : null}</Row>} style={styles.kv} />
          <KeyValue label="Length & CEU" value={w.durationHours ? `${w.ceu} CEU / ${w.durationHours} Contact Hours` : `${w.ceu} CEU`} style={styles.kv} />
          {w.instructor ? <KeyValue label="Instructor(s)" value={w.instructor} style={styles.kv} /> : null}
        </Row>
        <View><ProgressBar value={(w.registeredCount / w.capacity) * 100} height={5} /><Text variant="caption">{w.registeredCount} / {w.capacity} seats taken</Text></View>
        <Row>
          <Button title="View Workshop Details →" style={{ flex: 1 }} onPress={onDetails} testID={`workshop-details-${w.id}`} />
          {status === 'approved' || status === 'pending' ? (
            !onDrop ? null : <Pressable accessibilityRole="button" accessibilityLabel="Drop workshop" onPress={onDrop} style={styles.sqBtn} testID={`workshop-drop-${w.id}`}><Icon name="LogOut" size={18} color={colors.danger600} /></Pressable>
          ) : !status && !t.isPast ? (
            <Button title={full ? 'Full' : 'Register'} variant="outline" fullWidth={false} onPress={onRegister} disabled={full} loading={registering} testID={`workshop-register-${w.id}`} />
          ) : null}
        </Row>
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.coral50, alignItems: 'center', justifyContent: 'center' },
  kv: { width: '46%' },
  sqBtn: { width: 48, height: 48, borderRadius: 999, borderWidth: 1.5, borderColor: colors.danger600, alignItems: 'center', justifyContent: 'center' },
});
