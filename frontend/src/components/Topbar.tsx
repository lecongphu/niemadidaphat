import { LayoutDashboardIcon, HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import UserButton from "./UserButton";
import SearchBar from "./SearchBar";

const Topbar = () => {
	const { isAuthenticated, user } = useAuthStore();
	const isAdmin = user?.isAdmin || false;

	return (
		<div
			className='flex items-center justify-between gap-4 p-4 sticky top-0 bg-zinc-900/75
      backdrop-blur-md z-10
    '
		>
			<div className='flex gap-2 items-center flex-shrink-0'>
				<Link to={"/"} className={cn(buttonVariants({ variant: "ghost" }))}>
					<HomeIcon className='size-5 mr-2' />
					<span className='hidden sm:inline'>Trang Chủ</span>
				</Link>
			</div>

			{/* Search Bar - centered and flexible */}
			<div className='flex-1 max-w-2xl mx-auto'>
				<SearchBar />
			</div>

			<div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4 sm:mr-2' />
						<span className='hidden sm:inline'>Quản Trị</span>
					</Link>
				)}

				{!isAuthenticated && <SignInOAuthButtons />}

				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;
