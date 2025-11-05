const TermsOfService = () => {
	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100'>
			<div className='max-w-4xl mx-auto px-6 py-12'>
				<h1 className='text-4xl font-bold mb-8'>Điều Khoản Dịch Vụ</h1>
				<p className='text-zinc-400 mb-8'>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

				<div className='space-y-8'>
					<section>
						<h2 className='text-2xl font-semibold mb-4'>1. Chấp Nhận Điều Khoản</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Bằng việc truy cập và sử dụng trang web Niệm A Di Đà Phật ("Dịch vụ"), bạn đồng ý tuân
							thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với
							bất kỳ phần nào của các điều khoản này, bạn không được phép sử dụng dịch vụ của chúng
							tôi.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>2. Mô Tả Dịch Vụ</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Niệm A Di Đà Phật là một nền tảng chia sẻ và nghe các bài pháp Phật giáo. Dịch vụ của
							chúng tôi bao gồm:
						</p>
						<ul className='list-disc list-inside space-y-2 ml-4 mt-3 text-zinc-300'>
							<li>Thư viện các bài pháp âm thanh từ các pháp sư</li>
							<li>Tính năng tạo và quản lý danh sách phát cá nhân</li>
							<li>Tính năng chat và kết nối với cộng đồng</li>
							<li>Khả năng chia sẻ và khám phá nội dung Phật pháp</li>
						</ul>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>3. Tài Khoản Người Dùng</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>
								<strong>3.1 Đăng Ký:</strong> Để sử dụng một số tính năng của dịch vụ, bạn cần tạo
								tài khoản bằng cách đăng nhập qua Google. Bạn phải cung cấp thông tin chính xác và đầy
								đủ.
							</p>
							<p>
								<strong>3.2 Bảo Mật Tài Khoản:</strong> Bạn chịu trách nhiệm duy trì tính bảo mật của
								tài khoản và tất cả các hoạt động diễn ra dưới tài khoản của bạn.
							</p>
							<p>
								<strong>3.3 Hạn Chế Đăng Nhập:</strong> Mỗi tài khoản chỉ được đăng nhập trên một
								thiết bị tại một thời điểm. Đăng nhập trên thiết bị mới sẽ tự động đăng xuất thiết bị
								cũ.
							</p>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>4. Quy Tắc Sử Dụng</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý KHÔNG:</p>
							<ul className='list-disc list-inside space-y-2 ml-4'>
								<li>Vi phạm bất kỳ luật pháp hoặc quy định nào</li>
								<li>Đăng tải nội dung vi phạm bản quyền hoặc quyền sở hữu trí tuệ</li>
								<li>Đăng tải nội dung khiêu dâm, bạo lực, hoặc gây thù hận</li>
								<li>Làm phiền, quấy rối hoặc đe dọa người dùng khác</li>
								<li>Sử dụng bot, script hoặc công cụ tự động để truy cập dịch vụ</li>
								<li>Cố gắng truy cập trái phép vào hệ thống hoặc dữ liệu</li>
								<li>Thu thập thông tin người dùng khác mà không có sự đồng ý</li>
								<li>Phát tán virus, malware hoặc mã độc hại</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>5. Nội Dung Người Dùng</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>
								<strong>5.1 Quyền Sở Hữu:</strong> Bạn giữ quyền sở hữu đối với nội dung mà bạn tạo ra
								(như danh sách phát, bình luận).
							</p>
							<p>
								<strong>5.2 Cấp Phép:</strong> Bằng việc đăng tải nội dung, bạn cấp cho chúng tôi một
								giấy phép toàn cầu, không độc quyền, miễn phí để sử dụng, sao chép, và hiển thị nội
								dung đó nhằm mục đích cung cấp dịch vụ.
							</p>
							<p>
								<strong>5.3 Trách Nhiệm:</strong> Bạn chịu trách nhiệm về nội dung mà bạn đăng tải.
								Chúng tôi có quyền xóa bất kỳ nội dung nào vi phạm điều khoản dịch vụ.
							</p>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>6. Quyền Sở Hữu Trí Tuệ</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Tất cả nội dung trên dịch vụ của chúng tôi, bao gồm nhưng không giới hạn ở văn bản, đồ
							họa, logo, biểu tượng, hình ảnh, âm thanh, và phần mềm, là tài sản của chúng tôi hoặc
							các nhà cung cấp nội dung và được bảo vệ bởi luật bản quyền và sở hữu trí tuệ.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>7. Chấm Dứt Dịch Vụ</h2>
						<div className='text-zinc-300 leading-relaxed space-y-3'>
							<p>
								Chúng tôi có quyền đình chỉ hoặc chấm dứt quyền truy cập của bạn vào dịch vụ bất cứ
								lúc nào, không cần thông báo trước, nếu:
							</p>
							<ul className='list-disc list-inside space-y-2 ml-4'>
								<li>Bạn vi phạm các điều khoản dịch vụ này</li>
								<li>Chúng tôi nghi ngờ hoạt động gian lận hoặc trái phép</li>
								<li>Theo yêu cầu của pháp luật</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>8. Từ Chối Bảo Đảm</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Dịch vụ được cung cấp "như hiện có" và "như sẵn có". Chúng tôi không đảm bảo rằng dịch
							vụ sẽ không bị gián đoạn, không có lỗi, hoặc an toàn tuyệt đối. Bạn sử dụng dịch vụ với
							rủi ro của riêng mình.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>9. Giới Hạn Trách Nhiệm</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Trong phạm vi tối đa được pháp luật cho phép, chúng tôi không chịu trách nhiệm về bất kỳ
							thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc
							sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>10. Bồi Thường</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Bạn đồng ý bồi thường và giữ cho chúng tôi không bị thiệt hại từ bất kỳ khiếu nại, tổn
							thất, trách nhiệm pháp lý, chi phí hoặc phí tổn (bao gồm phí luật sư hợp lý) phát sinh từ
							việc bạn sử dụng dịch vụ hoặc vi phạm các điều khoản này.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>11. Thay Đổi Điều Khoản</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Chúng tôi có quyền sửa đổi các điều khoản dịch vụ này bất cứ lúc nào. Chúng tôi sẽ thông
							báo cho bạn về các thay đổi quan trọng bằng cách đăng thông báo trên trang web. Việc tiếp
							tục sử dụng dịch vụ sau khi thay đổi có nghĩa là bạn chấp nhận các điều khoản mới.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>12. Luật Áp Dụng</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Các điều khoản này được điều chỉnh và giải thích theo luật pháp Việt Nam. Mọi tranh chấp
							phát sinh từ hoặc liên quan đến các điều khoản này sẽ được giải quyết tại tòa án có thẩm
							quyền tại Việt Nam.
						</p>
					</section>

					<section>
						<h2 className='text-2xl font-semibold mb-4'>13. Liên Hệ</h2>
						<p className='text-zinc-300 leading-relaxed'>
							Nếu bạn có bất kỳ câu hỏi nào về điều khoản dịch vụ này, vui lòng liên hệ với chúng tôi
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

export default TermsOfService;
