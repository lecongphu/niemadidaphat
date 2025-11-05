import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UsersTable from "./UsersTable";

const UsersTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<CardTitle>Quản Lý Người Dùng</CardTitle>
				<CardDescription>Theo dõi và quản lý người dùng trong hệ thống</CardDescription>
			</CardHeader>
			<CardContent>
				<UsersTable />
			</CardContent>
		</Card>
	);
};

export default UsersTabContent;
