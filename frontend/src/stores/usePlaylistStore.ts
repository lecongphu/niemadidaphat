import { axiosInstance } from "@/lib/axios";
import { Playlist } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface PlaylistStore {
	playlists: Playlist[];
	currentPlaylist: Playlist | null;
	isLoading: boolean;
	error: string | null;

	fetchPlaylists: () => Promise<void>;
	fetchPlaylistById: (id: string) => Promise<void>;
	createPlaylist: (name: string, description?: string) => Promise<void>;
	updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
	deletePlaylist: (id: string) => Promise<void>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
	playlists: [],
	currentPlaylist: null,
	isLoading: false,
	error: null,

	fetchPlaylists: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/playlists");
			set({ playlists: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			toast.error("Không thể tải danh sách playlist");
		} finally {
			set({ isLoading: false });
		}
	},

	fetchPlaylistById: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/playlists/${id}`);
			set({ currentPlaylist: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			toast.error("Không thể tải playlist");
		} finally {
			set({ isLoading: false });
		}
	},

	createPlaylist: async (name: string, description?: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/playlists", {
				name,
				description: description || "",
			});
			set((state) => ({
				playlists: [response.data, ...state.playlists],
			}));
			toast.success("Tạo playlist thành công");
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			toast.error("Không thể tạo playlist: " + (error.response?.data?.message || error.message));
		} finally {
			set({ isLoading: false });
		}
	},

	updatePlaylist: async (id: string, updates: Partial<Playlist>) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/playlists/${id}`, updates);
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === id ? response.data : p)),
				currentPlaylist: state.currentPlaylist?._id === id ? response.data : state.currentPlaylist,
			}));
			toast.success("Cập nhật playlist thành công");
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			toast.error("Không thể cập nhật playlist");
		} finally {
			set({ isLoading: false });
		}
	},

	deletePlaylist: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/playlists/${id}`);
			set((state) => ({
				playlists: state.playlists.filter((p) => p._id !== id),
			}));
			toast.success("Xóa playlist thành công");
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			toast.error("Không thể xóa playlist");
		} finally {
			set({ isLoading: false });
		}
	},

	addSongToPlaylist: async (playlistId: string, songId: string) => {
		try {
			const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, {
				songId,
			});
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
			}));
			toast.success("Đã thêm bài vào playlist");
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(message === "Song already in playlist" ? "Bài này đã có trong playlist" : "Không thể thêm bài vào playlist");
		}
	},

	removeSongFromPlaylist: async (playlistId: string, songId: string) => {
		try {
			const response = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
			}));
			toast.success("Đã xóa bài khỏi playlist");
		} catch (error: any) {
			toast.error("Không thể xóa bài khỏi playlist");
		}
	},
}));
