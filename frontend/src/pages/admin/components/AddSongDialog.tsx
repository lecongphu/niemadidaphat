import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload, X, Music, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	artist: string;
	album: string;
	duration: string;
}

interface UploadProgress {
	percentage: number;
	status: 'idle' | 'uploading' | 'success' | 'error';
}

const MAX_FILE_SIZE = {
	audio: 500 * 1024 * 1024, // 500MB
	image: 10 * 1024 * 1024,  // 10MB
};

const ALLOWED_FORMATS = {
	audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a'],
	image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

const AddSongDialog = () => {
	const { albums, fetchAlbums } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
		percentage: 0,
		status: 'idle'
	});

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		album: "",
		duration: "0",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const [previews, setPreviews] = useState<{ audio: string | null; image: string | null }>({
		audio: null,
		image: null,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	// Validate file size and format
	const validateFile = (file: File, type: 'audio' | 'image'): string | null => {
		if (file.size > MAX_FILE_SIZE[type]) {
			const maxSizeMB = MAX_FILE_SIZE[type] / (1024 * 1024);
			return `File quá lớn. Giới hạn ${maxSizeMB}MB`;
		}

		if (!ALLOWED_FORMATS[type].includes(file.type)) {
			return `Định dạng không hợp lệ. Chỉ chấp nhận: ${ALLOWED_FORMATS[type].join(', ')}`;
		}

		return null;
	};

	const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file
		const error = validateFile(file, 'audio');
		if (error) {
			setErrors(prev => ({ ...prev, audio: error }));
			toast.error(error);
			return;
		}

		setErrors(prev => ({ ...prev, audio: '' }));
		setFiles((prev) => ({ ...prev, audio: file }));

		// Tạo preview URL
		const audioUrl = URL.createObjectURL(file);
		setPreviews((prev) => ({ ...prev, audio: audioUrl }));

		// Tính duration tự động và extract metadata
		const audio = new Audio();
		audio.src = audioUrl;

		audio.addEventListener("loadedmetadata", () => {
			const durationInSeconds = Math.floor(audio.duration);
			setNewSong((prev) => ({ 
				...prev, 
				duration: durationInSeconds.toString(),
				// Auto-fill title from filename if empty
				title: prev.title || file.name.replace(/\.[^/.]+$/, "")
			}));
		});

		audio.addEventListener("error", () => {
			setErrors(prev => ({ ...prev, audio: 'Không thể đọc file audio' }));
			toast.error('File audio không hợp lệ');
		});
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file
		const error = validateFile(file, 'image');
		if (error) {
			setErrors(prev => ({ ...prev, image: error }));
			toast.error(error);
			return;
		}

		setErrors(prev => ({ ...prev, image: '' }));
		setFiles((prev) => ({ ...prev, image: file }));

		// Tạo preview URL
		const imageUrl = URL.createObjectURL(file);
		setPreviews((prev) => ({ ...prev, image: imageUrl }));
	};

	// Cleanup previews on unmount
	useEffect(() => {
		return () => {
			if (previews.audio) URL.revokeObjectURL(previews.audio);
			if (previews.image) URL.revokeObjectURL(previews.image);
		};
	}, [previews.audio, previews.image]);

	// Validate form
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!newSong.title.trim()) {
			newErrors.title = 'Vui lòng nhập tên bài hát';
		}

		if (!newSong.artist.trim()) {
			newErrors.artist = 'Vui lòng nhập tên nghệ sĩ';
		}

		if (!files.audio) {
			newErrors.audio = 'Vui lòng chọn file audio';
		}

		if (!files.image) {
			newErrors.image = 'Vui lòng chọn ảnh bìa';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			toast.error('Vui lòng điền đầy đủ thông tin');
			return false;
		}

		return true;
	};

	const resetForm = () => {
		setNewSong({
			title: "",
			artist: "",
			album: "",
			duration: "0",
		});

		setFiles({
			audio: null,
			image: null,
		});

		// Cleanup previews
		if (previews.audio) URL.revokeObjectURL(previews.audio);
		if (previews.image) URL.revokeObjectURL(previews.image);
		
		setPreviews({
			audio: null,
			image: null,
		});

		setErrors({});
		setUploadProgress({ percentage: 0, status: 'idle' });

		// Reset file inputs
		if (audioInputRef.current) audioInputRef.current.value = '';
		if (imageInputRef.current) imageInputRef.current.value = '';
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		setUploadProgress({ percentage: 0, status: 'uploading' });

		try {
			const formData = new FormData();

			formData.append("title", newSong.title.trim());
			formData.append("artist", newSong.artist.trim());
			formData.append("duration", newSong.duration);
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}

			formData.append("audioFile", files.audio!);
			formData.append("imageFile", files.image!);

			await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const percentage = progressEvent.total 
						? Math.round((progressEvent.loaded * 100) / progressEvent.total)
						: 0;
					setUploadProgress({ percentage, status: 'uploading' });
				}
			});

			setUploadProgress({ percentage: 100, status: 'success' });
			toast.success("Thêm bài hát thành công! 🎵");
			
			// Refresh albums list
			await fetchAlbums();
			
			// Reset form and close dialog after a short delay
			setTimeout(() => {
				resetForm();
				setSongDialogOpen(false);
			}, 1500);

		} catch (error: any) {
			setUploadProgress({ percentage: 0, status: 'error' });
			console.error('Upload error:', error);
			
			const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
			toast.error("Thêm bài hát thất bại: " + errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const removeFile = (type: 'audio' | 'image') => {
		if (type === 'audio') {
			if (previews.audio) URL.revokeObjectURL(previews.audio);
			setFiles(prev => ({ ...prev, audio: null }));
			setPreviews(prev => ({ ...prev, audio: null }));
			if (audioInputRef.current) audioInputRef.current.value = '';
		} else {
			if (previews.image) URL.revokeObjectURL(previews.image);
			setFiles(prev => ({ ...prev, image: null }));
			setPreviews(prev => ({ ...prev, image: null }));
			if (imageInputRef.current) imageInputRef.current.value = '';
		}
		setErrors(prev => ({ ...prev, [type]: '' }));
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	};

	const formatDuration = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={(open) => {
			if (!open && !isLoading) {
				resetForm();
			}
			setSongDialogOpen(open);
		}}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Song
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[85vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Add New Song</DialogTitle>
					<DialogDescription>
						Upload a new song to your music library (Max: 500MB audio, 10MB image)
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*,.mp3,.wav,.ogg,.m4a,.flac'
						ref={audioInputRef}
						hidden
						onChange={handleAudioChange}
						disabled={isLoading}
					/>

					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*,.jpg,.jpeg,.png,.webp'
						onChange={handleImageChange}
						disabled={isLoading}
					/>

					{/* Image Upload Area with Preview */}
					<div className='space-y-2'>
						<label className='text-sm font-medium flex items-center gap-2'>
							<ImageIcon className='h-4 w-4' />
							Ảnh bìa <span className='text-red-500'>*</span>
						</label>
						<div
							className={`relative flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
								errors.image 
									? 'border-red-500 bg-red-500/5' 
									: previews.image 
									? 'border-emerald-500 bg-emerald-500/5' 
									: 'border-zinc-700 hover:border-zinc-600'
							}`}
							onClick={() => !isLoading && imageInputRef.current?.click()}
						>
							{previews.image ? (
								<div className='relative w-full'>
									<img 
										src={previews.image} 
										alt="Preview" 
										className='w-full h-48 object-cover rounded-lg'
									/>
									<Button
										variant='destructive'
										size='sm'
										className='absolute top-2 right-2'
										onClick={(e) => {
											e.stopPropagation();
											removeFile('image');
										}}
										disabled={isLoading}
									>
										<X className='h-4 w-4' />
									</Button>
									<div className='mt-2 text-center'>
										<div className='text-xs text-emerald-500 font-medium'>{files.image?.name}</div>
										<div className='text-xs text-zinc-500'>{files.image && formatFileSize(files.image.size)}</div>
									</div>
								</div>
							) : (
								<div className='text-center'>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Click để chọn ảnh bìa</div>
									<div className='text-xs text-zinc-500'>JPG, PNG, WebP (Max 10MB)</div>
								</div>
							)}
						</div>
						{errors.image && <p className='text-xs text-red-500 flex items-center gap-1'>⚠️ {errors.image}</p>}
					</div>

					{/* Audio Upload with Preview */}
					<div className='space-y-2'>
						<label className='text-sm font-medium flex items-center gap-2'>
							<Music className='h-4 w-4' />
							File audio <span className='text-red-500'>*</span>
						</label>
						{files.audio ? (
							<div className='p-4 bg-zinc-800 rounded-lg space-y-3'>
								<div className='flex items-center justify-between'>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium truncate'>{files.audio.name}</p>
										<p className='text-xs text-zinc-500'>
											{formatFileSize(files.audio.size)} • {formatDuration(parseInt(newSong.duration) || 0)}
										</p>
									</div>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => removeFile('audio')}
										disabled={isLoading}
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
								{previews.audio && (
									<audio 
										src={previews.audio} 
										controls 
										className='w-full h-8'
										style={{ accentColor: '#10b981' }}
									/>
								)}
							</div>
						) : (
							<Button 
								variant='outline' 
								onClick={() => audioInputRef.current?.click()} 
								className='w-full h-20 border-dashed'
								disabled={isLoading}
							>
								<div className='text-center'>
									<Music className='h-6 w-6 mx-auto mb-1 text-zinc-400' />
									<p className='text-sm'>Click để chọn file audio</p>
									<p className='text-xs text-zinc-500'>MP3, WAV, OGG, FLAC (Max 500MB)</p>
								</div>
							</Button>
						)}
						{errors.audio && <p className='text-xs text-red-500 flex items-center gap-1'>⚠️ {errors.audio}</p>}
					</div>

					{/* Title Input */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>
							Tên bài hát <span className='text-red-500'>*</span>
						</label>
						<Input
							value={newSong.title}
							onChange={(e) => {
								setNewSong({ ...newSong, title: e.target.value });
								if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
							}}
							className={`bg-zinc-800 border-zinc-700 ${errors.title ? 'border-red-500' : ''}`}
							placeholder='Nhập tên bài hát...'
							disabled={isLoading}
						/>
						{errors.title && <p className='text-xs text-red-500'>⚠️ {errors.title}</p>}
					</div>

					{/* Artist Input */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>
							Nghệ sĩ <span className='text-red-500'>*</span>
						</label>
						<Input
							value={newSong.artist}
							onChange={(e) => {
								setNewSong({ ...newSong, artist: e.target.value });
								if (errors.artist) setErrors(prev => ({ ...prev, artist: '' }));
							}}
							className={`bg-zinc-800 border-zinc-700 ${errors.artist ? 'border-red-500' : ''}`}
							placeholder='Nhập tên nghệ sĩ...'
							disabled={isLoading}
						/>
						{errors.artist && <p className='text-xs text-red-500'>⚠️ {errors.artist}</p>}
					</div>

					{/* Duration Display */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>
							Thời lượng
							<span className='text-xs text-emerald-500 ml-2'>✓ Tự động tính</span>
						</label>
						<div className='flex gap-2'>
							<Input
								type='text'
								value={formatDuration(parseInt(newSong.duration) || 0)}
								readOnly
								className='bg-zinc-800 border-zinc-700 text-zinc-400 flex-1'
								placeholder='0:00'
							/>
							<Input
								type='number'
								min='0'
								value={newSong.duration}
								onChange={(e) => setNewSong({ ...newSong, duration: e.target.value || "0" })}
								className='bg-zinc-800 border-zinc-700 w-24'
								placeholder='0'
								disabled={isLoading}
								title='Seconds'
							/>
						</div>
					</div>

					{/* Album Select */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Tùy chọn)</label>
						<Select
							value={newSong.album}
							onValueChange={(value) => setNewSong({ ...newSong, album: value })}
							disabled={isLoading}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Chọn album hoặc để trống' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>🎵 Single (Không thuộc album)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Upload Progress */}
					{uploadProgress.status === 'uploading' && (
						<div className='space-y-2 p-4 bg-zinc-800 rounded-lg'>
							<div className='flex items-center justify-between text-sm'>
								<span className='text-zinc-400'>Đang upload...</span>
								<span className='text-emerald-500 font-medium'>{uploadProgress.percentage}%</span>
							</div>
							<div className='w-full bg-zinc-700 rounded-full h-2 overflow-hidden'>
								<div 
									className='bg-emerald-500 h-full transition-all duration-300 ease-out'
									style={{ width: `${uploadProgress.percentage}%` }}
								/>
							</div>
						</div>
					)}

					{uploadProgress.status === 'success' && (
						<div className='flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-500 text-sm'>
							<CheckCircle2 className='h-5 w-5' />
							<span>Upload thành công! Đang xử lý...</span>
						</div>
					)}
				</div>

				<DialogFooter className='gap-2'>
					<Button 
						variant='outline' 
						onClick={() => {
							if (!isLoading) {
								resetForm();
								setSongDialogOpen(false);
							}
						}} 
						disabled={isLoading}
					>
						Hủy
					</Button>
					<Button 
						onClick={handleSubmit} 
						disabled={isLoading || uploadProgress.status === 'uploading'}
						className='bg-emerald-500 hover:bg-emerald-600 text-black'
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang upload...
							</>
						) : (
							<>
								<Plus className='mr-2 h-4 w-4' />
								Thêm bài hát
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddSongDialog;
