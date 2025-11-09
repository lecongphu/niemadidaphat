import { useEffect, useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getName, getOptimizedImageUrl, formatDuration } from "@/lib/utils";
import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, RefreshCw, Play, ListPlus, ChevronLeft, ChevronRight } from "lucide-react";
import PlayingIndicator from "@/components/PlayingIndicator";
import { AddToPlaylistDialog } from "@/pages/playlist/components/AddToPlaylistDialog";
import { useAuthStore } from "@/stores/useAuthStore";

const SONGS_PER_PAGE = 20;

const SongsList = () => {
	const { songs, fetchSongs, isLoading } = useMusicStore();
	const { currentSong, isPlaying, setCurrentSong } = usePlayerStore();
	const { isAuthenticated } = useAuthStore();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
	const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

	useEffect(() => {
		fetchSongs();
	}, [fetchSongs]);

	const handleManualRefresh = () => {
		setIsRefreshing(true);
		fetchSongs().finally(() => setIsRefreshing(false));
	};

	const handleAddToPlaylist = (songId: string) => {
		setSelectedSongId(songId);
		setShowAddToPlaylist(true);
	};

	const handlePlaySong = (song: any) => {
		setCurrentSong(song);
	};

	// Pagination logic
	const totalPages = Math.ceil(songs.length / SONGS_PER_PAGE);
	const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
	const endIndex = startIndex + SONGS_PER_PAGE;
	const currentSongs = songs.slice(startIndex, endIndex);

	const goToPage = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const goToPreviousPage = () => {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	};

	const goToNextPage = () => {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (isLoading) {
		return (
			<Card className="bg-white/80 dark:bg-zinc-900/50 border-amber-200 dark:border-zinc-800 shadow-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Music className="h-5 w-5 text-orange-500 dark:text-violet-500" />
						<CardTitle className="text-amber-900 dark:text-white">Tất Cả Bài Pháp</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<PlaylistSkeleton />
				</CardContent>
			</Card>
		);
	}

	if (songs.length === 0) {
		return (
			<Card className="bg-white/80 dark:bg-zinc-900/50 border-amber-200 dark:border-zinc-800 shadow-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Music className="h-5 w-5 text-orange-500 dark:text-violet-500" />
						<CardTitle className="text-amber-900 dark:text-white">Tất Cả Bài Pháp</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center text-amber-700 dark:text-zinc-400 py-8">Chưa có dữ liệu</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="bg-white/80 dark:bg-zinc-900/50 border-amber-200 dark:border-zinc-800 shadow-md">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Music className="h-5 w-5 text-orange-500 dark:text-violet-500" />
							<CardTitle className="text-amber-900 dark:text-white">Tất Cả Bài Pháp</CardTitle>
							<span className="text-sm text-amber-700 dark:text-zinc-400 ml-2">
								({songs.length} bài)
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleManualRefresh}
							disabled={isRefreshing}
							className="h-8 w-8 text-amber-900 dark:text-white hover:bg-amber-100 dark:hover:bg-zinc-800"
						>
							<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{currentSongs.map((song) => {
							const isCurrentSong = currentSong?._id === song._id;
							return (
								<div
									key={song._id}
									className="group flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-800/50 transition-all border border-transparent hover:border-orange-500/20 dark:hover:border-violet-500/20"
								>
									{/* Play button / Playing indicator */}
									<div
										className="flex items-center justify-center cursor-pointer w-10 h-10 flex-shrink-0"
										onClick={() => handlePlaySong(song)}
									>
										{isCurrentSong && isPlaying ? (
											<PlayingIndicator />
										) : (
											<div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-200 dark:bg-zinc-700 group-hover:bg-orange-500 dark:group-hover:bg-violet-500 transition-colors">
												<Play className="h-4 w-4 text-amber-900 dark:text-white" />
											</div>
										)}
									</div>

									{/* Song image and info */}
									<div
										className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
										onClick={() => handlePlaySong(song)}
									>
										<img
											src={getOptimizedImageUrl(song.imageUrl)}
											alt={song.title}
											className="w-12 h-12 rounded object-cover flex-shrink-0 shadow-md"
										/>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-amber-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-violet-400 transition-colors truncate">
												{song.title}
											</p>
											<p className="text-sm text-amber-700 dark:text-zinc-400 truncate">
												{getName(song.teacher)}
											</p>
										</div>
									</div>

									{/* Duration */}
									<div className="hidden sm:flex items-center text-sm text-amber-700 dark:text-zinc-400 flex-shrink-0">
										{formatDuration(song.duration)}
									</div>

									{/* Add to playlist button */}
									{isAuthenticated && (
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0 text-amber-900 dark:text-white hover:bg-amber-200 dark:hover:bg-zinc-700"
											onClick={(e) => {
												e.stopPropagation();
												handleAddToPlaylist(song._id);
											}}
											title="Thêm vào playlist"
										>
											<ListPlus className="h-4 w-4" />
										</Button>
									)}
								</div>
							);
						})}
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-amber-200 dark:border-zinc-800">
							<Button
								variant="outline"
								size="sm"
								onClick={goToPreviousPage}
								disabled={currentPage === 1}
								className="border-amber-300 dark:border-zinc-700 text-amber-900 dark:text-white hover:bg-amber-100 dark:hover:bg-zinc-800 disabled:opacity-50"
							>
								<ChevronLeft className="h-4 w-4" />
								<span className="hidden sm:inline ml-1">Trước</span>
							</Button>

							<div className="flex items-center gap-1">
								{getPageNumbers().map((page, index) => {
									if (page === '...') {
										return (
											<span key={`ellipsis-${index}`} className="px-2 text-amber-700 dark:text-zinc-400">
												...
											</span>
										);
									}
									return (
										<Button
											key={page}
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => goToPage(page as number)}
											className={
												currentPage === page
													? "bg-orange-500 dark:bg-violet-500 text-white hover:bg-orange-600 dark:hover:bg-violet-600"
													: "border-amber-300 dark:border-zinc-700 text-amber-900 dark:text-white hover:bg-amber-100 dark:hover:bg-zinc-800"
											}
										>
											{page}
										</Button>
									);
								})}
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={goToNextPage}
								disabled={currentPage === totalPages}
								className="border-amber-300 dark:border-zinc-700 text-amber-900 dark:text-white hover:bg-amber-100 dark:hover:bg-zinc-800 disabled:opacity-50"
							>
								<span className="hidden sm:inline mr-1">Sau</span>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}

					{/* Page info */}
					<div className="text-center text-sm text-amber-700 dark:text-zinc-400 mt-3">
						Trang {currentPage} / {totalPages} • Hiển thị {startIndex + 1}-{Math.min(endIndex, songs.length)} trong tổng số {songs.length} bài pháp
					</div>
				</CardContent>
			</Card>

			<AddToPlaylistDialog
				open={showAddToPlaylist}
				onOpenChange={setShowAddToPlaylist}
				songId={selectedSongId}
			/>
		</>
	);
};

export default SongsList;
