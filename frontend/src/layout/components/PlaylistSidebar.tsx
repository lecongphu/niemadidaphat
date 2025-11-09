import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { HeadphonesIcon, ListMusic, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreatePlaylistDialog } from "@/pages/playlist/components/CreatePlaylistDialog";
import { getOptimizedImageUrl } from "@/lib/utils";

const PlaylistSidebar = () => {
	const { user, isAuthenticated } = useAuthStore();
	const { playlists, fetchPlaylists, isLoading: isLoadingPlaylists } = usePlaylistStore();
	const { teachers, fetchTeachers, isLoading: isLoadingTeachers } = useMusicStore();
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			fetchPlaylists();
		}
	}, [fetchPlaylists, isAuthenticated]);

	useEffect(() => {
		fetchTeachers();
	}, [fetchTeachers]);

	return (
		<div className='h-full bg-white/80 dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-lg flex flex-col'>
			<ScrollArea className='flex-1'>
				{/* Playlists Section */}
				{isAuthenticated ? (
					<div>
						<div className='p-4 flex justify-between items-center border-b border-amber-200 dark:border-zinc-800'>
							<div className='flex items-center gap-2'>
								<ListMusic className='size-5 text-blue-500 shrink-0' />
								<h2 className='font-semibold text-amber-900 dark:text-white'>Playlists Của Bạn</h2>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowCreateDialog(true)}
								className="h-8 w-8 text-amber-900 dark:text-white hover:bg-amber-100 dark:hover:bg-zinc-800"
								title="Tạo playlist mới"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						<div className='p-4'>
							{isLoadingPlaylists ? (
								<div className="text-center text-amber-700 dark:text-zinc-400 py-4">
									Đang tải...
								</div>
							) : playlists.length === 0 ? (
								<div className="text-center text-amber-700 dark:text-zinc-400 py-4">
									<p className="mb-2 text-sm">Chưa có playlist</p>
									<p className="text-xs">Tạo playlist đầu tiên của bạn</p>
								</div>
							) : (
								<div className="space-y-2">
									{playlists.map((playlist) => (
										<Link
											to={`/playlists/${playlist._id}`}
											key={playlist._id}
											className="group flex items-center gap-3 p-2 hover:bg-amber-100 dark:hover:bg-zinc-800/50 rounded-md transition-all border border-transparent hover:border-blue-500/20"
										>
											<div className="w-12 h-12 rounded flex-shrink-0">
												{playlist.imageUrl && playlist.imageUrl.trim() !== "" ? (
													<img
														src={getOptimizedImageUrl(playlist.imageUrl)}
														alt={playlist.name}
														className="w-full h-full rounded object-cover"
													/>
												) : (
													<div className="w-full h-full rounded bg-amber-200 dark:bg-zinc-800 flex items-center justify-center">
														<ListMusic className="h-6 w-6 text-amber-700 dark:text-zinc-400" />
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm text-amber-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
													{playlist.name}
												</p>
												<p className="text-xs text-amber-700 dark:text-zinc-400 truncate">
													{playlist.songs.length} bài pháp
												</p>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					<LoginPrompt />
				)}

				{/* Teachers Section */}
				<div className='border-t border-amber-200 dark:border-zinc-800'>
					<div className='p-4 border-b border-amber-200 dark:border-zinc-800'>
						<div className='flex items-center gap-2'>
							<Users className='size-5 text-violet-500 shrink-0' />
							<h2 className='font-semibold text-amber-900 dark:text-white'>Pháp Sư</h2>
						</div>
					</div>

					<div className='p-4'>
						{isLoadingTeachers ? (
							<div className="text-center text-amber-700 dark:text-zinc-400 py-4">
								Đang tải...
							</div>
						) : teachers.length === 0 ? (
							<div className="text-center text-amber-700 dark:text-zinc-400 py-4">
								<p className="text-sm">Chưa có pháp sư</p>
							</div>
						) : (
							<div className="space-y-2">
								{teachers.map((teacher) => (
									<Link
										to={`/teachers/${teacher._id}`}
										key={teacher._id}
										className="group flex items-center gap-3 p-2 hover:bg-amber-100 dark:hover:bg-zinc-800/50 rounded-md transition-all border border-transparent hover:border-violet-500/20"
									>
										<div className="w-12 h-12 rounded-full flex-shrink-0">
											<img
												src={getOptimizedImageUrl(teacher.imageUrl)}
												alt={teacher.name}
												className="w-full h-full rounded-full object-cover"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm text-amber-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
												{teacher.name}
											</p>
											<p className="text-xs text-amber-700 dark:text-zinc-400 truncate">
												{teacher.specialization}
											</p>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</ScrollArea>

			{/* Create Playlist Dialog */}
			<CreatePlaylistDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
		</div>
	);
};

export default PlaylistSidebar;

const LoginPrompt = () => (
	<div className='h-full flex flex-col items-center justify-center p-6 text-center space-y-4'>
		<div className='relative'>
			<div
				className='absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full blur-lg
       opacity-75 animate-pulse'
				aria-hidden='true'
			/>
			<div className='relative bg-white dark:bg-zinc-900 rounded-full p-4'>
				<ListMusic className='size-8 text-blue-400' />
			</div>
		</div>

		<div className='space-y-2 max-w-[250px]'>
			<h3 className='text-lg font-semibold text-amber-900 dark:text-white'>Quản Lý Playlists</h3>
			<p className='text-sm text-amber-700 dark:text-zinc-400'>Đăng nhập để tạo và quản lý playlists của bạn</p>
		</div>
	</div>
);
