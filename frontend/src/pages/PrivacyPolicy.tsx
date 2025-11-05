const PrivacyPolicy = () => {
	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100'>
			<div className='max-w-4xl mx-auto px-6 py-12'>
				<h1 className='text-4xl font-bold mb-8'>Chính Sách Bảo Mật</h1>
				<p className='text-zinc-400 mb-8'>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

				<div className='space-y-8'>
					<section>
						<h2 className='text-2xl font-semibold mb-4'>1. Giới Thiệu</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chào mừng bạn đến với Niệm A Di Đà Phật. Chúng tôi cam kết bảo vệ quyền riêng tư và
							thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập,
							sử dụng và bảo vệ thông tin của bạn.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>2. Thông Tin Chúng Tôi Thu Thập</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>Khi bạn sử dụng dịch vụ của chúng tôi, chúng tôi có thể thu thập:</p>
							<ul className='list-disc list-inside space-y-2 ml-4'>
								<li>
									<strong>Thông tin tài khoản Google:</strong> Khi bạn đăng nhập bằng Google, chúng tôi
									thu thập tên, địa chỉ email và ảnh đại diện của bạn.
								</li>
								<li>
									<strong>Thông tin sử dụng:</strong> Các bài pháp bạn nghe, danh sách phát bạn tạo, và
									lịch sử hoạt động.
								</li>
								<li>
									<strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, và thông tin thiết bị.
								</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>3. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>Chúng tôi sử dụng thông tin của bạn để:</p>
							<ul className='list-disc list-inside space-y-2 ml-4'>
								<li>Cung cấp và duy trì dịch vụ của chúng tôi</li>
								<li>Cá nhân hóa trải nghiệm người dùng</li>
								<li>Gửi thông báo về cập nhật và tính năng mới</li>
								<li>Cải thiện và tối ưu hóa dịch vụ</li>
								<li>Bảo vệ an ninh và ngăn chặn gian lận</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>4. Đăng Nhập Bằng Google</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chúng tôi sử dụng Google Sign-In để xác thực người dùng. Khi bạn đăng nhập bằng Google:
						</p>
						<ul className='list-disc list-inside space-y-2 ml-4 mt-3 text-zinc-300'>
							<li>Chúng tôi chỉ yêu cầu quyền truy cập thông tin cơ bản (tên, email, ảnh đại diện)</li>
							<li>Chúng tôi không lưu trữ mật khẩu Google của bạn</li>
							<li>Bạn có thể thu hồi quyền truy cập bất cứ lúc nào từ tài khoản Google của bạn</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>5. Chia Sẻ Thông Tin</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, trừ
							khi:
						</p>
						<ul className='list-disc list-inside space-y-2 ml-4 mt-3 text-zinc-300'>
							<li>Có sự đồng ý của bạn</li>
							<li>Được yêu cầu bởi pháp luật</li>
							<li>Để bảo vệ quyền lợi của chúng tôi và người dùng khác</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>6. Bảo Mật Dữ Liệu</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chúng tôi sử dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin
							của bạn khỏi truy cập trái phép, mất mát hoặc lạm dụng. Tuy nhiên, không có phương thức
							truyền tải qua Internet nào là an toàn 100%.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>7. Quyền Của Bạn</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>Bạn có quyền:</p>
							<ul className='list-disc list-inside space-y-2 ml-4'>
								<li>Truy cập và xem thông tin cá nhân của bạn</li>
								<li>Yêu cầu sửa đổi hoặc xóa thông tin</li>
								<li>Từ chối hoặc hạn chế việc xử lý dữ liệu</li>
								<li>Xuất dữ liệu của bạn</li>
								<li>Xóa tài khoản của bạn</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>8. Cookies và Công Nghệ Theo Dõi</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chúng tôi sử dụng cookies và các công nghệ tương tự để duy trì phiên đăng nhập và cải
							thiện trải nghiệm người dùng. Bạn có thể quản lý tùy chọn cookies trong trình duyệt của
							mình.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>9. Thay Đổi Chính Sách</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo
							cho bạn về bất kỳ thay đổi quan trọng nào bằng cách đăng chính sách mới trên trang này.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>10. Liên Hệ</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi
							qua email: <a href='mailto:lecongphu1412@gmail.com' className='text-violet-400 hover:text-violet-300'>lecongphu1412@gmail.com</a>
						</p>
					</section>
				</div>

				<div className='mt-12 pt-8 border-t border-zinc-800'>
					<p className='text-zinc-500 text-sm text-center'>
						© {new Date().getFullYear()} Niệm A Di Đà Phật. Tất cả quyền được bảo lưu.
					</p>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicy;
