import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import TopListenedSongs from "@/components/TopListenedSongs";

const HomePage = () => {
	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<SEO
				title="Trang Chủ"
				description="Niệm A Di Đà Phật - Thư viện bài pháp Phật giáo online. Nghe kinh Phật, bài giảng Phật pháp, thiền học miễn phí. Hướng dẫn tu hành, niệm Phật, tụng kinh."
				type="website"
				url="/"
				keywords={[
					"niệm phật online",
					"kinh phật audio",
					"bài giảng phật pháp",
					"tu hành phật giáo",
					"thiền học",
					"tụng kinh",
					"a di đà phật",
				]}
			/>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6 space-y-8'>
					<h1 className='text-2xl sm:text-3xl font-bold'>Nam Mô A Di Đà Phật</h1>

					{/* Top Listened Songs */}
					<TopListenedSongs />
				</div>

				{/* Footer */}
				<footer className='mt-12 py-8 px-4 sm:px-6 border-t border-zinc-700/50'>
					<div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
						<p className='text-zinc-500 text-sm'>
							© {new Date().getFullYear()} Niệm A Di Đà Phật.
						</p>
						<div className='flex items-center gap-6 text-sm'>
							<Link
								to='/privacy-policy'
								className='text-zinc-400 hover:text-violet-400 transition-colors'
							>
								Chính Sách Bảo Mật
							</Link>
							<Link
								to='/terms-of-service'
								className='text-zinc-400 hover:text-violet-400 transition-colors'
							>
								Điều Khoản Dịch Vụ
							</Link>
						</div>
					</div>
				</footer>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
