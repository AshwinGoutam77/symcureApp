import { useQuery } from '@tanstack/react-query';
import contentService from '../../services/contentService';

export const useLegalContentQuery = slug => {
    return useQuery({
        queryKey: ['legal-content', slug],

        queryFn: async () => {
            const response = await contentService.getLegalContent(slug);

            return response?.data;
        },

        enabled: !!slug,

        staleTime: 5 * 60 * 1000,
    });
};