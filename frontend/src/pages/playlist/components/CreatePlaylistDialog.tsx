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
import { useState } from "react";

interface CreatePlaylistDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreatePlaylistDialog = ({ open, onOpenChange }: CreatePlaylistDialogProps) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const { createPlaylist, isLoading } = usePlaylistStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		await createPlaylist(name.trim(), description.trim());
		setName("");
		setDescription("");
		onOpenChange(false);
	};

	const handleClose = () => {
		setName("");
		setDescription("");
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
