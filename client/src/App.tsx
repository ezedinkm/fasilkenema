import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/context";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Stadium from "@/pages/Stadium";
import Contact from "@/pages/Contact";
import WatchReview from "@/pages/WatchReview";
import Blog from "@/pages/Blog";
import Membership from "@/pages/Membership";
import MembershipRegister from "@/pages/MembershipRegister";
import MembershipSuccess from "@/pages/MembershipSuccess";
import Donate from "@/pages/Donate";
import DonateSuccess from "@/pages/DonateSuccess";
import DigitalCard from "@/pages/DigitalCard";
import BlogPost from "@/pages/BlogPost";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMembers from "@/pages/admin/Members";
import AdminPayments from "@/pages/admin/Payments";
import AdminContent from "@/pages/admin/Content";
import AdminSMS from "@/pages/admin/SMS";
import AdminSettings from "@/pages/admin/Settings";
import AdminTeam from "@/pages/admin/Team";
import AdminUserMessage from "@/pages/admin/UserMessage";
import AdminWatchReview from "@/pages/admin/WatchReview";
import MemberLogin from "@/pages/MemberLogin";
import MemberDashboard from "@/pages/MemberDashboard2";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import WomenFasil from "@/pages/WomenFasil";
import JuniorFasil from "@/pages/JuniorFasil";
import MeetingsEvents from "@/pages/MeetingsEvents";
import Programs from "@/pages/Programs";
import Basketball from "@/pages/programs/Basketball";
import Boxing from "@/pages/programs/Boxing";
import Handball from "@/pages/programs/Handball";
import Charity from "@/pages/programs/Charity";
import TeamMen from "@/pages/team/Men";
import TeamWomen from "@/pages/team/Women";
import TeamJunior from "@/pages/team/Junior";
import TeamTrophies from "@/pages/team/Trophies";
import EthiopianLeague from "@/pages/EthiopianLeague";
import Gonder from "@/pages/Gonder";
import Shopping from "@/pages/Shopping";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/stadium" component={Stadium} />
      <Route path="/contact" component={Contact} />
      <Route path="/media" component={WatchReview} />
      <Route path="/media/watchreview" component={WatchReview} />
      <Route path="/blog" component={Blog} />
      <Route path="/news" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/membership" component={Membership} />
      <Route path="/membership/register" component={MembershipRegister} />
      <Route path="/membership/success" component={MembershipSuccess} />
      <Route path="/donate" component={Donate} />
      <Route path="/gonder" component={Gonder} />
      <Route path="/shopping" component={Shopping} />
      <Route path="/donate/success" component={DonateSuccess} />
      <Route path="/programs" component={Programs} />
      <Route path="/programs/basketball" component={Basketball} />
      <Route path="/programs/boxing" component={Boxing} />
      <Route path="/programs/handball" component={Handball} />
      <Route path="/programs/charity" component={Charity} />
      <Route path="/team/men" component={TeamMen} />
      <Route path="/team/women" component={TeamWomen} />
      <Route path="/team/junior" component={TeamJunior} />
      <Route path="/team/trophies" component={TeamTrophies} />
      <Route path="/epl" component={EthiopianLeague} />
      <Route path="/card/:membershipNumber" component={DigitalCard} />

      {/* Member Routes */}
      <Route path="/member/login" component={MemberLogin} />
      <Route path="/member/forgot-password" component={ForgotPassword} />
      <Route path="/member/reset-password" component={ResetPassword} />
      <Route path="/member/dashboard" component={MemberDashboard} />
      <Route path="/women-fasil" component={WomenFasil} />
      <Route path="/junior-fasil" component={JuniorFasil} />
      <Route path="/meetings-events" component={MeetingsEvents} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/members" component={AdminMembers} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/sms" component={AdminSMS} />
      <Route path="/admin/watchreview" component={AdminWatchReview} />
      <Route path="/admin/usermessage" component={AdminUserMessage} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/team" component={AdminTeam} />

      <Route path="/not-found" component={NotFound} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ScrollToTop />
        <Toaster />
        <Router />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
