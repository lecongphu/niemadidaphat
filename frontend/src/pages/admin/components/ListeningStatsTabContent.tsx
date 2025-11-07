import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Headphones, TrendingUp, Users, RefreshCw } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PopularSong {
	_id: string;
	listens: number;
	title: string;
	imageUrl: string;
	teacher: {
		name: string;
	};
}

interface DailyStat {
	_id: string;
	totalTime: number;
	completedSongs: number;
	uniqueUsersCount: number;
}

interface GlobalStats {
	totalListeningTime: number;
	totalListeningHours: number;
	uniqueListenersCount: number;
	popularSongs: PopularSong[];
	dailyStats: DailyStat[];
}

const ListeningStatsTabContent = () => {
	const [stats, setStats] = useState<GlobalStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [, setTick] = useState(0); // Force re-render for time update
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Initial fetch
		fetchGlobalStats();

		// Set up auto-refresh every 30 seconds
		intervalRef.current = setInterval(() => {
			fetchGlobalStats(true); // Silent refresh
		}, 30000);

		// Update "time ago" every second
		tickIntervalRef.current = setInterval(() => {
			setTick((prev) => prev + 1);
		}, 1000);

		// Cleanup intervals on unmount
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			if (tickIntervalRef.current) {
				clearInterval(tickIntervalRef.current);
			}
		};
	}, []);

	const fetchGlobalStats = async (silent = false) => {
		try {
			if (!silent) {
				setLoading(true);
			} else {
				setIsRefreshing(true);
			}
			const response = await axiosInstance.get("/listening/stats/global");
			setStats(response.data);
			setLastUpdate(new Date());
		} catch (error) {
			console.error("Error fetching global stats:", error);
		} finally {
			if (!silent) {
				setLoading(false);
			} else {
				setIsRefreshing(false);
			}
		}
	};

	const handleManualRefresh = () => {
		fetchGlobalStats();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-zinc-400">Đang tải thống kê...</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-zinc-400">Không có dữ liệu thống kê</div>
			</div>
		);
	}

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	};

	// Calculate total stats from last 7 days
	const last7Days = stats.dailyStats.slice(-7);
	const last7DaysTotal = last7Days.reduce((sum, day) => sum + day.completedSongs, 0);

	// Format last update time
	const getTimeSinceUpdate = () => {
		const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
		if (seconds < 60) return `${seconds} giây trước`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes} phút trước`;
		const hours = Math.floor(minutes / 60);
		return `${hours} giờ trước`;
	};

	return (
		<div className="space-y-6">
			{/* Header with Refresh Button */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="text-2xl font-bold">Thống Kê Realtime</h2>
					<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
						</span>
						<span className="text-xs font-medium text-red-500">LIVE</span>
					</div>
					{isRefreshing && (
						<div className="flex items-center gap-2 text-sm text-emerald-500">
							<RefreshCw className="h-4 w-4 animate-spin" />
							<span>Đang cập nhật...</span>
						</div>
					)}
				</div>
				<div className="flex items-center gap-4">
					<span className="text-sm text-zinc-400">
						Cập nhật lần cuối: {getTimeSinceUpdate()}
					</span>
					<Button
						onClick={handleManualRefresh}
						disabled={loading || isRefreshing}
						size="sm"
						variant="outline"
						className="gap-2"
					>
						<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
						Làm mới
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="bg-zinc-800/50 border-zinc-700 transition-all duration-300 hover:border-zinc-600">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng Thời Gian Nghe</CardTitle>
						<Clock className="h-4 w-4 text-emerald-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalListeningHours.toLocaleString()}h</div>
						<p className="text-xs text-zinc-400 mt-1">
							{formatTime(stats.totalListeningTime)}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-zinc-800/50 border-zinc-700 transition-all duration-300 hover:border-zinc-600">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Người Nghe</CardTitle>
						<Users className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.uniqueListenersCount}</div>
						<p className="text-xs text-zinc-400 mt-1">Tổng số người đã nghe</p>
					</CardContent>
				</Card>

				<Card className="bg-zinc-800/50 border-zinc-700 transition-all duration-300 hover:border-zinc-600">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">7 Ngày Qua</CardTitle>
						<TrendingUp className="h-4 w-4 text-purple-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{last7DaysTotal}</div>
						<p className="text-xs text-zinc-400 mt-1">Bài pháp đã hoàn thành</p>
					</CardContent>
				</Card>

				<Card className="bg-zinc-800/50 border-zinc-700 transition-all duration-300 hover:border-zinc-600">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Trung Bình/Người</CardTitle>
						<Headphones className="h-4 w-4 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Math.round(stats.totalListeningHours / (stats.uniqueListenersCount || 1))}h
						</div>
						<p className="text-xs text-zinc-400 mt-1">Thời gian nghe/người</p>
					</CardContent>
				</Card>
			</div>

			{/* Popular Songs */}
			<Card className="bg-zinc-800/50 border-zinc-700">
				<CardHeader>
					<CardTitle>Top 20 Bài Pháp Phổ Biến</CardTitle>
					<CardDescription>Xếp hạng theo số lượt nghe hoàn thành</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.popularSongs.map((song, index) => (
							<div
								key={song._id}
								className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
							>
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm font-bold">
									{index + 1}
								</div>
								<img
									src={getOptimizedImageUrl(song.imageUrl)}
									alt={song.title}
									className="w-12 h-12 rounded-md object-cover"
								/>
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{song.title}</div>
									<div className="text-sm text-zinc-400 truncate">{song.teacher.name}</div>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Headphones className="h-4 w-4 text-emerald-500" />
									<span className="font-medium">{song.listens.toLocaleString()}</span>
									<span className="text-zinc-400">lượt nghe</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Daily Stats Chart */}
			<Card className="bg-zinc-800/50 border-zinc-700">
				<CardHeader>
					<CardTitle>Thống Kê 30 Ngày Gần Đây</CardTitle>
					<CardDescription>Số bài pháp hoàn thành và người nghe mỗi ngày</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Completed Songs Chart */}
							<div>
								<h4 className="text-sm font-medium mb-3 text-zinc-400">Bài Pháp Hoàn Thành</h4>
								<div className="space-y-2">
									{stats.dailyStats.slice(-10).map((day) => (
										<div key={day._id} className="flex items-center gap-2">
											<div className="text-xs text-zinc-400 w-20">{day._id}</div>
											<div className="flex-1 h-6 bg-zinc-900 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-end pr-2"
													style={{
														width: `${Math.min((day.completedSongs / Math.max(...stats.dailyStats.map((d) => d.completedSongs))) * 100, 100)}%`,
													}}
												>
													<span className="text-xs font-medium text-white">
														{day.completedSongs}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Unique Users Chart */}
							<div>
								<h4 className="text-sm font-medium mb-3 text-zinc-400">Người Nghe</h4>
								<div className="space-y-2">
									{stats.dailyStats.slice(-10).map((day) => (
										<div key={day._id} className="flex items-center gap-2">
											<div className="text-xs text-zinc-400 w-20">{day._id}</div>
											<div className="flex-1 h-6 bg-zinc-900 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-2"
													style={{
														width: `${Math.min((day.uniqueUsersCount / Math.max(...stats.dailyStats.map((d) => d.uniqueUsersCount))) * 100, 100)}%`,
													}}
												>
													<span className="text-xs font-medium text-white">
														{day.uniqueUsersCount}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Summary Table */}
						<div className="mt-6 overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-zinc-700">
										<th className="text-left py-2 px-3 text-zinc-400 font-medium">Ngày</th>
										<th className="text-right py-2 px-3 text-zinc-400 font-medium">
											Bài Hoàn Thành
										</th>
										<th className="text-right py-2 px-3 text-zinc-400 font-medium">Người Nghe</th>
										<th className="text-right py-2 px-3 text-zinc-400 font-medium">
											Thời Gian Nghe
										</th>
									</tr>
								</thead>
								<tbody>
									{stats.dailyStats.slice(-10).reverse().map((day) => (
										<tr key={day._id} className="border-b border-zinc-800 hover:bg-zinc-900/30">
											<td className="py-2 px-3">{day._id}</td>
											<td className="py-2 px-3 text-right font-medium">
												{day.completedSongs}
											</td>
											<td className="py-2 px-3 text-right font-medium">
												{day.uniqueUsersCount}
											</td>
											<td className="py-2 px-3 text-right text-zinc-400">
												{formatTime(day.totalTime)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ListeningStatsTabContent;
