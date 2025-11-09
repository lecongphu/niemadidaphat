import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { Loader } from "lucide-react";
import { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { checkAuth, isLoading, user, isAuthenticated } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (isAuthenticated && user) {
			initSocket(user._id);
		} else {
			disconnectSocket();
		}

		return () => disconnectSocket();
	}, [isAuthenticated, user, initSocket, disconnectSocket]);

	if (isLoading)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-emerald-500 animate-spin' />
			</div>
		);

	return <>{children}</>;
};
export default AuthProvider;
