import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboardService';

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
  });
};
