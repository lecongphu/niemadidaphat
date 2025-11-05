import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getName, getOptimizedImageUrl, formatDuration } from "@/lib/utils";
import { Clock, ListPlus, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayingIndicator from "@/components/PlayingIndicator";
import { AddToPlaylistDialog } from "@/pages/playlist/components/AddToPlaylistDialog";

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const { isAuthenticated } = useAuthStore();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	if (isLoading) return null;

	const handlePlayAlbum = () => {
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			// start playing the album from the beginning
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;

		playAlbum(currentAlbum?.songs, index);
	};

	const handleAddToPlaylist = (songId: string) => {
		setSelectedSongId(songId);
		setShowAddToPlaylist(true);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				{/* Main Content */}
				<div className='relative min-h-full'>
					{/* bg gradient */}
					<div
						className='absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80
					 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						<div className='flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-6 sm:pb-8'>
							<img
								src={getOptimizedImageUrl(currentAlbum?.imageUrl)}
								alt={currentAlbum?.title}
								className='w-full sm:w-[240px] h-auto sm:h-[240px] shadow-xl rounded mx-auto sm:mx-0'
							/>
							<div className='flex flex-col justify-end text-center sm:text-left'>
								<p className='text-xs sm:text-sm font-medium'>Bộ Kinh</p>
								<h1 className='text-3xl sm:text-5xl md:text-7xl font-bold my-2 sm:my-4'>{currentAlbum?.title}</h1>
								<div className='flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-zinc-100 flex-wrap'>
									<span className='font-medium text-white'>
										{getName(currentAlbum?.teacher)}
									</span>
									<span>• {currentAlbum?.songs.length} bài pháp</span>
									<span>• {currentAlbum?.releaseYear}</span>
								</div>
							</div>
						</div>

						{/* play button */}
						<div className='px-4 sm:px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400
                hover:scale-105 transition-all'
							>
								{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>
						</div>

						{/* Table Section */}
						<div className='bg-black/20 backdrop-blur-sm'>
							{/* table header - hidden on mobile */}
							<div
								className='hidden sm:grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-10 py-2 text-sm
            text-zinc-400 border-b border-white/5'
							>
								<div>#</div>
								<div>Tên Bài Pháp</div>
								<div>Ngày Phát Hành</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
								<div></div>
							</div>

							{/* songs list */}
							<div className='px-2 sm:px-6'>
								<div className='space-y-2 py-4'>
									{currentAlbum?.songs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										return (
											<div
												key={song._id}
												className={`
													grid grid-cols-[auto_1fr_auto] sm:grid-cols-[16px_4fr_2fr_1fr_40px]
													gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-sm
                      text-zinc-400 hover:bg-white/5 rounded-md group
                      `}
											>
												{/* Mobile: Play indicator / Number */}
												<div
													className='flex items-center justify-center cursor-pointer w-8 sm:w-auto'
													onClick={() => handlePlaySong(index)}
												>
													{isCurrentSong && isPlaying ? (
														<PlayingIndicator />
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												{/* Song info - responsive */}
												<div
													className='flex items-center gap-3 cursor-pointer min-w-0'
													onClick={() => handlePlaySong(index)}
												>
													<img src={getOptimizedImageUrl(song.imageUrl)} alt={song.title} className='size-10 flex-shrink-0' />

													<div className='min-w-0 flex-1'>
														<div className={`font-medium text-white truncate`}>{song.title}</div>
														<div className='truncate sm:hidden'>{getName(song.teacher)}</div>
														<div className='text-xs sm:hidden text-zinc-500'>
															{song.createdAt.split("T")[0]} • {formatDuration(song.duration)}
														</div>
													</div>
												</div>

												{/* Desktop: Release date */}
												<div
													className='hidden sm:flex items-center cursor-pointer'
													onClick={() => handlePlaySong(index)}
												>
													{song.createdAt.split("T")[0]}
												</div>

												{/* Desktop: Duration */}
												<div
													className='hidden sm:flex items-center cursor-pointer'
													onClick={() => handlePlaySong(index)}
												>
													{formatDuration(song.duration)}
												</div>

												{/* Add to playlist button */}
												<div className='flex items-center justify-center'>
													{isAuthenticated && (
														<Button
															size='icon'
															variant='ghost'
															className='h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
															onClick={(e) => {
																e.stopPropagation();
																handleAddToPlaylist(song._id);
															}}
															title='Thêm vào playlist'
														>
															<ListPlus className='h-4 w-4' />
														</Button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>

			<AddToPlaylistDialog
				open={showAddToPlaylist}
				onOpenChange={setShowAddToPlaylist}
				songId={selectedSongId}
			/>
		</div>
	);
};
export default AlbumPage;
