import Dashboard from "@/components/dashboard/Dashboard";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

const DashboardPage = () => {
  const { fetchAllData } = useAppContext();

  useEffect(() => {
    // Refresh all data when dashboard is loaded
    fetchAllData();
  }, [fetchAllData]); // explicitly adding the dependency here

  return <Dashboard />;
};

export default DashboardPage;
