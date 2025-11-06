import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	teacher: string;
	album: string;
	category: string;
}

const AddSongDialog = () => {
	const { albums, teachers, categories, fetchSongs } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [keepFormData, setKeepFormData] = useState(false);

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		teacher: "",
		album: "",
		category: "",
	});

	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioDuration, setAudioDuration] = useState<number>(0);

	const audioInputRef = useRef<HTMLInputElement>(null);

	const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setAudioFile(file);

		// Calculate audio duration
		const audio = new Audio();
		const objectUrl = URL.createObjectURL(file);

		audio.src = objectUrl;

		audio.addEventListener('loadedmetadata', () => {
			const duration = Math.round(audio.duration);
			setAudioDuration(duration);
			URL.revokeObjectURL(objectUrl);
		});
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setUploadProgress(0);

		try {
			// Validation
			if (!audioFile) {
				return toast.error("Vui lòng tải lên file âm thanh");
			}

			if (!newSong.album) {
				return toast.error("Vui lòng chọn bộ kinh");
			}

			if (!newSong.teacher) {
				return toast.error("Vui lòng chọn pháp sư");
			}

			if (!newSong.category) {
				return toast.error("Vui lòng chọn chủ đề");
			}

			// File upload
			const formData = new FormData();

			formData.append("title", newSong.title);
			formData.append("teacher", newSong.teacher);
			formData.append("albumId", newSong.album);
			formData.append("category", newSong.category);
			formData.append("duration", audioDuration.toString());

			formData.append("audioFile", audioFile);

			await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const progress = progressEvent.total
						? Math.round((progressEvent.loaded * 100) / progressEvent.total)
						: 0;
					setUploadProgress(progress);
				},
			});

			// Refresh the songs list
			await fetchSongs();

			// Only reset form if keepFormData is false
			if (!keepFormData) {
				setNewSong({
					title: "",
					teacher: "",
					album: "",
					category: "",
				});

				setSongDialogOpen(false);
			}

			// Always reset audio file and progress
			setAudioFile(null);
			setAudioDuration(0);

			setUploadProgress(0);
			toast.success("Bài pháp đã được thêm thành công");
		} catch (error: any) {
			toast.error("Không thể thêm bài pháp: " + error.message);
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
		}
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Thêm Bài Pháp
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Thêm Bài Pháp Mới</DialogTitle>
					<DialogDescription>Thêm một bài pháp mới vào thư viện</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						onChange={handleAudioChange}
					/>

					{/* Audio upload */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>File Âm Thanh *</label>
						<div className='flex items-center gap-2'>
							<Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
								{audioFile ? audioFile.name.slice(0, 40) : "Chọn File Âm Thanh"}
							</Button>
						</div>
						{audioFile && (
							<div className='text-xs text-zinc-400 space-y-1'>
								<p>Đã chọn: {audioFile.name}</p>
								{audioDuration > 0 && (
									<p>Thời lượng: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}</p>
								)}
							</div>
						)}
					</div>

					{/* other fields */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Tên Bài Pháp</label>
						<Input
							value={newSong.title}
							onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Pháp Sư *</label>
						<Select
							value={newSong.teacher}
							onValueChange={(value) => setNewSong({ ...newSong, teacher: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Chọn pháp sư' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								{teachers.map((teacher) => (
									<SelectItem key={teacher._id} value={teacher._id}>
										{teacher.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Bộ Kinh *</label>
						<Select
							value={newSong.album}
							onValueChange={(value) => setNewSong({ ...newSong, album: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Chọn bộ kinh' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Chủ Đề *</label>
						<Select
							value={newSong.category}
							onValueChange={(value) => setNewSong({ ...newSong, category: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Chọn chủ đề' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								{categories.map((category) => (
									<SelectItem key={category._id} value={category._id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Upload Progress */}
					{isLoading && uploadProgress > 0 && (
						<div className='space-y-2'>
							<div className='flex justify-between text-sm'>
								<span className='text-zinc-400'>Đang tải lên...</span>
								<span className='text-emerald-400'>{uploadProgress}%</span>
							</div>
							<div className='w-full bg-zinc-800 rounded-full h-2 overflow-hidden'>
								<div
									className='bg-emerald-500 h-full transition-all duration-300 ease-out'
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}

					{/* Keep Form Data Checkbox */}
					<div className='flex items-center space-x-2 pt-2'>
						<Checkbox
							id='keepFormData'
							checked={keepFormData}
							onCheckedChange={(checked) => setKeepFormData(checked as boolean)}
							className='border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
						/>
						<label
							htmlFor='keepFormData'
							className='text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
						>
							Giữ thông tin form để thêm tiếp bài pháp mới
						</label>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? `Đang tải lên... ${uploadProgress}%` : "Thêm Bài Pháp"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddSongDialog;
