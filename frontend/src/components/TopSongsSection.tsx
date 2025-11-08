import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { Song } from "@/types";
import { getOptimizedImageUrl, getName } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Pause } from "lucide-react";

interface TopSong extends Song {
	listens: number;
}

// Inline PlayButton component for list view
const InlinePlayButton = ({ song }: { song: TopSong }) => {
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const isCurrentSong = currentSong?._id === song._id;

	const handlePlay = () => {
		if (isCurrentSong) togglePlay();
		else setCurrentSong(song);
	};

	return (
		<Button
			size="icon"
			onClick={handlePlay}
			className="bg-green-500 hover:bg-green-400 text-black h-9 w-9"
		>
			{isCurrentSong && isPlaying ? (
				<Pause className="h-4 w-4" />
			) : (
				<Play className="h-4 w-4" />
			)}
		</Button>
	);
};

const TopSongsSection = () => {
	const [topSongs, setTopSongs] = useState<TopSong[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { currentSong } = usePlayerStore();

	useEffect(() => {
		const fetchTopSongs = async () => {
			try {
				const response = await axiosInstance.get("/listening/top-songs?limit=10");
				setTopSongs(response.data);
			} catch (error) {
				console.error("Error fetching top songs:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTopSongs();
	}, []);

	if (isLoading) {
		return (
			<section className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl sm:text-2xl font-bold flex items-center gap-2'>
						<Headphones className='h-6 w-6 text-violet-400' />
						Top 10 Bài Pháp Được Nghe Nhiều Nhất
					</h2>
				</div>
				<div className='space-y-2'>
					{[...Array(10)].map((_, i) => (
						<div
							key={i}
							className='h-16 bg-zinc-800/50 rounded-md animate-pulse'
						/>
					))}
				</div>
			</section>
		);
	}

	if (!topSongs.length) {
		return (
			<section className='space-y-4'>
				<h2 className='text-xl sm:text-2xl font-bold flex items-center gap-2'>
					<Headphones className='h-6 w-6 text-violet-400' />
					Top 10 Bài Pháp Được Nghe Nhiều Nhất
				</h2>
				<div className='text-center py-8 text-zinc-400'>
					Chưa có dữ liệu thống kê
				</div>
			</section>
		);
	}

	return (
		<section className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl sm:text-2xl font-bold flex items-center gap-2'>
					<Headphones className='h-6 w-6 text-violet-400' />
					Top 10 Bài Pháp Được Nghe Nhiều Nhất
				</h2>
			</div>

			{/* Desktop: Table View */}
			<div className='hidden md:block bg-zinc-900/50 rounded-lg overflow-hidden'>
				<div className='grid grid-cols-[50px_1fr_200px_100px_80px] gap-4 p-3 text-sm text-zinc-400 border-b border-zinc-800'>
					<div className='text-center'>#</div>
					<div>Bài Pháp</div>
					<div>Pháp Sư</div>
					<div className='text-center'>Lượt Nghe</div>
					<div></div>
				</div>
				<div>
					{topSongs.map((song, index) => {
						const isCurrentSong = currentSong?._id === song._id;
						return (
							<div
								key={song._id}
								className={`grid grid-cols-[50px_1fr_200px_100px_80px] gap-4 p-3 items-center hover:bg-zinc-800/50 transition-colors group ${
									isCurrentSong ? 'bg-violet-500/10' : ''
								}`}
							>
								<div className='text-center text-zinc-400 font-bold text-lg'>
									{index + 1}
								</div>
								<div className='flex items-center gap-3 min-w-0'>
									<img
										src={getOptimizedImageUrl(song.imageUrl)}
										alt={song.title}
										className='w-12 h-12 rounded object-cover'
									/>
									<div className='flex-1 min-w-0'>
										<h3 className={`font-medium truncate ${isCurrentSong ? 'text-violet-400' : 'text-white'}`}>
											{song.title}
										</h3>
									</div>
								</div>
								<div className='text-zinc-400 truncate'>
									{getName(song.teacher)}
								</div>
								<div className='text-center text-zinc-400'>
									{song.listens.toLocaleString()}
								</div>
								<div className='flex justify-end'>
									<InlinePlayButton song={song} />
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Mobile: Card View */}
			<div className='md:hidden space-y-2'>
				{topSongs.map((song, index) => {
					const isCurrentSong = currentSong?._id === song._id;
					return (
						<div
							key={song._id}
							className={`bg-zinc-900/50 rounded-lg p-3 hover:bg-zinc-800/50 transition-colors ${
								isCurrentSong ? 'bg-violet-500/10' : ''
							}`}
						>
							<div className='flex items-center gap-3'>
								<div className='text-2xl font-bold text-zinc-600 w-8 text-center flex-shrink-0'>
									{index + 1}
								</div>
								<img
									src={getOptimizedImageUrl(song.imageUrl)}
									alt={song.title}
									className='w-14 h-14 rounded object-cover flex-shrink-0'
								/>
								<div className='flex-1 min-w-0'>
									<h3 className={`font-medium truncate text-sm ${isCurrentSong ? 'text-violet-400' : 'text-white'}`}>
										{song.title}
									</h3>
									<p className='text-xs text-zinc-400 truncate'>
										{getName(song.teacher)}
									</p>
									<div className='flex items-center gap-1 mt-1 text-xs text-zinc-500'>
										<Headphones className='h-3 w-3' />
										{song.listens.toLocaleString()} lượt nghe
									</div>
								</div>
								<div className='flex-shrink-0'>
									<InlinePlayButton song={song} />
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default TopSongsSection;
