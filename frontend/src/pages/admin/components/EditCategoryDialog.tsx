import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import type { Category } from "@/types";

interface EditCategoryDialogProps {
	category: Category;
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const EditCategoryDialog = ({ category, open, onClose, onSuccess }: EditCategoryDialogProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: category.name,
		description: category.description || "",
	});

	useEffect(() => {
		setFormData({
			name: category.name,
			description: category.description || "",
		});
	}, [category]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			return toast.error("Vui lòng nhập tên chủ đề");
		}

		setIsLoading(true);

		try {
			await axiosInstance.put(`/admin/categories/${category._id}`, formData);
			toast.success("Cập nhật chủ đề thành công");
			onSuccess();
		} catch (error: any) {
			console.error("Error updating category:", error);
			toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật chủ đề");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Chỉnh Sửa Chủ Đề</DialogTitle>
					<DialogDescription>Cập nhật thông tin chủ đề</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='edit-name'>
							Tên Chủ Đề <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='edit-name'
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Tên chủ đề'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='edit-description'>Mô Tả (Tùy chọn)</Label>
						<Textarea
							id='edit-description'
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className='bg-zinc-800 border-zinc-700 min-h-[100px]'
							placeholder='Mô tả về chủ đề này...'
						/>
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							disabled={isLoading}
							className='bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
						>
							Hủy
						</Button>
						<Button type='submit' disabled={isLoading} className='bg-violet-600 hover:bg-violet-700'>
							{isLoading ? "Đang cập nhật..." : "Cập Nhật"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditCategoryDialog;
