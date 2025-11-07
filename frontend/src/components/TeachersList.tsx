import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";

interface Teacher {
	_id: string;
	name: string;
	bio: string;
	imageUrl: string;
	specialization: string;
	yearsOfExperience: number;
	createdAt: string;
}

const TeachersList = () => {
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [loading, setLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Socket.IO realtime updates for teachers
	useSocket({
		onTeacherCreated: () => {
			console.log("Teacher created via Socket.IO");
			fetchTeachers(true); // Silent refresh
		},
		onTeacherUpdated: () => {
			console.log("Teacher updated via Socket.IO");
			fetchTeachers(true); // Silent refresh
		},
		onTeacherDeleted: () => {
			console.log("Teacher deleted via Socket.IO");
			fetchTeachers(true); // Silent refresh
		},
	});

	useEffect(() => {
		fetchTeachers();
	}, []);

	const fetchTeachers = async (silent: boolean = false) => {
		try {
			if (!silent) {
				setLoading(true);
			} else {
				setIsRefreshing(true);
			}
			const response = await axiosInstance.get("/teachers");
			setTeachers(response.data);
		} catch (error) {
			console.error("Error fetching teachers:", error);
		} finally {
			setLoading(false);
			setIsRefreshing(false);
		}
	};

	const handleManualRefresh = () => {
		fetchTeachers(true);
	};

	if (loading) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5 text-blue-500" />
						<CardTitle>Pháp Sư</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center text-zinc-400 py-8">Đang tải...</div>
				</CardContent>
			</Card>
		);
	}

	if (teachers.length === 0) {
		return (
			<Card className="bg-zinc-900/50 border-zinc-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5 text-blue-500" />
						<CardTitle>Pháp Sư</CardTitle>
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
						<Users className="h-5 w-5 text-blue-500" />
						<CardTitle>Pháp Sư</CardTitle>
						<div className="flex items-center gap-2 ml-3">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
							</span>
							<span className="text-xs font-medium text-blue-500">LIVE</span>
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
					{teachers.map((teacher) => (
						<div
							key={teacher._id}
							className="group p-4 hover:bg-zinc-800/50 rounded-lg transition-all border border-transparent hover:border-blue-500/20"
						>
							<div className="flex flex-col items-center text-center">
								<div className="relative w-24 h-24 mb-3">
									<img
										src={getOptimizedImageUrl(teacher.imageUrl)}
										alt={teacher.name}
										className="w-full h-full rounded-full object-cover shadow-lg group-hover:shadow-blue-500/20 transition-shadow"
									/>
								</div>
								<div className="space-y-1 w-full">
									<p className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
										{teacher.name}
									</p>
									<p className="text-sm text-zinc-400 truncate">
										{teacher.specialization}
									</p>
									<p className="text-xs text-zinc-500">
										{teacher.yearsOfExperience} năm kinh nghiệm
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default TeachersList;
