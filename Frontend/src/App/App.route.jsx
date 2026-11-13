import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../features/auth/component/Home.jsx";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Booking from "../features/order/pages/Booking.jsx";
import Resendmail from "../features/auth/component/Resendmail.jsx";
import Forgetmail from "../features/auth/component/Forgetmail.jsx";
import ForgetPassword from "../features/auth/component/ForgetPassword.jsx";
import View from "../features/auth/component/View.jsx";
import CustomerProfile from "../features/order/components/CustomerProfile.jsx";
import TechnicianRegister from "../features/technician/pages/TechnicianRegister.jsx";
import TechnicianDashboard from "../features/technician/pages/TechnicianDashboard.jsx";
import TechnicianProfile from "../features/technician/component/Technician-Profile.jsx";
import TechnicianNotification from "../features/technician/component/TechnicianNotification.jsx";
import TechnicianTracking from "../features/technician/pages/TechnicianTracking.jsx";
import NotFound from "../features/auth/component/NotFound.jsx";
import Protected from "../features/auth/component/Protected.jsx";
import AllServices from "../features/order/pages/AllServices.jsx";
import createService from "../features/admin/components/createService.jsx";
import AdminDashboard from "../features/admin/pages/admin_Dashboard.jsx";
import Customer_tracking from "../features/socketio/pages/customer_tracking.jsx";
import AppLayout from "./AppLayout.jsx";
import PaymentSuccess from "../features/technician/component/Payment-success.jsx";
import Payment from "../features/technician/pages/Payment.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/customer" replace />,
  },
        {
        path: "/resend-mail",
        element: <Resendmail />,
      },
      {
        path: "/forget-mail",
        element: <Forgetmail />,
      },
      {
        path: "/forget-password",
        element: <ForgetPassword />,
      },
  {
    path: "/customer",
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/customer/",
        element: <Home />,
      },
      {
        path: "/customer/allServices",
        element: <AllServices />,
      },
      {
        path: "/customer/register",
        element: <Register />,
      },
      {
        path: "/customer/login",
        element: <Login />,
      },
      {
        path: "/customer/booking",
        element: <Booking />,
      },

      {
        path: "/customer/service/:serviceId",
        element: <View />,
      },
      {
        path: "/customer/profile",
        element: (
          <Protected>
            <CustomerProfile />
          </Protected>
        ),
      },
      {
        path: "/customer/customer_tracking/:OrderId",
        element: (
          <Protected>
            <Customer_tracking />
          </Protected>
        ),
      },
      {
        path: "/customer/payment/:OrderId",
        element: (
          <Protected>
            <Payment />
          </Protected>
        ),
      },
      {
        path: "/customer/payment-success",
        element: (
          <Protected>
            <PaymentSuccess />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "/payment/:OrderId",
    element: (
      <Protected>
        <Payment />
      </Protected>
    ),
  },
  {
    path: "/Payment-success",
    element: (
      <Protected>
        <PaymentSuccess />
      </Protected>
    ),
  },
  {
    path: "/payment-success",
    element: (
      <Protected>
        <PaymentSuccess />
      </Protected>
    ),
  },
  {
    path: "/technician",
    children: [
      {
        path: "/technician/Technician-Dashboard",
        element: (
          <Protected>
            <TechnicianDashboard />
          </Protected>
        ),
      },
      {
        path: "/technician/technician-register",
        element: <TechnicianRegister />,
      },
      {
        path: "/technician/Technician-Profile",
        element: (
          <Protected>
            <TechnicianProfile />
          </Protected>
        ),
      },
      {
        path: "/technician/TechnicianNotification",
        element: (
          <Protected>
            <TechnicianNotification />
          </Protected>
        ),
      },
      {
        path: "/technician/tracking/:OrderId",
        element: (
          <Protected>
            <TechnicianTracking />
          </Protected>
        ),
      },
      {
        path: "/technician/technician_tracking/:OrderId",
        element: (
          <Protected>
            <TechnicianTracking />
          </Protected>
        ),
      },
    {
      path:"/technician/payment/:OrderId",
      element:(<Protected>
        <Payment/>
     </Protected>)
    },
      {
        path: "/technician/payment-success",
        element:(<Protected>
          <PaymentSuccess />
        </Protected>)
      }
    ],
  },
  {
    path: "/admin/admin-Dashboard",
    element: (
      <Protected>
        <AdminDashboard />
      </Protected>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
