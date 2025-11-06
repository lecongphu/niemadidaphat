import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getName, getOptimizedImageUrl, formatDuration } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Download, ListPlus, Music2, Pause, Play, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddToPlaylistDialog } from "@/pages/playlist/components/AddToPlaylistDialog";
import { Song } from "@/types";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import PlayingIndicator from "@/components/PlayingIndicator";
import SEO from "@/components/SEO";

const SongDetailPage = () => {
	const { songId } = useParams();
	const navigate = useNavigate();
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const { isAuthenticated } = useAuthStore();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
	const [song, setSong] = useState<Song | null>(null);
	const [similarSongs, setSimilarSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (songId) {
			fetchSongDetail(songId);
		}
	}, [songId]);

	const fetchSongDetail = async (id: string) => {
		try {
			setIsLoading(true);
			const response = await axiosInstance.get(`/songs/${id}`);
			setSong(response.data.song);
			setSimilarSongs(response.data.similarSongs || []);
		} catch (error: any) {
			console.error("Error fetching song detail:", error);
			toast.error("Không thể tải thông tin bài pháp");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePlaySong = () => {
		if (!song) return;

		if (currentSong?._id === song._id) {
			togglePlay();
		} else {
			setCurrentSong(song);
		}
	};

	const handlePlaySimilarSong = (similarSong: Song) => {
		setCurrentSong(similarSong);
	};

	const handleDownload = async () => {
		if (!song) return;

		try {
			toast.loading("Đang chuẩn bị tải xuống...");

			const response = await fetch(song.audioUrl);
			const blob = await response.blob();

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${song.title} - ${getName(song.teacher)}.mp3`;

			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.dismiss();
			toast.success("Đã tải xuống bài pháp");
		} catch (error) {
			console.error("Error downloading audio:", error);
			toast.dismiss();
			toast.error("Không thể tải xuống bài pháp");
		}
	};

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-zinc-400">Đang tải...</div>
			</div>
		);
	}

	if (!song) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-zinc-400">Không tìm thấy bài pháp</div>
			</div>
		);
	}

	const isCurrentSong = currentSong?._id === song._id;

	// SEO data
	const teacherName = getName(song.teacher);
	const categoryName = getName(song.category);
	const description = `Nghe bài pháp "${song.title}" của ${teacherName}. Chủ đề: ${categoryName}. Thời lượng: ${formatDuration(song.duration)}. Niệm A Di Đà Phật - Thư viện bài pháp Phật giáo online.`;

	return (
		<div className="h-full">
			<SEO
				title={`${song.title} - ${teacherName}`}
				description={description}
				type="music.song"
				image={song.imageUrl}
				url={`/songs/${song._id}`}
				keywords={[song.title, teacherName, categoryName, "bài pháp", "phật pháp audio"]}
				author={teacherName}
				publishedTime={song.createdAt}
				modifiedTime={song.updatedAt}
			/>
			<ScrollArea className="h-full rounded-md">
				<div className="relative min-h-full">
					{/* Background gradient */}
					<div
						className="absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80 to-zinc-900 pointer-events-none"
						aria-hidden="true"
					/>

					{/* Content */}
					<div className="relative z-10">
						{/* Back button */}
						<div className="p-4 sm:p-6">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate(-1)}
								className="text-zinc-400 hover:text-white"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Quay lại
							</Button>
						</div>

						{/* Song header */}
						<div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-6 pb-8">
							<div className="relative group mx-auto sm:mx-0">
								<img
									src={getOptimizedImageUrl(song.imageUrl)}
									alt={song.title}
									className="w-full sm:w-[280px] h-auto sm:h-[280px] shadow-2xl rounded"
								/>
								{/* Play button overlay */}
								<div
									className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded"
									onClick={handlePlaySong}
								>
									{isCurrentSong && isPlaying ? (
										<div className="bg-green-500 rounded-full p-4 hover:scale-105 transition-transform">
											<Pause className="h-8 w-8 text-black" />
										</div>
									) : (
										<div className="bg-green-500 rounded-full p-4 hover:scale-105 transition-transform">
											<Play className="h-8 w-8 text-black" />
										</div>
									)}
								</div>
							</div>

							<div className="flex flex-col justify-end text-center sm:text-left">
								<p className="text-sm font-medium mb-2">Bài Pháp</p>
								<h1 className="text-4xl sm:text-6xl md:text-7xl font-bold my-4">{song.title}</h1>

								{/* Song metadata */}
								<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-zinc-100 mb-4">
									<div className="flex items-center gap-2">
										<User className="h-4 w-4" />
										<span className="font-medium text-white">{getName(song.teacher)}</span>
									</div>
									<span>•</span>
									<div className="flex items-center gap-2">
										<Music2 className="h-4 w-4" />
										<span>{getName(song.category)}</span>
									</div>
									<span>•</span>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										<span>{formatDuration(song.duration)}</span>
									</div>
								</div>

								<div className="flex items-center gap-2 text-xs text-zinc-400 justify-center sm:justify-start">
									<Calendar className="h-3 w-3" />
									<span>Phát hành: {song.createdAt.split("T")[0]}</span>
								</div>
							</div>
						</div>

						{/* Action buttons */}
						<div className="px-4 sm:px-6 pb-8 flex items-center gap-4 flex-wrap justify-center sm:justify-start">
							<Button
								onClick={handlePlaySong}
								size="lg"
								className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full px-8 hover:scale-105 transition-all"
							>
								{isCurrentSong && isPlaying ? (
									<>
										<Pause className="h-5 w-5 mr-2" />
										Tạm dừng
									</>
								) : (
									<>
										<Play className="h-5 w-5 mr-2" />
										Phát
									</>
								)}
							</Button>

							{isAuthenticated && (
								<Button
									variant="outline"
									size="lg"
									onClick={() => setShowAddToPlaylist(true)}
									className="rounded-full"
								>
									<ListPlus className="h-5 w-5 mr-2" />
									Thêm vào playlist
								</Button>
							)}

							<Button
								variant="outline"
								size="lg"
								onClick={handleDownload}
								className="rounded-full"
							>
								<Download className="h-5 w-5 mr-2" />
								Tải xuống
							</Button>
						</div>

						{/* Similar songs section */}
						{similarSongs.length > 0 && (
							<div className="px-4 sm:px-6 pb-8">
								<h2 className="text-2xl font-bold mb-6">Bài pháp tương tự</h2>

								<div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
									<div className="space-y-2">
										{similarSongs.map((similarSong, index) => {
											const isCurrent = currentSong?._id === similarSong._id;
											return (
												<div
													key={similarSong._id}
													className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 hover:bg-white/5 rounded-md group cursor-pointer"
													onClick={() => handlePlaySimilarSong(similarSong)}
												>
													{/* Play button / index */}
													<div className="flex items-center justify-center w-8">
														{isCurrent && isPlaying ? (
															<PlayingIndicator />
														) : (
															<>
																<span className="group-hover:hidden text-zinc-400">
																	{index + 1}
																</span>
																<Play className="h-4 w-4 hidden group-hover:block" />
															</>
														)}
													</div>

													{/* Song info */}
													<div className="flex items-center gap-3 min-w-0">
														<img
															src={getOptimizedImageUrl(similarSong.imageUrl)}
															alt={similarSong.title}
															className="w-12 h-12 rounded flex-shrink-0"
														/>
														<div className="min-w-0">
															<div className="font-medium text-white truncate">
																{similarSong.title}
															</div>
															<div className="text-sm text-zinc-400 truncate">
																{getName(similarSong.teacher)}
															</div>
														</div>
													</div>

													{/* Category - hidden on mobile */}
													<div className="hidden sm:flex items-center text-sm text-zinc-400">
														{getName(similarSong.category)}
													</div>

													{/* Duration */}
													<div className="flex items-center text-sm text-zinc-400">
														{formatDuration(similarSong.duration)}
													</div>

													{/* Add to playlist button */}
													<div className="flex items-center">
														{isAuthenticated && (
															<Button
																size="icon"
																variant="ghost"
																className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
																onClick={(e) => {
																	e.stopPropagation();
																	setShowAddToPlaylist(true);
																}}
																title="Thêm vào playlist"
															>
																<ListPlus className="h-4 w-4" />
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
				songId={song._id}
			/>
		</div>
	);
};

export default SongDetailPage;
