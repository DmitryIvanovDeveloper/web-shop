import ScenarioRunner from '../../shared/ui/ScenarioRunner';
import type { Step } from '../../shared/ui/ScenarioRunner';
import { useAppStore } from '../../app/store/AppStore';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';
import { useScenario } from '../../app/store/ScenarioContext';
import { useState, useEffect } from 'react';

const steps: Step[] = [
  { kind: 'info', title: 'Browse Shop', description: 'View catalog and product details' },
  {
    kind: 'form', title: 'Verify User ID', description: 'Enter your player ID to continue', fields: [
      { name: 'userId', label: 'Player ID', required: true },
      { name: 'playerName', label: 'Player Name' }
    ], actionLabel: 'Verify & Continue'
  },
  {
    kind: 'form', title: 'Purchasing', fields: [
      { name: 'productId', label: 'Product ID', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true }
    ]
  }
];

export default function WebshopModulePage() {
  const { dispatch } = useAppStore();
  const { selectedScenario, setSelectedScenario } = useScenario();
  const localSteps: Step[] = [
    steps[0],
    steps[1], // Verify User ID
    {
      ...steps[2], kind: 'form', title: 'Purchasing', fields: [
        { name: 'playerEmail', label: 'Email Address', required: true },
        { name: 'paymentMethod', label: 'Payment Method', type: 'select', required: true, options: [
          { label: 'Credit Card', value: 'card' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Google Pay', value: 'gpay' }
        ] },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      ], actionLabel: 'Purchase Now',
    }
  ];

  const scenarios = localSteps.map((s) => ({ title: s.title, steps: [s] }));

  // Ensure selectedScenario stays within range when switching modules
  useEffect(() => {
    if (selectedScenario !== null && (selectedScenario < 0 || selectedScenario >= scenarios.length)) {
      setSelectedScenario(0);
    }
  }, [selectedScenario, scenarios.length, setSelectedScenario]);

  // Filter scenarios based on safe selection
  const displayScenarios = (selectedScenario !== null && selectedScenario >= 0 && selectedScenario < scenarios.length)
    ? [scenarios[selectedScenario]]
    : scenarios;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Top header for Browse Shop with Open spec */}
      {(selectedScenario === null || selectedScenario === 0) && (
        <div style={{ padding: 16, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
          <h3 style={{ margin: 0, marginBottom: 12, display:'flex', alignItems:'center', gap:8, color: '#fff' }}>
            <span>Browse Shop</span>
            <span style={{ marginLeft:'auto' }} />
            <SpecLinkButton moduleName="Webshop" scenarioTitle="Browse Shop" />
          </h3>
          <h3 style={{ margin: 0, marginBottom: 16, color: '#fff' }}>Hit Sales - Limited Time Offers</h3>

          {/* Featured Deal */}
          <div style={{ marginBottom: 20 }}>
            <ProductCard
              title="Complete Destruction Set"
              discount="-80%"
              originalPrice="$104.99"
              currentPrice="$21.00"
              perPlayer="1 PER PLAYER"
              bonusItems="+21"
              gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              isHit={true}
              onBuy={() => {
                setSelectedScenario(1);
                setTimeout(() => {
                  document.querySelector('#sc-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />
          </div>

          <h4 style={{ margin: '0 0 12px 0', color: '#9fb3d9' }}>Special Offers</h4>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <ProductCard
              title="Storm of All Seas"
              subtitle="MYTHICAL WEAPON"
              discount="-50%"
              originalPrice="$49.99"
              currentPrice="$24.99"
              perPlayer="1 PER PLAYER"
              gradient="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
              countdown="21:18:14"
              onBuy={() => {
                setSelectedScenario(1);
                setTimeout(() => {
                  document.querySelector('#sc-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />
            <ProductCard
              title="Advancing Catapult"
              discount="-50%"
              originalPrice="$39.99"
              currentPrice="$19.99"
              perPlayer="1 PER PLAYER"
              gradient="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
              countdown="21:18:14"
              onBuy={() => {
                setSelectedScenario(1);
                setTimeout(() => {
                  document.querySelector('#sc-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />
            <ProductCard
              title="Shadow Assassin Bundle"
              discount="-60%"
              originalPrice="$59.99"
              currentPrice="$23.99"
              perPlayer="1 PER PLAYER"
              gradient="linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)"
              countdown="21:18:14"
              onBuy={() => {
                setSelectedScenario(1);
                setTimeout(() => {
                  document.querySelector('#sc-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />
            <ProductCard
              title="Ice Phoenix Set"
              discount="-33%"
              originalPrice="$44.99"
              currentPrice="$29.99"
              perPlayer="1 PER PLAYER"
              gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              countdown="21:18:14"
              onBuy={() => {
                setSelectedScenario(1);
                setTimeout(() => {
                  document.querySelector('#sc-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />
          </div>
        </div>
      )}
      {displayScenarios.map((sc, i) => {
        const realIndex = selectedScenario !== null ? selectedScenario : i;
        return (
          <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
            {realIndex !== 0 && (
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{sc.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Webshop" scenarioTitle={sc.title} />
              </h3>
            )}
          {realIndex === 2 ? (
            <div>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Complete your purchase with product details and payment information.</p>

                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                {/* Product Information - Left Side */}
                <div>
                  <h4 style={{ color: '#fff', margin: '16px 0 12px 0' }}>Product Details</h4>
                  <div style={{ 
                    padding: 16, 
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}>
                    {/* Discount Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: '#ef4444',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      -80%
                    </div>

                    {/* Product Info */}
                    <div style={{ marginTop: 40 }}>
                      <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>
                        Complete Destruction Set
                      </h4>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'line-through' }}>
                          $104.99
                        </div>
                        <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 700 }}>
                          $21.00
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '6px 12px',
                        borderRadius: 4,
                        display: 'inline-block',
                        fontSize: '12px',
                        color: '#fff'
                      }}>
                        +21 bonus items included
                      </div>
                    </div>

                    {/* Features */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ color: '#9fb3d9', fontSize: '12px', marginBottom: 8 }}>Includes:</div>
                      <ul style={{ margin: 0, paddingLeft: 16, color: '#d1d5db', fontSize: '12px' }}>
                        <li>Exclusive character skin</li>
                        <li>3 mythical weapons</li>
                        <li>Special effects pack</li>
                        <li>21 bonus consumables</li>
                      </ul>
                    </div>
                  </div>
                  </div>

                {/* Purchase Form - Right Side */}
                <div>
                  <h4 style={{ color: '#fff', margin: '16px 0 12px 0' }}>Purchase Information</h4>
                  <div style={{ padding: 16, background: '#0f1a2c', borderRadius: 8, border: '1px solid #2b3952' }}>
                    <PurchaseForm 
                      onPurchase={(formData) => {
                        dispatch({ type: 'ADD_TO_CART', skuId: 'destruction-set', qty: Number(formData.quantity) || 1 });
                        // Purchase completed - show success message
                        alert('Purchase completed successfully! Items added to your account.');
                      }}
                    />
                  </div>
                </div>
                </div>
              </div>
            ) : (
              <ScenarioRunner
                title={sc.title}
                intro={realIndex === 0 ? 'Player journey in the shop: browse catalog, verify identity, purchase items, and checkout (mock).' : undefined}
                steps={sc.steps}
            onStepNext={(_, data) => {
              if (realIndex === 1) {
                // User ID verified, move to Purchasing
                setSelectedScenario(2);
                setTimeout(() => {
                  document.querySelector('#sc-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              } else if (realIndex === 2) {
                const pid = String((data as any).productId || '');
                const qty = Number((data as any).quantity || 1);
                if (pid) dispatch({ type: 'ADD_TO_CART', skuId: pid, qty: isNaN(qty) ? 1 : qty });
              }
            }}
            onFinish={() => {
              if (realIndex === 1) {
                // User ID verified via finish, move to Purchasing
                setSelectedScenario(2);
                setTimeout(() => {
                  document.querySelector('#sc-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


function PurchaseForm({ onPurchase }: { onPurchase: (data: Record<string, any>) => void }) {
  const [formData, setFormData] = useState({
    playerEmail: '',
    paymentMethod: 'card',
    quantity: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPurchase(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, color: '#9fb3d9', fontSize: 12 }}>
          Email Address *
        </label>
        <input
          type="email"
          value={formData.playerEmail}
          onChange={(e) => setFormData({ ...formData, playerEmail: e.target.value })}
          placeholder="player@example.com"
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 12,
            background: '#11253f',
            color: '#e7f0ff',
            border: '1px solid #2b3952',
            borderRadius: 8,
            outlineColor: '#2e68ff'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, color: '#9fb3d9', fontSize: 12 }}>
          Payment Method *
        </label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 12,
            background: '#11253f',
            color: '#e7f0ff',
            border: '1px solid #2b3952',
            borderRadius: 8,
            outlineColor: '#2e68ff'
          }}
        >
          <option value="card">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="gpay">Google Pay</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, color: '#9fb3d9', fontSize: 12 }}>
          Quantity *
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          min="1"
          max="5"
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 12,
            background: '#11253f',
            color: '#e7f0ff',
            border: '1px solid #2b3952',
            borderRadius: 8,
            outlineColor: '#2e68ff'
          }}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: 8,
          padding: '8px 0',
          borderTop: '1px solid #2b3952'
        }}>
          <span style={{ color: '#9fb3d9' }}>Total:</span>
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '18px' }}>
            ${(21.00 * Number(formData.quantity || 1)).toFixed(2)}
          </span>
        </div>
        
        <button
          type="submit"
          style={{
            background: '#fbbf24',
            color: '#000',
            border: 'none',
            borderRadius: 6,
            padding: '12px 20px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '16px',
            width: '100%'
          }}
        >
          Purchase Now
        </button>
      </div>
    </form>
  );
}

function ProductCard({ 
  title, 
  subtitle, 
  discount, 
  originalPrice, 
  currentPrice, 
  perPlayer, 
  bonusItems, 
  gradient, 
  countdown, 
  isHit = false,
  onBuy
}: {
  title: string;
  subtitle?: string;
  discount: string;
  originalPrice: string;
  currentPrice: string;
  perPlayer?: string;
  bonusItems?: string;
  gradient: string;
  countdown?: string;
  isHit?: boolean;
  onBuy?: () => void;
}) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 12,
      padding: 16,
      position: 'relative',
      minHeight: isHit ? 180 : 160,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Discount Badge */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        background: '#ef4444',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: '12px',
        fontWeight: 700
      }}>
        {discount}
      </div>

      {/* Per Player Badge */}
      {perPlayer && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: '#ef4444',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: '10px',
          fontWeight: 700
        }}>
          {perPlayer}
        </div>
      )}

      {/* Countdown Timer */}
      {countdown && (
        <div style={{
          position: 'absolute',
          top: isHit ? 40 : 35,
          right: 8,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          ⏰ {countdown}
        </div>
      )}

      {/* Content */}
      <div style={{ marginTop: isHit ? 50 : 40 }}>
        {subtitle && (
          <div style={{
            color: '#fbbf24',
            fontSize: '10px',
            fontWeight: 700,
            marginBottom: 4,
            textTransform: 'uppercase'
          }}>
            {subtitle}
          </div>
        )}

        <h4 style={{
          color: '#fff',
          margin: '0 0 8px 0',
          fontSize: isHit ? '18px' : '14px',
          fontWeight: 700
        }}>
          {title}
        </h4>

        {/* Price */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            color: '#9ca3af',
            fontSize: '12px',
            textDecoration: 'line-through'
          }}>
            {originalPrice}
          </div>
          <div style={{
            color: '#fbbf24',
            fontSize: isHit ? '24px' : '18px',
            fontWeight: 700
          }}>
            {currentPrice}
          </div>
        </div>

        {/* Bonus Items */}
        {bonusItems && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '4px 8px',
            borderRadius: 4,
            display: 'inline-block',
            fontSize: '12px',
            color: '#fff'
          }}>
            {bonusItems}
          </div>
        )}

        {/* Buy Button */}
        {onBuy && (
          <button
            onClick={onBuy}
            style={{
              background: '#fbbf24',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              marginTop: 12
            }}
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
