import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { getOptimizedImageUrl } from "@/lib/utils";
import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";

const AlbumsList = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Socket.IO realtime updates for albums
	useSocket({
		onAlbumCreated: () => {
			console.log("Album created via Socket.IO");
			fetchAlbums(); // Refresh when album created
		},
		onAlbumDeleted: () => {
			console.log("Album deleted via Socket.IO");
			fetchAlbums(); // Refresh when album deleted
		},
	});

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	const handleManualRefresh = () => {
		setIsRefreshing(true);
		fetchAlbums().finally(() => setIsRefreshing(false));
	};

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
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Library className="h-5 w-5 text-violet-500" />
						<CardTitle>Bộ Kinh</CardTitle>
						<div className="flex items-center gap-2 ml-3">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
							</span>
							<span className="text-xs font-medium text-violet-500">LIVE</span>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleManualRefresh}
						disabled={isRefreshing}
						className="h-8 w-8"
					>
						<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
					</Button>
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
								<p className="font-medium text-white group-hover:text-violet-400 transition-colors">
									{album.title}
								</p>
								<p className="text-sm text-zinc-400">
									Bộ Kinh • {typeof album.teacher === 'string' ? album.teacher : album.teacher.name}
								</p>
								<p className="text-xs text-zinc-500">
									{album.songs?.length || 0} tập • {(() => {
										const totalSeconds = album.songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0;
										const hours = Math.floor(totalSeconds / 3600);
										const minutes = Math.floor((totalSeconds % 3600) / 60);
										return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
									})()}
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
