// @owner: ai
import { AddProductForm } from '../../../widgets/add-product-form';
import { ManageProductList } from '../../../widgets/manage-product-list';

export function AdminPage() {
  return (
    <div className="container mx-auto p-8 font-sans">
      <h1 className="text-4xl font-bold text-pink-500 mb-8">🛠️ 관리자 페이지</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddProductForm />
        </div>
        <div className="lg:col-span-2">
          <ManageProductList />
        </div>
      </div>
    </div>
  );
}
