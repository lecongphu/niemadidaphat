import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import UserButton from "./UserButton";

const Topbar = () => {
	const { isAuthenticated, user } = useAuthStore();
	const isAdmin = user?.isAdmin || false;

	return (
		<div
			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75
      backdrop-blur-md z-10
    '
		>
			<div className='flex gap-2 items-center'>
				<img src='/sen.png' className='size-8' alt='ADiDaPhat logo' />
				Tam Thánh Đường
			</div>
			<div className='flex items-center gap-4'>
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4  mr-2' />
						Quản Trị
					</Link>
				)}

				{!isAuthenticated && <SignInOAuthButtons />}

				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;
