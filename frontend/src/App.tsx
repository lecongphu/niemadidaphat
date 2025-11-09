import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import MainLayout from "./layout/MainLayout";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import PlaylistPage from "./pages/playlist/PlaylistPage";
import SongDetailPage from "./pages/song/SongDetailPage";
import TeacherPage from "./pages/teacher/TeacherPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";
import GoogleOneTap from "./components/GoogleOneTap";

function App() {
	return (
		<>
			<GoogleOneTap />
			<Routes>
				<Route path='/admin' element={<AdminPage />} />
				<Route path='/privacy-policy' element={<PrivacyPolicy />} />
				<Route path='/terms-of-service' element={<TermsOfService />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/songs/:songId' element={<SongDetailPage />} />
					<Route path='/playlists/:playlistId' element={<PlaylistPage />} />
					<Route path='/teachers/:teacherId' element={<TeacherPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;
