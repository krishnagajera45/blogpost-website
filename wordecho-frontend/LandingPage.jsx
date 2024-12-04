// // LandingPage.jsx
// import React from "react";
// import { Link } from "react-router-dom";

// const LandingPage = ({ user }) => {
//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
//       <div className="text-center px-6">
//         <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
//           Welcome to My Blog
//         </h1>
//         <p className="text-lg md:text-xl text-gray-600 mb-8">
//           {user
//             ? `Hi ${user.name}, explore the latest blogs and insights tailored for you!`
//             : "Join us to explore exciting blogs and share your own stories."}
//         </p>
//         {user ? (
//           <Link
//             to="/user-home"
//             className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-md"
//           >
//             Go to Your Dashboard
//           </Link>
//         ) : (
//           <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
//             <Link
//               to="/register"
//               className="bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-3 rounded-md"
//             >
//               Sign Up Now
//             </Link>
//             <Link
//               to="/login"
//               className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-md"
//             >
//               Log In
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LandingPage;
// LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex flex-col justify-center items-center text-white">
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Welcome to My Blog
        </h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow-md">
          {user
            ? `Hi ${user.name}, explore the latest blogs and insights tailored for you!`
            : "Join us to explore exciting blogs and share your own stories."}
        </p>
        {user ? (
          <Link
            to="/user-home"
            className="bg-white hover:bg-gray-200 text-gray-800 font-semibold text-lg px-6 py-3 rounded-md shadow-md transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Go to Your Dashboard
          </Link>
        ) : (
          <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
            <Link
              to="/register"
              className="bg-white hover:bg-green-200 text-gray-800 font-semibold text-lg px-6 py-3 rounded-md shadow-md transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-blue-200 text-gray-800 font-semibold text-lg px-6 py-3 rounded-md shadow-md transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
