import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserButton = () => {
	const { user, isAuthenticated, logout } = useAuthStore();
	const navigate = useNavigate();

	if (!isAuthenticated || !user) {
		return null;
	}

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="focus:outline-none">
					<Avatar className="size-8 cursor-pointer hover:opacity-80 transition">
						<AvatarImage src={user.imageUrl} alt={user.fullName} />
						<AvatarFallback>
							<User className="size-4" />
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.fullName}</p>
						<p className="text-xs leading-none text-zinc-400">{user.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-zinc-800" />
				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10"
				>
					<LogOut className="mr-2 size-4" />
					<span>Đăng xuất</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserButton;
