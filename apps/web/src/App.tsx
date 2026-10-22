import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { WorkPage } from './pages/Work';
import { ProfilePage } from './pages/Profile';
import { ComingSoon, NotFound } from './pages/Placeholder';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work/:slug" element={<WorkPage />} />
        <Route path="people/:handle" element={<ProfilePage />} />
        <Route path="club" element={<ComingSoon title="Your club" body="Tasks, sessions and your club's problem statements will live here." />} />
        <Route path="openings" element={<ComingSoon title="Openings" body="Roles and internships from companies hiring through Vinden will live here." />} />
        <Route path="saved" element={<ComingSoon title="Saved" body="Everything you bookmark will be collected here. For now, filter Home by Saved." />} />
        <Route path="post" element={<ComingSoon title="Post your work" body="Upload a project, tag your teammates and their share, then send it for verification." />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
