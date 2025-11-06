import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface EditSongDialogProps {
	song: Song;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface UpdateSong {
	title: string;
	teacher: string;
	album: string;
	category: string;
}

const EditSongDialog = ({ song, open, onOpenChange }: EditSongDialogProps) => {
	const { albums, teachers, categories, fetchSongs } = useMusicStore();
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const [updateSong, setUpdateSong] = useState<UpdateSong>({
		title: "",
		teacher: "",
		album: "",
		category: "",
	});

	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioDuration, setAudioDuration] = useState<number>(0);

	const audioInputRef = useRef<HTMLInputElement>(null);

	// Initialize form with song data
	useEffect(() => {
		if (song && open) {
			setUpdateSong({
				title: song.title,
				teacher: typeof song.teacher === "string" ? song.teacher : song.teacher._id,
				album: song.albumId || "",
				category: typeof song.category === "string" ? song.category : song.category._id,
			});
			setAudioDuration(song.duration);
		}
	}, [song, open]);

	const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setAudioFile(file);

		// Calculate audio duration
		const audio = new Audio();
		const objectUrl = URL.createObjectURL(file);

		audio.src = objectUrl;

		audio.addEventListener("loadedmetadata", () => {
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
			if (!updateSong.album) {
				return toast.error("Vui lòng chọn bộ kinh");
			}

			if (!updateSong.teacher) {
				return toast.error("Vui lòng chọn pháp sư");
			}

			if (!updateSong.category) {
				return toast.error("Vui lòng chọn chủ đề");
			}

			// File upload
			const formData = new FormData();

			formData.append("title", updateSong.title);
			formData.append("teacher", updateSong.teacher);
			formData.append("albumId", updateSong.album);
			formData.append("category", updateSong.category);
			formData.append("duration", audioDuration.toString());

			// Only append audio file if a new one was selected
			if (audioFile) {
				formData.append("audioFile", audioFile);
			}

			await axiosInstance.put(`/admin/songs/${song._id}`, formData, {
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

			// Reset and close
			setAudioFile(null);
			setUploadProgress(0);
			onOpenChange(false);
			toast.success("Bài pháp đã được cập nhật thành công");
		} catch (error: any) {
			toast.error("Không thể cập nhật bài pháp: " + error.message);
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto">
				<DialogHeader>
					<DialogTitle>Cập Nhật Bài Pháp</DialogTitle>
					<DialogDescription>Chỉnh sửa thông tin bài pháp</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<input
						type="file"
						accept="audio/*"
						ref={audioInputRef}
						hidden
						onChange={handleAudioChange}
					/>

					{/* Audio upload */}
					<div className="space-y-2">
						<label className="text-sm font-medium">File Âm Thanh (tùy chọn)</label>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => audioInputRef.current?.click()} className="w-full">
								{audioFile ? audioFile.name.slice(0, 40) : "Chọn File Âm Thanh Mới"}
							</Button>
						</div>
						{audioFile && (
							<div className="text-xs text-zinc-400 space-y-1">
								<p>Đã chọn: {audioFile.name}</p>
								{audioDuration > 0 && (
									<p>
										Thời lượng: {Math.floor(audioDuration / 60)}:
										{(audioDuration % 60).toString().padStart(2, "0")}
									</p>
								)}
							</div>
						)}
						{!audioFile && (
							<div className="text-xs text-zinc-500">
								Bỏ trống nếu không muốn thay đổi file âm thanh
							</div>
						)}
					</div>

					{/* other fields */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Tên Bài Pháp</label>
						<Input
							value={updateSong.title}
							onChange={(e) => setUpdateSong({ ...updateSong, title: e.target.value })}
							className="bg-zinc-800 border-zinc-700"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Pháp Sư *</label>
						<Select
							value={updateSong.teacher}
							onValueChange={(value) => setUpdateSong({ ...updateSong, teacher: value })}
						>
							<SelectTrigger className="bg-zinc-800 border-zinc-700">
								<SelectValue placeholder="Chọn pháp sư" />
							</SelectTrigger>
							<SelectContent className="bg-zinc-800 border-zinc-700">
								{teachers.map((teacher) => (
									<SelectItem key={teacher._id} value={teacher._id}>
										{teacher.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Bộ Kinh *</label>
						<Select
							value={updateSong.album}
							onValueChange={(value) => setUpdateSong({ ...updateSong, album: value })}
						>
							<SelectTrigger className="bg-zinc-800 border-zinc-700">
								<SelectValue placeholder="Chọn bộ kinh" />
							</SelectTrigger>
							<SelectContent className="bg-zinc-800 border-zinc-700">
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Chủ Đề *</label>
						<Select
							value={updateSong.category}
							onValueChange={(value) => setUpdateSong({ ...updateSong, category: value })}
						>
							<SelectTrigger className="bg-zinc-800 border-zinc-700">
								<SelectValue placeholder="Chọn chủ đề" />
							</SelectTrigger>
							<SelectContent className="bg-zinc-800 border-zinc-700">
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
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-zinc-400">Đang tải lên...</span>
								<span className="text-emerald-400">{uploadProgress}%</span>
							</div>
							<div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
								<div
									className="bg-emerald-500 h-full transition-all duration-300 ease-out"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? `Đang cập nhật... ${uploadProgress}%` : "Cập Nhật"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default EditSongDialog;
