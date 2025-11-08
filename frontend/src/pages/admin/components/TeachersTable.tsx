import { Button } from "@/components/ui/button";
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
import { Calendar, Trash2, Pencil } from "lucide-react";
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
