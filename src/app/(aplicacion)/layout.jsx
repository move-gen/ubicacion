import ToasterContext from "@/components/context/ToasterContext";

import Header from "@/components/navbar/header";
import HeaderMobile from "@/components/navbar/header-mobile";
import MarginWidthWrapper from "@/components/navbar/margin-width-wrapper";
import PageWrapper from "@/components/navbar/page-wrapper";
import SideNav from "@/components/navbar/side-nav";
import { AuthProvider } from "../auth/AuthProvider";

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <main>
        <SideNav />
        <ToasterContext />
        <main className="flex-1">
          <MarginWidthWrapper>
            <Header />
            <HeaderMobile />
            <PageWrapper>{children}</PageWrapper>
          </MarginWidthWrapper>
        </main>
      </main>
    </AuthProvider>
  );
}
