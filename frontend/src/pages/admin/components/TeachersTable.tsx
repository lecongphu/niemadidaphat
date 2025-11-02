import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Trash2 } from "lucide-react";

const TeachersTable = () => {
	const { teachers, isLoading, error, deleteTeacher } = useMusicStore();

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
									variant={"ghost"}
									size={"sm"}
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
									onClick={() => deleteTeacher(teacher._id)}
								>
									<Trash2 className='size-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
export default TeachersTable;
