import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { WorkPage } from './pages/Work';
import { ProfilePage } from './pages/Profile';
import { PostPage } from './pages/Post';
import { NotFound } from './pages/Placeholder';
import { SignUp } from './features/onboarding/SignUp';
import { CompleteStep } from './features/onboarding/CompleteStep';
import { AddExperience } from './features/onboarding/AddExperience';
import { ConfirmRole } from './features/onboarding/ConfirmRole';
import { Explore } from './features/work/Explore';
import { ReviewQueue } from './features/work/ReviewQueue';
import { ReviewWork } from './features/work/ReviewWork';
import { Completion } from './features/work/Completion';
import { Communities } from './features/community/Communities';
import { CommunityPage } from './features/community/CommunityPage';
import { CreateCommunity } from './features/community/CreateCommunity';
import { JoinRequests } from './features/community/JoinRequests';
import { MyClub } from './features/community/MyClub';
import { ClubPage } from './features/community/ClubPage';
import { ClubPortfolio } from './features/community/ClubPortfolio';
import { Apply } from './features/community/Apply';
import { Applications } from './features/community/Applications';
import { Evaluate } from './features/community/Evaluate';
import { TrainingPlan } from './features/training/TrainingPlan';
import { LearningPath } from './features/training/LearningPath';
import { TaskPage } from './features/training/TaskPage';
import { Sessions } from './features/training/Sessions';
import { RegisterCompany } from './features/training/RegisterCompany';
import { SubmitProblem } from './features/training/SubmitProblem';
import { ClubProblems } from './features/training/ClubProblems';
import { CompanyProblems } from './features/training/CompanyProblems';

/** Every screen in the feature register (docs/vinden-feature-register-v0.1.html), by its item code. */
export function App() {
  return (
    <Routes>
      {/* FN-03-I02: a manager opens this from an email, without signing in, so it has no app chrome. */}
      <Route path="confirm/:token" element={<ConfirmRole />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />                                              {/* FN-07-I01 */}
        <Route path="explore" element={<Explore />} />                                  {/* FN-07-I02 */}
        <Route path="signup" element={<SignUp />} />                                    {/* FN-01-I01 */}
        <Route path="profile/complete/:step" element={<CompleteStep />} />              {/* FN-02-I03 to I06 */}
        <Route path="profile/experience/new" element={<AddExperience />} />             {/* FN-03-I01 */}
        <Route path="people/:handle" element={<ProfilePage />} />                       {/* FN-02-I01 */}
        <Route path="post" element={<PostPage />} />                                    {/* FN-04-I01 */}
        <Route path="work/:slug" element={<WorkPage />} />                              {/* FN-06-I01, FN-05-I01 */}
        <Route path="communities" element={<Communities />} />                          {/* FN-08-I01 */}
        <Route path="communities/new" element={<CreateCommunity />} />                  {/* FN-08-I04 */}
        <Route path="communities/:slug" element={<CommunityPage />} />                  {/* FN-08-I02 */}
        <Route path="communities/:slug/requests" element={<JoinRequests />} />          {/* FN-08-I03 */}
        <Route path="club" element={<MyClub />} />                                      {/* FN-09-I01, your club */}
        <Route path="clubs/:slug" element={<ClubPage />} />                             {/* FN-09-I01 */}
        <Route path="clubs/:slug/portfolio" element={<ClubPortfolio />} />              {/* FN-09-I02 */}
        <Route path="clubs/:slug/apply" element={<Apply />} />                          {/* FN-10-I01 */}
        <Route path="club/applications" element={<Applications />} />                   {/* FN-10-I02 */}
        <Route path="club/applications/:id" element={<Evaluate />} />                   {/* FN-10-I03 */}
        <Route path="club/review" element={<ReviewQueue />} />                          {/* FN-05-I02 */}
        <Route path="club/review/:slug" element={<ReviewWork />} />                     {/* FN-05-I03 */}
        <Route path="club/completion" element={<Completion />} />                       {/* FN-05-I04 */}
        <Route path="club/training" element={<TrainingPlan />} />                       {/* FN-11-I01 */}
        <Route path="club/learning/:id" element={<LearningPath />} />                   {/* FN-11-I02 */}
        <Route path="club/tasks/:id" element={<TaskPage />} />                          {/* FN-11-I03 */}
        <Route path="club/sessions" element={<Sessions />} />                           {/* FN-11-I04 */}
        <Route path="club/problems" element={<ClubProblems />} />                       {/* FN-12-I03 */}
        <Route path="companies/register" element={<RegisterCompany />} />               {/* FN-12-I01 */}
        <Route path="problems" element={<CompanyProblems />} />                         {/* FN-12-I04 */}
        <Route path="problems/new" element={<SubmitProblem />} />                       {/* FN-12-I02 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
