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
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

interface CreatePlaylistDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreatePlaylistDialog = ({ open, onOpenChange }: CreatePlaylistDialogProps) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const imageInputRef = useRef<HTMLInputElement>(null);
	const { createPlaylist, isLoading } = usePlaylistStore();

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setImagePreview("");
		if (imageInputRef.current) {
			imageInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		await createPlaylist(name.trim(), description.trim(), imageFile);
		setName("");
		setDescription("");
		setImageFile(null);
		setImagePreview("");
		onOpenChange(false);
	};

	const handleClose = () => {
		setName("");
		setDescription("");
		setImageFile(null);
		setImagePreview("");
		if (imageInputRef.current) {
			imageInputRef.current.value = "";
		}
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Tạo playlist mới</DialogTitle>
						<DialogDescription>
							Tạo một playlist mới để lưu trữ các bài pháp yêu thích của bạn.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='name'>Tên playlist *</Label>
							<Input
								id='name'
								placeholder='Bài pháp yêu thích của tôi'
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='description'>Mô tả</Label>
							<Textarea
								id='description'
								placeholder='Mô tả ngắn về playlist của bạn'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={isLoading}
								rows={3}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Ảnh bìa</Label>
							<div className='flex flex-col gap-2'>
								{imagePreview ? (
									<div className='relative w-full h-40 rounded-md overflow-hidden bg-zinc-800'>
										<img
											src={imagePreview}
											alt='Preview'
											className='w-full h-full object-cover'
										/>
										<button
											type='button'
											onClick={handleRemoveImage}
											className='absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition'
											disabled={isLoading}
										>
											<X className='h-4 w-4 text-white' />
										</button>
									</div>
								) : (
									<div
										onClick={() => imageInputRef.current?.click()}
										className='w-full h-40 rounded-md border-2 border-dashed border-zinc-700 hover:border-zinc-600
											flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-zinc-800/50'
									>
										<ImagePlus className='h-10 w-10 text-zinc-500' />
										<p className='text-sm text-zinc-400'>Nhấp để chọn ảnh</p>
										<p className='text-xs text-zinc-500'>Tùy chọn - Sẽ dùng ảnh mặc định nếu không chọn</p>
									</div>
								)}
								<input
									ref={imageInputRef}
									type='file'
									accept='image/*'
									onChange={handleImageChange}
									className='hidden'
									disabled={isLoading}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
							Hủy
						</Button>
						<Button type='submit' disabled={isLoading || !name.trim()}>
							{isLoading ? "Đang tạo..." : "Tạo playlist"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
