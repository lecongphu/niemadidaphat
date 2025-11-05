import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import EditCategoryDialog from "./EditCategoryDialog";
import type { Category } from "@/types";

const CategoriesTable = () => {
	const { categories, fetchCategories } = useMusicStore();
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Bạn có chắc chắn muốn xóa chủ đề "${name}"?\n\nLưu ý: Không thể xóa nếu có bài pháp đang sử dụng chủ đề này.`)) {
			return;
		}

		try {
			await axiosInstance.delete(`/admin/categories/${id}`);
			toast.success(`Đã xóa chủ đề "${name}"`);
			fetchCategories();
		} catch (error: any) {
			console.error("Error deleting category:", error);
			toast.error(error.response?.data?.message || "Không thể xóa chủ đề");
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (!categories || categories.length === 0) {
		return (
			<div className='text-center py-8 text-zinc-400'>
				Chưa có chủ đề nào. Hãy thêm chủ đề mới!
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead>Tên Chủ Đề</TableHead>
						<TableHead>Mô Tả</TableHead>
						<TableHead>Ngày Tạo</TableHead>
						<TableHead className='text-right'>Hành Động</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{categories.map((category) => (
						<TableRow key={category._id} className='hover:bg-zinc-800/50'>
							<TableCell className='font-medium'>{category.name}</TableCell>
							<TableCell className='max-w-md'>
								{category.description || (
									<span className='text-zinc-500 italic'>Không có mô tả</span>
								)}
							</TableCell>
							<TableCell>{formatDate(category.createdAt)}</TableCell>
							<TableCell className='text-right'>
								<div className='flex items-center justify-end gap-2'>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => setEditingCategory(category)}
										className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
									>
										<Pencil className='size-4 mr-2' />
										Sửa
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleDelete(category._id, category.name)}
										className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
									>
										<Trash2 className='size-4 mr-2' />
										Xóa
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{editingCategory && (
				<EditCategoryDialog
					category={editingCategory}
					open={!!editingCategory}
					onClose={() => setEditingCategory(null)}
					onSuccess={() => {
						setEditingCategory(null);
						fetchCategories();
					}}
				/>
			)}
		</>
	);
};

export default CategoriesTable;
