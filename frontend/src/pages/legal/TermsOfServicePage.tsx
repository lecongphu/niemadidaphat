import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const TermsOfServicePage = () => {
	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-100 flex flex-col'>
			<div className='max-w-4xl mx-auto px-4 py-8 flex-1'>
				<Link to='/' className='inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-8'>
					<span className='mr-2'>←</span> Quay lại Trang chủ
				</Link>

				<h1 className='text-4xl font-bold mb-8'>Điều Khoản Dịch Vụ</h1>
				
				<div className='space-y-6 text-zinc-300 leading-relaxed'>
					<section>
						<p className='text-sm text-zinc-400 mb-6'>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
						<p className='mb-4'>
							Chào mừng bạn đến với ứng dụng nghe nhạc của chúng tôi. Bằng việc sử dụng dịch vụ này, 
							bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>1. Chấp Nhận Điều Khoản</h2>
						<p>
							Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc, hiểu và 
							đồng ý bị ràng buộc bởi các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào 
							của các điều khoản, vui lòng không sử dụng dịch vụ.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>2. Mô Tả Dịch Vụ</h2>
						<p>
							Dịch vụ của chúng tôi cung cấp nền tảng nghe nhạc trực tuyến, cho phép người dùng:
						</p>
						<ul className='list-disc list-inside ml-4 mt-2 space-y-2'>
							<li>Phát và nghe nhạc trực tuyến</li>
							<li>Tạo và quản lý danh sách phát</li>
							<li>Tương tác với người dùng khác thông qua tính năng chat</li>
							<li>Khám phá và chia sẻ âm nhạc</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>3. Tài Khoản Người Dùng</h2>
						<p className='mb-2'>
							<strong>3.1. Đăng Ký:</strong> Để sử dụng một số tính năng của dịch vụ, bạn cần tạo 
							tài khoản. Bạn đồng ý cung cấp thông tin chính xác, đầy đủ và cập nhật.
						</p>
						<p className='mb-2'>
							<strong>3.2. Bảo Mật:</strong> Bạn có trách nhiệm bảo mật tài khoản và mật khẩu của 
							mình. Vui lòng thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi truy cập trái 
							phép nào.
						</p>
						<p>
							<strong>3.3. Độ Tuổi:</strong> Bạn phải từ 13 tuổi trở lên để sử dụng dịch vụ này.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>4. Quyền và Nghĩa Vụ Người Dùng</h2>
						<p className='mb-2'>
							<strong>4.1. Quyền Sử Dụng:</strong> Chúng tôi cấp cho bạn quyền không độc quyền, 
							có thể thu hồi để truy cập và sử dụng dịch vụ cho mục đích cá nhân, phi thương mại.
						</p>
						<p className='mb-2'>
							<strong>4.2. Hành Vi Bị Cấm:</strong> Bạn đồng ý không:
						</p>
						<ul className='list-disc list-inside ml-4 space-y-2'>
							<li>Vi phạm bất kỳ luật pháp nào</li>
							<li>Xâm phạm quyền sở hữu trí tuệ</li>
							<li>Tải lên nội dung độc hại, spam hoặc không phù hợp</li>
							<li>Can thiệp vào hoạt động của dịch vụ</li>
							<li>Sử dụng bot hoặc công cụ tự động trái phép</li>
							<li>Thu thập thông tin người dùng khác mà không có sự đồng ý</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>5. Nội Dung và Bản Quyền</h2>
						<p className='mb-2'>
							<strong>5.1. Nội Dung của Chúng Tôi:</strong> Tất cả nội dung trên dịch vụ (nhạc, hình ảnh, 
							văn bản, logo) thuộc sở hữu của chúng tôi hoặc các nhà cung cấp nội dung và được bảo vệ 
							bởi luật bản quyền.
						</p>
						<p className='mb-2'>
							<strong>5.2. Nội Dung Người Dùng:</strong> Bạn giữ quyền sở hữu nội dung mà bạn tải lên, 
							nhưng cấp cho chúng tôi giấy phép toàn cầu, không độc quyền để sử dụng, sao chép và hiển 
							thị nội dung đó trên dịch vụ.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>6. Chấm Dứt Dịch Vụ</h2>
						<p>
							Chúng tôi có quyền tạm ngưng hoặc chấm dứt quyền truy cập của bạn vào dịch vụ bất kỳ 
							lúc nào, với hoặc không có lý do, bao gồm nhưng không giới hạn ở việc vi phạm các điều 
							khoản này.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>7. Từ Chối Bảo Đảm</h2>
						<p>
							Dịch vụ được cung cấp "nguyên trạng" và "theo khả năng sẵn có". Chúng tôi không đảm bảo 
							rằng dịch vụ sẽ hoạt động liên tục, an toàn hoặc không có lỗi. Bạn sử dụng dịch vụ với 
							rủi ro của riêng mình.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>8. Giới Hạn Trách Nhiệm</h2>
						<p>
							Trong phạm vi tối đa được pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với 
							bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh 
							từ việc sử dụng hoặc không thể sử dụng dịch vụ.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>9. Thay Đổi Điều Khoản</h2>
						<p>
							Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Các thay đổi có hiệu lực 
							ngay khi được đăng tải. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa 
							với việc bạn chấp nhận các điều khoản mới.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>10. Luật Điều Chỉnh</h2>
						<p>
							Các điều khoản này được điều chỉnh bởi luật pháp Việt Nam mà không xét đến các quy định 
							về xung đột luật.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>11. Liên Hệ</h2>
						<p>
							Nếu bạn có bất kỳ câu hỏi nào về các Điều Khoản Dịch Vụ này, vui lòng liên hệ với chúng 
							tôi qua email: support@musicapp.com
						</p>
					</section>

					<div className='border-t border-zinc-700 pt-6 mt-8'>
						<p className='text-sm text-zinc-400'>
							Bằng việc sử dụng dịch vụ, bạn xác nhận rằng bạn đã đọc và hiểu các điều khoản này.
						</p>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default TermsOfServicePage;

