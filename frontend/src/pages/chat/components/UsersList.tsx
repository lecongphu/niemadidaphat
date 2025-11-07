import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { Crown } from "lucide-react";

const UsersList = () => {
	const { users, selectedUser, isLoading, setSelectedUser, onlineUsers } = useChatStore();

	return (
		<div className='border-r border-zinc-800'>
			<div className='flex flex-col h-full'>
				<ScrollArea className='h-[calc(100vh-280px)]'>
					<div className='space-y-2 p-4'>
						{isLoading ? (
							<UsersListSkeleton />
						) : (
							users.map((user) => (
								<div
									key={user._id}
									onClick={() => setSelectedUser(user)}
									className={`flex items-center justify-center lg:justify-start gap-3 p-3 
										rounded-lg cursor-pointer transition-colors
                    ${selectedUser?._id === user._id ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
								>
									<div className='relative'>
										<Avatar className='size-8 md:size-12'>
											<AvatarImage src={user.imageUrl} />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										{/* online indicator */}
										<div
											className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-zinc-900
                        ${onlineUsers.has(user._id) ? "bg-green-500" : "bg-zinc-500"}`}
										/>
									</div>

									<div className='flex-1 min-w-0 lg:block hidden'>
										<div className='flex items-center gap-2'>
											<span className='font-medium truncate'>{user.fullName}</span>
											{user.isAdmin && (
												<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
													<Crown className="size-3" />
													Admin
												</span>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default UsersList;
