import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Album, Music, Users, UserCog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import TeachersTabContent from "./components/TeachersTabContent";
import UsersTabContent from "./components/UsersTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";

const AdminPage = () => {
	const { isAdmin, isLoading } = useAuthStore();

	const { fetchAlbums, fetchSongs, fetchStats, fetchTeachers, fetchCategories } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
		fetchTeachers();
		fetchCategories();
	}, [fetchAlbums, fetchSongs, fetchStats, fetchTeachers, fetchCategories]);

	if (!isAdmin && !isLoading) return <div>Không có quyền truy cập</div>;

	return (
		<div
			className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-8'
		>
			<Header />

			<DashboardStats />

			<Tabs defaultValue='songs' className='space-y-6'>
				<TabsList className='p-1 bg-zinc-800/50'>
					<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
						<Music className='mr-2 size-4' />
						Bài Pháp
					</TabsTrigger>
					<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
						<Album className='mr-2 size-4' />
						Bộ Kinh
					</TabsTrigger>
					<TabsTrigger value='teachers' className='data-[state=active]:bg-zinc-700'>
						<Users className='mr-2 size-4' />
						Pháp Sư
					</TabsTrigger>
					<TabsTrigger value='users' className='data-[state=active]:bg-zinc-700'>
						<UserCog className='mr-2 size-4' />
						Người Dùng
					</TabsTrigger>
				</TabsList>

				<TabsContent value='songs'>
					<SongsTabContent />
				</TabsContent>
				<TabsContent value='albums'>
					<AlbumsTabContent />
				</TabsContent>
				<TabsContent value='teachers'>
					<TeachersTabContent />
				</TabsContent>
				<TabsContent value='users'>
					<UsersTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default AdminPage;
