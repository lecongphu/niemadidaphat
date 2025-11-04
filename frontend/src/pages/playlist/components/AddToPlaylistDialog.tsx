import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Check, ListMusic, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";

interface AddToPlaylistDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	songId: string | null;
}

export const AddToPlaylistDialog = ({ open, onOpenChange, songId }: AddToPlaylistDialogProps) => {
	const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	useEffect(() => {
		if (open) {
			fetchPlaylists();
		}
	}, [open, fetchPlaylists]);

	const handleAddToPlaylist = async (playlistId: string) => {
		if (!songId) return;
		await addSongToPlaylist(playlistId, songId);
	};

	const isSongInPlaylist = (playlistId: string) => {
		if (!songId) return false;
		const playlist = playlists.find((p) => p._id === playlistId);
		return playlist?.songs.some((s) => s._id === songId);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Thêm vào playlist</DialogTitle>
						<DialogDescription>
							Chọn playlist để thêm bài pháp này vào.
						</DialogDescription>
					</DialogHeader>

					<div className='py-4'>
						{/* Create New Playlist Button */}
						<Button
							variant='outline'
							className='w-full justify-start mb-4'
							onClick={() => setShowCreateDialog(true)}
						>
							<Plus className='mr-2 h-4 w-4' />
							Tạo playlist mới
						</Button>

						{/* Playlists List */}
						{playlists.length > 0 ? (
							<ScrollArea className='h-[300px]'>
								<div className='space-y-2'>
									{playlists.map((playlist) => {
										const isAdded = isSongInPlaylist(playlist._id);
										return (
											<Button
												key={playlist._id}
												variant='ghost'
												className='w-full justify-between h-auto py-3 px-4'
												onClick={() => !isAdded && handleAddToPlaylist(playlist._id)}
												disabled={isAdded}
											>
												<div className='flex items-center gap-3'>
													<div className='w-12 h-12 bg-zinc-800 rounded flex items-center justify-center flex-shrink-0'>
														{playlist.imageUrl ? (
															<img
																src={playlist.imageUrl}
																alt={playlist.name}
																className='w-12 h-12 rounded object-cover'
															/>
														) : (
															<ListMusic className='h-6 w-6 text-zinc-400' />
														)}
													</div>
													<div className='text-left'>
														<div className='font-medium text-white'>{playlist.name}</div>
														<div className='text-xs text-zinc-400'>
															{playlist.songs.length} bài pháp
														</div>
													</div>
												</div>
												{isAdded && <Check className='h-5 w-5 text-green-500' />}
											</Button>
										);
									})}
								</div>
							</ScrollArea>
						) : (
							<div className='text-center py-8 text-zinc-400'>
								<ListMusic className='h-12 w-12 mx-auto mb-3 opacity-50' />
								<p className='text-sm'>Chưa có playlist nào</p>
								<p className='text-xs mt-1'>Tạo playlist đầu tiên của bạn</p>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			<CreatePlaylistDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
		</>
	);
};
