import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { WorkPage } from './pages/Work';
import { ProfilePage } from './pages/Profile';
import { ClubPage } from './pages/Club';
import { PostPage } from './pages/Post';
import { ComingSoon, NotFound } from './pages/Placeholder';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work/:slug" element={<WorkPage />} />
        <Route path="people/:handle" element={<ProfilePage />} />
        <Route path="club" element={<ClubPage />} />
        <Route path="openings" element={<ComingSoon title="Openings" body="Roles and internships from companies hiring through Vinden will live here." />} />
        <Route path="saved" element={<ComingSoon title="Saved" body="Everything you bookmark will be collected here. For now, filter Home by Saved." />} />
        <Route path="post" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
