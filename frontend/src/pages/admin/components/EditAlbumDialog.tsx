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
import { Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Album } from "@/types";

interface EditAlbumDialogProps {
	album: Album;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditAlbumDialog = ({ album, open, onOpenChange }: EditAlbumDialogProps) => {
	const { teachers } = useMusicStore();
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [editedAlbum, setEditedAlbum] = useState({
		title: album.title,
		teacher: typeof album.teacher === 'string' ? album.teacher : album.teacher._id,
		releaseYear: album.releaseYear,
	});

	const [imageFile, setImageFile] = useState<File | null>(null);

	// Reset form when album changes
	useEffect(() => {
		setEditedAlbum({
			title: album.title,
			teacher: typeof album.teacher === 'string' ? album.teacher : album.teacher._id,
			releaseYear: album.releaseYear,
		});
		setImageFile(null);
	}, [album]);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!editedAlbum.teacher) {
				return toast.error("Vui lòng chọn pháp sư");
			}

			const formData = new FormData();
			formData.append("title", editedAlbum.title);
			formData.append("teacher", editedAlbum.teacher);
			formData.append("releaseYear", editedAlbum.releaseYear.toString());

			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			await axiosInstance.put(`/admin/albums/${album._id}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setImageFile(null);
			onOpenChange(false);
			toast.success("Bộ kinh đã được cập nhật thành công");
		} catch (error: any) {
			toast.error("Không thể cập nhật bộ kinh: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>Chỉnh Sửa Bộ Kinh</DialogTitle>
					<DialogDescription>Cập nhật thông tin bộ kinh</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleImageSelect}
						accept='image/*'
						className='hidden'
					/>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => fileInputRef.current?.click()}
					>
						<div className='text-center'>
							<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-6 w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2'>
								{imageFile ? imageFile.name : "Tải lên hình ảnh mới (tùy chọn)"}
							</div>
							<Button variant='outline' size='sm' className='text-xs'>
								Chọn File
							</Button>
						</div>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Tên Bộ Kinh</label>
						<Input
							value={editedAlbum.title}
							onChange={(e) => setEditedAlbum({ ...editedAlbum, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Nhập tên bộ kinh'
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Pháp Sư *</label>
						<Select
							value={editedAlbum.teacher}
							onValueChange={(value) => setEditedAlbum({ ...editedAlbum, teacher: value })}
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
						<label className='text-sm font-medium'>Năm Phát Hành</label>
						<Input
							type='number'
							value={editedAlbum.releaseYear}
							onChange={(e) => setEditedAlbum({ ...editedAlbum, releaseYear: parseInt(e.target.value) })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Nhập năm phát hành'
							min={1900}
							max={new Date().getFullYear()}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600'
						disabled={isLoading || !editedAlbum.title || !editedAlbum.teacher}
					>
						{isLoading ? "Đang cập nhật..." : "Cập Nhật"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default EditAlbumDialog;
