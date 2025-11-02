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
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	teacher: string;
	album: string;
	duration: string;
	category: string;
}

const AddSongDialog = () => {
	const { albums, teachers, categories } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		teacher: "",
		album: "",
		duration: "0",
		category: "",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setFiles((prev) => ({ ...prev, audio: file }));

		// Calculate audio duration
		const audio = new Audio();
		audio.src = URL.createObjectURL(file);

		audio.addEventListener("loadedmetadata", () => {
			const durationInSeconds = Math.floor(audio.duration);
			setNewSong((prev) => ({ ...prev, duration: durationInSeconds.toString() }));
			URL.revokeObjectURL(audio.src); // Clean up
		});
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setUploadProgress(0);

		try {
			if (!files.audio || !files.image) {
				return toast.error("Vui lòng tải lên cả file âm thanh và hình ảnh");
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

			const formData = new FormData();

			formData.append("title", newSong.title);
			formData.append("teacher", newSong.teacher);
			formData.append("duration", newSong.duration);
			formData.append("albumId", newSong.album);
			formData.append("category", newSong.category);

			formData.append("audioFile", files.audio);
			formData.append("imageFile", files.image);

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

			setNewSong({
				title: "",
				teacher: "",
				album: "",
				duration: "0",
				category: "",
			});

			setFiles({
				audio: null,
				image: null,
			});
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

					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files![0] }))}
					/>

					{/* image upload area */}
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-emerald-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 20)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Tải lên hình ảnh</div>
									<Button variant='outline' size='sm' className='text-xs'>
										Chọn File
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Audio upload */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>File Âm Thanh</label>
						<div className='flex items-center gap-2'>
							<Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
								{files.audio ? files.audio.name.slice(0, 20) : "Chọn File Âm Thanh"}
							</Button>
						</div>
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
						<label className='text-sm font-medium'>Thời Lượng</label>
						<Input
							type='text'
							value={
								newSong.duration === "0"
									? "Tự động tính từ file âm thanh"
									: `${newSong.duration} giây (${Math.floor(parseInt(newSong.duration) / 60)}:${(
											parseInt(newSong.duration) % 60
									  )
											.toString()
											.padStart(2, "0")})`
							}
							readOnly
							className='bg-zinc-800 border-zinc-700 text-zinc-400'
						/>
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
