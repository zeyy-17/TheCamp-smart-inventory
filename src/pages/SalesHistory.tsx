import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";
import { Search, FileText, RotateCcw, Plus } from "lucide-react";
import { ProcessReturnDialog } from "@/components/ProcessReturnDialog";
import { RecordSaleDialog } from "@/components/RecordSaleDialog";
import { BulkSaleDialog } from "@/components/BulkSaleDialog";

export default function SalesHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [bulkSaleDialogOpen, setBulkSaleDialogOpen] = useState(false);

  // Fetch all products for filter
  const { data: products = [] } = useQuery({
    queryKey: ['products-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch sales history with filters
  const { data: salesHistory = [], isLoading } = useQuery({
    queryKey: ['sales-history', selectedProduct, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          product:products(id, name, sku),
          returns(id, quantity, refund_amount, reason, created_at)
        `)
        .gte('date_sold', startDate)
        .lte('date_sold', endDate)
        .order('date_sold', { ascending: false });

      if (selectedProduct !== 'all') {
        query = query.eq('product_id', parseInt(selectedProduct));
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Filter by search query
  const filteredSales = salesHistory.filter((sale) => {
    const productName = sale.product?.name?.toLowerCase() || '';
    const sku = sale.product?.sku?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return productName.includes(query) || sku.includes(query);
  });

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalReturns = filteredSales.reduce((sum, sale) => {
    const returnAmount = sale.returns?.reduce((rSum: number, ret: any) => rSum + ret.refund_amount, 0) || 0;
    return sum + returnAmount;
  }, 0);
  const netRevenue = totalSales - totalReturns;

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sales History</h1>
            <p className="text-muted-foreground mt-1">View and manage all sales transactions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSaleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Record Sale
            </Button>
            <Button onClick={() => setBulkSaleDialogOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Bulk Record
            </Button>
            <Button onClick={() => setReturnDialogOpen(true)} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Process Return
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">₱{totalSales.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">₱{totalReturns.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">₱{netRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {filteredSales.length} transaction(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Returns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const hasReturns = sale.returns && sale.returns.length > 0;
                      const totalReturned = hasReturns 
                        ? sale.returns.reduce((sum: number, ret: any) => sum + ret.quantity, 0)
                        : 0;
                      const returnAmount = hasReturns
                        ? sale.returns.reduce((sum: number, ret: any) => sum + ret.refund_amount, 0)
                        : 0;

                      return (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {format(new Date(sale.date_sold), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {sale.product?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {sale.product?.sku || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {sale.quantity}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₱{sale.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {hasReturns ? (
                              <Badge variant="destructive">
                                Partial Return
                              </Badge>
                            ) : (
                              <Badge variant="default">
                                Completed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {hasReturns ? (
                              <div className="text-sm">
                                <div className="text-destructive font-medium">
                                  -{totalReturned} units
                                </div>
                                <div className="text-muted-foreground">
                                  ₱{returnAmount.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RecordSaleDialog 
        open={saleDialogOpen} 
        onOpenChange={setSaleDialogOpen}
      />
      <BulkSaleDialog 
        open={bulkSaleDialogOpen} 
        onOpenChange={setBulkSaleDialogOpen}
      />
      <ProcessReturnDialog 
        open={returnDialogOpen} 
        onOpenChange={setReturnDialogOpen}
      />
    </div>
  );
}