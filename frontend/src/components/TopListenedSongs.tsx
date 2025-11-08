import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Play, Headphones, RefreshCw } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";

interface TopSong {
	_id: string;
	title: string;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	listens: number;
	teacher: {
		_id: string;
		name: string;
	};
	album: {
		_id: string;
		title: string;
	} | null;
}

const TopListenedSongs = () => {
	const [topSongs, setTopSongs] = useState<TopSong[]>([]);
	const [loading, setLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { initializeQueue, playAlbum, currentSong, isPlaying, togglePlay } = usePlayerStore();

	// Socket.IO realtime updates - replace polling
	useSocket({
		onListeningStatsUpdated: () => {
			console.log("Top songs updated via Socket.IO");
			fetchTopSongs(true); // Silent refresh when socket event received
		},
	});

	useEffect(() => {
		fetchTopSongs();
	}, []);

	const fetchTopSongs = async (silent: boolean = false) => {
		try {
			if (!silent) {
				setLoading(true);
			} else {
				setIsRefreshing(true);
			}
			const response = await axiosInstance.get("/listening/top?limit=10");
			setTopSongs(response.data);
		} catch (error) {
			console.error("Error fetching top songs:", error);
		} finally {
			setLoading(false);
			setIsRefreshing(false);
		}
	};

	const handleManualRefresh = () => {
		fetchTopSongs(true);
	};

	const handlePlaySong = (song: TopSong, index: number) => {
		if (currentSong?._id === song._id) {
			togglePlay();
		} else {
			// Play this song and set queue to rest of top songs
			const queue = topSongs.map((s) => ({
				...s,
				category: { _id: "", name: "" },
				albumId: s.album?._id || null,
				order: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}));
			initializeQueue(queue);
			playAlbum(queue, index);
		}
	};

	if (loading) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-emerald-500" />
						<CardTitle>Top 10 Bài Pháp Được Nghe Nhiều Nhất</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center text-zinc-400 py-8">Đang tải...</div>
				</CardContent>
			</Card>
		);
	}

	if (topSongs.length === 0) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-emerald-500" />
						<CardTitle>Top 10 Bài Pháp Được Nghe Nhiều Nhất</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center text-zinc-400 py-8">Chưa có dữ liệu</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-zinc-900/50 border-zinc-800">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-emerald-500" />
						<CardTitle>Top 10 Bài Pháp Được Nghe Nhiều Nhất</CardTitle>
						<div className="flex items-center gap-2 ml-3">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							<span className="text-xs font-medium text-emerald-500">LIVE</span>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleManualRefresh}
						disabled={isRefreshing}
						className="h-8 w-8"
					>
						<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{topSongs.map((song, index) => {
						const isCurrentSong = currentSong?._id === song._id;
						const isPlaying_current = isCurrentSong && isPlaying;

						return (
							<div
								key={song._id}
								className={`group flex items-center gap-4 p-3 rounded-lg transition-all ${
									isCurrentSong
										? "bg-emerald-500/10 border border-emerald-500/20"
										: "hover:bg-zinc-800/50"
								}`}
							>
								{/* Rank Number */}
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg ${
										index === 0
											? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
											: index === 1
											? "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
											: index === 2
											? "bg-gradient-to-br from-orange-400 to-orange-600 text-black"
											: "bg-zinc-800 text-zinc-400"
									}`}
								>
									{index + 1}
								</div>

								{/* Album Art */}
								<div className="relative w-14 h-14 flex-shrink-0">
									<img
										src={getOptimizedImageUrl(song.imageUrl)}
										alt={song.title}
										className="w-full h-full rounded-md object-cover"
									/>
									<Button
										size="icon"
										variant="ghost"
										className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={() => handlePlaySong(song, index)}
									>
										<Play
											className={`h-6 w-6 ${isPlaying_current ? "hidden" : "block"}`}
											fill="white"
										/>
										{isPlaying_current && (
											<div className="flex gap-1">
												<div className="w-1 h-4 bg-white animate-pulse"></div>
												<div
													className="w-1 h-4 bg-white animate-pulse"
													style={{ animationDelay: "0.2s" }}
												></div>
												<div
													className="w-1 h-4 bg-white animate-pulse"
													style={{ animationDelay: "0.4s" }}
												></div>
											</div>
										)}
									</Button>
								</div>

								{/* Song Info */}
								<div className="flex-1 min-w-0">
									<div
										className={`font-medium ${
											isCurrentSong ? "text-emerald-500" : "text-white"
										}`}
									>
										{song.title}
									</div>
									<div className="text-sm text-zinc-400">{song.teacher.name}</div>
								</div>

								{/* Listen Count */}
								<div className="flex items-center gap-2 text-sm text-zinc-400">
									<Headphones className="h-4 w-4" />
									<span className="font-medium">{song.listens.toLocaleString()}</span>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};

export default TopListenedSongs;
