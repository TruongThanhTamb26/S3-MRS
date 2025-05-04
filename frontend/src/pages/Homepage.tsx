import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll event for navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-white/90 shadow-sm py-4"
      }`}>
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <img src="/BACHKHOA.png" alt="logo" className="w-8 h-8" />
            BK SmartSpace
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 text-sm text-gray-700">
            <a href="#home" className="hover:text-blue-600 transition-colors">Trang chủ</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Tính năng</a>
            <a href="#instructions" className="hover:text-blue-600 transition-colors">Hướng dẫn</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Liên hệ</a>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <button
            onClick={() => navigate("/login")} 
            className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-2 px-6 shadow-lg">
            <nav className="flex flex-col space-y-3">
              <a href="#home" className="hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Trang chủ</a>
              <a href="#features" className="hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Tính năng</a>
              <a href="#instructions" className="hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Hướng dẫn</a>
              <a href="#faq" className="hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#contact" className="hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Liên hệ</a>
              <button
                onClick={() => navigate("/login")} 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 w-full mt-2"
              >
                Đăng nhập
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-16">
        <img
          src="/hcmut-campus.png"
          alt="campus"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center text-white text-center px-4">
          <h2 className="text-lg md:text-xl font-light animate-fadeIn">CHÀO MỪNG ĐẾN VỚI</h2>
          <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-6 max-w-4xl animate-slideUp">
            Hệ thống Quản lý & Đặt chỗ Không gian Học tập Thông minh HCMUT
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
            <button 
              onClick={() => navigate("/login")}
              className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors font-medium"
            >
              Đặt phòng ngay
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-2 px-6 py-3 bg-transparent hover:bg-white/20 border-2 border-white rounded-md text-white transition-colors"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-600 text-white py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base">Phòng học</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-sm md:text-base">Sinh viên sử dụng</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-sm md:text-base">Đánh giá tích cực</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm md:text-base">Hỗ trợ trực tuyến</div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section id="features" className="bg-white py-16 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Giới thiệu về HCMUT Smart Study Space</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Hệ thống hiện đại giúp tối ưu hóa việc sử dụng các không gian học tập, 
              hỗ trợ sinh viên và giảng viên đặt phòng, theo dõi trạng thái phòng học 
              và quản lý tài nguyên một cách hiệu quả.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            {/* Intro */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold">Đặt phòng dễ dàng</h3>
              <p className="text-gray-600">
                Hệ thống cho phép sinh viên và giảng viên đặt phòng học một cách nhanh chóng, 
                kiểm tra trạng thái phòng học, và quản lý lịch sử đặt phòng. Việc check-in và 
                check-out cũng được thực hiện một cách tiện lợi thông qua hệ thống.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Bắt đầu ngay
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard 
                title="Thiết bị hiện đại" 
                desc="Cung cấp đầy đủ máy chiếu, bảng tương tác, Wi-Fi, ổ cắm điện và các thiết bị học tập hiện đại khác để hỗ trợ việc học tập hiệu quả."
                icon="📽️"
              />
              <FeatureCard 
                title="Vị trí thuận tiện" 
                desc="Phòng học nằm tại nhiều tòa nhà trong khuôn viên HCMUT, thuận tiện di chuyển và kết nối học tập."
                icon="🏢"
              />
              <FeatureCard 
                title="Nội quy trường" 
                desc="Tuân thủ nội quy sử dụng, giữ gìn vệ sinh, an toàn và trật tự trong môi trường học tập chung."
                icon="📜"
              />
              <FeatureCard 
                title="Không gian hiện đại" 
                desc="Không gian học tập hiện đại, linh hoạt, phục vụ nhu cầu đa dạng của sinh viên và giảng viên tại HCMUT."
                icon="🏫"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="instructions" className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Cách thức hoạt động</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Quy trình đặt phòng và sử dụng không gian học tập tại HCMUT được thiết kế
              để đơn giản, nhanh chóng và hiệu quả.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="1" 
              title="Đăng nhập & Tìm kiếm" 
              description="Đăng nhập vào hệ thống và tìm kiếm phòng học phù hợp với nhu cầu của bạn, lọc theo thời gian, sức chứa, thiết bị."
            />
            <StepCard 
              number="2" 
              title="Đặt phòng" 
              description="Chọn phòng và khung giờ phù hợp, xác nhận thông tin đặt phòng và nhận mã xác nhận."
            />
            <StepCard 
              number="3" 
              title="Check-in & Sử dụng" 
              description="Đến phòng học đúng giờ, check-in qua hệ thống và sử dụng không gian học tập. Sau khi sử dụng, check-out để hoàn tất."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-600">
              Một số câu hỏi phổ biến về hệ thống quản lý và đặt chỗ không gian học tập.
            </p>
          </div>
          
          <div className="space-y-6">
            <FaqItem 
              question="Làm thế nào để đặt phòng học?" 
              answer="Sinh viên cần đăng nhập vào hệ thống, chọn ngày và giờ, tìm phòng phù hợp, và xác nhận đặt chỗ. Bạn sẽ nhận được email xác nhận và có thể theo dõi đặt chỗ của mình trong trang cá nhân."
            />
            <FaqItem 
              question="Tôi có thể đặt phòng trước bao lâu?" 
              answer="Bạn có thể đặt phòng trước tối đa 2 tuần và tối thiểu 1 giờ trước thời gian sử dụng, tùy thuộc vào loại phòng và chính sách cụ thể."
            />
            <FaqItem 
              question="Làm thế nào để hủy đặt phòng?" 
              answer="Vào trang cá nhân của bạn, tìm đặt phòng cần hủy và nhấn nút 'Hủy'. Lưu ý rằng việc hủy phòng cần thực hiện trước thời gian sử dụng ít nhất 1 giờ để tránh các hình phạt."
            />
            <FaqItem 
              question="Có giới hạn số lần đặt phòng không?" 
              answer="Hiện tại, mỗi sinh viên được phép đặt tối đa 3 phòng trong một ngày và không quá 10 phòng trong một tuần để đảm bảo sự công bằng trong việc sử dụng tài nguyên."
            />
            <FaqItem 
              question="Tôi cần làm gì nếu gặp vấn đề kỹ thuật trong phòng học?" 
              answer="Trong trường hợp gặp vấn đề kỹ thuật, bạn có thể báo cáo trực tiếp thông qua hệ thống hoặc liên hệ với đội ngũ hỗ trợ kỹ thuật qua số điện thoại được cung cấp trong phòng học."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng trải nghiệm không gian học tập thông minh?</h2>
          <p className="mb-8 text-blue-100">
            Đăng nhập ngay hôm nay để bắt đầu đặt phòng học và tận hưởng trải nghiệm học tập hiệu quả tại HCMUT.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => window.location.href = "mailto:bstgroup@hcmut.edu.vn"}
              className="px-8 py-3 bg-transparent border-2 border-white rounded-md hover:bg-white/10 transition-colors"
            >
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm text-gray-600 py-8 px-4 border-t">
        <div className="mb-6">
          <img src="/BACHKHOA.png" alt="logo" className="mx-auto w-12 h-12" />
          <p className="mt-2 font-medium text-gray-700">Trường Đại Học Bách Khoa – ĐHQG TP.HCM</p>
          <p>268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM</p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Về chúng tôi</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Phản hồi</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Thông tin liên hệ</h4>
            <ul className="space-y-1">
              <li>Email: bstgroup@hcmut.edu.vn</li>
              <li>Điện thoại: (+84) 363459876</li>
              <li>Fax: (+84) 363459800</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Mạng xã hội</h4>
            <div className="flex gap-4 justify-center text-2xl">
              <a href="#" className="hover:text-blue-600 transition-colors">📘</a>
              <a href="#" className="hover:text-blue-600 transition-colors">📸</a>
              <a href="#" className="hover:text-blue-600 transition-colors">🐦</a>
              <a href="#" className="hover:text-blue-600 transition-colors">💼</a>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200">
          <p>© Copyright 2025–2030 CO3001 | Trường ĐH Bách Khoa - ĐHQG TP.HCM</p>
        </div>
      </footer>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, desc }: { icon?: string; title: string; desc: string }) => (
  <div className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
    {icon && <div className="text-2xl mb-2">{icon}</div>}
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

// Step card component
const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden">
    <div className="absolute -top-6 -left-6 bg-blue-600 text-white text-4xl font-bold w-16 h-16 flex items-end justify-end pb-1 pr-1 rounded-full opacity-10">
      {number}
    </div>
    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// FAQ component
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button 
        className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-600 bg-gray-50">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;