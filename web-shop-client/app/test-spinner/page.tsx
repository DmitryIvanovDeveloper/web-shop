import { OfferCard } from "../../src/shared/components/molecules/offer-card";

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>Test Spinner</h1>
      <OfferCard
        title="Test"
        buyButton={{
          text: "$10.00",
          enabled: true
        }}
        isLoading={true}
      />
    </div>
  );
}

