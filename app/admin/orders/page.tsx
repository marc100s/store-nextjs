import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth-guard";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import DeleteDialog from '@/components/shared/delete-dialog';

export const metadata: Metadata = {
    title: 'Admin Orders',
}

const AdminOrdersPage = async (props: {
    searchParams: Promise<{page: string}>
}) => {

    const { page = '1', query: searchText } = await props.searchParams;

    await requireAdmin();

    const orders = await getAllOrders({
        page: Number(page),
        query: searchText,
      });
   
    return ( 
    <div className='space-y-2'>
        <h2 className='h2-bold'>Orders</h2>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>PAID</TableHead>
                <TableHead>DELIVERED</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatId(order.id)}</TableCell>
                  <TableCell> {formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : 'not paid'}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : 'not delivered'}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant='outline' size='sm'>
                    <Link href={`/order/${order.id}`}>
                      Details
                    </Link>
                    </Button>
                    <DeleteDialog id={order.id} action={deleteOrder} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          { 
              orders.totalPages > 1 && (
                  <Pagination page= { Number(page) || 1} totalPages={orders?.totalPages}
                  />
              )
          }
        </div>
      </div>
      ) 
    
};

export default AdminOrdersPage;