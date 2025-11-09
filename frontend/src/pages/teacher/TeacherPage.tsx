import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getOptimizedImageUrl, formatDuration } from "@/lib/utils";
import { Clock, ListPlus, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PlayingIndicator from "@/components/PlayingIndicator";
import { AddToPlaylistDialog } from "@/pages/playlist/components/AddToPlaylistDialog";
import SEO from "@/components/SEO";

const TeacherPage = () => {
	const { teacherId } = useParams();
	const { fetchTeacherById, currentTeacher, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum } = usePlayerStore();
	const { isAuthenticated } = useAuthStore();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

	useEffect(() => {
		if (teacherId) fetchTeacherById(teacherId);
	}, [fetchTeacherById, teacherId]);

	if (isLoading) return null;

	const handlePlaySong = (index: number) => {
		if (!currentTeacher?.songs) return;
		playAlbum(currentTeacher.songs, index);
	};

	const handleAddToPlaylist = (songId: string) => {
		setSelectedSongId(songId);
		setShowAddToPlaylist(true);
	};

	// SEO data
	const teacherDescription = currentTeacher
		? `Pháp sư ${currentTeacher.name} - ${currentTeacher.specialization}. ${currentTeacher.bio}. Nghe các bài pháp và bộ kinh của ${currentTeacher.name} tại Niệm A Di Đà Phật.`
		: "";

	return (
		<div className='h-full'>
			{currentTeacher && (
				<SEO
					title={`${currentTeacher.name} - Pháp Sư`}
					description={teacherDescription}
					type="website"
					image={currentTeacher.imageUrl}
					url={`/teachers/${currentTeacher._id}`}
					keywords={[currentTeacher.name, currentTeacher.specialization, "pháp sư", "bài giảng phật pháp"]}
					author={currentTeacher.name}
				/>
			)}
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
								src={getOptimizedImageUrl(currentTeacher?.imageUrl)}
								alt={currentTeacher?.name}
								className='w-full sm:w-[240px] h-auto sm:h-[240px] shadow-xl rounded-full mx-auto sm:mx-0'
							/>
							<div className='flex flex-col justify-end text-center sm:text-left'>
								<p className='text-xs sm:text-sm font-medium'>Pháp Sư</p>
								<h1 className='text-3xl sm:text-5xl md:text-7xl font-bold my-2 sm:my-4'>{currentTeacher?.name}</h1>
								<div className='flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-zinc-100 flex-wrap'>
									<span className='font-medium text-white'>
										{currentTeacher?.specialization}
									</span>
									{currentTeacher?.yearsOfExperience && (
										<span>• {currentTeacher.yearsOfExperience} năm kinh nghiệm</span>
									)}
								</div>
								{currentTeacher?.bio && (
									<p className='mt-4 text-sm text-zinc-300 max-w-2xl'>{currentTeacher.bio}</p>
								)}
							</div>
						</div>

						{/* Albums Section */}
						{currentTeacher?.albums && currentTeacher.albums.length > 0 && (
							<div className='px-4 sm:px-6 pb-8'>
								<h2 className='text-2xl font-bold mb-4'>Bộ Kinh</h2>
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
									{currentTeacher.albums.map((album) => (
										<Link
											key={album._id}
											to={`/albums/${album._id}`}
											className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group'
										>
											<div className='relative mb-4'>
												<img
													src={getOptimizedImageUrl(album.imageUrl)}
													alt={album.title}
													className='w-full aspect-square object-cover rounded-md shadow-lg group-hover:shadow-xl transition-shadow'
												/>
											</div>
											<h3 className='font-medium mb-1 text-white'>{album.title}</h3>
											<p className='text-sm text-zinc-400'>{album.releaseYear}</p>
										</Link>
									))}
								</div>
							</div>
						)}

						{/* Songs Section */}
						{currentTeacher?.songs && currentTeacher.songs.length > 0 && (
							<div className='bg-black/20 backdrop-blur-sm'>
								<div className='px-4 sm:px-6 py-4'>
									<h2 className='text-2xl font-bold mb-4'>Bài Pháp</h2>
								</div>

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
										{currentTeacher.songs.map((song, index) => {
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
															<div className={`font-medium text-white`}>{song.title}</div>
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
						)}
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
export default TeacherPage;
