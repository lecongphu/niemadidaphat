import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getName, getOptimizedImageUrl } from "@/lib/utils";
import { Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import PlayingIndicator from "@/components/PlayingIndicator";

const SongsTable = () => {
	const { songs, isLoading, error, deleteSong } = useMusicStore();
	const { currentSong, isPlaying } = usePlayerStore();
	const [deletingSongId, setDeletingSongId] = useState<string | null>(null);

	const handleDelete = async (songId: string) => {
		setDeletingSongId(songId);
		await deleteSong(songId);
		setDeletingSongId(null);
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Đang tải bài pháp...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Tiêu Đề</TableHead>
					<TableHead>Pháp Sư</TableHead>
					<TableHead>Chủ Đề</TableHead>
					<TableHead>Ngày Phát Hành</TableHead>
					<TableHead className='w-[100px]'>Thao Tác</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{songs.map((song) => {
					const isCurrentSong = currentSong?._id === song._id;
					return (
						<TableRow key={song._id} className='hover:bg-zinc-800/50'>
							<TableCell>
								{isCurrentSong && isPlaying ? (
									<div className='flex items-center justify-center'>
										<PlayingIndicator />
									</div>
								) : (
									<img src={getOptimizedImageUrl(song.imageUrl)} alt={song.title} className='size-10 rounded object-cover' />
								)}
							</TableCell>
							<TableCell className='font-medium'>{song.title}</TableCell>
							<TableCell>{getName(song.teacher)}</TableCell>
							<TableCell>{getName(song.category)}</TableCell>
							<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Calendar className='h-4 w-4' />
									{song.createdAt.split("T")[0]}
								</span>
							</TableCell>
							<TableCell>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
											disabled={deletingSongId === song._id}
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className='bg-zinc-900 border-zinc-700'>
										<AlertDialogHeader>
											<AlertDialogTitle>Xác nhận xóa bài pháp</AlertDialogTitle>
											<AlertDialogDescription className='text-zinc-400'>
												Bạn có chắc chắn muốn xóa bài pháp "{song.title}"? Hành động này không thể hoàn tác.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className='bg-zinc-800 hover:bg-zinc-700 border-zinc-700'>
												Hủy
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => handleDelete(song._id)}
												className='bg-red-600 hover:bg-red-700'
											>
												Xóa
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};
export default SongsTable;
