import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LogOut, Circle } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "@/stores/useChatStore";

interface User {
	_id: string;
	email: string;
	fullName: string;
	imageUrl: string;
	isOnline: boolean;
	lastActive: string;
}

const UsersTable = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const { socket } = useChatStore();

	const fetchUsers = async () => {
		try {
			const response = await axiosInstance.get("/admin/users");
			setUsers(response.data || []);
		} catch (error: any) {
			console.error("Error fetching users:", error);
			toast.error("Không thể tải danh sách người dùng");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleUserConnected = (userId: string) => {
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user._id === userId ? { ...user, isOnline: true, lastActive: new Date().toISOString() } : user
				)
			);
		};

		const handleUserDisconnected = (userId: string) => {
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user._id === userId ? { ...user, isOnline: false, lastActive: new Date().toISOString() } : user
				)
			);
		};

		socket.on("user_connected", handleUserConnected);
		socket.on("user_disconnected", handleUserDisconnected);

		return () => {
			socket.off("user_connected", handleUserConnected);
			socket.off("user_disconnected", handleUserDisconnected);
		};
	}, [socket]);

	const handleForceLogout = async (userId: string, fullName: string) => {
		if (!confirm(`Bạn có chắc chắn muốn đăng xuất ${fullName}?`)) return;

		try {
			await axiosInstance.post(`/admin/users/${userId}/logout`);
			toast.success(`Đã đăng xuất ${fullName}`);
			// Update local state
			setUsers((prevUsers) =>
				prevUsers.map((user) => (user._id === userId ? { ...user, isOnline: false } : user))
			);
		} catch (error: any) {
			console.error("Error forcing logout:", error);
			toast.error("Không thể đăng xuất người dùng");
		}
	};

	const formatLastActive = (lastActive: string) => {
		const date = new Date(lastActive);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return "Vừa xong";
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
		return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
	};

	if (loading) {
		return <div className="text-center py-8">Đang tải...</div>;
	}

	if (!users || users.length === 0) {
		return <div className="text-center py-8 text-zinc-400">Không có người dùng nào</div>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className="hover:bg-zinc-800/50">
					<TableHead className="w-[50px]">Trạng thái</TableHead>
					<TableHead>Người dùng</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Hoạt động gần nhất</TableHead>
					<TableHead className="text-right">Hành động</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user._id} className="hover:bg-zinc-800/50">
						<TableCell>
							<Circle
								className={`size-3 ${user.isOnline ? "fill-green-500 text-green-500" : "fill-zinc-500 text-zinc-500"}`}
							/>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-3">
								<img
									src={user.imageUrl || "/avatar.png"}
									alt={user.fullName}
									className="size-10 rounded-full object-cover"
								/>
								<div>
									<div className="font-medium">{user.fullName}</div>
								</div>
							</div>
						</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell>{formatLastActive(user.lastActive)}</TableCell>
						<TableCell className="text-right">
							{user.isOnline && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleForceLogout(user._id, user.fullName)}
									className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
								>
									<LogOut className="size-4 mr-2" />
									Đăng xuất
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default UsersTable;
