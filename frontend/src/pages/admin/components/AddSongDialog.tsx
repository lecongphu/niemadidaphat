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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Link2, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	teacher: string;
	album: string;
	category: string;
}

const AddSongDialog = () => {
	const { albums, teachers, categories } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
	const [keepFormData, setKeepFormData] = useState(false);

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		teacher: "",
		album: "",
		category: "",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const [urls, setUrls] = useState<{ audio: string; image: string }>({
		audio: "",
		image: "",
	});

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setFiles((prev) => ({ ...prev, audio: file }));
	};

	const handleAudioUrlChange = (url: string) => {
		setUrls((prev) => ({ ...prev, audio: url }));
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setUploadProgress(0);

		try {
			// Validation based on upload method
			if (uploadMethod === "file") {
				if (!files.audio || !files.image) {
					return toast.error("Vui lòng tải lên cả file âm thanh và hình ảnh");
				}
			} else {
				if (!urls.audio || !urls.image) {
					return toast.error("Vui lòng nhập cả URL âm thanh và hình ảnh");
				}
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

			if (uploadMethod === "file") {
				// File upload mode
				const formData = new FormData();

				formData.append("title", newSong.title);
				formData.append("teacher", newSong.teacher);
				formData.append("albumId", newSong.album);
				formData.append("category", newSong.category);

				formData.append("audioFile", files.audio!);
				formData.append("imageFile", files.image!);

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
			} else {
				// URL mode
				await axiosInstance.post("/admin/songs/url", {
					title: newSong.title,
					teacher: newSong.teacher,
					albumId: newSong.album,
					category: newSong.category,
					audioUrl: urls.audio,
					imageUrl: urls.image,
				});
			}

			// Only reset form if keepFormData is false
			if (!keepFormData) {
				setNewSong({
					title: "",
					teacher: "",
					album: "",
					category: "",
				});

				setUrls({
					audio: "",
					image: "",
				});

				setSongDialogOpen(false);
			} else {
				// Only reset title and files to allow adding next episode
				setNewSong((prev) => ({
					...prev,
				}));
			}

			// Always reset files and progress
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

					{/* Upload Method Tabs */}
					<Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "url")}>
						<TabsList className='grid w-full grid-cols-2 bg-zinc-800'>
							<TabsTrigger value='file' className='data-[state=active]:bg-emerald-500'>
								<Upload className='h-4 w-4 mr-2' />
								Tải File Lên
							</TabsTrigger>
							<TabsTrigger value='url' className='data-[state=active]:bg-emerald-500'>
								<Link2 className='h-4 w-4 mr-2' />
								Nhập URL
							</TabsTrigger>
						</TabsList>

						{/* File Upload Tab */}
						<TabsContent value='file' className='space-y-4'>
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
						</TabsContent>

						{/* URL Input Tab */}
						<TabsContent value='url' className='space-y-4'>
							{/* Image URL */}
							<div className='space-y-2'>
								<label className='text-sm font-medium'>URL Hình Ảnh</label>
								<Input
									type='url'
									placeholder='https://example.com/image.jpg'
									value={urls.image}
									onChange={(e) => setUrls((prev) => ({ ...prev, image: e.target.value }))}
									className='bg-zinc-800 border-zinc-700'
								/>
							</div>

							{/* Audio URL */}
							<div className='space-y-2'>
								<label className='text-sm font-medium'>URL Âm Thanh</label>
								<Input
									type='url'
									placeholder='https://example.com/audio.mp3'
									value={urls.audio}
									onChange={(e) => handleAudioUrlChange(e.target.value)}
									className='bg-zinc-800 border-zinc-700'
								/>
							</div>
						</TabsContent>
					</Tabs>

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
