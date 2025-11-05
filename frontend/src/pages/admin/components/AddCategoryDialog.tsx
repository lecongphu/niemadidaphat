import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";

interface NewCategory {
	name: string;
	description: string;
}

const AddCategoryDialog = () => {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { fetchCategories } = useMusicStore();

	const [newCategory, setNewCategory] = useState<NewCategory>({
		name: "",
		description: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newCategory.name.trim()) {
			return toast.error("Vui lòng nhập tên chủ đề");
		}

		setIsLoading(true);

		try {
			await axiosInstance.post("/admin/categories", newCategory);
			toast.success("Thêm chủ đề thành công");

			// Reset form
			setNewCategory({ name: "", description: "" });
			setOpen(false);

			// Refresh categories
			fetchCategories();
		} catch (error: any) {
			console.error("Error creating category:", error);
			toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm chủ đề");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className='bg-violet-600 hover:bg-violet-700'>
					<Plus className='mr-2 size-4' />
					Thêm Chủ Đề
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Thêm Chủ Đề Mới</DialogTitle>
					<DialogDescription>Thêm chủ đề/danh mục cho bài pháp</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>
							Tên Chủ Đề <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='name'
							value={newCategory.name}
							onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Ví dụ: Thiền Định, Giáo Lý, Kinh Điển...'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Mô Tả (Tùy chọn)</Label>
						<Textarea
							id='description'
							value={newCategory.description}
							onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
							className='bg-zinc-800 border-zinc-700 min-h-[100px]'
							placeholder='Mô tả về chủ đề này...'
						/>
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={isLoading}
							className='bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
						>
							Hủy
						</Button>
						<Button type='submit' disabled={isLoading} className='bg-violet-600 hover:bg-violet-700'>
							{isLoading ? "Đang thêm..." : "Thêm Chủ Đề"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddCategoryDialog;
