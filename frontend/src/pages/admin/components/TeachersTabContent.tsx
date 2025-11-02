import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import TeachersTable from "./TeachersTable";
import AddTeacherDialog from "./AddTeacherDialog";

const TeachersTabContent = () => {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Users className='size-5 text-violet-500' />
							Teachers
						</CardTitle>
						<CardDescription>Manage dharma teachers</CardDescription>
					</div>
					<AddTeacherDialog />
				</div>
			</CardHeader>
			<CardContent>
				<TeachersTable />
			</CardContent>
		</Card>
	);
};
export default TeachersTabContent;
