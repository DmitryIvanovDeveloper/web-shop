// Script to create sample projects via API
// Using built-in fetch (Node.js 18+)

async function createProject(projectData) {
  try {
    console.log(`Creating project: ${projectData.name}`);

    const response = await fetch('http://localhost:3000/api/merchant-admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Project created: ${result.name} (${result.id})`);
      return result;
    } else {
      console.log(`❌ Failed to create project: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.error(`Error creating project ${projectData.name}:`, error.message);
    return null;
  }
}

async function createSampleProjects() {
  const merchantId = '550e8400-e29b-41d4-a716-446655440000';
  const now = new Date().toISOString();

  const projects = [
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      appId: 'ecommerce-store-001',
      name: 'Premium Fashion Store',
      description: 'A high-end fashion e-commerce store with advanced features',
      status: 'active',
      merchantId: merchantId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      appId: 'tech-gadgets-002',
      name: 'Tech Gadgets Hub',
      description: 'Latest technology products and gadgets store',
      status: 'active',
      merchantId: merchantId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      appId: 'home-decor-003',
      name: 'Home & Garden Decor',
      description: 'Beautiful home decoration and garden products',
      status: 'active',
      merchantId: merchantId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      appId: 'sports-equipment-004',
      name: 'Sports & Fitness Store',
      description: 'Complete sports equipment and fitness products',
      status: 'active',
      merchantId: merchantId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      appId: 'bookstore-005',
      name: 'Digital Bookstore',
      description: 'Wide collection of digital books and educational materials',
      status: 'active',
      merchantId: merchantId,
      createdAt: now,
      updatedAt: now
    }
  ];

  console.log('Starting to create sample projects...\n');

  for (const project of projects) {
    await createProject(project);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ All projects creation attempts completed!');
}

createSampleProjects();