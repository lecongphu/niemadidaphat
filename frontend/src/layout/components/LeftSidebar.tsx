import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getOptimizedImageUrl } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { SignedIn, useAuth } from "@clerk/clerk-react";
import { HomeIcon, Library, ListMusic, MessageCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreatePlaylistDialog } from "@/pages/playlist/components/CreatePlaylistDialog";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();
	const { playlists, fetchPlaylists, isLoading: isLoadingPlaylists } = usePlaylistStore();
	const { isSignedIn } = useAuth();
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	useEffect(() => {
		if (isSignedIn) {
			fetchPlaylists();
		}
	}, [fetchPlaylists, isSignedIn]);

	console.log({ albums });

	return (
		<div className='h-full flex flex-col gap-2'>
			{/* Navigation menu */}

			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<Link
						to={"/"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Trang Chủ</span>
					</Link>

					<SignedIn>
						<Link
							to={"/chat"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800",
								})
							)}
						>
							<MessageCircle className='mr-2 size-5' />
							<span className='hidden md:inline'>Đàm đạo</span>
						</Link>
					</SignedIn>
				</div>
			</div>

			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Bộ Kinh</span>
					</div>
				</div>

				<ScrollArea className='h-[calc(100vh-500px)]'>
					<div className='space-y-2'>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							albums.map((album) => (
								<Link
									to={`/albums/${album._id}`}
									key={album._id}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<img
										src={getOptimizedImageUrl(album.imageUrl)}
										alt='Hình ảnh bộ kinh'
										className='size-12 rounded-md flex-shrink-0 object-cover'
									/>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{album.title}</p>
										<p className='text-sm text-zinc-400 truncate'>
											Bộ Kinh • {typeof album.teacher === 'string' ? album.teacher : album.teacher.name}
										</p>
									</div>
								</Link>
							))
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Playlists section */}
			<SignedIn>
				<div className='rounded-lg bg-zinc-900 p-4'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center text-white px-2'>
							<ListMusic className='size-5 mr-2' />
							<span className='hidden md:inline'>Playlists</span>
						</div>
						<button
							onClick={() => setShowCreateDialog(true)}
							className='text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded-full transition'
							title='Tạo playlist mới'
						>
							<Plus className='size-4' />
						</button>
					</div>

					<ScrollArea className='h-[150px]'>
						<div className='space-y-2'>
							{isLoadingPlaylists ? (
								<PlaylistSkeleton />
							) : playlists.length > 0 ? (
								playlists.map((playlist) => (
									<Link
										to={`/playlists/${playlist._id}`}
										key={playlist._id}
										className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
									>
										<div className='size-12 rounded-md flex-shrink-0 bg-zinc-800 flex items-center justify-center'>
											{playlist.imageUrl && playlist.imageUrl.trim() !== "" ? (
												<img
													src={getOptimizedImageUrl(playlist.imageUrl)}
													alt={playlist.name}
													className='size-12 rounded-md object-cover'
												/>
											) : (
												<ListMusic className='size-6 text-zinc-400' />
											)}
										</div>

										<div className='flex-1 min-w-0 hidden md:block'>
											<p className='font-medium truncate'>{playlist.name}</p>
											<p className='text-sm text-zinc-400 truncate'>
												Playlist • {playlist.songs.length} bài pháp
											</p>
										</div>
									</Link>
								))
							) : (
								<div className='text-center py-4 text-zinc-400 text-sm'>
									<p className='hidden md:block'>Chưa có playlist</p>
									<p className='hidden md:block text-xs mt-1'>Tạo playlist đầu tiên</p>
								</div>
							)}
						</div>
					</ScrollArea>
				</div>
			</SignedIn>

			<CreatePlaylistDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
		</div>
	);
};
export default LeftSidebar;
