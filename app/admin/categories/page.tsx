import CategoryManagement from '@/components/features/admin/category-management';

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  return (
    <CategoryManagement standalone={true} />
  )
}