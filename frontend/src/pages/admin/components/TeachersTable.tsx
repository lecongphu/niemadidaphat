import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMusicStore } from "@/stores/useMusicStore";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Calendar, Trash2, Pencil, Award } from "lucide-react";
import { useState } from "react";
import EditTeacherDialog from "./EditTeacherDialog";
import { Teacher } from "@/types";

const TeachersTable = () => {
	const { teachers, isLoading, error, deleteTeacher } = useMusicStore();
	const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading teachers...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}

	return (
		<>
		{/* Mobile Card Layout */}
		<div className='md:hidden space-y-3'>
			{teachers.map((teacher) => (
				<Card key={teacher._id} className='bg-zinc-900 border-zinc-800'>
					<CardContent className='p-4'>
						<div className='flex gap-3'>
							<img
								src={getOptimizedImageUrl(teacher.imageUrl)}
								alt={teacher.name}
								className='w-16 h-16 rounded-full object-cover flex-shrink-0'
							/>
							<div className='flex-1 min-w-0'>
								<h3 className='font-medium text-white truncate'>{teacher.name}</h3>
								<p className='text-sm text-zinc-400 truncate'>{teacher.specialization}</p>
								<div className='flex items-center gap-3 mt-2 text-xs text-zinc-500'>
									<span className='flex items-center gap-1'>
										<Award className='h-3 w-3' />
										{teacher.yearsOfExperience} năm
									</span>
									<span className='flex items-center gap-1'>
										<Calendar className='h-3 w-3' />
										{teacher.createdAt.split("T")[0]}
									</span>
								</div>
							</div>
						</div>
						<div className='flex gap-2 mt-3 pt-3 border-t border-zinc-800'>
							<Button
								variant='outline'
								size='sm'
								className='flex-1 text-blue-400 border-blue-400/20 hover:bg-blue-400/10'
								onClick={() => setEditTeacher(teacher)}
							>
								<Pencil className='h-4 w-4 mr-2' />
								Sửa
							</Button>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										className='flex-1 text-red-400 border-red-400/20 hover:bg-red-400/10'
									>
										<Trash2 className='h-4 w-4 mr-2' />
										Xóa
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className='bg-zinc-900 border-zinc-700 max-w-[90vw] sm:max-w-lg'>
									<AlertDialogHeader>
										<AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
										<AlertDialogDescription className='text-zinc-400'>
											Bạn đang xóa giảng sư "<span className='font-medium text-white'>{teacher.name}</span>".
											Hành động này không thể hoàn tác.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className='bg-zinc-800 hover:bg-zinc-700 border-zinc-700'>
											Hủy
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => deleteTeacher(teacher._id)}
											className='bg-red-500 hover:bg-red-600 text-white'
										>
											Xóa
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</CardContent>
				</Card>
			))}
		</div>

		{/* Desktop Table Layout */}
		<div className='hidden md:block'>
			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead className='w-[50px]'></TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Specialization</TableHead>
						<TableHead>Years of Experience</TableHead>
						<TableHead>Added Date</TableHead>
						<TableHead className='text-right'>Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{teachers.map((teacher) => (
						<TableRow key={teacher._id} className='hover:bg-zinc-800/50'>
							<TableCell>
								<img src={teacher.imageUrl} alt={teacher.name} className='size-10 rounded-full object-cover' />
							</TableCell>
							<TableCell className='font-medium'>{teacher.name}</TableCell>
							<TableCell>{teacher.specialization}</TableCell>
							<TableCell>{teacher.yearsOfExperience} years</TableCell>
							<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Calendar className='h-4 w-4' />
									{teacher.createdAt.split("T")[0]}
								</span>
							</TableCell>

							<TableCell className='text-right'>
								<div className='flex gap-2 justify-end'>
									<Button
										variant='ghost'
										size='sm'
										className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
										onClick={() => setEditTeacher(teacher)}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant={"ghost"}
												size={"sm"}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
											>
												<Trash2 className='size-4' />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className='bg-zinc-900 border-zinc-700'>
											<AlertDialogHeader>
												<AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
												<AlertDialogDescription className='text-zinc-400'>
													Bạn đang xóa giảng sư "<span className='font-medium text-white'>{teacher.name}</span>".
													Hành động này không thể hoàn tác.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className='bg-zinc-800 hover:bg-zinc-700 border-zinc-700'>
													Hủy
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => deleteTeacher(teacher._id)}
													className='bg-red-500 hover:bg-red-600 text-white'
												>
													Xóa
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>

		{editTeacher && (
			<EditTeacherDialog
				teacher={editTeacher}
				open={!!editTeacher}
				onOpenChange={(open) => !open && setEditTeacher(null)}
			/>
		)}
		</>
	);
};
export default TeachersTable;
