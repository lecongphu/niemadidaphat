import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Calendar, Music, Trash2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import EditAlbumDialog from "./EditAlbumDialog";
import { Album } from "@/types";

const AlbumsTable = () => {
	const { albums, deleteAlbum, fetchAlbums } = useMusicStore();
	const [editAlbum, setEditAlbum] = useState<Album | null>(null);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	return (
		<>
		{/* Mobile Card Layout */}
		<div className='md:hidden space-y-3'>
			{albums.map((album) => (
				<Card key={album._id} className='bg-zinc-900 border-zinc-800'>
					<CardContent className='p-4'>
						<div className='flex gap-3'>
							<img
								src={getOptimizedImageUrl(album.imageUrl)}
								alt={album.title}
								className='w-20 h-20 rounded object-cover flex-shrink-0'
							/>
							<div className='flex-1 min-w-0'>
								<h3 className='font-medium text-white truncate'>{album.title}</h3>
								<p className='text-sm text-zinc-400 truncate'>{getName(album.teacher)}</p>
								<div className='flex items-center gap-3 mt-2 text-xs text-zinc-500'>
									<span className='flex items-center gap-1'>
										<Calendar className='h-3 w-3' />
										{album.releaseYear}
									</span>
									<span className='flex items-center gap-1'>
										<Music className='h-3 w-3' />
										{album.songs.length} bài
									</span>
								</div>
							</div>
						</div>
						<div className='flex gap-2 mt-3 pt-3 border-t border-zinc-800'>
							<Button
								variant='outline'
								size='sm'
								className='flex-1 text-blue-400 border-blue-400/20 hover:bg-blue-400/10'
								onClick={() => setEditAlbum(album)}
							>
								<Pencil className='h-4 w-4 mr-2' />
								Sửa
							</Button>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										className='flex-1 text-red-400 border-red-400/20 hover:bg-red-400/10'
									>
										<Trash2 className='h-4 w-4 mr-2' />
										Xóa
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className='bg-zinc-900 border-zinc-700 max-w-[90vw] sm:max-w-lg'>
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
					</CardContent>
				</Card>
			))}
		</div>

		{/* Desktop Table Layout */}
		<div className='hidden md:block'>
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
									<Button
										variant='ghost'
										size='sm'
										className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
										onClick={() => setEditAlbum(album)}
									>
										<Pencil className='h-4 w-4' />
									</Button>
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
		</div>

		{editAlbum && (
			<EditAlbumDialog
				album={editAlbum}
				open={!!editAlbum}
				onOpenChange={(open) => !open && setEditAlbum(null)}
			/>
		)}
		</>
	);
};
export default AlbumsTable;
