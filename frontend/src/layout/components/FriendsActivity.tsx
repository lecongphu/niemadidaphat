import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { HeadphonesIcon, Music, Users } from "lucide-react";
import { useEffect } from "react";

const FriendsActivity = () => {
	const { users, fetchUsers, onlineUsers, userActivities } = useChatStore();
	const { user } = useAuthStore();

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	return (
		<div className='h-full bg-zinc-900 rounded-lg flex flex-col'>
			<div className='p-4 flex justify-between items-center border-b border-zinc-800'>
				<div className='flex items-center gap-2'>
					<Users className='size-5 shrink-0' />
					<h2 className='font-semibold'>Những Phật Tử đang nghe pháp</h2>
				</div>
			</div>

			{!user && <LoginPrompt />}

			<ScrollArea className='flex-1'>
				<div className='p-4 space-y-4'>
					{users.map((user) => {
						const activity = userActivities.get(user._id);
						const isPlaying = activity && activity !== "Idle";

						// Parse activity - có thể là string hoặc object
						let songName = "";
						let artistName = "";

						if (isPlaying && activity) {
							if (typeof activity === "string") {
								// Nếu là string dạng "Playing Song by Artist"
								const cleaned = activity.replace("Playing ", "");
								const parts = cleaned.split(" by ");
								songName = parts[0] || "";
								artistName = parts[1] || "";
							} else if (typeof activity === "object") {
								// Nếu là object
								songName = (activity as any).song || (activity as any).title || "";
								artistName = (activity as any).artist || "";
							}
						}

						return (
							<div
								key={user._id}
								className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'
							>
								<div className='flex items-start gap-3'>
									<div className='relative'>
										<Avatar className='size-10 border border-zinc-800'>
											<AvatarImage src={user.imageUrl} alt={user.fullName} />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										<div
											className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900
												${onlineUsers.has(user._id) ? "bg-green-500" : "bg-zinc-500"}
												`}
											aria-hidden='true'
										/>
									</div>

									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2'>
											<span className='font-medium text-sm text-white'>{user.fullName}</span>
											{isPlaying && <Music className='size-3.5 text-emerald-400 shrink-0' />}
										</div>

										{isPlaying ? (
											<div className='mt-1'>
												<div className='mt-1 text-sm text-white font-medium truncate'>
													{songName}
												</div>
												<div className='text-xs text-zinc-400 truncate'>
													{artistName}
												</div>
											</div>
										) : (
											<div className='mt-1 text-xs text-zinc-400'>Đang nghỉ ngơi</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
};
export default FriendsActivity;

const LoginPrompt = () => (
	<div className='h-full flex flex-col items-center justify-center p-6 text-center space-y-4'>
		<div className='relative'>
			<div
				className='absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg
       opacity-75 animate-pulse'
				aria-hidden='true'
			/>
			<div className='relative bg-zinc-900 rounded-full p-4'>
				<HeadphonesIcon className='size-8 text-emerald-400' />
			</div>
		</div>

		<div className='space-y-2 max-w-[250px]'>
			<h3 className='text-lg font-semibold text-white'>Xem Phật Tử Khác Đang Nghe Gì</h3>
			<p className='text-sm text-zinc-400'>Đăng nhập để biết các Phật tử khác đang thưởng thức bài pháp nào</p>
		</div>
	</div>
);
