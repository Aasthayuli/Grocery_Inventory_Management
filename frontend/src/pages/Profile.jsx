import { useEffect, useState } from "react";
import { getProfile } from "../services/authService";
import { User, Mail, ShieldCheck, Calendar } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          My Profile
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Username */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Username</p>
              <p className="font-semibold text-sm sm:text-base">
                {user?.username}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Email</p>
              <p className="font-semibold text-sm sm:text-base">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Role</p>
              <p className="font-semibold text-sm sm:text-base capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Joined On</p>
              <p className="font-semibold text-sm sm:text-base">
                {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
