import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getName, getOptimizedImageUrl } from "@/lib/utils";
import { Download, Laptop2, ListMusic, Mic2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious, repeatMode, toggleRepeatMode, isShuffled, toggleShuffle } = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(false);
	const [previousVolume, setPreviousVolume] = useState(75);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => {
			if (audio && !isNaN(audio.currentTime)) {
				setCurrentTime(audio.currentTime);
			}
		};

		const updateDuration = () => {
			if (audio && !isNaN(audio.duration)) {
				setDuration(audio.duration);
			}
		};

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			const { repeatMode, playNext: storePlayNext } = usePlayerStore.getState();

			if (repeatMode === "one") {
				// Repeat current song
				if (audio && audio.currentTime !== undefined) {
					audio.currentTime = 0;
					audio.play().catch((error) => {
						if (error.name !== 'AbortError') {
							console.error('Error repeating audio:', error);
						}
					});
				}
			} else {
				// Play next song (will handle repeat all in playNext)
				storePlayNext();
			}
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			// Safely remove event listeners even if audio element was removed
			if (audio) {
				audio.removeEventListener("timeupdate", updateTime);
				audio.removeEventListener("loadedmetadata", updateDuration);
				audio.removeEventListener("ended", handleEnded);
			}
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	const toggleMute = () => {
		if (!audioRef.current) return;

		if (isMuted) {
			// Unmute: restore previous volume
			const volumeToRestore = previousVolume > 0 ? previousVolume : 75;
			setVolume(volumeToRestore);
			audioRef.current.volume = volumeToRestore / 100;
			setIsMuted(false);
		} else {
			// Mute: save current volume and set to 0
			setPreviousVolume(volume);
			setVolume(0);
			audioRef.current.volume = 0;
			setIsMuted(true);
		}
	};

	const handleDownload = async () => {
		if (!currentSong) return;

		try {
			toast.loading("Đang chuẩn bị tải xuống...");

			// Fetch the audio file
			const response = await fetch(currentSong.audioUrl);
			const blob = await response.blob();

			// Create a download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${currentSong.title} - ${getName(currentSong.teacher)}.mp3`;

			// Trigger download
			document.body.appendChild(link);
			link.click();

			// Cleanup
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

	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={getOptimizedImageUrl(currentSong.imageUrl)}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate hover:underline cursor-pointer'>
									{currentSong.title}
								</div>
								<div className='text-sm text-zinc-400 truncate hover:underline cursor-pointer'>
									{getName(currentSong.teacher)}
								</div>
							</div>
							<Button
								size='icon'
								variant='ghost'
								className='hover:text-white text-zinc-400 hover:bg-zinc-800 shrink-0'
								onClick={handleDownload}
								title='Tải xuống bài pháp'
							>
								<Download className='h-5 w-5' />
							</Button>
						</>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex items-center gap-2 sm:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className={`hover:text-white ${
								isShuffled ? "text-green-500" : "text-zinc-400"
							}`}
							onClick={toggleShuffle}
							disabled={!currentSong}
							title={isShuffled ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
						>
							<Shuffle className='h-3 w-3 sm:h-4 sm:w-4' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className={`hover:text-white ${
								repeatMode !== "off" ? "text-green-500" : "text-zinc-400"
							}`}
							onClick={toggleRepeatMode}
							title={
								repeatMode === "off" ? "Tắt lặp lại" :
								repeatMode === "all" ? "Lặp lại tất cả" :
								"Lặp lại một bài"
							}
						>
							{repeatMode === "one" ? (
								<Repeat1 className='h-3 w-3 sm:h-4 sm:w-4' />
							) : (
								<Repeat className='h-3 w-3 sm:h-4 sm:w-4' />
							)}
						</Button>
					</div>

					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>
				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Mic2 className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<ListMusic className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Laptop2 className='h-4 w-4' />
					</Button>

					<div className='flex items-center gap-2'>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={toggleMute}
							title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
						>
							{isMuted || volume === 0 ? (
								<VolumeX className='h-4 w-4' />
							) : volume < 50 ? (
								<Volume1 className='h-4 w-4' />
							) : (
								<Volume2 className='h-4 w-4' />
							)}
						</Button>

						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={(value) => {
								const newVolume = value[0];
								setVolume(newVolume);
								if (audioRef.current) {
									audioRef.current.volume = newVolume / 100;
								}
								// Unmute if user manually adjusts volume
								if (newVolume > 0 && isMuted) {
									setIsMuted(false);
								}
								// Set muted if volume is dragged to 0
								if (newVolume === 0 && !isMuted) {
									setIsMuted(true);
								}
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
