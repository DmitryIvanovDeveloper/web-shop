import { useLocation } from 'react-router-dom';
import { useScenario } from '../store/ScenarioContext';
import { useState } from 'react';

type ScenarioInfo = {
  title: string;
  role: string;
  preconditions: string[];
  context: string;
  goal: string;
};

type RoleGroup = {
  roleName: string;
  roleColor: string;
  scenarios: ScenarioInfo[];
};

export function RightSidebar() {
  const { pathname } = useLocation();
  const [selectedScenarioInfo, setSelectedScenarioInfo] = useState<ScenarioInfo | null>(null);

  // Get current module scenarios grouped by roles
  const getModuleScenarios = (modulePath: string): RoleGroup[] => {
    const scenarioGroups: Record<string, RoleGroup[]> = {
      '/modules/analytics': [
        {
          roleName: 'Data Analyst',
          roleColor: '#4ade80',
          scenarios: [
            {
              title: 'Daily Analytics Overview',
              role: 'Data Analyst',
              preconditions: ['Access to analytics dashboard', 'Configured data sources'],
              context: 'Data Analyst Anna checks key metrics every morning to identify user behavior anomalies and quickly respond to changes.',
              goal: 'Daily monitoring of product health and trend identification'
            },
            {
              title: 'Investigate Data Anomaly',
              role: 'Data Analyst',
              preconditions: ['Anomaly detection system', 'Historical data'],
              context: 'Data Analyst Anna received a notification about 500% growth in purchases at 4:45 PM. Need to understand: is this a bug, attack, or successful promotion.',
              goal: 'Determine the cause of anomaly and its business impact'
            },
            {
              title: 'Export Analytics Data',
              role: 'Data Analyst',
              preconditions: ['Export permissions', 'Sufficient data'],
              context: 'Data Analyst Anna prepares weekly report for management and needs to export data to Excel for detailed analysis.',
              goal: 'Prepare data for external analysis and reporting'
            }
          ]
        },
        {
          roleName: 'Technical Specialist',
          roleColor: '#f59e0b',
          scenarios: [
            {
              title: 'Set up GA4 Integration',
              role: 'Technical Specialist',
              preconditions: ['Admin rights', 'GA4 account', 'API keys'],
              context: 'Developer Max configures Google Analytics 4 integration to automatically synchronize user events.',
              goal: 'Automate analytics data collection'
            },
            {
              title: 'Data Pipeline Health',
              role: 'Technical Specialist',
              preconditions: ['Monitoring configured', 'Infrastructure access'],
              context: 'DevOps Max tracks event processing speed and pipeline delays to ensure real-time data flow.',
              goal: 'Maintain data flow stability'
            }
          ]
        },
        {
          roleName: 'Product Manager',
          roleColor: '#8b5cf6',
          scenarios: [
            {
              title: 'Create Custom Report',
              role: 'Product Manager',
              preconditions: ['Report access', 'Historical data'],
              context: 'PM Elena prepares monthly report for investors and needs to create custom dashboard with growth and retention metrics.',
              goal: 'Demonstrate product progress to stakeholders'
            },
            {
              title: 'Analyze A/B Test Results',
              role: 'Product Manager',
              preconditions: ['Running A/B test', 'Statistical significance'],
              context: 'PM Elena tested two versions of purchase button. Variant B showed +28% conversion. Need to decide on implementation.',
              goal: 'Choose the best variant and improve product metrics'
            },
            {
              title: 'Mobile Performance Analysis',
              role: 'Product Manager',
              preconditions: ['Mobile analytics', 'Crash data'],
              context: 'PM Elena noticed app rating drop in App Store. Need to analyze stability and performance.',
              goal: 'Improve user experience and store ratings'
            }
          ]
        }
      ],
      '/modules/merchant': [
        {
          roleName: 'Marketing Manager',
          roleColor: '#ef4444',
          scenarios: [
            {
              title: 'Campaign Dashboard',
              role: 'Marketing Manager',
              preconditions: ['Campaign access', 'Active campaigns'],
              context: 'Marketing Manager Maria checks effectiveness of "Summer Sale" email campaign - CTR 4.2%, but low conversion 2.8%.',
              goal: 'Monitor and optimize marketing campaigns'
            },
            {
              title: 'Create New Campaign',
              role: 'Marketing Manager',
              preconditions: ['Campaign creation rights', 'Ready content'],
              context: 'Marketing Manager Maria launches back-to-school campaign for students with promo code STUDY20 and personalized offers.',
              goal: 'Attract target audience and increase sales'
            },
            {
              title: 'A/B Test Setup',
              role: 'Marketing Manager',
              preconditions: ['A/B test platform', 'Testing hypothesis'],
              context: 'Marketing Manager Maria tests two subject line variants: "30% Discount" vs "Last day of discount!". Need to determine more effective one.',
              goal: 'Optimize open rate and CTR of email campaigns'
            }
          ]
        },
        {
          roleName: 'Sales Manager',
          roleColor: '#06b6d4',
          scenarios: [
            {
              title: 'Audience Targeting',
              role: 'Sales Manager',
              preconditions: ['Segments database', 'CRM data'],
              context: 'Sales Manager Igor configures targeting for VIP clients for exclusive premium products offer.',
              goal: 'Maximize conversion of high-value clients'
            },
            {
              title: 'Performance Dashboard',
              role: 'Sales Manager',
              preconditions: ['Sales analytics system', 'CRM integration'],
              context: 'Sales Manager Igor analyzes sales funnel: open rate 23.5%, click rate 4.2%, conversion 2.8%. Need to improve the last stage.',
              goal: 'Optimize sales funnel and increase revenue'
            }
          ]
        }
      ],
      '/modules/webshop': [
        {
          roleName: 'Player',
          roleColor: '#10b981',
          scenarios: [
            {
              title: 'Browse Shop',
              role: 'Player',
              preconditions: ['Game account', 'Shop access', 'Available offers'],
              context: 'Player Alex opens the shop and sees "Hit Sales" with -80% discount on "Complete Destruction Set" for $21.00 (was $104.99). The bundle includes character skin, weapons, and +21 bonus items.',
              goal: 'Explore current offers and find valuable weapon/skin bundles'
            },
            {
              title: 'Verify User ID',
              role: 'Player',
              preconditions: ['Game account', 'Valid player credentials'],
              context: 'Player Alex clicks "Buy Now" on Complete Destruction Set. System requires player ID verification before proceeding to secure the purchase and prevent fraud.',
              goal: 'Verify identity before making purchase'
            },
            {
              title: 'Purchasing',
              role: 'Player',
              preconditions: ['Verified user ID', 'Selected item'],
              context: 'Player Alex views Complete Destruction Set details and fills purchase form with email and payment method. System calculates total and completes transaction.',
              goal: 'Complete purchase transaction for selected item'
            }
          ]
        }
      ],
      '/modules/rewards': [
        {
          roleName: 'Player',
          roleColor: '#f59e0b',
          scenarios: [
            {
              title: 'Daily Reward Available',
              role: 'Player',
              preconditions: ['Daily login', 'Reward system enabled'],
              context: 'Player Sarah logs in and sees daily reward notification. She wants to claim 100 coins and check tier progress.',
              goal: 'Claim daily rewards and track loyalty progression'
            },
            {
              title: 'Claim Daily Reward',
              role: 'Player',
              preconditions: ['Available reward', 'Player account'],
              context: 'Player Sarah clicks claim button to receive daily bonus and sees tier progress update.',
              goal: 'Successfully claim reward and advance loyalty tier'
            }
          ]
        }
      ],
      '/modules/loyalty': [
        {
          roleName: 'Player',
          roleColor: '#22c55e',
          scenarios: [
            {
              title: 'Earn Points',
              role: 'Player',
              preconditions: ['Logged in', 'Points program active'],
              context: 'Player earns points for daily logins and purchases. Needs clear progress to next tier.',
              goal: 'Understand how to earn and see progress to next tier'
            },
            {
              title: 'Tiers Overview',
              role: 'Player',
              preconditions: ['Tier thresholds defined'],
              context: 'Player reviews benefits of each tier (Bronze..Diamond) and thresholds.',
              goal: 'Learn benefits and requirements of each tier'
            },
            {
              title: 'Rules Explainer',
              role: 'Player',
              preconditions: ['Rules configured'],
              context: 'Transparent rules for earning/spending points, expirations, and limits.',
              goal: 'Know how points are earned, spent, and when they expire'
            },
            {
              title: 'Redeem Options',
              role: 'Player',
              preconditions: ['Catalog of rewards'],
              context: 'Player explores how to redeem points for rewards without losing tier.',
              goal: 'See redemption options and impact on tier/points'
            }
          ]
        }
      ],
      '/modules/content': [
        {
          roleName: 'Content Manager',
          roleColor: '#8b5cf6',
          scenarios: [
            {
              title: 'Create Post',
              role: 'Content Manager',
              preconditions: ['Content creation access', 'Editorial guidelines'],
              context: 'Content Manager Lisa creates new blog post about game update with screenshots and videos.',
              goal: 'Publish engaging content for community'
            },
            {
              title: 'Upload Media',
              role: 'Content Manager',
              preconditions: ['Media upload rights', 'File formats supported'],
              context: 'Content Manager Lisa uploads promotional video for new character release.',
              goal: 'Enrich content with multimedia assets'
            },
            {
              title: 'Schedule Publish',
              role: 'Content Manager',
              preconditions: ['Publishing permissions', 'Content ready'],
              context: 'Content Manager Lisa schedules patch notes to publish when update goes live.',
              goal: 'Coordinate content release with game updates'
            },
            {
              title: 'Moderation',
              role: 'Content Manager',
              preconditions: ['Moderation tools', 'Community guidelines'],
              context: 'Content Manager Lisa reviews user-generated content and ensures it meets community standards.',
              goal: 'Maintain quality and safety of community content'
            }
          ]
        }
      ],
      '/modules/localization': [
        {
          roleName: 'Localization Specialist',
          roleColor: '#ef4444',
          scenarios: [
            {
              title: 'Detect Language',
              role: 'Localization Specialist',
              preconditions: ['Language detection system', 'User preferences'],
              context: 'Localization Specialist Mark sets up auto-detection for new players based on browser locale.',
              goal: 'Provide seamless localized experience from first visit'
            },
            {
              title: 'Translate Content',
              role: 'Localization Specialist',
              preconditions: ['Translation tools', 'Source content'],
              context: 'Localization Specialist Mark translates new UI strings for German market launch.',
              goal: 'Deliver high-quality localized content'
            },
            {
              title: 'Update Locale',
              role: 'Localization Specialist',
              preconditions: ['Locale management', 'Translation database'],
              context: 'Localization Specialist Mark updates Russian translations after user feedback.',
              goal: 'Maintain accurate and current translations'
            },
            {
              title: 'Validation',
              role: 'Localization Specialist',
              preconditions: ['QA process', 'Native speakers'],
              context: 'Localization Specialist Mark validates Spanish translations with native speaker review.',
              goal: 'Ensure translation quality and cultural appropriateness'
            }
          ]
        }
      ],
      '/modules/personalization': [
        {
          roleName: 'Personalization Engineer',
          roleColor: '#06b6d4',
          scenarios: [
            {
              title: 'Decision Simulator',
              role: 'Personalization Engineer',
              preconditions: ['User features available', 'Configured rules'],
              context: 'Engineer simulates user features (country/RFM/ARPU/churn) and validates which offer will be selected.',
              goal: 'Verify decision logic and explainability'
            },
            {
              title: 'Abandoned Cart Recovery',
              role: 'Personalization Engineer',
              preconditions: ['Abandoned cart signal', 'Channels opt-in'],
              context: 'Engineer configures soft reminders, incentives at 24h, and final ping at 72h with caps and cooldowns.',
              goal: 'Recover carts with optimal timing/offer while respecting constraints'
            },
            {
              title: 'Create Rule',
              role: 'Personalization Engineer',
              preconditions: ['Rule engine access', 'Business requirements'],
              context: 'Personalization Engineer Tom creates rule to show 20% discount for inactive users after 7 days.',
              goal: 'Re-engage users with targeted offers'
            },
            {
              title: 'Segment Users',
              role: 'Personalization Engineer',
              preconditions: ['User data', 'Segmentation criteria'],
              context: 'Personalization Engineer Tom creates VIP segment for players who spent over $100.',
              goal: 'Target high-value customers with premium offers'
            },
            {
              title: 'Generate Offer',
              role: 'Personalization Engineer',
              preconditions: ['AI recommendation engine', 'User behavior data'],
              context: 'Personalization Engineer Tom generates personalized bundle offers based on player preferences.',
              goal: 'Increase conversion with relevant product recommendations'
            },
            {
              title: 'Execute Automation',
              role: 'Personalization Engineer',
              preconditions: ['Automation platform', 'Trigger conditions'],
              context: 'Personalization Engineer Tom schedules abandoned cart recovery emails with dynamic content.',
              goal: 'Automate personalized user engagement'
            }
          ]
        }
      ],
      '/modules/sdk': [
        {
          roleName: 'SDK Developer',
          roleColor: '#f59e0b',
          scenarios: [
            {
              title: 'Configure Payments',
              role: 'SDK Developer',
              preconditions: ['Payment provider access', 'SDK integration'],
              context: 'SDK Developer Jake integrates Stripe payment processing for in-game purchases.',
              goal: 'Enable secure payment transactions'
            },
            {
              title: 'Setup Analytics (GA4)',
              role: 'SDK Developer',
              preconditions: ['Analytics account', 'Tracking requirements'],
              context: 'SDK Developer Jake configures Google Analytics 4 to track user engagement events.',
              goal: 'Collect comprehensive user behavior data'
            },
            {
              title: 'Initialize Overlay',
              role: 'SDK Developer',
              preconditions: ['Game engine support', 'UI framework'],
              context: 'SDK Developer Jake implements WebShop overlay in Unity game for seamless purchasing.',
              goal: 'Integrate shop experience into game'
            },
            {
              title: 'Handle Deep Link',
              role: 'SDK Developer',
              preconditions: ['Deep linking configuration', 'App routing'],
              context: 'SDK Developer Jake sets up deep links to open specific shop sections from external campaigns.',
              goal: 'Enable targeted marketing campaigns'
            }
          ]
        }
      ],
      '/modules/uibuilder': [
        {
          roleName: 'UI Designer',
          roleColor: '#8b5cf6',
          scenarios: [
            {
              title: 'Open UI Builder',
              role: 'UI Designer',
              preconditions: ['Design tool access', 'Component library'],
              context: 'UI Designer Rachel opens drag-and-drop interface to create new shop theme.',
              goal: 'Design custom shop appearance'
            },
            {
              title: 'Create Theme',
              role: 'UI Designer',
              preconditions: ['Brand guidelines', 'Color palette'],
              context: 'UI Designer Rachel creates Halloween theme with dark colors and spooky elements.',
              goal: 'Design seasonal shop theme'
            },
            {
              title: 'Customize Layout',
              role: 'UI Designer',
              preconditions: ['Layout components', 'Responsive design'],
              context: 'UI Designer Rachel arranges product cards and banners for mobile-first experience.',
              goal: 'Optimize layout for different screen sizes'
            },
            {
              title: 'Apply Theme',
              role: 'UI Designer',
              preconditions: ['Theme validation', 'Deployment access'],
              context: 'UI Designer Rachel publishes new theme to live environment for A/B testing.',
              goal: 'Deploy and test new shop design'
            }
          ]
        }
      ],
      '/modules/liveops': [
        {
          roleName: 'LiveOps Manager',
          roleColor: '#22c55e',
          scenarios: [
            {
              title: 'Graph Builder',
              role: 'LiveOps Manager',
              preconditions: ['Event taxonomy', 'Action channels defined'],
              context: 'Manager designs behavioral automation: triggers → filters → actions with caps and schedule.',
              goal: 'Deploy safe, high-impact automation flows'
            },
            {
              title: 'Event Simulator',
              role: 'LiveOps Manager',
              preconditions: ['Test user context'],
              context: 'Simulate key game events and verify which rules fire and why (mock).',
              goal: 'Validate behavior and guardrails before rollout'
            }
          ]
        }
      ]
    };
    return scenarioGroups[modulePath] || [];
  };

  const isModulePage = pathname.startsWith('/modules/');
  const currentScenarios = isModulePage ? getModuleScenarios(pathname) : [];
  const { selectedScenario, setSelectedScenario, showAllScenarios } = useScenario();

  if (!isModulePage || currentScenarios.length === 0) {
    return null;
  }

  // Note: Scenarios are now grouped by roles, no flattening needed

  return (
    <aside style={{ 
      width: 320, 
      padding: 16, 
      borderRight: '1px solid #151a24', 
      background: '#0e1420', 
      textAlign: 'left',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'auto',
      flexShrink: 0
    }}>
      <div style={{ fontWeight: 700, marginBottom: 16, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Scenarios by Role</span>
        {selectedScenario !== null && (
          <button
            onClick={showAllScenarios}
            style={{
              background: '#2e68ff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            All
          </button>
        )}
      </div>

      {/* Role Groups */}
      <div style={{ display: 'grid', gap: 16 }}>
        {currentScenarios.map((roleGroup, groupIdx) => (
          <div key={groupIdx}>
            <div style={{ 
              color: roleGroup.roleColor, 
              fontWeight: 600, 
              fontSize: '14px', 
              marginBottom: 8,
              padding: '4px 8px',
              background: `${roleGroup.roleColor}15`,
              borderRadius: 4,
              border: `1px solid ${roleGroup.roleColor}30`
            }}>
              {roleGroup.roleName}
            </div>
            <div style={{ display: 'grid', gap: 4, marginLeft: 8 }}>
              {roleGroup.scenarios.map((scenario, scenarioIdx) => {
                const globalIdx = currentScenarios.slice(0, groupIdx).flatMap(g => g.scenarios).length + scenarioIdx;
                return (
                  <a
                    key={scenarioIdx}
                    href={`#sc-${globalIdx + 1}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedScenario(globalIdx);
                      setSelectedScenarioInfo(scenario);
                      document.querySelector(`#sc-${globalIdx + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{
                      color: selectedScenario === globalIdx ? '#fff' : '#9fb3d9',
                      textDecoration: 'none',
                      padding: '6px 8px',
                      borderRadius: 6,
                      fontSize: '13px',
                      display: 'block',
                      border: '1px solid transparent',
                      background: selectedScenario === globalIdx ? '#2e68ff' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedScenario !== globalIdx) {
                        e.currentTarget.style.background = '#131b2b';
                        e.currentTarget.style.borderColor = '#2b3952';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedScenario !== globalIdx) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {scenario.title}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Scenario Details */}
      {selectedScenarioInfo && (
        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: '#0f1a2c', 
          borderRadius: 8, 
          border: '1px solid #1e293b' 
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '14px' }}>
            About Scenario
          </h4>
          
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#9fb3d9', fontSize: '12px', marginBottom: 4 }}>
              Preconditions:
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, color: '#d1d5db', fontSize: '12px' }}>
              {selectedScenarioInfo.preconditions.map((condition, idx) => (
                <li key={idx} style={{ marginBottom: 2 }}>{condition}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#9fb3d9', fontSize: '12px', marginBottom: 4 }}>
              Context:
            </div>
            <div style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.4 }}>
              {selectedScenarioInfo.context}
            </div>
          </div>

          <div>
            <div style={{ color: '#9fb3d9', fontSize: '12px', marginBottom: 4 }}>
              Goal:
            </div>
            <div style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.4 }}>
              {selectedScenarioInfo.goal}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
