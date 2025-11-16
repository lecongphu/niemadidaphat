import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getName, getOptimizedImageUrl, formatDuration } from "@/lib/utils";
import { Clock, Edit, MoreVertical, Pause, Play, Trash2, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlayingIndicator from "@/components/PlayingIndicator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditPlaylistDialog } from "./components/EditPlaylistDialog";

const PlaylistPage = () => {
	const { playlistId } = useParams();
	const navigate = useNavigate();
	const { fetchPlaylistById, currentPlaylist, isLoading, deletePlaylist, removeSongFromPlaylist } = usePlaylistStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	useEffect(() => {
		if (playlistId) fetchPlaylistById(playlistId);
	}, [fetchPlaylistById, playlistId]);

	if (isLoading) return null;

	const handlePlayPlaylist = () => {
		if (!currentPlaylist || currentPlaylist.songs.length === 0) return;

		const isCurrentPlaylistPlaying = currentPlaylist?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentPlaylistPlaying) togglePlay();
		else {
			playAlbum(currentPlaylist?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentPlaylist) return;
		playAlbum(currentPlaylist?.songs, index);
	};

	const handleDeletePlaylist = async () => {
		if (!playlistId) return;
		await deletePlaylist(playlistId);
		navigate("/");
	};

	const handleRemoveSong = async (songId: string) => {
		if (!playlistId) return;
		await removeSongFromPlaylist(playlistId, songId);
	};

	const totalDuration = currentPlaylist?.songs.reduce((acc, song) => acc + song.duration, 0) || 0;
	const formattedTotalDuration = formatDuration(totalDuration);

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				{/* Main Content */}
				<div className='relative min-h-full'>
					{/* bg gradient */}
					<div
						className='absolute inset-0 bg-gradient-to-b from-[#3b82f6]/80 via-zinc-900/80
					 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						{/* Navigation buttons */}
						<div className='flex gap-2 p-4 sm:p-6 pb-0'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => navigate(-1)}
								className='rounded-full bg-black/40 hover:bg-black/60 text-white hover:scale-105 transition-all'
								title='Quay lại'
							>
								<ArrowLeft className='h-5 w-5' />
							</Button>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => navigate('/')}
								className='rounded-full bg-black/40 hover:bg-black/60 text-white hover:scale-105 transition-all'
								title='Trang chủ'
							>
								<Home className='h-5 w-5' />
							</Button>
						</div>

						<div className='flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-6 sm:pb-8'>
							<img
								src={getOptimizedImageUrl(currentPlaylist?.imageUrl)}
								alt={currentPlaylist?.name}
								className='w-full sm:w-[240px] h-auto sm:h-[240px] shadow-xl rounded mx-auto sm:mx-0'
							/>
							<div className='flex flex-col justify-end text-center sm:text-left'>
								<p className='text-xs sm:text-sm font-medium'>Playlist</p>
								<h1 className='text-3xl sm:text-5xl md:text-7xl font-bold my-2 sm:my-4'>{currentPlaylist?.name}</h1>
								{currentPlaylist?.description && (
									<p className='text-zinc-400 mb-4 text-sm sm:text-base'>{currentPlaylist.description}</p>
								)}
								<div className='flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-zinc-100 flex-wrap'>
									<span>• {currentPlaylist?.songs.length} bài pháp</span>
									<span>• {formattedTotalDuration}</span>
								</div>
							</div>
						</div>

						{/* Action buttons */}
						<div className='px-4 sm:px-6 pb-4 flex items-center gap-4 sm:gap-6'>
							<Button
								onClick={handlePlayPlaylist}
								size='icon'
								disabled={!currentPlaylist?.songs || currentPlaylist.songs.length === 0}
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400
                hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{isPlaying && currentPlaylist?.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size='icon' variant='ghost' className='hover:bg-white/10'>
										<MoreVertical className='h-5 w-5' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start'>
									<DropdownMenuItem className='cursor-pointer' onClick={() => setShowEditDialog(true)}>
										<Edit className='mr-2 h-4 w-4' />
										<span>Chỉnh sửa playlist</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										className='cursor-pointer text-red-500 focus:text-red-500'
										onClick={() => setShowDeleteDialog(true)}
									>
										<Trash2 className='mr-2 h-4 w-4' />
										<span>Xóa playlist</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
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
								<div>Pháp Sư</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
								<div></div>
							</div>

							{/* songs list */}
							<div className='px-2 sm:px-6'>
								{currentPlaylist?.songs && currentPlaylist.songs.length > 0 ? (
									<div className='space-y-2 py-4'>
										{currentPlaylist.songs.map((song, index) => {
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
														<img
															src={getOptimizedImageUrl(song.imageUrl)}
															alt={song.title}
															className='size-10 flex-shrink-0'
														/>
														<div className='min-w-0 flex-1'>
															<div className={`font-medium text-white`}>{song.title}</div>
															<div className='text-xs sm:hidden text-zinc-500'>
																{getName(song.teacher)} • {formatDuration(song.duration)}
															</div>
														</div>
													</div>

													{/* Desktop: Teacher name */}
													<div className='hidden sm:flex items-center'>{getName(song.teacher)}</div>

													{/* Desktop: Duration */}
													<div className='hidden sm:flex items-center'>{formatDuration(song.duration)}</div>

													{/* Remove button */}
													<div className='flex items-center justify-center'>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button size='icon' variant='ghost' className='h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'>
																	<MoreVertical className='h-4 w-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align='end'>
																<DropdownMenuItem
																	className='cursor-pointer text-red-500 focus:text-red-500'
																	onClick={() => handleRemoveSong(song._id)}
																>
																	<Trash2 className='mr-2 h-4 w-4' />
																	<span>Xóa khỏi playlist</span>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className='text-center py-12 text-zinc-400'>
										<p className='text-base sm:text-lg mb-2'>Playlist trống</p>
										<p className='text-xs sm:text-sm'>Thêm bài pháp vào playlist của bạn</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>

			{/* Edit Playlist Dialog */}
			<EditPlaylistDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				playlist={currentPlaylist}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa playlist?</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa playlist "{currentPlaylist?.name}"? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeletePlaylist} className='bg-red-500 hover:bg-red-600'>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
export default PlaylistPage;
