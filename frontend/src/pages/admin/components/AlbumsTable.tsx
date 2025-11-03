import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useMusicStore } from "@/stores/useMusicStore";
import { getName, getOptimizedImageUrl } from "@/lib/utils";
import { Calendar, Music, Trash2 } from "lucide-react";
import { useEffect } from "react";

const AlbumsTable = () => {
	const { albums, deleteAlbum, fetchAlbums } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Tiêu Đề</TableHead>
					<TableHead>Giảng Sư</TableHead>
					<TableHead>Năm Phát Hành</TableHead>
					<TableHead>Bài Giảng</TableHead>
					<TableHead className='text-right'>Hành Động</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{albums.map((album) => (
					<TableRow key={album._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={getOptimizedImageUrl(album.imageUrl)} alt={album.title} className='w-10 h-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{album.title}</TableCell>
						<TableCell>{getName(album.teacher)}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{album.releaseYear}
							</span>
						</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Music className='h-4 w-4' />
								{album.songs.length} bài giảng
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className='bg-zinc-900 border-zinc-700'>
										<AlertDialogHeader>
											<AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
											<AlertDialogDescription className='text-zinc-400'>
												Bạn đang xóa bộ kinh "<span className='font-medium text-white'>{album.title}</span>"
												và tất cả <span className='font-medium text-white'>{album.songs.length} bài giảng</span> trong đó.
												Hành động này không thể hoàn tác.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className='bg-zinc-800 hover:bg-zinc-700 border-zinc-700'>
												Hủy
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => deleteAlbum(album._id)}
												className='bg-red-500 hover:bg-red-600 text-white'
											>
												Xóa
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
export default AlbumsTable;
