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
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewTeacher {
	name: string;
	bio: string;
	specialization: string;
	yearsOfExperience: string;
}

const AddTeacherDialog = () => {
	const { fetchTeachers } = useMusicStore();
	const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [newTeacher, setNewTeacher] = useState<NewTeacher>({
		name: "",
		bio: "",
		specialization: "",
		yearsOfExperience: "0",
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!imageFile) {
				return toast.error("Vui lòng tải lên file hình ảnh");
			}

			if (!newTeacher.name || !newTeacher.specialization) {
				return toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
			}

			const formData = new FormData();
			formData.append("name", newTeacher.name);
			formData.append("bio", newTeacher.bio);
			formData.append("specialization", newTeacher.specialization);
			formData.append("yearsOfExperience", newTeacher.yearsOfExperience);
			formData.append("imageFile", imageFile);

			await axiosInstance.post("/admin/teachers", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setNewTeacher({
				name: "",
				bio: "",
				specialization: "",
				yearsOfExperience: "0",
			});

			setImageFile(null);
			setTeacherDialogOpen(false);
			toast.success("Pháp sư đã được tạo thành công");
			fetchTeachers();
		} catch (error: any) {
			toast.error("Lỗi khi tạo pháp sư: " + error.response?.data?.message || error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-violet-500 hover:bg-violet-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					Thêm Pháp Sư
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Thêm Pháp Sư Mới</DialogTitle>
					<DialogDescription>Thêm pháp sư mới vào nền tảng</DialogDescription>
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
									<div className='text-sm text-zinc-400 mb-2'>Tải lên ảnh pháp sư</div>
									<div className='text-xs text-zinc-500'>SVG, PNG, JPG or GIF</div>
								</>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Tên</label>
						<Input
							value={newTeacher.name}
							onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Pháp sư Tịnh Không'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Chuyên Môn</label>
						<Input
							value={newTeacher.specialization}
							onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Tịnh độ tông, Kinh điển'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Số Năm Kinh Nghiệm</label>
						<Input
							type='number'
							value={newTeacher.yearsOfExperience}
							onChange={(e) => setNewTeacher({ ...newTeacher, yearsOfExperience: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='20'
							min='0'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Tiểu Sử</label>
						<Textarea
							value={newTeacher.bio}
							onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })}
							className='bg-zinc-800 border-zinc-700 min-h-[100px]'
							placeholder='Tiểu sử ngắn gọn của pháp sư...'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setTeacherDialogOpen(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} className='bg-violet-500 hover:bg-violet-600' disabled={isLoading}>
						{isLoading ? "Đang tạo..." : "Thêm Pháp Sư"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddTeacherDialog;
