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
import { getName } from "@/lib/utils";
import { Calendar, Trash2 } from "lucide-react";

const SongsTable = () => {
	const { songs, isLoading, error, deleteSong } = useMusicStore();

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
					<TableHead className='text-right'>Hành Động</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{songs.map((song) => (
					<TableRow key={song._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
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

						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant={"ghost"}
											size={"sm"}
											className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
										>
											<Trash2 className='size-4' />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className='bg-zinc-900 border-zinc-700'>
										<AlertDialogHeader>
											<AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
											<AlertDialogDescription className='text-zinc-400'>
												Bạn đang xóa bài pháp "<span className='font-medium text-white'>{song.title}</span>".
												Hành động này không thể hoàn tác.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className='bg-zinc-800 hover:bg-zinc-700 border-zinc-700'>
												Hủy
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => deleteSong(song._id)}
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
export default SongsTable;
