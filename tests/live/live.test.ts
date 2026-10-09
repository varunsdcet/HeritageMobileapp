/**
 * Read-only smoke test of every service against the live Heritage API.
 * Run: LIVE=1 CO_PW=... npx jest tests/live --testMatch '**\/live/*.test.ts'
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Repository } from '../../src/storage/repository';
import { buildSeed } from '../../src/fixtures/seed';
import { createApiServices } from '../../src/services/api';
import { useSessionStore } from '../../src/state/sessionStore';
import type { Services } from '../../src/services/contracts';

declare const process: { env: Record<string, string | undefined> };

const live = process.env.LIVE === '1' ? describe : describe.skip;
jest.setTimeout(240_000);

type Step = [string, () => Promise<unknown>];

async function runSteps(steps: Step[]) {
  const failures: string[] = [];
  for (const [name, fn] of steps) {
    const t = Date.now();
    try {
      const out = await fn();
      const size = Array.isArray(out) ? `${out.length} items` : out && typeof out === 'object' ? `keys=${Object.keys(out).slice(0, 6).join(',')}` : String(out);
      console.log(`OK   ${name} (${Date.now() - t}ms) ${size}`);
    } catch (e) {
      const err = e as { code?: string; message?: string; stack?: string };
      failures.push(`${name}: ${err.code ?? ''} ${err.message}`);
      console.log(`FAIL ${name}: ${err.code ?? ''} ${err.message}\n${(err.stack ?? '').split('\n').slice(1, 4).join('\n')}`);
    }
  }
  return failures;
}

function makeServices(): Services {
  const repo = new Repository({ store: AsyncStorage, seed: buildSeed, persistDelayMs: 0 });
  return createApiServices({ repo, store: AsyncStorage });
}

async function signIn(s: Services, loginId: string) {
  const { session, user } = await s.auth.login({ loginId, password: process.env.CO_PW ?? '', rememberMe: true });
  useSessionStore.getState().setSignedIn(session, user);
  return user;
}

live('live API', () => {
  it('student flows', async () => {
    const s = makeServices();
    const u = await signIn(s, 'ST-2024-001');
    const id = u.id;
    let sectionId = '';
    let assignmentId = '';
    let programmeId = '';
    let mailId = '';
    const failures = await runSteps([
      ['auth.restoreSession', () => s.auth.restoreSession()],
      ['auth.getSettings', () => s.auth.getSettings(id)],
      ['courses.listStudentSections', async () => { const r = await s.courses.listStudentSections(id); sectionId = r[0]?.id ?? ''; return r; }],
      ['courses.getSection', () => s.courses.getSection(sectionId)],
      ['courses.listSessions', () => s.courses.listSessions(sectionId)],
      ['courses.listTerms', () => s.courses.listTerms()],
      ['assignments.listForStudent', async () => { const r = await s.assignments.listForStudent(id); assignmentId = r[0]?.id ?? ''; return r; }],
      ['assignments.get', () => s.assignments.get(assignmentId, id)],
      ['grades.listStudentMarks', () => s.grades.listStudentMarks(id)],
      ['grades.listFinalMarks', () => s.grades.listFinalMarks(id)],
      ['attendance.listStudentRecords', () => s.attendance.listStudentRecords(id)],
      ['attendance.listCorrections', () => s.attendance.listCorrections(id)],
      ['workshops.list', () => s.workshops.list(id)],
      ['records.listBadges', () => s.records.listBadges(id)],
      ['records.listExtracurricular', () => s.records.listExtracurricular(id)],
      ['records.listPlan', () => s.records.listPlan(id)],
      ['tasks.list', () => s.tasks.list(id)],
      ['documents.list', () => s.documents.list(id)],
      ['documents.listTax', () => s.documents.listTax(id)],
      ['finance.listStatements', () => s.finance.listStatements(id)],
      ['finance.listTransactions', () => s.finance.listTransactions(id)],
      ['requests.list', () => s.requests.list(id)],
      ['requests.listEnglishTests', () => s.requests.listEnglishTests(id)],
      ['notifications.list', () => s.notifications.list(id)],
      ['mail.list inbox', async () => { const r = await s.mail.list(id, 'inbox'); mailId = r[0]?.id ?? ''; return r; }],
      ['mail.list outbox', () => s.mail.list(id, 'outbox')],
      ['mail.list drafts', () => s.mail.list(id, 'drafts')],
      ['mail.get', () => (mailId ? s.mail.get(mailId) : Promise.resolve('no mail'))],
      ['mail.listContacts', () => s.mail.listContacts()],
      ['raw /mail', async () => {
        const sess = JSON.parse((await AsyncStorage.getItem('campusone.session.v1')) ?? '{}');
        for (const q of ['', '?folderKind=inbox', '?folderKind=sent']) {
          const r = await fetch(`https://appslure.app/__api/mail${q}`, { headers: { Authorization: `Bearer ${sess.accessToken}` } });
          console.log(`   /mail${q}: ${r.status}`, (await r.text()).slice(0, 400));
        }
      }],
      ['askHeritage.suggestions', () => s.askHeritage.suggestions(id)],
      ['askHeritage.history', () => s.askHeritage.history(id)],
      ['askHeritage.ask', async () => { const a = await s.askHeritage.ask(id, 'When is my next class?'); console.log('   answer:', JSON.stringify(a).slice(0, 300)); return a; }],
      ['catalogue.listProgrammes', async () => { const r = await s.catalogue.listProgrammes(); programmeId = r[0]?.id ?? ''; return r; }],
      ['catalogue.getProgramme', async () => { const p = await s.catalogue.getProgramme(programmeId); console.log('   chapters:', p.chapters?.length, 'activities:', p.chapters?.[0]?.activities?.length); return p; }],
      ['catalogue.listBookmarks', () => s.catalogue.listBookmarks(id)],
      ['enrolment.listEnrolments', async () => { const r = await s.enrolment.listEnrolments(id); if (r[0]) programmeId = r[0].programmeId; return r; }],
      ['enrolment.listPayments', () => s.enrolment.listPayments(id)],
      ['learning.getSnapshot', () => s.learning.getSnapshot(id, programmeId)],
      ['learning.getCertificate', () => s.learning.getCertificate(id, programmeId)],
    ]);
    await s.auth.logout();
    expect(failures).toEqual([]);
  });

  it('instructor flows', async () => {
    const s = makeServices();
    const u = await signIn(s, 'vance.instructor@heritage.edu');
    const id = u.id;
    let sectionId = '';
    const failures = await runSteps([
      ['instructor.dashboard', async () => { const d = await s.instructor.dashboard(id); console.log('   dashboard:', JSON.stringify(d).slice(0, 300)); return d; }],
      ['courses.listInstructorSections', async () => {
        const r = await s.courses.listInstructorSections(id);
        for (const sec of r) {
          const [roster, sessions, marks] = await Promise.all([s.courses.listRoster(sec.id), s.courses.listSessions(sec.id), s.grades.listMarks(sec.id)]);
          console.log(`   ${sec.course?.code} ${sec.sectionCode}: roster=${roster.length} sessions=${sessions.length} marks=${marks.length}`);
          if (!sectionId && roster.length) sectionId = sec.id;
        }
        sectionId ||= r[0]?.id ?? '';
        return r;
      }],
      ['courses.getSection', () => s.courses.getSection(sectionId)],
      ['courses.listSessions', () => s.courses.listSessions(sectionId)],
      ['courses.listRoster', () => s.courses.listRoster(sectionId)],
      ['assignments.listSubmissionsForSection', () => s.assignments.listSubmissionsForSection(sectionId)],
      ['grades.listGradeItems', () => s.grades.listGradeItems(sectionId)],
      ['grades.listMarks', () => s.grades.listMarks(sectionId)],
      ['grades.exportGradesCsv', () => s.grades.exportGradesCsv(sectionId)],
      ['attendance.listForDate', () => s.attendance.listForDate(id, new Date().toISOString().slice(0, 10))],
      ['attendance.sectionSummary', () => s.attendance.sectionSummary(sectionId)],
      ['workshops.listEnrolmentsForInstructor', () => s.workshops.listEnrolmentsForInstructor()],
      ['instructor.listStudents', () => s.instructor.listStudents(id, { category: 'all', page: 1, pageSize: 20 })],
      ['instructor.listLessonCourses', () => s.instructor.listLessonCourses(id)],
      ['instructor.listCompetencies', () => s.instructor.listCompetencies(sectionId)],
      ['instructor.listSectionBadges', () => s.instructor.listSectionBadges(sectionId)],
      ['instructor.listEvaluations', () => s.instructor.listEvaluations(id)],
      ['instructor.listRepositories', () => s.instructor.listRepositories({ page: 1, pageSize: 20 })],
      ['instructor.listScheduleChanges', () => s.instructor.listScheduleChanges(id)],
      ['instructor.gradeSubmissionOverview', () => s.instructor.gradeSubmissionOverview(id, { status: 'all' })],
      ['instructor.listHistory', () => s.instructor.listHistory(id)],
      ['instructor.listFaculties', () => s.instructor.listFaculties()],
      ['instructor.listProgramTypes', () => s.instructor.listProgramTypes()],
      ['instructor.listTerms', () => s.instructor.listTerms()],
      ['instructor.getProfile', () => s.instructor.getProfile(id)],
      ['instructor.accomplishments', () => s.instructor.accomplishments(id)],
      ['instructor.listSectionsForInstructor', () => s.instructor.listSectionsForInstructor(id)],
      ['notifications.list', () => s.notifications.list(id)],
      ['mail.list inbox', () => s.mail.list(id, 'inbox')],
      ['askHeritage.suggestions', () => s.askHeritage.suggestions(id)],
    ]);
    await s.auth.logout();
    expect(failures).toEqual([]);
  });
});
