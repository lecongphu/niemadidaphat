import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { getName, getOptimizedImageUrl } from "@/lib/utils";
import { Calendar, Pencil, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useState, useMemo } from "react";
import PlayingIndicator from "@/components/PlayingIndicator";
import EditSongDialog from "./EditSongDialog";
import { Song } from "@/types";

const SongsTable = () => {
	const { songs, albums, teachers, categories, isLoading, error, deleteSong } = useMusicStore();
	const { currentSong, isPlaying } = usePlayerStore();
	const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
	const [editingSong, setEditingSong] = useState<Song | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	// Filter states
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
	const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	// Filter albums based on selected teacher
	const filteredAlbumsForDropdown = useMemo(() => {
		if (selectedTeacher === "all") return albums;
		return albums.filter((album) => {
			const teacherId = typeof album.teacher === "string" ? album.teacher : album.teacher._id;
			return teacherId === selectedTeacher;
		});
	}, [albums, selectedTeacher]);

	// Filter songs based on all criteria
	const filteredSongs = useMemo(() => {
		return songs.filter((song) => {
			// Search filter
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const titleMatch = song.title.toLowerCase().includes(query);
				const teacherName = getName(song.teacher).toLowerCase();
				const teacherMatch = teacherName.includes(query);
				if (!titleMatch && !teacherMatch) return false;
			}

			// Teacher filter
			if (selectedTeacher !== "all") {
				const songTeacherId = typeof song.teacher === "string" ? song.teacher : song.teacher._id;
				if (songTeacherId !== selectedTeacher) return false;
			}

			// Album filter
			if (selectedAlbum !== "all") {
				if (song.albumId !== selectedAlbum) return false;
			}

			// Category filter
			if (selectedCategory !== "all") {
				const songCategoryId = typeof song.category === "string" ? song.category : song.category._id;
				if (songCategoryId !== selectedCategory) return false;
			}

			return true;
		});
	}, [songs, searchQuery, selectedTeacher, selectedAlbum, selectedCategory]);

	const handleDelete = async (songId: string) => {
		setDeletingSongId(songId);
		await deleteSong(songId);
		setDeletingSongId(null);
	};

	const handleEdit = (song: Song) => {
		setEditingSong(song);
		setEditDialogOpen(true);
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedTeacher("all");
		setSelectedAlbum("all");
		setSelectedCategory("all");
	};

	const hasActiveFilters = searchQuery || selectedTeacher !== "all" || selectedAlbum !== "all" || selectedCategory !== "all";

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
		<>
			{/* Filters Section */}
			<div className='mb-6 space-y-4'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold text-white'>Bộ Lọc</h3>
					{hasActiveFilters && (
						<Button
							variant='ghost'
							size='sm'
							onClick={handleClearFilters}
							className='text-zinc-400 hover:text-white'
						>
							<X className='h-4 w-4 mr-2' />
							Xóa Bộ Lọc
						</Button>
					)}
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					{/* Search */}
					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-400'>Tìm Kiếm</label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400' />
							<Input
								placeholder='Tên bài pháp, pháp sư...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10 bg-zinc-800 border-zinc-700'
							/>
						</div>
					</div>

					{/* Teacher Filter */}
					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-400'>Pháp Sư</label>
						<Select value={selectedTeacher} onValueChange={(value) => {
							setSelectedTeacher(value);
							// Reset album when teacher changes
							if (selectedAlbum !== "all") {
								const albumBelongsToTeacher = albums.some((album) => {
									const teacherId = typeof album.teacher === "string" ? album.teacher : album.teacher._id;
									return album._id === selectedAlbum && (value === "all" || teacherId === value);
								});
								if (!albumBelongsToTeacher) {
									setSelectedAlbum("all");
								}
							}
						}}>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Tất cả pháp sư' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='all'>Tất cả pháp sư</SelectItem>
								{teachers.map((teacher) => (
									<SelectItem key={teacher._id} value={teacher._id}>
										{teacher.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Album Filter */}
					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-400'>Bộ Kinh</label>
						<Select
							value={selectedAlbum}
							onValueChange={setSelectedAlbum}
							disabled={selectedTeacher !== "all" && filteredAlbumsForDropdown.length === 0}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Tất cả bộ kinh' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='all'>Tất cả bộ kinh</SelectItem>
								{(selectedTeacher === "all" ? albums : filteredAlbumsForDropdown).map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Category Filter */}
					<div className='space-y-2'>
						<label className='text-sm font-medium text-zinc-400'>Chủ Đề</label>
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Tất cả chủ đề' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='all'>Tất cả chủ đề</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category._id} value={category._id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Results count */}
				<div className='text-sm text-zinc-400'>
					Hiển thị <span className='text-white font-medium'>{filteredSongs.length}</span> / {songs.length} bài pháp
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead className='w-[50px]'></TableHead>
						<TableHead>Tiêu Đề</TableHead>
						<TableHead>Pháp Sư</TableHead>
						<TableHead>Chủ Đề</TableHead>
						<TableHead>Ngày Phát Hành</TableHead>
						<TableHead className='w-[120px]'>Thao Tác</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{filteredSongs.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className='text-center py-8 text-zinc-400'>
								Không tìm thấy bài pháp nào
							</TableCell>
						</TableRow>
					) : (
						filteredSongs.map((song) => {
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
									<div className='flex items-center gap-2'>
										<Button
											variant='ghost'
											size='sm'
											className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
											onClick={() => handleEdit(song)}
										>
											<Pencil className='h-4 w-4' />
										</Button>
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
									</div>
								</TableCell>
							</TableRow>
						);
					})
					)}
				</TableBody>
			</Table>
			{editingSong && (
				<EditSongDialog song={editingSong} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
			)}
		</>
	);
};
export default SongsTable;
