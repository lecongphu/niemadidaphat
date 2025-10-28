import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-100 flex flex-col'>
			<div className='max-w-4xl mx-auto px-4 py-8 flex-1'>
				<Link to='/' className='inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-8'>
					<span className='mr-2'>←</span> Quay lại Trang chủ
				</Link>

				<h1 className='text-4xl font-bold mb-8'>Chính Sách Bảo Mật</h1>
				
				<div className='space-y-6 text-zinc-300 leading-relaxed'>
					<section>
						<p className='text-sm text-zinc-400 mb-6'>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
						<p className='mb-4'>
							Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách 
							chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi sử dụng dịch vụ.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>1. Thông Tin Chúng Tôi Thu Thập</h2>
						
						<div className='mb-4'>
							<h3 className='text-xl font-semibold text-zinc-200 mb-2'>1.1. Thông Tin Bạn Cung Cấp</h3>
							<ul className='list-disc list-inside ml-4 space-y-2'>
								<li><strong>Thông tin tài khoản:</strong> Tên, email, ảnh đại diện khi bạn đăng ký</li>
								<li><strong>Thông tin hồ sơ:</strong> Thông tin bổ sung bạn chọn thêm vào hồ sơ</li>
								<li><strong>Nội dung:</strong> Tin nhắn, danh sách phát và nội dung khác bạn tạo</li>
							</ul>
						</div>

						<div className='mb-4'>
							<h3 className='text-xl font-semibold text-zinc-200 mb-2'>1.2. Thông Tin Thu Thập Tự Động</h3>
							<ul className='list-disc list-inside ml-4 space-y-2'>
								<li><strong>Dữ liệu sử dụng:</strong> Bài hát bạn nghe, thời gian nghe, danh sách phát</li>
								<li><strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều hành, trình duyệt</li>
								<li><strong>Địa chỉ IP:</strong> Địa chỉ IP và vị trí địa lý gần đúng</li>
								<li><strong>Cookies:</strong> Dữ liệu từ cookies và công nghệ theo dõi tương tự</li>
							</ul>
						</div>

						<div>
							<h3 className='text-xl font-semibold text-zinc-200 mb-2'>1.3. Thông Tin Từ Bên Thứ Ba</h3>
							<p>
								Khi bạn đăng nhập thông qua các dịch vụ như Google hoặc GitHub, chúng tôi nhận được 
								thông tin cơ bản từ họ theo quyền bạn cấp.
							</p>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>2. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
						<p className='mb-2'>Chúng tôi sử dụng thông tin của bạn để:</p>
						<ul className='list-disc list-inside ml-4 space-y-2'>
							<li>Cung cấp, vận hành và duy trì dịch vụ</li>
							<li>Cải thiện, cá nhân hóa và mở rộng dịch vụ</li>
							<li>Hiểu và phân tích cách bạn sử dụng dịch vụ</li>
							<li>Giao tiếp với bạn về cập nhật, bảo mật và hỗ trợ</li>
							<li>Gửi thông tin marketing (với sự đồng ý của bạn)</li>
							<li>Phát hiện và ngăn chặn gian lận, lạm dụng</li>
							<li>Tuân thủ nghĩa vụ pháp lý</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>3. Chia Sẻ Thông Tin</h2>
						<p className='mb-2'>Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp:</p>
						
						<div className='space-y-3 ml-4'>
							<div>
								<p className='font-semibold'>3.1. Với Người Dùng Khác</p>
								<p className='text-sm mt-1'>
									Thông tin hồ sơ công khai, hoạt động nghe nhạc có thể được hiển thị cho người dùng 
									khác theo cài đặt quyền riêng tư của bạn.
								</p>
							</div>

							<div>
								<p className='font-semibold'>3.2. Với Nhà Cung Cấp Dịch Vụ</p>
								<p className='text-sm mt-1'>
									Chúng tôi làm việc với các công ty bên thứ ba để hỗ trợ dịch vụ (lưu trữ, phân tích, 
									xác thực).
								</p>
							</div>

							<div>
								<p className='font-semibold'>3.3. Yêu Cầu Pháp Lý</p>
								<p className='text-sm mt-1'>
									Khi luật pháp yêu cầu hoặc để bảo vệ quyền và an toàn của chúng tôi và người khác.
								</p>
							</div>

							<div>
								<p className='font-semibold'>3.4. Chuyển Nhượng Kinh Doanh</p>
								<p className='text-sm mt-1'>
									Trong trường hợp sáp nhập, mua lại hoặc bán tài sản.
								</p>
							</div>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>4. Bảo Mật Dữ Liệu</h2>
						<p className='mb-2'>
							Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin của bạn, bao gồm:
						</p>
						<ul className='list-disc list-inside ml-4 space-y-2'>
							<li>Mã hóa dữ liệu trong quá trình truyền tải (HTTPS/SSL)</li>
							<li>Mã hóa mật khẩu và dữ liệu nhạy cảm</li>
							<li>Kiểm soát truy cập nghiêm ngặt</li>
							<li>Giám sát và kiểm tra bảo mật thường xuyên</li>
							<li>Đào tạo nhân viên về bảo mật dữ liệu</li>
						</ul>
						<p className='mt-3 text-sm text-zinc-400'>
							Tuy nhiên, không có phương thức truyền tải qua Internet nào là hoàn toàn an toàn 100%.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>5. Quyền Của Bạn</h2>
						<p className='mb-2'>Bạn có các quyền sau đối với dữ liệu cá nhân:</p>
						<ul className='list-disc list-inside ml-4 space-y-2'>
							<li><strong>Quyền truy cập:</strong> Yêu cầu bản sao dữ liệu cá nhân</li>
							<li><strong>Quyền sửa đổi:</strong> Yêu cầu chỉnh sửa thông tin không chính xác</li>
							<li><strong>Quyền xóa:</strong> Yêu cầu xóa dữ liệu cá nhân</li>
							<li><strong>Quyền hạn chế:</strong> Yêu cầu hạn chế xử lý dữ liệu</li>
							<li><strong>Quyền phản đối:</strong> Phản đối việc xử lý dữ liệu</li>
							<li><strong>Quyền di chuyển:</strong> Nhận dữ liệu ở định dạng có thể đọc được</li>
							<li><strong>Quyền rút lại đồng ý:</strong> Rút lại sự đồng ý bất kỳ lúc nào</li>
						</ul>
						<p className='mt-3'>
							Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email: privacy@musicapp.com
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>6. Lưu Trữ Dữ Liệu</h2>
						<p>
							Chúng tôi lưu trữ thông tin của bạn chỉ trong thời gian cần thiết để cung cấp dịch vụ 
							và tuân thủ nghĩa vụ pháp lý. Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa 
							dữ liệu của bạn, trừ khi cần giữ lại vì lý do pháp lý.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>7. Cookies và Công Nghệ Theo Dõi</h2>
						<p className='mb-2'>
							Chúng tôi sử dụng cookies và công nghệ tương tự để:
						</p>
						<ul className='list-disc list-inside ml-4 space-y-2'>
							<li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
							<li>Hiểu cách bạn sử dụng dịch vụ</li>
							<li>Cải thiện hiệu suất và trải nghiệm người dùng</li>
							<li>Cung cấp nội dung được cá nhân hóa</li>
						</ul>
						<p className='mt-3'>
							Bạn có thể kiểm soát cookies thông qua cài đặt trình duyệt của mình.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>8. Quyền Riêng Tư Của Trẻ Em</h2>
						<p>
							Dịch vụ của chúng tôi không dành cho người dưới 13 tuổi. Chúng tôi không cố ý thu thập 
							thông tin từ trẻ em dưới 13 tuổi. Nếu bạn là cha mẹ/người giám hộ và biết con bạn đã 
							cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi có thể thực hiện các 
							hành động cần thiết.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>9. Chuyển Dữ Liệu Quốc Tế</h2>
						<p>
							Thông tin của bạn có thể được chuyển và lưu trữ trên máy chủ ở các quốc gia khác nhau. 
							Chúng tôi đảm bảo rằng việc chuyển dữ liệu này tuân thủ các quy định về bảo vệ dữ liệu 
							hiện hành.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>10. Thay Đổi Chính Sách</h2>
						<p>
							Chúng tôi có thể cập nhật Chính Sách Bảo Mật này theo thời gian. Chúng tôi sẽ thông báo 
							cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật 
							ngày "Cập nhật lần cuối". Bạn nên xem lại chính sách này định kỳ để biết về các thay đổi.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>11. Liên Hệ</h2>
						<p className='mb-2'>
							Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về Chính Sách Bảo Mật này, vui lòng liên hệ:
						</p>
						<ul className='ml-4 space-y-1'>
							<li>Email: privacy@musicapp.com</li>
							<li>Email hỗ trợ: support@musicapp.com</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold text-zinc-100 mb-4'>12. Đồng Ý</h2>
						<p>
							Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý với việc thu thập và sử dụng thông 
							tin như được mô tả trong Chính Sách Bảo Mật này.
						</p>
					</section>

					<div className='border-t border-zinc-700 pt-6 mt-8'>
						<p className='text-sm text-zinc-400'>
							Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Cảm ơn bạn đã tin tưởng 
							sử dụng dịch vụ của chúng tôi.
						</p>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default PrivacyPolicyPage;

