import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { getOptimizedImageUrl } from "@/lib/utils";
import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";

const AlbumsList = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	if (isLoading) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Library className="h-5 w-5 text-violet-500" />
						<CardTitle>Bộ Kinh</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<PlaylistSkeleton />
				</CardContent>
			</Card>
		);
	}

	if (albums.length === 0) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Library className="h-5 w-5 text-violet-500" />
						<CardTitle>Bộ Kinh</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center text-zinc-400 py-8">Chưa có dữ liệu</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-zinc-900/50 border-zinc-800">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Library className="h-5 w-5 text-violet-500" />
					<CardTitle>Bộ Kinh</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{albums.map((album) => (
						<Link
							to={`/albums/${album._id}`}
							key={album._id}
							className="group p-4 hover:bg-zinc-800/50 rounded-lg transition-all border border-transparent hover:border-violet-500/20"
						>
							<div className="relative w-full aspect-square mb-3">
								<img
									src={getOptimizedImageUrl(album.imageUrl)}
									alt={album.title}
									className="w-full h-full rounded-md object-cover shadow-lg group-hover:shadow-violet-500/20 transition-shadow"
								/>
							</div>
							<div className="space-y-1">
								<p className="font-medium truncate text-white group-hover:text-violet-400 transition-colors">
									{album.title}
								</p>
								<p className="text-sm text-zinc-400 truncate">
									Bộ Kinh • {typeof album.teacher === 'string' ? album.teacher : album.teacher.name}
								</p>
							</div>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default AlbumsList;
