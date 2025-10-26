import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className='bg-zinc-900/50 border-t border-zinc-800 py-6 mt-auto'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='flex flex-col md:flex-row justify-between items-center gap-4'>
					<div className='text-zinc-400 text-sm'>
						© {new Date().getFullYear()} Pháp Âm App. Phật Pháp không có bản quyền.
					</div>
					
					<div className='flex gap-6 text-sm'>
						<Link 
							to='/terms-of-service' 
							className='text-zinc-400 hover:text-emerald-400 transition-colors'
						>
							Terms of Service
						</Link>
						<Link 
							to='/privacy-policy' 
							className='text-zinc-400 hover:text-emerald-400 transition-colors'
						>
							Privacy Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

