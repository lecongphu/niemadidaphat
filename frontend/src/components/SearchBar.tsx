import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { Song, Album, Teacher } from "@/types";
import { getName, getOptimizedImageUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";

interface SearchResult {
	songs: Song[];
	albums: Album[];
	teachers: Teacher[];
}

const SearchBar = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const { setCurrentSong } = usePlayerStore();

	// Debounce search
	useEffect(() => {
		if (!query.trim()) {
			setResults(null);
			return;
		}

		const timeoutId = setTimeout(async () => {
			try {
				setIsLoading(true);
				const response = await axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);
				setResults(response.data);
			} catch (error) {
				console.error("Search error:", error);
				setResults(null);
			} finally {
				setIsLoading(false);
			}
		}, 300); // 300ms debounce

		return () => clearTimeout(timeoutId);
	}, [query]);

	// Click outside to close
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsFocused(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!results) return;

		const totalItems =
			(results.songs?.length || 0) + (results.albums?.length || 0) + (results.teachers?.length || 0);

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			handleSelectItem(selectedIndex);
		} else if (e.key === "Escape") {
			setIsFocused(false);
			inputRef.current?.blur();
		}
	};

	const handleSelectItem = (index: number) => {
		if (!results || index < 0) return;

		let currentIndex = 0;

		// Songs
		if (results.songs && index < results.songs.length) {
			const song = results.songs[index];
			setCurrentSong(song);
			clearSearch();
			return;
		}
		currentIndex += results.songs?.length || 0;

		// Albums
		if (results.albums && index < currentIndex + results.albums.length) {
			const album = results.albums[index - currentIndex];
			navigate(`/albums/${album._id}`);
			clearSearch();
			return;
		}
		currentIndex += results.albums?.length || 0;

		// Teachers
		if (results.teachers && index < currentIndex + results.teachers.length) {
			const teacher = results.teachers[index - currentIndex];
			navigate(`/teachers/${teacher._id}`);
			clearSearch();
			return;
		}
	};

	const clearSearch = () => {
		setQuery("");
		setResults(null);
		setIsFocused(false);
		setSelectedIndex(-1);
	};

	const showResults = isFocused && results && query.trim().length > 0;

	return (
		<div ref={searchRef} className="relative w-full">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
				<Input
					ref={inputRef}
					type="text"
					placeholder="Tìm bài pháp, bộ kinh, pháp sư..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onKeyDown={handleKeyDown}
					className="w-full pl-10 pr-10 bg-zinc-800 border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
				/>
				{isLoading && (
					<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin" />
				)}
				{query && !isLoading && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
						onClick={clearSearch}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Search Results Dropdown */}
			{showResults && (
				<div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-h-[500px] overflow-y-auto z-50">
					{/* Songs */}
					{results.songs && results.songs.length > 0 && (
						<div className="p-2">
							<div className="text-xs font-semibold text-zinc-400 px-2 py-1 uppercase">Bài Pháp</div>
							{results.songs.map((song, index) => (
								<button
									key={song._id}
									className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition-colors ${
										selectedIndex === index ? "bg-zinc-800" : ""
									}`}
									onClick={() => {
										setCurrentSong(song);
										clearSearch();
									}}
								>
									<img
										src={getOptimizedImageUrl(song.imageUrl)}
										alt={song.title}
										className="w-12 h-12 rounded object-cover flex-shrink-0"
									/>
									<div className="flex-1 text-left min-w-0">
										<div className="font-medium text-white truncate">{song.title}</div>
										<div className="text-sm text-zinc-400 truncate">{getName(song.teacher)}</div>
									</div>
								</button>
							))}
						</div>
					)}

					{/* Albums */}
					{results.albums && results.albums.length > 0 && (
						<div className="p-2 border-t border-zinc-800">
							<div className="text-xs font-semibold text-zinc-400 px-2 py-1 uppercase">Bộ Kinh</div>
							{results.albums.map((album, index) => {
								const globalIndex = (results.songs?.length || 0) + index;
								return (
									<button
										key={album._id}
										className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition-colors ${
											selectedIndex === globalIndex ? "bg-zinc-800" : ""
										}`}
										onClick={() => {
											navigate(`/albums/${album._id}`);
											clearSearch();
										}}
									>
										<img
											src={getOptimizedImageUrl(album.imageUrl)}
											alt={album.title}
											className="w-12 h-12 rounded object-cover flex-shrink-0"
										/>
										<div className="flex-1 text-left min-w-0">
											<div className="font-medium text-white truncate">{album.title}</div>
											<div className="text-sm text-zinc-400 truncate">
												{getName(album.teacher)} • {album.releaseYear}
											</div>
										</div>
									</button>
								);
							})}
						</div>
					)}

					{/* Teachers */}
					{results.teachers && results.teachers.length > 0 && (
						<div className="p-2 border-t border-zinc-800">
							<div className="text-xs font-semibold text-zinc-400 px-2 py-1 uppercase">Pháp Sư</div>
							{results.teachers.map((teacher, index) => {
								const globalIndex = (results.songs?.length || 0) + (results.albums?.length || 0) + index;
								return (
									<button
										key={teacher._id}
										className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-amber-100 dark:hover:bg-zinc-800 transition-colors ${
											selectedIndex === globalIndex ? "bg-amber-100 dark:bg-zinc-800" : ""
										}`}
										onClick={() => {
											navigate(`/teachers/${teacher._id}`);
											clearSearch();
										}}
									>
										<img
											src={getOptimizedImageUrl(teacher.imageUrl)}
											alt={teacher.name}
											className="w-12 h-12 rounded-full object-cover flex-shrink-0"
										/>
										<div className="flex-1 text-left min-w-0">
											<div className="font-medium text-amber-900 dark:text-white truncate">{teacher.name}</div>
											<div className="text-sm text-amber-700 dark:text-zinc-400 truncate">{teacher.specialization}</div>
										</div>
									</button>
								);
							})}
						</div>
					)}

					{/* No results */}
					{results.songs?.length === 0 && results.albums?.length === 0 && results.teachers?.length === 0 && (
						<div className="p-4 text-center text-zinc-400">
							<div className="text-sm">Không tìm thấy kết quả cho "{query}"</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchBar;
