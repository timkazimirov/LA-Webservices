import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

async function getStripePromise() {
  if (!stripePromise) {
    const res = await fetch("/api/stripe/config", { credentials: "include" });
    const { publishableKey } = await res.json();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

function CheckoutForm({ invoiceId, amount, description, onSuccess, onCancel }: {
  invoiceId: string;
  amount: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        await apiRequest("POST", `/api/invoices/${invoiceId}/confirm-payment`);
        setSucceeded(true);
        queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
        toast({ title: "Payment successful", description: `$${parseFloat(amount).toLocaleString()} has been processed.` });
        setTimeout(onSuccess, 1500);
      } catch {
        setError("Payment was processed but confirmation failed. Please contact support.");
      }
    }

    setProcessing(false);
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-chart-2 mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-1">Payment Successful</h3>
        <p className="text-sm text-muted-foreground">Your payment of ${parseFloat(amount).toLocaleString()} has been processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 p-3 rounded-md bg-muted/50">
        <p className="text-xs text-muted-foreground">Paying for</p>
        <p className="text-sm font-medium">{description || "Invoice"}</p>
        <p className="text-xl font-bold text-primary mt-1">${parseFloat(amount).toLocaleString()}</p>
      </div>

      <div className="mb-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={processing} className="flex-1" data-testid="button-cancel-payment">
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || processing} className="flex-1" data-testid="button-confirm-payment">
          {processing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
          ) : (
            `Pay $${parseFloat(amount).toLocaleString()}`
          )}
        </Button>
      </div>
    </form>
  );
}

export function StripePaymentDialog({ invoiceId, amount, description, onSuccess, onCancel }: {
  invoiceId: string;
  amount: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const sp = await getStripePromise();
        setStripeInstance(sp);

        const res = await apiRequest("POST", `/api/invoices/${invoiceId}/pay`);
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Setting up payment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button variant="secondary" onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  if (!clientSecret || !stripeInstance) return null;

  return (
    <Elements stripe={stripeInstance} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <CheckoutForm
        invoiceId={invoiceId}
        amount={amount}
        description={description}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
