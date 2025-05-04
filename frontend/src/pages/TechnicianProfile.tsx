import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { TechNavbar } from '../components/TechNavbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required('Họ tên không được để trống'),
  email: Yup.string().email('Email không hợp lệ').required('Email không được để trống'),
  phoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  department: Yup.string(),
  position: Yup.string()
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Mật khẩu hiện tại không được để trống'),
  newPassword: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu mới không được để trống'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu không được để trống')
});

const TechnicianProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await userService.getUserProfile();
        if (userData.success) {
          setProfile(userData.data);
        } else {
          toast.error('Không thể tải thông tin người dùng');
        }
      } catch (error) {
        toast.error('Không thể tải thông tin người dùng');
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (values: UserProfile) => {
    try {
      const response = await userService.updateUserProfile(values);
      if (response.success) {
        toast.success('Cập nhật thông tin thành công');
        setProfile(values);
      } else {
        toast.error(response.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    }
  };

  const handleChangePassword = async (values: PasswordChange, { resetForm }: any) => {
    try {
      const response = await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      if (response.success) {
        toast.success('Đổi mật khẩu thành công');
        resetForm();
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TechNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TechNavbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-4 py-4 text-sm font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('profile')}
              >
                Thông tin cá nhân
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('password')}
              >
                Đổi mật khẩu
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin kỹ thuật viên</h2>
                
                <Formik
                  initialValues={profile}
                  validationSchema={ProfileSchema}
                  onSubmit={handleUpdateProfile}
                  enableReinitialize
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                          Tên đăng nhập
                        </label>
                        <Field
                          type="text"
                          name="username"
                          id="username"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          disabled
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                          Họ và tên
                        </label>
                        <Field
                          type="text"
                          name="fullName"
                          id="fullName"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                          Email
                        </label>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="email" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                          Số điện thoại
                        </label>
                        <Field
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="phoneNumber" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
                          Phòng ban
                        </label>
                        <Field
                          type="text"
                          name="department"
                          id="department"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="department" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                          Chức vụ
                        </label>
                        <Field
                          type="text"
                          name="position"
                          id="position"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="position" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
            
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
                
                <Formik
                  initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }}
                  validationSchema={PasswordSchema}
                  onSubmit={handleChangePassword}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                          Mật khẩu hiện tại
                        </label>
                        <Field
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="currentPassword" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                          Mật khẩu mới
                        </label>
                        <Field
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="newPassword" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                          Xác nhận mật khẩu mới
                        </label>
                        <Field
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs italic mt-1" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;