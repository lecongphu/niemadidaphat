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
import { Playlist } from "@/types";
import { useEffect, useState } from "react";

interface EditPlaylistDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	playlist: Playlist | null;
}

export const EditPlaylistDialog = ({ open, onOpenChange, playlist }: EditPlaylistDialogProps) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [imagePreview, setImagePreview] = useState<string>("");
	const { updatePlaylist, isLoading } = usePlaylistStore();

	// Initialize form with playlist data
	useEffect(() => {
		if (playlist && open) {
			setName(playlist.name);
			setDescription(playlist.description || "");
			setImagePreview(playlist.imageUrl || "");
		}
	}, [playlist, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !playlist) return;

		// For now, we'll just update name and description
		// Image update would require backend changes
		await updatePlaylist(playlist._id, {
			name: name.trim(),
			description: description.trim(),
		});
		onOpenChange(false);
	};

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa playlist</DialogTitle>
						<DialogDescription>
							Cập nhật thông tin playlist của bạn.
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
							<Label>Ảnh bìa (chưa hỗ trợ chỉnh sửa)</Label>
							<div className='flex flex-col gap-2'>
								<div className='relative w-full h-40 rounded-md overflow-hidden bg-zinc-800'>
									{imagePreview && (
										<img
											src={imagePreview}
											alt='Preview'
											className='w-full h-full object-cover'
										/>
									)}
									<div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
										<p className='text-sm text-zinc-300'>Ảnh không thể thay đổi</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
							Hủy
						</Button>
						<Button type='submit' disabled={isLoading || !name.trim()}>
							{isLoading ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
