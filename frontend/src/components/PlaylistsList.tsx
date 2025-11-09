import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getOptimizedImageUrl } from "@/lib/utils";
import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePlaylistDialog } from "@/pages/playlist/components/CreatePlaylistDialog";

const PlaylistsList = () => {
	const { playlists, fetchPlaylists, isLoading: isLoadingPlaylists } = usePlaylistStore();
	const { isAuthenticated } = useAuthStore();
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			fetchPlaylists();
		}
	}, [fetchPlaylists, isAuthenticated]);

	// Don't show anything if user is not authenticated
	if (!isAuthenticated) {
		return null;
	}

	if (isLoadingPlaylists) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<ListMusic className="h-5 w-5 text-blue-500" />
						<CardTitle>Playlists Của Bạn</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<PlaylistSkeleton />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-zinc-900/50 border-zinc-800">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ListMusic className="h-5 w-5 text-blue-500" />
						<CardTitle>Playlists Của Bạn</CardTitle>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowCreateDialog(true)}
						className="h-8 w-8"
						title="Tạo playlist mới"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{playlists.length === 0 ? (
					<div className="text-center text-zinc-400 py-8">
						<p className="mb-2">Chưa có playlist</p>
						<p className="text-sm">Tạo playlist đầu tiên của bạn</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{playlists.map((playlist) => (
							<Link
								to={`/playlists/${playlist._id}`}
								key={playlist._id}
								className="group p-4 hover:bg-zinc-800/50 rounded-lg transition-all border border-transparent hover:border-blue-500/20"
							>
								<div className="relative w-full aspect-square mb-3">
									{playlist.imageUrl && playlist.imageUrl.trim() !== "" ? (
										<img
											src={getOptimizedImageUrl(playlist.imageUrl)}
											alt={playlist.name}
											className="w-full h-full rounded-md object-cover shadow-lg group-hover:shadow-blue-500/20 transition-shadow"
										/>
									) : (
										<div className="w-full h-full rounded-md bg-zinc-800 flex items-center justify-center">
											<ListMusic className="h-16 w-16 text-zinc-400" />
										</div>
									)}
								</div>
								<div className="space-y-1">
									<p className="font-medium text-white group-hover:text-blue-400 transition-colors">
										{playlist.name}
									</p>
									<p className="text-sm text-zinc-400">
										Playlist • {playlist.songs.length} bài pháp
									</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</CardContent>

			<CreatePlaylistDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
		</Card>
	);
};

export default PlaylistsList;
