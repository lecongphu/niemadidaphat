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
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import { Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Teacher } from "@/types";

interface EditTeacherDialogProps {
	teacher: Teacher;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditTeacherDialog = ({ teacher, open, onOpenChange }: EditTeacherDialogProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const [editedTeacher, setEditedTeacher] = useState({
		name: teacher.name,
		bio: teacher.bio,
		specialization: teacher.specialization,
		yearsOfExperience: teacher.yearsOfExperience.toString(),
	});

	const [imageFile, setImageFile] = useState<File | null>(null);

	// Reset form when teacher changes
	useEffect(() => {
		setEditedTeacher({
			name: teacher.name,
			bio: teacher.bio,
			specialization: teacher.specialization,
			yearsOfExperience: teacher.yearsOfExperience.toString(),
		});
		setImageFile(null);
	}, [teacher]);

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!editedTeacher.name || !editedTeacher.specialization) {
				return toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
			}

			const formData = new FormData();
			formData.append("name", editedTeacher.name);
			formData.append("bio", editedTeacher.bio);
			formData.append("specialization", editedTeacher.specialization);
			formData.append("yearsOfExperience", editedTeacher.yearsOfExperience);

			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			await axiosInstance.put(`/admin/teachers/${teacher._id}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setImageFile(null);
			onOpenChange(false);
			toast.success("Pháp sư đã được cập nhật thành công");
		} catch (error: any) {
			toast.error("Lỗi khi cập nhật pháp sư: " + error.response?.data?.message || error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Chỉnh Sửa Pháp Sư</DialogTitle>
					<DialogDescription>Cập nhật thông tin pháp sư</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						ref={imageInputRef}
						hidden
						accept='image/*'
						onChange={(e) => setImageFile(e.target.files![0])}
					/>

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{imageFile ? (
								<div className='space-y-2'>
									<div className='text-sm text-emerald-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{imageFile.name.slice(0, 20)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Tải lên ảnh mới (tùy chọn)</div>
									<div className='text-xs text-zinc-500'>SVG, PNG, JPG or GIF</div>
								</>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Tên</label>
						<Input
							value={editedTeacher.name}
							onChange={(e) => setEditedTeacher({ ...editedTeacher, name: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Pháp sư Tịnh Không'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Chuyên Môn</label>
						<Input
							value={editedTeacher.specialization}
							onChange={(e) => setEditedTeacher({ ...editedTeacher, specialization: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Tịnh độ tông, Kinh điển'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Số Năm Kinh Nghiệm</label>
						<Input
							type='number'
							value={editedTeacher.yearsOfExperience}
							onChange={(e) => setEditedTeacher({ ...editedTeacher, yearsOfExperience: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='20'
							min='0'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Tiểu Sử</label>
						<Textarea
							value={editedTeacher.bio}
							onChange={(e) => setEditedTeacher({ ...editedTeacher, bio: e.target.value })}
							className='bg-zinc-800 border-zinc-700 min-h-[100px]'
							placeholder='Tiểu sử ngắn gọn của pháp sư...'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} className='bg-violet-500 hover:bg-violet-600' disabled={isLoading}>
						{isLoading ? "Đang cập nhật..." : "Cập Nhật"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditTeacherDialog;
