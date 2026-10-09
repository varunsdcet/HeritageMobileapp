import React from 'react';
import { Screen, ScreenHeader, Text, Card, Row, Stack, Button, Pill, LoadingState, ErrorState, EmptyState, ProgressBar, DemoLabel } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Routes } from '../../../navigation/routes';
import type { RootScreenProps } from '../../../navigation/types';
import { useEnrolments, useProgramme } from './useCatalogue';
import { useSnapshot, useCertificate } from '../learning/useLearning';
import { formatDate } from '../../../utils/format';

/** Inferred supporting screen: self-paced enrolments and certificates. */
export function MyLearningScreen({ navigation }: RootScreenProps<'StudentMyLearning'>) {
  const enrolments = useEnrolments();
  return (
    <Screen header={<ScreenHeader title="My Learning" />} testID="my-learning">
      <Stack>
        <DemoLabel text="Inferred supporting screen" />
        {enrolments.isLoading ? <LoadingState /> : enrolments.error ? <ErrorState error={enrolments.error} onRetry={() => enrolments.refetch()} /> : !enrolments.data?.length ? (
          <EmptyState icon="GraduationCap" title="No self-paced programmes yet" message="Browse the catalogue to start learning." action={{ label: 'Browse Current Programs', onPress: () => navigation.navigate(Routes.StudentCatalogue) }} />
        ) : enrolments.data.map(e => <EnrolmentCard key={e.id} programmeId={e.programmeId} enrolledAt={e.enrolledAt} onOpen={() => navigation.navigate(Routes.StudentOutline, { programmeId: e.programmeId })} onCertificate={() => navigation.navigate(Routes.StudentCertificate, { programmeId: e.programmeId })} />)}
        <Button title="Browse Current Programs" variant="outline" onPress={() => navigation.navigate(Routes.StudentCatalogue)} testID="mylearning-catalogue" />
      </Stack>
    </Screen>
  );
}

function EnrolmentCard({ programmeId, enrolledAt, onOpen, onCertificate }: { programmeId: string; enrolledAt: string; onOpen: () => void; onCertificate: () => void }) {
  const programme = useProgramme(programmeId);
  const snap = useSnapshot(programmeId);
  const cert = useCertificate(programmeId);
  return (
    <Card testID={`enrolment-${programmeId}`}>
      <Stack gap={spacing.sm}>
        <Row justify="space-between"><Pill label={snap.data?.completedAll ? 'Completed' : 'In progress'} tone={snap.data?.completedAll ? 'green' : 'coral'} small dot /><Text variant="caption">Enrolled {formatDate(enrolledAt)}</Text></Row>
        <Text variant="titleMd">{programme.data?.title ?? '…'}</Text>
        <ProgressBar value={snap.data?.percent ?? 0} color={colors.gold500} />
        <Text variant="bodySm">{snap.data ? `${snap.data.completedCount}/${snap.data.totalCount} activities · ${snap.data.chapterUnlockedCount} of ${programme.data?.chapterCount ?? '—'} chapters unlocked` : 'Loading progress…'}</Text>
        <Row>
          <Button title="Open outline" onPress={onOpen} style={{ flex: 1 }} testID={`enrolment-open-${programmeId}`} />
          <Button title={cert.data ? 'Certificate' : 'Certificate preview'} variant="outline" onPress={onCertificate} style={{ flex: 1 }} testID={`enrolment-cert-${programmeId}`} />
        </Row>
      </Stack>
    </Card>
  );
}
