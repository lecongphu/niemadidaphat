import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CategoriesTable from "./CategoriesTable";
import AddCategoryDialog from "./AddCategoryDialog";

const CategoriesTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>Chủ Đề Bài Pháp</CardTitle>
						<CardDescription>Quản lý các chủ đề/danh mục bài pháp</CardDescription>
					</div>
					<AddCategoryDialog />
				</div>
			</CardHeader>
			<CardContent>
				<CategoriesTable />
			</CardContent>
		</Card>
	);
};

export default CategoriesTabContent;
