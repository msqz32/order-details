export interface OrderDetail {
  purchaseDate: Date;
  invoice: number;
  customerRoot: string;
  customerLeaf: string;
  productDescription: string;
  packSize: string;
  unitType: string;
  category: string;
  distributorRoot: string;
  distributorLeaf: string;
  manufacturer: string;
  quantity: number;
  price: number;
  total: number;
}
