import InvoiceManager from "@/pages/settings/invoice-manager";

export default function InvoicesPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Invoices</h2>
        <p className="text-muted-foreground mt-1">
          Manage your invoice template and create invoices for customers.
        </p>
      </div>
      <InvoiceManager />
    </div>
  );
}
